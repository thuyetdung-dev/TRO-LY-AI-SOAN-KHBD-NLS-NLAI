/* guided-fix.js — V27.5.4: trợ lý sửa lỗi tuần tự dành cho giáo viên. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const state={issue:null,previous:'',batch:false,processed:0,total:0};
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
function issueMessages(){
  const report=$('validationReport');if(!report)return [];
  return [...report.querySelectorAll('li')].map(li=>[...li.childNodes].filter(n=>!(n.nodeType===1&&n.matches('button'))).map(n=>n.textContent).join(' ').trim()).filter(Boolean);
}
function currentProduct(issue){
  const flows=lessonflows(typeof rawMarkdown==='string'?rawMarkdown:'');
  const product=flows[issue.flow]?.spec?.rows?.[issue.row]?.product;
  return Array.isArray(product)?product.join('\n'):String(product||'');
}
function setMode(kind){
  ['guidedFixProductBox','guidedFixSourceActions','guidedFixMathActions','guidedFixAdvancedActions'].forEach(id=>$(id).hidden=true);
  if(kind==='product')$('guidedFixProductBox').hidden=false;
  else if(kind==='source')$('guidedFixSourceActions').hidden=false;
  else if(kind==='math')$('guidedFixMathActions').hidden=false;
  else $('guidedFixAdvancedActions').hidden=false;
}
function showProgress(){
  const el=$('guidedFixProgress');if(!el)return;
  el.hidden=!state.batch;
  el.textContent=state.batch?'Đang xử lý '+Math.min(state.processed+1,state.total)+'/'+state.total+' cảnh báo':'';
}
function openFix(message,fromBatch=false){
  if(typeof rawMarkdown!=='string'||!rawMarkdown.trim())return notify('Hãy soạn kế hoạch trước khi chỉnh sửa');
  state.issue=classify(message);if(fromBatch)state.batch=true;showProgress();
  $('guidedFixTitle').textContent=state.issue.title;
  $('guidedFixExplanation').textContent=state.issue.plain;
  $('guidedFixTechnical').textContent=state.issue.message;
  $('guidedFixPreview').hidden=true;
  $('guidedFixApply').hidden=state.issue.kind!=='product';
  $('guidedFixApply').disabled=true;
  $('guidedFixPreviewBtn').hidden=state.issue.kind!=='product';
  setMode(state.issue.kind);
  if(state.issue.kind==='product'){
    $('guidedFixLocation').textContent='Hoạt động '+(state.issue.flow+1)+' · Bước '+(state.issue.row+1)+' · Sản phẩm dự kiến';
    $('guidedFixProduct').value=currentProduct(state.issue);
  }
  $('guidedFixUndo').disabled=!state.previous;
  $('guidedFixDialog').showModal();
  if(state.issue.kind==='product')requestAnimationFrame(()=>$('guidedFixProduct').focus());
}
function preview(){
  const value=$('guidedFixProduct').value.trim();
  if(!value)return notify('Hãy nhập nội dung sản phẩm dự kiến');
  $('guidedFixPreviewText').textContent=value;
  $('guidedFixPreview').hidden=false;
  $('guidedFixApply').disabled=false;
}
async function suggest(){
  if(!state.issue||state.issue.kind!=='product')return;
  const button=$('guidedFixSuggest'),original=button.textContent;
  button.disabled=true;button.textContent='AI đang đề xuất…';
  const prompt='Bạn là chuyên gia giáo dục Toán THPT. Viết lại mục Sản phẩm dự kiến cho '+$('guidedFixLocation').textContent+'. Tên bài: '+($('lesson')?.value||'')+'. Nội dung hiện tại: '+$('guidedFixProduct').value+'. Yêu cầu: 80–150 từ, nêu rõ kết quả học sinh tạo ra, lập luận hoặc cách kiểm tra; chỉ trả về nội dung tiếng Việt, không Markdown, không JSON.';
  try{
    const response=await fetch('/api/openai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,files:[]})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'AI chưa phản hồi');
    $('guidedFixProduct').value=String(data.text||'').trim();
    $('guidedFixPreview').hidden=true;$('guidedFixApply').disabled=true;
    notify('AI đã tạo bản nháp. Giáo viên hãy đọc và bấm Xem trước.');
  }catch(error){notify(error.message||'Không tạo được gợi ý AI')}
  finally{button.disabled=false;button.textContent=original}
}
function apply(){
  if(!state.issue||state.issue.kind!=='product')return;
  const value=$('guidedFixProduct').value.trim();
  if(value.length<80)return notify('Nội dung còn quá ngắn; hãy nêu rõ kết quả hoặc lời giải học sinh phải tạo ra');
  try{
    const before=rawMarkdown,next=replaceProduct(before,state.issue.flow,state.issue.row,value);
    state.previous=before;
    showResult(next,typeof validatePlan==='function'?validatePlan(next,values(),false):undefined);
    window.khbdSaveVersion?.(true);
    $('guidedFixDialog').close();state.processed++;
    notify('Đã áp dụng và kiểm định lại. Có thể bấm Hoàn tác nếu cần.');
    if(state.batch)setTimeout(nextIssue,400);
  }catch(error){notify(error.message||'Không thể áp dụng nội dung')}
}
function undo(){
  if(!state.previous)return notify('Chưa có lần sửa nào để hoàn tác');
  const prior=state.previous;state.previous='';state.batch=false;
  showResult(prior,typeof validatePlan==='function'?validatePlan(prior,values(),false):undefined);
  $('guidedFixDialog').close();notify('Đã hoàn tác lần sửa gần nhất');
}
function nextIssue(){
  const messages=issueMessages();
  if(!messages.length){state.batch=false;notify('Đã xử lý xong các cảnh báo.');return}
  openFix(messages[0],true);
}
function startBatch(){
  const messages=issueMessages();if(!messages.length)return notify('Không còn cảnh báo cần sửa');
  state.batch=true;state.processed=0;state.total=messages.length;openFix(messages[0],true);
}
function addSummary(){
  const report=$('validationReport');if(!report)return;
  const messages=issueMessages();let box=$('guidedFixSummary');
  if(!messages.length){box?.remove();return}
  if(!box){box=document.createElement('div');box.id='guidedFixSummary';box.className='guided-fix-summary';report.prepend(box)}
  if(box.dataset.count===String(messages.length))return;
  box.dataset.count=String(messages.length);
  box.innerHTML='<strong>Còn '+messages.length+' nội dung nên rà soát.</strong><button type="button" class="secondary">Sửa lần lượt '+messages.length+' cảnh báo</button>';
  box.querySelector('button').onclick=startBatch;
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
  const messages=issueMessages();
  if(messages.length)openFix(messages[0]);else openFix('Bản kế hoạch chưa có lỗi bắt buộc. Giáo viên có thể mở chỉnh sửa nâng cao nếu muốn thay đổi nội dung.');
}
function init(){
  const tag=$('buildTag');if(tag)tag.textContent='2026-09-15 · V27.5.4';
  const edit=$('editBtn');if(edit){edit.textContent='Sửa không cần mã';edit.onclick=firstIssue}
  $('guidedFixCancel').onclick=()=>{state.batch=false;$('guidedFixDialog').close()};
  $('guidedFixPreviewBtn').onclick=preview;$('guidedFixApply').onclick=apply;$('guidedFixUndo').onclick=undo;$('guidedFixSuggest').onclick=suggest;
  $('guidedFixProduct').addEventListener('input',()=>{$('guidedFixPreview').hidden=true;$('guidedFixApply').disabled=true});
  $('guidedFixAddSource').onclick=()=>{state.batch=false;$('guidedFixDialog').close();$('dropZone')?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>$('files')?.click(),450)};
  $('guidedFixOpenMath').onclick=()=>{state.batch=false;$('guidedFixDialog').close();$('mathAuditBtn')?.click()};
  $('guidedFixOpenAdvanced').onclick=()=>{$('guidedFixDialog').close();window.khbdOpenSourceEditor?.()};
  $('guidedFixOpenAdvanced2').onclick=()=>{$('guidedFixDialog').close();window.khbdOpenSourceEditor?.()};
  const refresh=()=>{addButtons();addSummary()};
  const observer=new MutationObserver(refresh);observer.observe(document.body,{subtree:true,childList:true});refresh();
}
window.khbdGuidedFix={lessonflows,replaceProduct,classify,openFix,issueMessages};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();