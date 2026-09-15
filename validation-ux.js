/* validation-ux.js — V27.5.2: giao diện kiểm định, không can thiệp luồng gửi tài liệu. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
function jump(message){
 const text=String(message||''),flow=(text.match(/Lessonflow\s+(\d+)/i)||[])[1],tiet=(text.match(/Tiết\s+(\d+)/i)||[])[1];
 const nodes=[...document.querySelectorAll('#result h1,#result h2,#result h3,#result h4,#result strong,#result td,#result p')],norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ');
 let target=flow?nodes.find(el=>norm(el.textContent).includes('lessonflow '+flow)):null;
 if(!target&&tiet)target=nodes.find(el=>norm(el.textContent).includes('tiết '+tiet));
 target=target||$('result');target?.scrollIntoView({behavior:'smooth',block:'center'});target?.classList.add('validation-target');setTimeout(()=>target?.classList.remove('validation-target'),2200);
}
function addJumps(){
 const report=$('validationReport');if(!report)return;
 report.querySelectorAll('li').forEach(li=>{if(li.querySelector('.validation-jump'))return;const message=li.textContent,b=document.createElement('button');b.type='button';b.className='validation-jump';b.textContent='Đi đến';b.setAttribute('aria-label','Đi đến nội dung cần rà soát');b.onclick=()=>jump(message);li.prepend(b)});
}
function status(){
 const out=$('exportStatus'),word=$('wordBtn'),approval=$('approveCompetencies'),report=$('validationReport');if(!out||!word)return;
 const mathCount=window.khbdMathAudit?.blockers?.length||0,generalBlocked=report?.classList.contains('block'),waiting=!!approval&&!approval.checked;
 const cls='export-status '+(mathCount||generalBlocked?'blocked':waiting?'waiting':'ready'),message=mathCount?'Chưa thể tải DOCX: hình hoặc công thức Toán còn '+mathCount+' lỗi.':generalBlocked?'Chưa thể tải DOCX: kiểm định chung còn lỗi phải sửa.':waiting?'Đang chờ giáo viên duyệt mã NLS/NLAI bên dưới.':'Sẵn sàng tải DOCX.';
 if(out.className!==cls)out.className=cls;if(out.textContent!==message)out.textContent=message;
 const audit=$('mathAuditBtn');if(audit&&audit.textContent.trim()==='Kiểm định Toán ✓')audit.textContent='Hình và công thức Toán: Đạt ✓';
}
function refresh(){addJumps();status();const tag=$('buildTag'),label='2026-09-15 · V27.5.2';if(tag&&tag.textContent!==label)tag.textContent=label}
document.addEventListener('change',e=>{if(e.target?.id==='approveCompetencies')status()});
const observer=new MutationObserver(refresh);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});
refresh();
})();