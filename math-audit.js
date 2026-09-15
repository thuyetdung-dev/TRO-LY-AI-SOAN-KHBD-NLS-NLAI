/* math-audit.js — V27.5.1: kiểm định chuyên biệt nội dung Toán THPT. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parseLoose(s){try{return JSON.parse(s)}catch(_){try{return JSON.parse(String(s).replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/,\s*([}\]])/g,'$1'))}catch(__){return null}}}
function item(level,message,blockIndex=null){return {level,message,blockIndex}}
function countUnescaped(s,ch){let n=0;for(let i=0;i<s.length;i++)if(s[i]===ch&&s[i-1]!=='\\')n++;return n}
function audit(md){
 const blockers=[],warnings=[],passed=[],source=String(md||'');
 if(countUnescaped(source,'$')%2)blockers.push(item('block','Có dấu $ mở/đóng công thức không cân bằng.'));
 const fences=(source.match(/\x60\x60\x60/g)||[]).length;if(fences%2)blockers.push(item('block','Có khối mã chưa được đóng.'));
 const blocks=[],fenceRe=new RegExp('\\x60\\x60\\x60([a-zA-Z-]*)\\s*\\n?([\\s\\S]*?)\\x60\\x60\\x60','g');
 source.replace(fenceRe,(all,lang,body)=>{const spec=parseLoose(body.trim());if(spec&&spec.type)blocks.push(spec);return all});
 if(!blocks.length)warnings.push(item('warn','Không tìm thấy đồ thị, bảng biến thiên, bảng xét dấu hoặc hình Toán có cấu trúc để kiểm định.'));
 blocks.forEach((s,i)=>{
  const type=String(s.type||'').toLowerCase();
  if(type==='graph'){
   const funcs=Array.isArray(s.functions)?s.functions:(s.expr?[{expr:s.expr}]:[]);
   if(!funcs.length)blockers.push(item('block','Đồ thị '+(i+1)+' chưa có biểu thức hàm số.',i));
   funcs.forEach((f,k)=>{const ex=String(f.expr||f.expression||'').trim();if(!ex)blockers.push(item('block','Đồ thị '+(i+1)+', hàm '+(k+1)+' đang trống.',i));else if(typeof compileExpr==='function'){try{const fn=compileExpr(ex),samples=[-1,0,1].map(fn);if(!samples.some(Number.isFinite))throw new Error()}catch(_){blockers.push(item('block','Không đọc được biểu thức “'+ex+'” ở đồ thị '+(i+1)+'.',i))}}});
   if(['xMin','xMax','yMin','yMax'].some(k=>s[k]!=null&&!Number.isFinite(Number(s[k]))))blockers.push(item('block','Miền vẽ của đồ thị '+(i+1)+' chứa giá trị không hợp lệ.',i));
   if(Number.isFinite(+s.xMin)&&Number.isFinite(+s.xMax)&&+s.xMin>=+s.xMax)blockers.push(item('block','Đồ thị '+(i+1)+' có xMin không nhỏ hơn xMax.',i));
   else passed.push('Đồ thị '+(i+1)+': biểu thức và miền vẽ hợp lệ.');
  }else if(type==='variation'){
   const n=Array.isArray(s.points)?s.points.length:0,need=Math.max(0,2*n-3);
   if(n<2)blockers.push(item('block','Bảng biến thiên '+(i+1)+' cần ít nhất hai mốc x.',i));
   if(!Array.isArray(s.derivative)||s.derivative.length!==need)blockers.push(item('block','Bảng biến thiên '+(i+1)+' cần '+need+' ô đạo hàm, hiện có '+(s.derivative?.length||0)+'.',i));
   if(!Array.isArray(s.values)||s.values.length!==n)blockers.push(item('block','Bảng biến thiên '+(i+1)+' cần '+n+' giá trị hoặc giới hạn hàm số.',i));
   if(n>=2&&s.derivative?.length===need&&s.values?.length===n)passed.push('Bảng biến thiên '+(i+1)+': số mốc và dữ liệu khớp nhau.');
  }else if(type==='sign'){
   const pts=Array.isArray(s.columns)?s.columns:(Array.isArray(s.points)?s.points:[]),need=Math.max(0,2*pts.length-3),rows=Array.isArray(s.rows)?s.rows:[];
   if(pts.length<2||!rows.length)blockers.push(item('block','Bảng xét dấu '+(i+1)+' thiếu mốc hoặc hàng xét dấu.',i));
   rows.forEach((r,k)=>{if(!Array.isArray(r.cells)||r.cells.length!==need)blockers.push(item('block','Bảng xét dấu '+(i+1)+', hàng '+(k+1)+' cần '+need+' ô, hiện có '+(r.cells?.length||0)+'.',i))});
   if(pts.length>=2&&rows.length&&rows.every(r=>r.cells?.length===need))passed.push('Bảng xét dấu '+(i+1)+': cấu trúc hàng/cột hợp lệ.');
  }else if(type==='solid'||type==='hinh-khong-gian')passed.push('Hình không gian '+(i+1)+': đã nhận diện cấu trúc.');
 });
 const report={blockers,warnings,passed,checkedAt:Date.now(),blocks:blocks.length};
 window.khbdMathAudit=report;render(report);if(typeof syncExportLock==='function')syncExportLock();return report;
}
function render(r){
 const box=$('mathAuditSummary');if(!box)return;
 const cls=r.blockers.length?'block':r.warnings.length?'warn':'ok',title=r.blockers.length?'CHƯA ĐẠT — cần sửa lỗi Toán học':r.warnings.length?'ĐẠT CÓ CẢNH BÁO':'ĐẠT KIỂM ĐỊNH TOÁN HỌC';
 const group=(name,arr)=>arr.length?'<section><h3>'+name+'</h3><ul>'+arr.map(x=>'<li>'+(x.blockIndex!=null?'<button type="button" data-block="'+x.blockIndex+'" class="audit-jump">Xem hình '+(x.blockIndex+1)+'</button> ':'')+esc(x.message)+'</li>').join('')+'</ul></section>':'';
 box.className='math-audit-summary '+cls;box.innerHTML='<strong>'+title+'</strong><p>Đã kiểm tra '+r.blocks+' đối tượng Toán có cấu trúc.</p>'+group('Phải sửa',r.blockers)+group('Nên xem lại',r.warnings)+group('Đã đạt',r.passed.map(x=>item('ok',x)));
 box.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>{const els=[...document.querySelectorAll('#result .mathviz')],el=els[+b.dataset.block];$('mathAuditDialog').close();el?.scrollIntoView({behavior:'smooth',block:'center'});el?.classList.add('audit-focus');setTimeout(()=>el?.classList.remove('audit-focus'),2200)});
}
$('mathAuditBtn')?.addEventListener('click',()=>{audit(typeof rawMarkdown==='string'?rawMarkdown:'');$('mathAuditDialog').showModal()});
$('rerunMathAudit')?.addEventListener('click',()=>audit(typeof rawMarkdown==='string'?rawMarkdown:''));
$('closeMathAudit')?.addEventListener('click',()=>$('mathAuditDialog').close());
window.khbdRunMathAudit=audit;
})();