/* guided-fix.js — V27.5.3: trợ lý sửa lỗi dành cho giáo viên, không cần sửa mã. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const state={issue:null,previous:'',preview:''};
const notify=message=>{const el=$('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)};
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

function lessonflows(markdown){
  const ticks=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp(ticks+'([a-zA-Z-]*)\\s*\\n?([\\s\\S]*?)'+ticks,'g');
  const found=[];let match;
  while((match=pattern.exec(String(markdown||'')))){
    const body=match[2].trim();
    if(!body.startsWith('{'))continue;
    try{
      const spec=JSON.parse(body);
      if(spec&&spec.type==='lessonflow'&&Array.isArray(spec.rows))found.push({start:match.index,end:pattern.lastIndex,lang:match[1]||'json',spec});
    }catch(_){}
  }
  return found;
}
function replaceProduct(markdown,flowIndex,rowIndex,value){
  const flows=lessonflows(markdown),target=flows[flowIndex];
  if(!target||!target.spec.rows[rowIndex])throw new Error('Không tìm thấy đúng hoạt động cần sửa.');
  const next=JSON.parse(JSON.stringify(target.spec));
  const lines=String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
  next.rows[rowIndex].product=lines.length?lines:['Chưa nhập sản phẩm dự kiến.'];
  const ticks=String.fromCharCode(96).repeat(3);
  const block=ticks+target.lang+'\n'+JSON.stringify(next,null,2)+'\n'+ticks;
  return markdown.slice(0,target.start)+block+markdown.slice(target.end);
}
function classify(message){
  const text=clean(message);
  const m=text.match(/Lessonflow\s+(\d+),\s*bước\s+(\d+):\s*sản phẩm dự kiến quá sơ sài/i);
  if(m)return {kind:'product',message:text,flow:+m[1]-1,row:+m[2]-1,title:'Bổ sung sản phẩm học tập',plain:'Hãy viết rõ học sinh phải tạo ra kết quả gì: đáp án, lập luận, bảng, hình hoặc kết luận. Không chỉ ghi một nhãn ngắn.'};
  if(/trích dẫn số trang.*không có tài liệu nguồn/i.test(text))return {kind:'source',message:text,title:'Bổ sung tài liệu để kiểm chứng',plain:'Kế hoạch đang nhắc đến số trang sách nhưng chưa có tệp nguồn. Hãy thêm SGK hoặc tài liệu đã dùng để phần mềm đối chiếu.'};
  if(/thời lượng|phân bổ/i.test(text))return {kind:'duration',message:text,title:'Điều chỉnh thời lượng',plain:'Tổng số phút hoặc thời lượng từng tiết chưa khớp. Hãy kiểm tra số tiết và phân bổ thời gian trong kế hoạch.'};
  if(/công thức|đồ thị|bảng biến thiên|bảng xét dấu/i.test(text))return {kind:'math',message:text,title:'Kiểm tra nội dung Toán',plain:'Phần công thức hoặc hình Toán cần được kiểm tra bằng công cụ chuyên dụng trước khi xuất Word.'};
  return {kind:'advanced',message:text,title:'Rà soát nội dung',plain:'Phần mềm đã xác định một nội dung cần giáo viên kiểm tra. Bạn có thể đi đến vị trí đó hoặc mở trình chỉnh sửa nâng cao.'};
}
function currentProduct(issue){
  const flows=lessonflows(typeof rawMarkdown==='string'?rawMarkdown:'');
  const row=flows[issue.flow]?.spec?.rows?.[issue.row],p=row?.product;
  return Array.isArray(p)?p.join('\n'):String(p||'');
}
function setMode(kind){
  ['guidedFixProductBox','guidedFixSourceActions','guidedFixMathActions','guidedFixAdvancedActions'].forEach(id=>$(id).hidden=true);
  if(kind==='product')$('guidedFixProductBox').hidden=false;
  else if(kind==='source')$('guidedFixSourceActions').hidden=false;
  else if(kind==='math')$('guidedFixMathActions').hidden=false;
  else $('guidedFixAdvancedActions').hidden=false;
}
function openFix(message){
  if(typeof rawMarkdown!=='string'||!rawMarkdown.trim())return notify('Hãy soạn kế hoạch trước khi chỉnh sửa');
  const issue=classify(message);state.issue=issue;state.preview='';
  $('guidedFixTitle').textContent=issue.title;
  $('guidedFixExplanation').textContent=issue.plain;
  $('guidedFixTechnical').textContent=issue.message;
  $('guidedFixPreview').hidden=true;
  $('guidedFixApply').hidden=issue.kind!=='product';
  $('guidedFixPreviewBtn').hidden=issue.kind!=='product';
  setMode(issue.kind);
  if(issue.kind==='product'){
    $('guidedFixLocation').textContent='Hoạt động '+(issue.flow+1)+' · Bước '+(issue.row+1)+' · Sản phẩm dự kiến';
    $('guidedFixProduct').value=currentProduct(issue);
  }
  $('guidedFixUndo').disabled=!state.previous;
  $('guidedFixDialog').showModal();
  if(issue.kind==='product')requestAnimationFrame(()=>$('guidedFixProduct').focus());
}
function preview(){
  const value=$('guidedFixProduct').value.trim();
  if(!value)return notify('Hãy nhập nội dung sản phẩm dự kiến');
  state.preview=value;
  $('guidedFixPreviewText').textContent=value;
  $('guidedFixPreview').hidden=false;
}
function apply(){
  if(!state.issue||state.issue.kind!=='product')return;
  const value=$('guidedFixProduct').value.trim();
  if(value.length<40)return notify('Nội dung còn quá ngắn; hãy nêu rõ kết quả hoặc lời giải học sinh phải tạo ra');
  try{
    const before=rawMarkdown,next=replaceProduct(before,state.issue.flow,state.issue.row,value);
    state.previous=before;
    showResult(next,typeof validatePlan==='function'?validatePlan(next,values(),false):undefined);
    window.khbdSaveVersion?.(true);
    $('guidedFixDialog').close();
    notify('Đã áp dụng và kiểm định lại. Có thể bấm Hoàn tác nếu cần.');
  }catch(error){notify(error.message||'Không thể áp dụng nội dung')}
}
function undo(){
  if(!state.previous)return notify('Chưa có lần sửa nào để hoàn tác');
  const prior=state.previous;state.previous='';
  showResult(prior,typeof validatePlan==='function'?validatePlan(prior,values(),false):undefined);
  $('guidedFixDialog').close();notify('Đã hoàn tác lần sửa gần nhất');
}
function addButtons(){
  const report=$('validationReport');if(!report)return;
  report.querySelectorAll('li').forEach(li=>{
    if(li.querySelector('.guided-fix-open'))return;
    const message=[...li.childNodes].filter(n=>!(n.nodeType===1&&n.matches('button'))).map(n=>n.textContent).join(' ').trim();
    const button=document.createElement('button');button.type='button';button.className='guided-fix-open';button.textContent='Hướng dẫn sửa';
    button.onclick=()=>openFix(message);li.append(button);
  });
}
function firstIssue(){
  const li=$('validationReport')?.querySelector('li');
  if(li){
    const message=[...li.childNodes].filter(n=>!(n.nodeType===1&&n.matches('button'))).map(n=>n.textContent).join(' ').trim();
    openFix(message);
  }else openFix('Bản kế hoạch chưa có lỗi bắt buộc. Giáo viên có thể mở chỉnh sửa nâng cao nếu muốn thay đổi nội dung.');
}
function init(){
  const tag=$('buildTag');if(tag)tag.textContent='2026-09-15 · V27.5.3';
  const edit=$('editBtn');if(edit){edit.textContent='Sửa không cần mã';edit.onclick=firstIssue}
  $('guidedFixCancel').onclick=()=>$('guidedFixDialog').close();
  $('guidedFixPreviewBtn').onclick=preview;$('guidedFixApply').onclick=apply;$('guidedFixUndo').onclick=undo;
  $('guidedFixAddSource').onclick=()=>{$('guidedFixDialog').close();$('dropZone')?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>$('files')?.click(),450)};
  $('guidedFixOpenMath').onclick=()=>{$('guidedFixDialog').close();$('mathAuditBtn')?.click()};
  $('guidedFixOpenAdvanced').onclick=()=>{$('guidedFixDialog').close();window.khbdOpenSourceEditor?.()};
  $('guidedFixOpenAdvanced2').onclick=()=>{$('guidedFixDialog').close();window.khbdOpenSourceEditor?.()};
  const observer=new MutationObserver(addButtons);observer.observe(document.body,{subtree:true,childList:true});addButtons();
}
window.khbdGuidedFix={lessonflows,replaceProduct,classify,openFix};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();