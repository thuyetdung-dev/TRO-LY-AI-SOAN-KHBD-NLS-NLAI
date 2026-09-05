(function(){
  'use strict';
  const $=id=>document.getElementById(id),KEY='khbd_versions_v3',MAX=10;
  let editing=false,dirty=false;
  const notify=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)};
  const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const versions=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return []}};
  /* Bản cũ gọi thẳng setItem không bọc try/catch. Mỗi phiên bản lưu cả innerHTML đã render
   (kèm hàng chục SVG MathJax, có thể vài trăm KB), 10 phiên bản là chạm trần ~5 MB của
   localStorage → QuotaExceededError ném ra ngoài và làm hỏng cả nút "Lưu phiên bản".
   Nay: lưu markdown gốc (nhẹ hơn hàng chục lần) và tự bớt phiên bản cũ khi đầy. */
function putVersions(v){
  let arr=v.slice(0,MAX);
  for(let i=0;i<arr.length;i++){
    try{localStorage.setItem(KEY,JSON.stringify(arr));return true}
    catch(e){arr=arr.slice(0,Math.max(1,arr.length-1))}
  }
  try{localStorage.removeItem(KEY)}catch(_){}
  notify('Bộ nhớ trình duyệt đã đầy — hãy xoá bớt phiên bản cũ');
  return false;
}
  const meta=()=>({subject:$('subject').value,grade:$('grade').value,lesson:$('lesson').value,book:$('book').value,periods:$('periods').value,tableLayout:$('tableLayout').value,assessmentMode:$('assessmentMode').value,lessonTemplate:$('lessonTemplate').value,sourceMode:$('sourceMode').value});
  function saveVersion(auto=false){if(!$('result').innerHTML.trim())return;const v=versions(),now=new Date();v.unshift({id:Date.now(),time:now.toLocaleString('vi-VN'),name:`${$('subject').value} ${$('grade').value} – ${$('lesson').value}`,md:(typeof rawMarkdown==='string'?rawMarkdown:''),/* b16: khi đã có markdown gốc thì KHÔNG lưu thêm bản HTML đã dựng. Bản HTML kèm hàng
        chục SVG MathJax có thể tới hơn 100 KB mỗi phiên bản, mười phiên bản là chạm
        trần localStorage — đúng nguyên nhân của thông báo "Bộ nhớ trình duyệt đã đầy".
        Khôi phục và so sánh đều đã dựng lại từ markdown, nên HTML chỉ còn cần cho các
        phiên bản lưu từ bản cũ. */
    html:(typeof rawMarkdown==='string'&&rawMarkdown.trim())?'':($('result').innerHTML.length<120000?$('result').innerHTML:''),meta:meta()});putVersions(v);renderHistory();if(!auto)notify('Đã lưu phiên bản hiện tại')}
  function setEditing(on){editing=on;$('result').contentEditable=on?'true':'false';$('result').classList.toggle('editing',on);$('editBtn').textContent=on?'Kết thúc sửa':'Chỉnh sửa';if(on){$('result').focus();notify('Có thể sửa trực tiếp nội dung. Hãy lưu phiên bản sau khi sửa.')}else if(dirty){saveVersion(true);dirty=false;notify('Đã kết thúc sửa và lưu một phiên bản')}}
  $('editBtn').onclick=()=>setEditing(!editing);
  $('result').addEventListener('input',()=>{if(editing)dirty=true});
  $('saveVersionBtn').onclick=()=>saveVersion(false);
  function restore(id){const v=versions().find(x=>x.id===id);if(!v)return;
  /* Ưu tiên dựng lại từ markdown gốc: giữ đúng công thức và cho phép xuất DOCX chuẩn.
     Phiên bản cũ chỉ có html thì vẫn khôi phục được, nhưng khi đó rawMarkdown rỗng nên
     nút Tải DOCX sẽ báo cần soạn lại — đó là hành vi đúng, tránh xuất ra tệp mất công thức. */
  if(v.md&&typeof showResult==='function'){showResult(v.md);}else{$('result').innerHTML=v.html||'';}Object.entries(v.meta||{}).forEach(([k,val])=>{if($(k))$(k).value=val});$('result').hidden=false;$('resultActions').hidden=false;$('draftNotice').hidden=false;$('historyDialog').close();window.MathJax?.typesetPromise?.([$('result')]);notify('Đã khôi phục phiên bản đã chọn')}
  /* LỖI CỦA b15: hàm này chỉ đọc va.html, trong khi saveVersion CHỈ lưu html khi nó ngắn
     hơn 120 000 ký tự. Một KHBD thật đã dựng kèm hàng chục SVG MathJax vượt mốc đó rất dễ,
     nên html được lưu là chuỗi rỗng và bảng so sánh hiện ra HAI Ô TRẮNG, không báo lỗi gì.
     restore() đã ưu tiên markdown gốc từ trước; nay compare() làm giống hệt. */
  function compare(a,b){const va=versions().find(x=>x.id===a),vb=versions().find(x=>x.id===b);if(!va||!vb)return;
    const clean=v=>{if(v.md&&v.md.trim())return v.md;const d=document.createElement('div');d.innerHTML=v.html||'';const t=d.innerText;return t.trim()?t:'(Phiên bản này được lưu ở bản cũ và không còn nội dung để so sánh.)'};$('compareView').hidden=false;$('compareView').innerHTML=`<h3>So sánh hai phiên bản</h3><div class="compare-grid"><section><b>${xml(va.time)}</b><pre>${xml(clean(va))}</pre></section><section><b>${xml(vb.time)}</b><pre>${xml(clean(vb))}</pre></section></div>`}
  function renderHistory(){const v=versions(),box=$('historyList');if(!v.length){box.innerHTML='<p>Chưa có phiên bản nào.</p>';return}box.innerHTML=v.map(x=>`<article class="version-item"><label><input type="checkbox" class="compare-check" value="${x.id}"> <b>${xml(x.name)}</b></label><small>${xml(x.time)}</small><button type="button" data-restore="${x.id}">Khôi phục</button></article>`).join('')+'<button type="button" id="compareSelected" class="secondary">So sánh 2 phiên bản đã chọn</button>';box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>restore(+b.dataset.restore));$('compareSelected').onclick=()=>{const ids=[...box.querySelectorAll('.compare-check:checked')].map(x=>+x.value);if(ids.length!==2)return notify('Hãy chọn đúng 2 phiên bản để so sánh');compare(ids[0],ids[1])}}
  $('historyBtn').onclick=()=>{renderHistory();$('compareView').hidden=true;$('historyDialog').showModal()};
  function paragraphsFromNode(node){const out=[];if(node.nodeType===3){const t=node.textContent.trim();if(t)out.push(`<w:p><w:r><w:t xml:space="preserve">${xml(t)}</w:t></w:r></w:p>`);return out}if(node.nodeType!==1)return out;const tag=node.tagName.toLowerCase();if(tag==='table'){const rows=[...node.rows].map(tr=>`<w:tr>${[...tr.cells].map(td=>`<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p><w:r><w:t xml:space="preserve">${xml(td.innerText)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('');out.push(`<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`);return out}if(/^h[1-3]$/.test(tag)||tag==='p'||tag==='blockquote'||tag==='li'){const style=tag==='h1'?'Title':tag==='h2'?'Heading1':tag==='h3'?'Heading2':'';out.push(`<w:p>${style?`<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`:''}<w:r><w:t xml:space="preserve">${xml((tag==='li'?'• ':'')+node.innerText)}</w:t></w:r></w:p>`);return out}[...node.children].forEach(c=>out.push(...paragraphsFromNode(c)));return out}
  function finalAudit(){const errors=[];if(!$('result').innerText.trim())errors.push('Bản kế hoạch đang trống.');if($('validationReport').classList.contains('block'))errors.push('Bản kế hoạch đang có lỗi kiểm định chuyên môn chưa được xử lý.');/* Cùng lỗi "đ" như trong app.js: phải đổi đ/Đ thành d trước khi bỏ dấu. */
const heads=[...$('result').querySelectorAll('h1,h2,h3')].map(x=>x.innerText.replace(/đ/g,'d').replace(/Đ/g,'D').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()).join(' | ');['muc tieu','thiet bi','tien trinh'].forEach(x=>{if(!heads.includes(x))errors.push(`Thiếu tiêu đề ${x}.`)});if($('approveCompetencies')&&!$('approveCompetencies').checked)errors.push('Chưa duyệt mã NLS/NLAI.');return [...new Set(errors)]}
  async function exportDocx(){const errors=finalAudit();if(errors.length){alert('CHƯA THỂ XUẤT DOCX:\n- '+errors.join('\n- '));return}if(typeof JSZip==='undefined'){alert('Chưa tải được bộ tạo DOCX. Hãy kết nối Internet và mở lại trang.');return}const body=[...$('result').children].flatMap(paragraphsFromNode).join('');const zip=new JSZip();zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');const word=zip.folder('word');word.file('document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`);word.file('styles.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="26"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style></w:styles>');word.folder('_rels').file('document.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`KHBD_${$('subject').value}_${$('grade').value}_${$('lesson').value.replace(/[^a-zA-Z0-9À-ỹ]+/g,'_').slice(0,55)}.docx`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);saveVersion(true);notify('Đã tạo tệp DOCX thực và lưu phiên bản')}
  /* wordBtn được docx-export.js (nạp sau) ghi đè bằng trình xuất .docx giữ công thức.
   Giữ exportDocx ở đây làm phương án dự phòng nếu docx-export.js không nạp được. */
$('wordBtn').onclick=exportDocx;
window.khbdSaveVersion=saveVersion;
})();
