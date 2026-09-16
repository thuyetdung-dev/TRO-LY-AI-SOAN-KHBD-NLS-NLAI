/* v28.js — Không gian làm việc V28 dành cho giáo viên. */
(function(){
'use strict';
const $=id=>document.getElementById(id),UNDO='khbd_v28_undo',DRAFT='khbd_v28_autodraft',WELCOME='khbd_v28_welcome';
const state={base:'',segments:[],undo:[],ai:[],timer:0};
const note=m=>{const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
const md=()=>typeof rawMarkdown==='string'?rawMarkdown:'';
const flows=x=>window.khbdGuidedFix?.lessonflows?.(x)||[];
const draw=x=>showResult(x,typeof validatePlan==='function'?validatePlan(x,values(),false):undefined);
function pushUndo(x){if(!x||state.undo[0]===x)return;state.undo.unshift(x);state.undo=state.undo.slice(0,10);try{localStorage.setItem(UNDO,JSON.stringify(state.undo))}catch(_){}undoLabel()}
function undoLabel(){const b=$('v28UndoBtn');if(b){b.disabled=!state.undo.length;b.textContent=state.undo.length?'Hoàn tác ('+state.undo.length+')':'Hoàn tác'}}
function sections(x){const ms=[...String(x).matchAll(/^#{1,4}\s+.+$/gm)],out=[];if(!ms.length)return [{head:'Toàn bộ kế hoạch',mark:'',body:x,start:0,end:x.length}];ms.forEach((m,i)=>{const end=ms[i+1]?.index??x.length;out.push({head:m[0].replace(/^#+\s*/,''),mark:m[0],body:x.slice(m.index+m[0].length,end).replace(/^\n/,''),start:m.index,end})});return out}
function area(label,value,key){return '<label>'+esc(label)+'<textarea rows="3" data-v28="'+key+'">'+esc(value)+'</textarea></label>'}
function openEdit(){
 if(!md().trim())return note('Hãy soạn kế hoạch trước khi chỉnh sửa');
 state.base=md();state.segments=sections(state.base);
 const sectionHtml=state.segments.map((s,i)=>{const complex=s.body.includes('"type": "lessonflow"')||s.body.includes('"type":"lessonflow"');return '<details class="v28-section" '+(i<3?'open':'')+'><summary>'+esc(s.head)+'</summary>'+(complex?'<p class="v28-note">Phần này có bảng hoạt động. Hãy sửa bằng các ô Hoạt động bên dưới để bảo toàn cấu trúc.</p>':'<textarea rows="8" data-v28-section="'+i+'">'+esc(s.body.trim())+'</textarea>')+'</details>'}).join('');
 const flowHtml=flows(state.base).map((f,fi)=>'<details class="v28-flow"><summary>Hoạt động '+(fi+1)+'</summary>'+f.spec.rows.map((r,ri)=>'<fieldset><legend>Bước '+(ri+1)+(r.step?' – '+esc(r.step):'')+'</legend><div class="v28-grid">'+area('Hoạt động của giáo viên',(r.teacherActions||[]).join('\n'),'f'+fi+'r'+ri+'teacherActions')+area('Hoạt động của học sinh',(r.studentActions||[]).join('\n'),'f'+fi+'r'+ri+'studentActions')+area('Sản phẩm dự kiến',(r.product||[]).join('\n'),'f'+fi+'r'+ri+'product')+area('Đánh giá',(r.assessment||[]).join('\n'),'f'+fi+'r'+ri+'assessment')+'<label>Thời lượng (phút)<input type="number" min="0" max="225" data-v28="f'+fi+'r'+ri+'duration" value="'+esc(r.duration??'')+'"></label></div></fieldset>').join('')+'</details>').join('');
 $('v28EditorBody').innerHTML='<h3>Các phần của kế hoạch</h3>'+sectionHtml+'<h3>Tiến trình hoạt động</h3>'+flowHtml;$('v28Diff').hidden=true;$('v28ApplyBtn').disabled=true;$('v28EditorDialog').showModal();
}
function collect(){
 let out=state.base,reps=[];
 $('v28EditorBody').querySelectorAll('[data-v28-section]').forEach(el=>{const s=state.segments[+el.dataset.v28Section];reps.push({start:s.start,end:s.end,text:s.mark+'\n'+el.value.trim()+'\n'})});
 reps.sort((a,b)=>b.start-a.start).forEach(x=>out=out.slice(0,x.start)+x.text+out.slice(x.end));
 const fs=flows(out);
 for(let fi=fs.length-1;fi>=0;fi--){const f=fs[fi],spec=JSON.parse(JSON.stringify(f.spec));spec.rows.forEach((r,ri)=>{['teacherActions','studentActions','product','assessment'].forEach(n=>{const e=$('v28EditorBody').querySelector('[data-v28="f'+fi+'r'+ri+n+'"]');if(e)r[n]=arr(e.value)});const d=$('v28EditorBody').querySelector('[data-v28="f'+fi+'r'+ri+'duration"]');if(d&&d.value!=='')r.duration=+d.value});const ticks=String.fromCharCode(96).repeat(3),block=ticks+(f.lang||'json')+'\n'+JSON.stringify(spec,null,2)+'\n'+ticks;out=out.slice(0,f.start)+block+out.slice(f.end)}
 return out.trim();
}
function preview(){const next=collect(),a=flows(state.base),b=flows(next);let changed=0;a.forEach((f,i)=>f.spec.rows.forEach((r,j)=>{if(JSON.stringify(r)!==JSON.stringify(b[i]?.spec?.rows?.[j]))changed++}));$('v28Before').textContent=state.base.slice(0,5000);$('v28After').textContent=next.slice(0,5000);$('v28DiffSummary').textContent='Đã thay đổi '+changed+' bước hoạt động; độ dài: '+state.base.length+' → '+next.length+' ký tự.';$('v28Diff').hidden=false;$('v28ApplyBtn').disabled=next===state.base}
function apply(){const next=collect();if(!next||next===state.base)return note('Chưa có thay đổi để áp dụng');pushUndo(md());draw(next);window.khbdSaveVersion?.(true);state.base=next;$('v28EditorDialog').close();note('Đã áp dụng, kiểm định lại và đồng bộ với DOCX')}
function undo(){const prior=state.undo.shift();if(!prior)return note('Không còn bước để hoàn tác');draw(prior);try{localStorage.setItem(UNDO,JSON.stringify(state.undo))}catch(_){}undoLabel();note('Đã hoàn tác một bước')}
function targets(){return [...($('validationReport')?.querySelectorAll('li')||[])].map(li=>li.textContent.replace(/Đi đến|Hướng dẫn sửa/g,'').trim()).map(text=>{const m=text.match(/Lessonflow\s+(\d+),\s*bước\s+(\d+):\s*sản phẩm dự kiến/i);return m?{flow:+m[1],step:+m[2],message:text}:null}).filter(Boolean)}
async function aiFix(){
 const ts=targets();if(!ts.length)return note('Không có cảnh báo sản phẩm học tập để AI đề xuất');
 const btn=$('v28AiFixBtn'),old=btn.textContent;btn.disabled=true;btn.textContent='AI đang chuẩn bị…';
 const fs=flows(md()),items=ts.map(x=>({flow:x.flow,step:x.step,current:fs[x.flow-1]?.spec?.rows?.[x.step-1]?.product||[],warning:x.message}));
 const prompt='Bạn là chuyên gia giáo dục Toán THPT. Trả về DUY NHẤT JSON array, mỗi phần tử có flow, step, product. Product tiếng Việt 80–150 từ, nêu rõ kết quả học sinh tạo ra, lập luận và cách kiểm tra. Không đổi flow, step. Tên bài: '+($('lesson')?.value||'')+'. Dữ liệu: '+JSON.stringify(items);
 /* askAI() tự định tuyến theo nguồn AI đang chọn; trước đây gọi cứng /api/openai nên
    giáo viên dùng Gemini bấm nút này là nhận lỗi từ một máy chủ họ không định dùng. */
 try{let raw=await window.askAI(prompt);const first=raw.indexOf('['),last=raw.lastIndexOf(']');if(first<0||last<first)throw new Error('AI trả về dữ liệu chưa đúng cấu trúc');state.ai=JSON.parse(raw.slice(first,last+1)).filter(p=>+p.flow>0&&+p.step>0&&String(p.product||'').length>=80);$('v28AiReview').innerHTML=state.ai.map((p,i)=>'<article><label><input type="checkbox" data-ai="'+i+'" checked> Hoạt động '+esc(p.flow)+' · Bước '+esc(p.step)+'</label><p>'+esc(p.product)+'</p></article>').join('');$('v28AiApplyBtn').disabled=!state.ai.length;$('v28AiDialog').showModal()}catch(e){note(e.message||'Không tạo được đề xuất AI')}finally{btn.disabled=false;btn.textContent=old}
}
function applyAi(){let out=md();const chosen=[...$('v28AiReview').querySelectorAll('[data-ai]:checked')].map(x=>state.ai[+x.dataset.ai]);if(!chosen.length)return note('Hãy chọn ít nhất một đề xuất');pushUndo(out);chosen.sort((a,b)=>+b.flow-+a.flow).forEach(p=>out=window.khbdGuidedFix.replaceProduct(out,+p.flow-1,+p.step-1,String(p.product)));draw(out);window.khbdSaveVersion?.(true);$('v28AiDialog').close();note('Đã áp dụng đề xuất được duyệt và kiểm định lại')}
async function testAI(){const b=$('v28TestAiBtn'),provider=$('aiProvider')?.value;b.disabled=true;b.textContent='Đang kiểm tra…';try{if(provider==='gemini'){$('scanModels')?.click();note('Đang kiểm tra Gemini. Xem kết quả trong mục Nguồn AI.');return}await window.askAI('Chỉ trả lời đúng một từ: OK');note('Kết nối OpenAI hoạt động tốt.')}catch(e){note('Kiểm tra AI: '+e.message)}finally{b.disabled=false;b.textContent='Kiểm tra kết nối AI'}}
function preflight(){
 const checks=[['Nội dung kế hoạch',!!$('result')?.innerText.trim(),'Hãy soạn hoặc khôi phục kế hoạch.'],['Kiểm định chung',!$('validationReport')?.classList.contains('block'),'Còn lỗi bắt buộc cần sửa.'],['Cảnh báo cần rà soát',!$('validationReport')?.querySelector('li'),'Có cảnh báo nhưng vẫn có thể xuất sau khi giáo viên duyệt.'],['Hình và công thức Toán',!(window.khbdMathAudit?.blockers?.length),'Mở Kiểm định Toán để xử lý.'],['Duyệt mã NLS/NLAI',!$('approveCompetencies')||$('approveCompetencies').checked,'Hãy đọc và đánh dấu xác nhận mã.']];
 $('v28PreflightList').innerHTML=checks.map(c=>'<li class="'+(c[1]?'pass':'review')+'"><strong>'+(c[1]?'✓ ':'! ')+esc(c[0])+'</strong><span>'+esc(c[1]?'Đạt':c[2])+'</span></li>').join('');const blocked=!checks[0][1]||!checks[1][1]||!checks[3][1];$('v28PreflightResult').textContent=blocked?'Chưa thể xuất DOCX: còn lỗi bắt buộc.':checks.every(c=>c[1])?'Đạt hoàn toàn – sẵn sàng tải DOCX.':'Có cảnh báo – giáo viên rà soát rồi vẫn có thể tải DOCX.';$('v28PreflightDialog').showModal();
}
function autoSave(){clearTimeout(state.timer);state.timer=setTimeout(()=>{if(!md().trim())return;try{localStorage.setItem(DRAFT,JSON.stringify({md:md(),time:Date.now(),lesson:$('lesson')?.value||''}))}catch(_){}$('v28SaveState').textContent='Đã tự lưu '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})},1000)}
function restore(){try{const d=JSON.parse(localStorage.getItem(DRAFT)||'null');if(!d?.md)return note('Không có bản nháp tự lưu');if(md().trim()&&!confirm('Khôi phục sẽ thay nội dung hiện tại. Tiếp tục?'))return;pushUndo(md());draw(d.md);note('Đã khôi phục bản nháp tự lưu')}catch(_){note('Bản nháp không đọc được')}}
function init(){
 $('buildTag').textContent='2026-09-15 · V28';try{state.undo=JSON.parse(localStorage.getItem(UNDO)||'[]')}catch(_){state.undo=[]}undoLabel();
 $('v28EditBtn').onclick=openEdit;$('v28PreviewBtn').onclick=preview;$('v28ApplyBtn').onclick=apply;$('v28EditorCancel').onclick=()=>$('v28EditorDialog').close();$('v28UndoBtn').onclick=undo;
 $('v28AiFixBtn').onclick=aiFix;$('v28AiApplyBtn').onclick=applyAi;$('v28AiCancel').onclick=()=>$('v28AiDialog').close();$('v28TestAiBtn').onclick=testAI;
 $('v28PreflightBtn').onclick=preflight;$('v28PreflightClose').onclick=()=>$('v28PreflightDialog').close();$('v28RestoreDraftBtn').onclick=restore;$('v28HelpBtn').onclick=()=>$('v28WelcomeDialog').showModal();
 $('v28WelcomeClose').onclick=()=>{localStorage.setItem(WELCOME,'1');$('v28WelcomeDialog').close()};$('v28LargeTextBtn').onclick=()=>{document.body.classList.toggle('v28-large');localStorage.setItem('khbd_v28_large',document.body.classList.contains('v28-large')?'1':'0')};
 if(localStorage.getItem('khbd_v28_large')==='1')document.body.classList.add('v28-large');const ob=new MutationObserver(autoSave);if($('result'))ob.observe($('result'),{subtree:true,childList:true,characterData:true});const showWelcome=()=>{const d=$('v28WelcomeDialog');if(!localStorage.getItem(WELCOME)&&d&&!d.open)d.showModal()};if(document.body.classList.contains('authenticated'))setTimeout(showWelcome,500);window.addEventListener('khbd:authenticated',()=>setTimeout(showWelcome,300));
}
window.khbdV28={sections,flows,targets,preflight};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();