/* Mốc phiên bản — hiện ngay trên thanh tiêu đề. Sau nhiều vòng sửa, đã có lần trang web
   chạy bản cũ mà cả hai bên đều tưởng là bản mới, mất công đi tìm lỗi đã sửa xong rồi.
   Nhìn dòng chữ trên đầu trang là biết ngay đang chạy bản nào. */
const APP_BUILD='2026-09-05 · b16';
const $=id=>document.getElementById(id);let selectedFiles=[],rawMarkdown='',availableModels=[],scanTimer,draftTimer,lastValidation=null;
const fields=['subject','grade','lesson','book','periods','students','classSize','equipment','notes','tableLayout','assessmentMode','lessonTemplate','sourceMode'];
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)};
// Escape đủ 5 ký tự đặc biệt (bao gồm dấu nháy) để dùng an toàn cả trong nội dung text lẫn trong thuộc tính HTML (title, style, stroke...).
// Trước đây hàm này chỉ escape &,<,> nên các chỗ dùng esc() để build thuộc tính (vd aria-label, style="--c:...") có thể bị phá vỡ nếu dữ liệu AI trả về chứa dấu ".
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('themeBtn').onclick=()=>document.body.classList.toggle('dark');
$('showKey').onclick=()=>{const i=$('apiKey');i.type=i.type==='password'?'text':'password';$('showKey').textContent=i.type==='text'?'Ẩn':'Hiện'};
$('clearKey').onclick=()=>{$('apiKey').value='';$('apiKey').type='password';$('showKey').textContent='Hiện';scanModels(false);toast('Đã xóa khóa API khỏi ô nhập')};
function modelScore(name){const n=name.toLowerCase(),version=(n.match(/gemini-(\d+(?:\.\d+)?)/)||[])[1];let score=parseFloat(version||0)*100;if(n.includes('flash'))score+=30;if(n.includes('pro'))score+=20;if(n.includes('lite'))score-=8;if(/preview|experimental|exp/.test(n))score-=12;if(n.includes('latest'))score-=4;return score}
function usableModel(m){const n=(m.name||'').toLowerCase();return n.startsWith('models/gemini-')&&(m.supportedGenerationMethods||[]).includes('generateContent')&&!/(embedding|image|imagen|veo|tts|audio|transcribe|live|computer-use|robotics)/.test(n)}
/* Giới hạn token đầu ra khác nhau theo mô hình (Gemini 1.5 chỉ 8192; 2.x tới 65536).
   Danh sách /v1beta/models đã trả về outputTokenLimit nên ta dùng luôn thay vì đoán:
   đặt cứng một con số quá cao sẽ bị API từ chối, quá thấp thì KHBD dài bị cắt giữa chừng. */
const OUTPUT_LIMITS=new Map();
/* Một KHBD đầy đủ theo mẫu tổ chuyên môn dài khoảng 70 nghìn ký tự ≈ 25-30 nghìn token.
   Trần 32768 cũ vừa đủ chặn ngay giữa bài. Nới lên hết mức mô hình cho phép (Gemini 2.x tới 65536). */
function maxTokensFor(fullName){const lim=OUTPUT_LIMITS.get(fullName);return Math.min(lim||8192,65536)}
function setModelStatus(text,state=''){$('modelStatus').textContent=text;$('modelStatus').className=`model-status ${state}`.trim()}
async function scanModels(showToast=false){const key=$('apiKey').value.trim();if(!key){availableModels=[];$('model').innerHTML='<option value="auto">Tự động dò mô hình phù hợp (Khuyên dùng)</option>';setModelStatus('Nhập API key để hệ thống tự dò mô hình đang hoạt động.');if(showToast)toast('Vui lòng nhập Gemini API key');return []}const btn=$('scanModels'),previous=$('model').value;btn.disabled=true;setModelStatus('Đang dò các mô hình có thể tạo nội dung...');try{const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models',{headers:{'x-goog-api-key':key}}),data=await res.json();if(!res.ok)throw new Error(data?.error?.message||'Không lấy được danh sách mô hình');availableModels=(data.models||[]).filter(usableModel).sort((a,b)=>modelScore(b.name)-modelScore(a.name));availableModels.forEach(m=>{if(m.outputTokenLimit)OUTPUT_LIMITS.set(m.name,Number(m.outputTokenLimit))});if(!availableModels.length)throw new Error('API key này chưa có mô hình tạo nội dung phù hợp');$('model').innerHTML='<option value="auto">Tự động chọn mô hình tốt nhất (Khuyên dùng)</option>'+availableModels.map(m=>`<option value="${esc(m.name)}">${esc(m.displayName||m.name.replace('models/',''))}</option>`).join('');if([...$('model').options].some(o=>o.value===previous))$('model').value=previous;setModelStatus(`Đã tìm thấy ${availableModels.length} mô hình · ưu tiên ${availableModels[0].name.replace('models/','')}`,'ok');if(showToast)toast(`Đã tìm thấy ${availableModels.length} mô hình đang hỗ trợ`);return availableModels}catch(err){availableModels=[];$('model').innerHTML='<option value="auto">Tự động dò khi bắt đầu soạn</option>';setModelStatus(err.message||'Không thể dò mô hình','error');if(showToast)toast(err.message||'Không thể dò mô hình');return []}finally{btn.disabled=false}}
$('scanModels').onclick=()=>scanModels(true);
$('apiKey').addEventListener('input',()=>{clearTimeout(scanTimer);scanTimer=setTimeout(()=>scanModels(false),700)});
$('grade').addEventListener('change',()=>{const g=clampGrade($('grade').value),ai=$('includeAI');if(g<10){ai.checked=false;ai.disabled=true;ai.closest('label').title='NLAI chỉ khả dụng cho lớp 10–12 vì bảng chuẩn hiện có chưa bao phủ lớp 6–9';toast('Lớp 6–9: đã tắt NLAI; NLS vẫn được tích hợp theo bậc phù hợp')}else{ai.disabled=false;ai.closest('label').title=''}});
$('sampleBtn').onclick=()=>{Object.entries({subject:'Toán',grade:'12',lesson:'Bài 2. Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',book:'Kết nối tri thức với cuộc sống',periods:'3',students:'Trung bình–khá',classSize:'45',equipment:'TV 32 inch, bảng phụ, máy tính cầm tay'}).forEach(([k,v])=>$(k).value=v);toast('Đã điền dữ liệu mẫu')};
const dz=$('dropZone');['dragenter','dragover'].forEach(e=>dz.addEventListener(e,x=>{x.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(e=>dz.addEventListener(e,x=>{x.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>addFiles(e.dataTransfer.files));dz.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('files').click()}});$('files').onchange=e=>addFiles(e.target.files);
/* Gemini giới hạn khoảng 20 MB cho toàn bộ một yêu cầu gửi kèm dữ liệu nội tuyến, mà mã hóa
   base64 làm dữ liệu phình thêm 1/3. Trần 40 MB của bản cũ vượt xa giới hạn đó: giáo viên
   chọn đủ 40 MB thì yêu cầu luôn bị Google từ chối, kèm thông báo lỗi khó hiểu. */
/* Giới hạn 12 MB trước đây là do gửi tài liệu kèm thẳng trong thân yêu cầu (inline): Gemini
   chỉ nhận khoảng 20 MB cho cả yêu cầu, mà mã hoá base64 làm dữ liệu phình thêm 1/3.
   Nay dùng thêm Files API của Gemini: tệp được TẢI LÊN TRƯỚC, yêu cầu soạn bài chỉ gửi kèm
   đường dẫn, nên giới hạn 20 MB kia không còn áp dụng. Tệp nhỏ vẫn gửi inline cho nhanh
   (đỡ một vòng gọi mạng); tệp lớn tự chuyển sang Files API. */
const MAX_FILE_MB=30,MAX_TOTAL_MB=60,INLINE_LIMIT_MB=8;
function addFiles(list){for(const f of list){if(f.size>MAX_FILE_MB*1024*1024){toast(`${f.name}: vượt ${MAX_FILE_MB} MB`);continue}const total=selectedFiles.reduce((s,x)=>s+x.size,0);if(total+f.size>MAX_TOTAL_MB*1024*1024){toast(`Tổng dung lượng tài liệu không được vượt ${MAX_TOTAL_MB} MB`);break}if(!selectedFiles.some(x=>x.name===f.name&&x.size===f.size))selectedFiles.push(f)}renderFiles()}
function renderFiles(){$('fileList').innerHTML=selectedFiles.map((f,i)=>`<div class="file-chip"><b>${esc(f.name)}</b><span>${(f.size/1048576).toFixed(1)} MB</span><button type="button" data-i="${i}" aria-label="Bỏ tệp">×</button></div>`).join('');$('fileList').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedFiles.splice(+b.dataset.i,1);renderFiles()})}
function values(){return Object.fromEntries(fields.map(k=>[k,$(k).value.trim()]))}
function setProgress(p,title,text){$('emptyState').hidden=true;$('result').hidden=true;$('progress').hidden=false;$('resultActions').hidden=true;$('progressBar').style.width=p+'%';$('progressTitle').textContent=title;$('progressText').textContent=text}
function bytesToBase64(buf){let bin='',arr=new Uint8Array(buf),step=0x8000;for(let i=0;i<arr.length;i+=step)bin+=String.fromCharCode(...arr.subarray(i,i+step));return btoa(bin)}
async function filePart(file){return {inlineData:{mimeType:file.type||mime(file.name),data:bytesToBase64(await file.arrayBuffer())}}}

/* ===== Tải tệp lớn lên Gemini Files API =====
   Giao thức tải nhiều bước: xin đường dẫn tải lên, đẩy dữ liệu, rồi chờ Google xử lý xong
   (tệp PDF phải ở trạng thái ACTIVE mới dùng được, nếu gửi lúc còn PROCESSING sẽ báo lỗi). */
async function uploadToFilesApi(file,key,onProgress){
  const mimeType=file.type||mime(file.name);
  const start=await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files',{
    method:'POST',
    headers:{'x-goog-api-key':key,'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start',
      'X-Goog-Upload-Header-Content-Length':String(file.size),
      'X-Goog-Upload-Header-Content-Type':mimeType,'Content-Type':'application/json'},
    body:JSON.stringify({file:{display_name:file.name}})});
  if(!start.ok)throw new Error((await start.json().catch(()=>({})))?.error?.message||`Không xin được đường dẫn tải lên (HTTP ${start.status})`);
  const uploadUrl=start.headers.get('x-goog-upload-url')||start.headers.get('X-Goog-Upload-URL');
  /* Trình duyệt chỉ đọc được tiêu đề phản hồi khi máy chủ cho phép lộ nó ra. Nếu không đọc
     được thì không thể tải kiểu này từ trình duyệt — báo rõ để còn quay về cách gửi kèm. */
  if(!uploadUrl)throw new Error('Trình duyệt không đọc được đường dẫn tải lên do Google trả về');
  const up=await fetch(uploadUrl,{method:'POST',
    /* Content-Length là "forbidden request header" trong trình duyệt: Chrome/Edge tự đặt
       từ Blob. Tự khai báo làm một số máy chặn ngay trước khi gửi tệp. */
    headers:{'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},
    body:file});
  if(!up.ok)throw new Error(`Tải tệp lên thất bại (HTTP ${up.status})`);
  let info=(await up.json())?.file;
  if(!info?.uri)throw new Error('Google không trả về đường dẫn tệp');
  for(let i=0;i<30&&info.state==='PROCESSING';i++){
    onProgress&&onProgress(`Google đang xử lý ${file.name}...`);
    await new Promise(r=>setTimeout(r,2000));
    const st=await fetch(`https://generativelanguage.googleapis.com/v1beta/${info.name}`,{headers:{'x-goog-api-key':key}});
    info=await st.json();
  }
  if(info.state==='FAILED')throw new Error(`Google không đọc được tệp ${file.name}`);
  return {fileData:{mimeType:info.mimeType||mimeType,fileUri:info.uri}};
}

/* Chọn cách gửi cho từng tệp. Tải lên thất bại vì bất kỳ lý do gì (kể cả trình duyệt chặn
   đọc tiêu đề) thì vẫn quay về gửi kèm trực tiếp nếu tệp đủ nhỏ, để không mất luôn tài liệu. */
async function buildFileParts(key){
  const parts=[];
  for(const f of selectedFiles){
    setProgress(25,'Đang đọc tài liệu...',f.name);
    const big=f.size>INLINE_LIMIT_MB*1024*1024;
    if(big){
      try{
        setProgress(25,'Đang tải tài liệu lên Google...',`${f.name} (${(f.size/1048576).toFixed(1)} MB)`);
        parts.push(await uploadToFilesApi(f,key,t=>setProgress(28,'Đang tải tài liệu lên Google...',t)));
        continue;
      }catch(err){
        if(f.size>15*1024*1024)throw new Error(`Không tải được ${f.name} lên Google (${err.message}). Hãy tách nhỏ tệp dưới 15 MB rồi thử lại.`);
        toast(`Không tải lên được ${f.name}, chuyển sang gửi kèm trực tiếp`);
      }
    }
    parts.push(await filePart(f));
  }
  return parts;
}
function mime(n){const e=n.split('.').pop().toLowerCase();return {pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',txt:'text/plain',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[e]||'application/octet-stream'}
// Phạm vi sản phẩm: lớp 6–12. NLAI hiện chỉ có bảng chuẩn được nhúng cho lớp 10–12.
function clampGrade(g){const n=parseInt(g,10);return Number.isFinite(n)?Math.min(12,Math.max(6,n)):12}
function nlsLevelForGrade(g){g=clampGrade(g);return g<=7?3:g<=9?4:5}

// Dựng khối "NGUỒN THAM CHIẾU BẮT BUỘC" nhúng thẳng bảng mã chính thức (KHÔNG để AI tự nhớ/tự bịa).
// Đây là điểm mấu chốt để tránh rủi ro AI gán sai/gán khống mã NLS, NLAI: hai văn bản
// (QĐ 2422/QĐ-BGDĐT và TT 02/2025/TT-BGDĐT) đều rất mới, mô hình AI nhiều khả năng
// KHÔNG có sẵn dữ liệu chính xác trong lúc huấn luyện nếu không được cấp trực tiếp ở đây.
function buildStandardsBlock(v){
  const grade=clampGrade(v.grade),digital=$('includeDigital').checked,ai=$('includeAI').checked;
  if(!digital&&!ai)return '';
  let out='\n===== NGUỒN THAM CHIẾU BẮT BUỘC (KHÔNG được suy diễn/bịa mã ngoài danh sách dưới đây) =====\n';
  if(ai&&grade>=10){
    out+=`\n[BẢNG MÃ YÊU CẦU CẦN ĐẠT NĂNG LỰC AI — NLAI — Lớp ${grade}]\n`
       +`Trích Khung nội dung giáo dục AI, kèm theo Quyết định số 2422/QĐ-BGDĐT ngày 18/8/2026 của Bộ GDĐT.\n`
       +`Quy ước mã: [Lớp].[Mã chủ đề A/B/C/D+số].[Số thứ tự] — có tiền tố "MR" là nội dung MỞ RỘNG (không bắt buộc với mọi học sinh), không có "MR" là nội dung CỐT LÕI (bắt buộc).\n`
       +(AI_YCCD[grade]||'')+'\n';
  }
  if(digital){
    out+=`\n[BẢNG MÃ NĂNG LỰC SỐ — NLS — 24 năng lực thành phần, lọc theo bậc áp dụng cho lớp ${grade}]\n`
       +`Trích nguyên văn Phụ lục — Khung năng lực số cho người học (Thông tư 02/2025/TT-BGDĐT ngày 24/01/2025 của Bộ GDĐT).\n`
       +`Định dạng mã dùng ở đây: "[Miền].[Tiểu mục]-B[Số bậc][ý]" (vd 6.3-B5a = Miền 6, tiểu mục 3, Bậc 5, ý a). Đây là quy ước tự đặt để tiện tham chiếu (Thông tư gốc chỉ gọi "Bậc 1".."Bậc 8", không có ký hiệu viết tắt chính thức) — Bậc 1-2 ứng Cơ bản, 3-4 Trung cấp, 5-6 Nâng cao, 7-8 Chuyên sâu. Mục 6 "Ứng dụng trí tuệ nhân tạo" thuộc khung NLS (TT 02/2025) — KHÁC với khung NLAI (QĐ 2422) ở trên; hai hệ mã độc lập, không gộp/nhầm lẫn định dạng.\n`
       +`Phần mềm dùng Bậc ${nlsLevelForGrade(grade)} phù hợp phạm vi triển khai của lớp ${grade}. Chỉ dùng đúng mã của bậc này; mức độ nhiệm vụ được phân hóa nhưng không tự đổi bậc.\n`
       +buildNLSText([nlsLevelForGrade(grade)])+'\n';
  }
  out+='\n===== HẾT NGUỒN THAM CHIẾU BẮT BUỘC =====\n'
     +'QUY TẮC BẮT BUỘC KHI GẮN MÃ: (a) chỉ dùng đúng nguyên văn mã có trong bảng trên, tuyệt đối không tự tạo mã mới, không mượn mã của lớp/khối khác; (b) chỉ gắn mã vào một bước khi bước đó thực sự tạo ra hành vi học sinh quan sát được, khớp với đúng mô tả của mã; nếu không có, ghi "—", không cố gắn cho đủ; (c) việc lồng ghép NLS/NLAI KHÔNG được làm thay đổi hoặc gia tăng yêu cầu cần đạt của môn học đang soạn — chỉ dùng để củng cố, vận dụng; (d) TUYỆT ĐỐI không lập cột điểm/đầu điểm riêng cho NLS hoặc NLAI trong bất kỳ phần đánh giá nào của KHBD; (e) khi dùng yêu cầu cần đạt NLAI thuộc nội dung mở rộng (có tiền tố MR), phải ghi rõ đây là nội dung mở rộng, không bắt buộc.\n';
  return out;
}

/* Bản cũ chỉ khớp chữ "toán" đứng riêng nên bỏ sót "Đại số", "Hình học", "Giải tích",
   "Toán(nâng cao)" — giáo viên dạy các phân môn này mất luôn mô-đun bảng biến thiên/đồ thị. */
function isMathSubject(v){return /toán|toan|đại\s*số|dai\s*so|hình\s*học|hinh\s*hoc|giải\s*tích|giai\s*tich|lượng\s*giác|luong\s*giac|mathematics|maths?\b/i.test(v.subject||'')}
function mathRulesFor(v){if(!isMathSubject(v))return '6) Không áp dụng mô-đun biểu diễn Toán học vì môn đang soạn không phải môn Toán.';return `6) MÔ-ĐUN RIÊNG MÔN TOÁN — ba loại hình vẽ, viết trong khối mã có nhãn mathviz.

6a) BẢNG BIẾN THIÊN: {"type":"variation","title":"...","expr":"...","points":[...],"derivative":[...],"values":[...]}
 - "points": các mốc x theo thứ tự tăng dần, luôn bắt đầu bằng "-\\\\infty" và kết thúc bằng "+\\\\infty". Gọi số mốc là N.
 - "derivative": ĐÚNG 2N-3 phần tử, XEN KẼ theo thứ tự: dấu trên khoảng 1, giá trị tại mốc 2, dấu trên khoảng 2, giá trị tại mốc 3, ... Dấu chỉ dùng "+" hoặc "-". Tại mốc mà y'=0 ghi "0"; tại mốc hàm không xác định ghi "\\\\|".
 - "values": ĐÚNG N phần tử, một giá trị y cho mỗi mốc. BẮT BUỘC TÍNH RA SỐ CỤ THỂ tại mọi điểm cực trị — để trống là lỗi, giáo viên sẽ phải tự tính lại. Tại điểm gián đoạn dùng {"left":"-\\\\infty","right":"+\\\\infty"}.
 - CHUẨN CHÍNH XÁC: các mốc và giá trị phải giữ dạng phân số/căn thức LaTeX, ví dụ "-\\\\sqrt{\\\\frac{3}{2}}", "\\\\sqrt{\\\\frac{3}{2}}", "-\\\\frac{5}{4}". KHÔNG đổi thành số gần đúng như "-1.22", "1.22", "-1.25", trừ khi tài liệu nguồn hoặc bài toán yêu cầu làm tròn.
 - "expr": BẮT BUỘC — công thức hàm số viết theo cú pháp máy tính (dùng * cho phép nhân, ^ cho luỹ thừa), ví dụ "x^3-3*x^2+2" hoặc "(-x^2+5*x-7)/(x-2)". Phần mềm dùng trường này để VẼ LUÔN ĐỒ THỊ ngay dưới bảng biến thiên, nên thiếu nó là mất hình trực quan của cả hoạt động.
 - Ví dụ đúng cho y=x^3-3x^2+2 (N=4): points ["-\\\\infty","0","2","+\\\\infty"], derivative ["+","0","-","0","+"] (đúng 5 = 2·4-3), values ["-\\\\infty","2","-2","+\\\\infty"], expr "x^3-3*x^2+2".

6b) BẢNG XÉT DẤU: {"type":"sign","title":"...","columns":[...],"rows":[{"label":"f'(x)","cells":[...]}]}
 - "columns" là các mốc x, N mốc. "cells" của mỗi hàng có ĐÚNG 2N-3 phần tử, xen kẽ y hệt quy tắc 6a: dấu khoảng 1, giá trị tại mốc 2, dấu khoảng 2, ...
 - Ví dụ đúng: columns ["-\\\\infty","1","3","+\\\\infty"], cells ["+","0","-","0","+"].
 - Đếm sai số phần tử là bảng vẽ ra lệch cột, không dùng được.

6c) ĐỒ THỊ HÀM SỐ: {"type":"graph","title":"...","xMin":-5,"xMax":5,"yMin":-5,"yMax":5,"asymptotes":[{"type":"vertical","value":3},{"type":"horizontal","value":1},{"type":"oblique","slope":1,"intercept":4}],"functions":[{"expr":"x^3-3*x","label":"y=x^3-3x","color":"#176fa8"}]}
 - "expr" viết theo cú pháp máy tính: dùng dấu * cho phép nhân (viết "3*x" chứ không phải "3x"), dùng ^ cho luỹ thừa. Dùng được sin, cos, tan, sqrt, abs, exp, log, ln, pi.
 - Chọn xMin/xMax/yMin/yMax bao trọn các điểm cực trị và giao điểm cần quan sát.
 - "asymptotes": bắt buộc với hàm phân thức hoặc hàm có tiệm cận. Tính chính xác trước khi ghi: tiệm cận đứng dùng {"type":"vertical","value":a} cho $x=a$; tiệm cận ngang dùng {"type":"horizontal","value":b} cho $y=b$; tiệm cận xiên dùng {"type":"oblique","slope":m,"intercept":n} cho $y=mx+n$. Chỉ ghi các tiệm cận thực sự tồn tại, không đưa đồng thời ngang và xiên nếu không đúng.
 - BẮT BUỘC có ít nhất một đồ thị khi bài học có bất kỳ nội dung nào sau đây: nhận biết tính đơn điệu hoặc cực trị QUA HÌNH ẢNH ĐỒ THỊ, khảo sát và vẽ đồ thị hàm số, tương giao đồ thị, hoặc khi sách giáo khoa có hình vẽ đồ thị ở phần tương ứng. Yêu cầu cần đạt "nhận biết qua hình ảnh đồ thị" mà bản soạn không có đồ thị nào thì chưa dạy được mục tiêu đó.

QUY TẮC CHUNG: mỗi khối mathviz đặt ngay dưới dòng văn bản dẫn vào nó. Chỉ dùng khi đúng nội dung bài, không ép dùng cho mọi bài Toán. Nhưng với bài về tính đơn điệu, cực trị hay khảo sát hàm số thì bảng biến thiên và đồ thị là bắt buộc, không được thay bằng lời mô tả suông.`}
function promptFor(v){const grade=clampGrade(v.grade);return `Bạn là chuyên gia hàng đầu về xây dựng Kế hoạch bài dạy tại Việt Nam. Hãy soạn KHBD năm học 2026–2027, tuyệt đối dựa trên tài liệu nguồn nếu có.
THÔNG TIN: Môn ${v.subject}; lớp ${grade}; bài ${v.lesson}; bộ sách ${v.book}; số tiết ${v.periods||'hãy xác định từ SGV/tài liệu'}; học sinh ${v.students}; sĩ số ${v.classSize}; thiết bị ${v.equipment}. Ghi chú: ${v.notes||'không'}.
YÊU CẦU BẮT BUỘC:
1) Ghi rõ căn cứ xác định số tiết; nếu nguồn thiếu thì ghi “đề xuất” và không bịa trang sách.
2) Bám sát ĐÚNG khung dưới đây — không tự đổi tên đề mục, không bỏ mục nào, không gộp mục. Bốn kiểu hoạt động (Khởi động, Hình thành kiến thức mới, Luyện tập, Vận dụng) là bắt buộc; riêng số lượng "Hoạt động 1, 2, 3..." bên trong mục Hình thành kiến thức mới do nội dung bài quyết định. Mọi hoạt động đều phải có đủ bốn phần a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện. Tiến trình phải CHIA THEO TỪNG TIẾT bằng các dòng "TIẾT 1: ...", "TIẾT 2: ..." cho đủ số tiết được giao:
${KHBD_TEMPLATE_5512}
3) Mục d) Tổ chức thực hiện của các "Hoạt động 1, 2, 3..." thuộc phần HÌNH THÀNH KIẾN THỨC MỚI phải xuất một khối mã lessonflow chứa JSON hợp lệ, đúng 4 rows, tuyệt đối không dùng bảng Markdown. Riêng HOẠT ĐỘNG KHỞI ĐỘNG, HOẠT ĐỘNG LUYỆN TẬP và HOẠT ĐỘNG VẬN DỤNG thì viết bốn bước theo văn xuôi, mỗi bước là một đề mục in đậm, KHÔNG dùng lessonflow — đúng như giáo án mẫu của tổ chuyên môn. Mỗi row dùng schema: {"step":"Bước 1: Chuyển giao nhiệm vụ","duration":3,"goalIds":["MT1"],"teacherActions":["GV ..."],"studentActions":["HS ..."],"product":["SP1: <VIẾT RA nội dung kiến thức hoặc lời giải đầy đủ>"],"assessment":["TC1: tiêu chí và cách thu thập minh chứng"],"competency":["Mã: hành vi quan sát được"],"sourceTag":"Theo nguồn: <tên tệp và mục cụ thể>" hoặc "AI đề xuất"} (nhãn phải bắt đầu đúng bằng chữ "Theo nguồn:" hoặc "AI đề xuất"). Tên bốn bước phải đúng nguyên văn: "Bước 1: Chuyển giao nhiệm vụ", "Bước 2: Thực hiện nhiệm vụ", "Bước 3: Báo cáo, thảo luận", "Bước 4: Kết luận, nhận định". TRƯỜNG "product" LÀ CHỖ QUAN TRỌNG NHẤT CỦA CẢ BẢN KẾ HOẠCH: nó phải chứa nội dung kiến thức viết ra thành chữ — định nghĩa nguyên văn, định lí, kết luận, chú ý, và lời giải chi tiết từng bước của mọi hoạt động/ví dụ/luyện tập được nhắc tới. Mỗi phần tử bắt đầu bằng mã SP1, SP2... rồi mới đến nội dung. Dừng ở "SP1: Kết luận về tính đơn điệu" là SAI; phải viết hẳn: "SP1: Cho hàm số $y=f(x)$ có đạo hàm trên khoảng $K$. Nếu $f'(x)>0$ với mọi $x \\in K$ thì hàm số đồng biến trên $K$; nếu $f'(x)<0$ với mọi $x \\in K$ thì hàm số nghịch biến trên $K$." Phần tử product của bước 3 và bước 4 thường dài vài câu trở lên. Giáo viên phải cầm bản in này lên lớp dạy được ngay mà không cần mở lại sách. Khối đầy đủ có dạng {"type":"lessonflow","rows":[...]}. duration là số phút nguyên dương; goalIds chỉ được dùng mã mục tiêu đã khai báo; sản phẩm phải có mã SP; tiêu chí phải có mã TC. Mỗi công thức trong JSON đặt giữa $...$ và gạch chéo ngược LaTeX viết thành hai gạch chéo ngược để JSON hợp lệ.
Bảng phải tách rõ việc GV làm và HS làm, thể hiện câu hỏi/nhiệm vụ, cách tổ chức, thời lượng, phân hoá cho ${v.students}, phù hợp ${v.classSize} HS và thiết bị ${v.equipment}. Sản phẩm dự kiến phải đặt song song với từng bước, có nội dung/đáp án/kiến thức chốt cụ thể. assessment phải nêu phương pháp/công cụ, minh chứng và tiêu chí quan sát được. competency chỉ gắn khi có hành vi quan sát được; nếu không phát sinh ghi "—".
${buildStandardsBlock(v)}
4) ${$('includeDigital').checked?'Đề xuất NLS ở Bậc '+nlsLevelForGrade(grade)+' chỉ khi có hành vi số quan sát được; nếu không phù hợp ghi “—”.':'Không tích hợp NLS.'} ${$('includeAI').checked&&grade>=10?'NLAI không bắt buộc ở mọi môn/tiết; chỉ gắn mã đúng lớp '+grade+' khi học sinh thực sự tìm hiểu, sử dụng, kiểm chứng hoặc đánh giá AI; phải đối chiếu kết quả AI và không gắn hình thức.':'Không tích hợp NLAI'+(grade<10?' vì phần mềm chưa có bảng NLAI chuẩn cho lớp này.':'.')}
5) Mọi công thức nội dòng bắt buộc đặt giữa $...$; công thức riêng dòng đặt giữa $$...$$. Tuyệt đối không in lệnh LaTeX trần như \\frac, \\sqrt, \\lim ngoài dấu phân cách. QUAN TRỌNG — lỗi hay gặp cần tránh: bên trong $...$/$$...$$ PHẢI giữ nguyên dấu gạch chéo ngược "\" của mọi lệnh LaTeX (vec, in, mathbb, cdot, perp, Leftrightarrow, frac, widehat, overrightarrow...) ở TẤT CẢ các phần của tài liệu, kể cả các gạch đầu dòng văn xuôi ở mục a) Mục tiêu/b) Nội dung/c) Sản phẩm (không chỉ bên trong khối lessonflow). Viết ĐÚNG: "$\\vec{a} = k\\vec{b}$ ($k \\in \\mathbb{R}$, $\\vec{b} \\neq \\vec{0}$)"; "$\\widehat{AOB}$"; "$\\vec{IA}+\\vec{IB}+\\vec{IC}+\\vec{ID}=\\vec{0}$". KHÔNG được viết thành "$veca = kvecb$ ($k in mathbbR$)" hay "$vecIA+vecIB=vec0$" (thiếu dấu \\ sẽ làm hỏng công thức khi hiển thị).
${mathRulesFor(v)}
7) ĐÁNH MÃ VÀ LIÊN KẾT: Mọi mục tiêu dùng mã MT1, MT2... và động từ quan sát được. Mọi sản phẩm dùng SP1, SP2...; mọi tiêu chí dùng TC1, TC2... Sau phần Mục tiêu, tạo bảng Markdown "MA TRẬN LIÊN KẾT MỤC TIÊU – HOẠT ĐỘNG – SẢN PHẨM – ĐÁNH GIÁ" gồm 4 cột: Mục tiêu | Hoạt động | Sản phẩm | Tiêu chí/công cụ. Không để mục tiêu nào thiếu hoạt động, sản phẩm hoặc tiêu chí tương ứng.
8) THỜI LƯỢNG: Mỗi row lessonflow có duration. Mỗi tiết 45 phút; tiến trình phải chia đủ số dòng "TIẾT n:" bằng đúng số tiết được giao và nội dung mỗi tiết phải vừa 45 phút. Tổng thời lượng toàn bài phải đúng ${v.periods?Number(v.periods)*45:'số tiết đề xuất × 45'} phút; cuối Tiến trình ghi "Tổng thời lượng: ... phút". Nếu giao vận dụng ngoài giờ, duration ghi thời gian giao nhiệm vụ trên lớp, không cộng thời gian HS làm ở nhà.
9) CÔNG CỤ ĐÁNH GIÁ: ${v.assessmentMode==='day-du'?'Cuối KHBD tạo phụ lục công cụ đánh giá phù hợp (bảng kiểm hoặc rubric), có tiêu chí TC, 3 mức Chưa đạt/Đạt/Tốt và minh chứng; không tạo đầu điểm riêng cho NLS/NLAI.':v.assessmentMode==='co-ban'?'Trong từng bước nêu câu hỏi/cách đánh giá, đáp án hoặc tiêu chí cơ bản; không cần phụ lục rubric.':'Không tạo phụ lục đánh giá riêng, nhưng vẫn phải có assessment trong từng bước.'}
10) DẤU VẾT NGUỒN: ${v.sourceMode==='strict'?'KHÓA NGUỒN TUYỆT ĐỐI: chỉ sử dụng thông tin có trong tài liệu đính kèm/nội dung bổ sung; không tự thêm yêu cầu cần đạt, số tiết, kiến thức, bài tập hoặc dữ kiện. Phần không xác định được phải ghi “Chưa đủ dữ liệu nguồn – giáo viên bổ sung”, tuyệt đối không suy diễn.':$('traceSources').checked?'Trong sourceTag và các dữ kiện quan trọng, ghi “Theo nguồn: tên tệp/mục” nếu thật sự có trong tài liệu; phần do AI bổ sung phải ghi “AI đề xuất”. Không được gắn nhãn “Theo nguồn” nếu không xác định được tài liệu.':'Không bắt buộc gắn nhãn nguồn trong từng nội dung.'} Cuối bài tạo mục “DẤU VẾT NGUỒN VÀ TRÁCH NHIỆM GIẢI TRÌNH”.
10.1) MẪU CHUYÊN MÔN: ${v.lessonTemplate==='math'?'Ưu tiên lập luận, biểu diễn toán học, bài tập phân hóa và kiểm tra đáp án.':v.lessonTemplate==='science'?'Ưu tiên tiến trình khám phá/thí nghiệm, an toàn, quan sát và xử lí dữ liệu.':v.lessonTemplate==='language'?'Ưu tiên đọc–viết–nói–nghe, ngữ liệu, giao tiếp và sản phẩm ngôn ngữ.':v.lessonTemplate==='project'?'Ưu tiên vấn đề thực tiễn, thiết kế, chế tạo, thử nghiệm, cải tiến và rubric sản phẩm.':'Tự chọn phương pháp đặc thù phù hợp môn học; không áp dụng máy móc mẫu của môn khác.'}
11) TRÍCH DẪN SÁCH: chỉ được ghi số trang, số hiệu bài tập, số hiệu hoạt động (HĐ1, Ví dụ 2, Luyện tập 3, Bài 1.5...) khi con số đó THỰC SỰ NHÌN THẤY trong tài liệu đính kèm. Nếu không đọc được số trang trong tài liệu, ghi "SGK — bài <tên bài>" và KHÔNG kèm số trang. Bịa số trang là lỗi nghiêm trọng vì giáo viên sẽ mở sách theo chỉ dẫn đó trước mặt học sinh.
12) ĐỘ DÀI: một kế hoạch bài dạy đạt yêu cầu cho ${v.periods||"số tiết đề xuất"} tiết thường dài hàng chục nghìn ký tự vì phải chép đủ kiến thức và lời giải. Không rút gọn, không viết tắt nội dung bằng nhãn, không dùng dấu ba chấm để lược bỏ. Nếu buộc phải chọn giữa ngắn gọn và đầy đủ nội dung dạy học, luôn chọn đầy đủ.
13) Câu hỏi phải chính xác; tự giải và kiểm tra đáp án hai lần. Không sao chép máy móc giáo án tham khảo; không bịa dữ kiện từ nguồn. Đầu ra bằng Markdown, không mở đầu xã giao, phong cách ${$('style').value}.`}
const MAX_MODEL_ATTEMPTS=3; // Giới hạn số mô hình thử tuần tự, tránh giáo viên phải chờ hàng chục phút nếu key có nhiều model nhưng đều lỗi.

/* ===== Gọi Gemini theo lối truyền dòng (viết lại ở b16) =====

   MÂU THUẪN CỦA BẢN b15: prompt bắt mô hình viết "hàng chục nghìn ký tự" và hạn mức
   token đã nới tới 65536 (≈ 25–30 nghìn token), trong khi lượt gọi lại dùng
   :generateContent — phải chờ VIẾT XONG TOÀN BỘ mới trả về — và flow.js cắt ngang ở
   đúng 120 giây. Một bài dài như thế thường mất 2–5 phút. Nghĩa là ở chính cấu hình mà
   phần mềm tự đặt ra, lỗi "AI phản hồi quá 120 giây" là chuyện THƯỜNG TRỰC dù mọi thứ
   đều đang chạy đúng.

   NAY: dùng :streamGenerateContent?alt=sse. Nội dung về tới đâu nhận tới đó, nên:
   - Đồng hồ đếm ngược được đặt lại mỗi lần có dữ liệu mới. Chỉ ngắt khi mô hình IM LẶNG
     quá lâu — tức là hỏng thật — chứ không ngắt vì bài dài.
   - Giáo viên nhìn thấy số ký tự tăng dần, biết máy đang chạy chứ không treo.
   Bản vá fetch trong flow.js bắt theo chuỗi ':generateContent' nên không chạm vào
   ':streamGenerateContent' — hai cơ chế không giẫm chân nhau.

   Vẫn giữ đường không truyền dòng làm dự phòng cho trình duyệt không đọc được luồng. */
const STREAM_IDLE_MS=90000;   // im lặng quá 90 giây mới coi là hỏng
const STREAM_TOTAL_MS=600000; // trần tuyệt đối 10 phút cho một lượt
/* Đường dự phòng không truyền dòng vẫn đi qua bản vá fetch của flow.js. Trần 120 giây cũ
   quá chật cho một KHBD dài, nên nới đúng bằng trần của đường truyền dòng. */
window.AI_TIMEOUT_MS=STREAM_TOTAL_MS;

/* Token suy nghĩ của Gemini 2.5 trở lên ĐƯỢC TÍNH VÀO maxOutputTokens. Không đặt trần thì
   mô hình có thể tiêu một phần lớn hạn mức vào suy nghĩ rồi bị cắt giữa bài, báo MAX_TOKENS,
   và thông báo lỗi lại khuyên giáo viên "giảm số tiết" — quy sai nguyên nhân. Mô hình đời
   cũ không biết trường này nên chỉ gửi khi tên mô hình cho thấy có suy luận, và nếu vẫn bị
   từ chối thì thử lại đúng mô hình đó mà bỏ trường đi. */
function thinkingFor(model){return /gemini-(?:2\.5|[3-9])/i.test(model)?{thinkingBudget:4096}:null}

function requestBody(fullName,model,parts,withThinking){
  const cfg={temperature:.25,maxOutputTokens:maxTokensFor(fullName)};
  const th=withThinking?thinkingFor(model):null;
  if(th)cfg.thinkingConfig=th;
  return JSON.stringify({contents:[{role:'user',parts}],generationConfig:cfg});
}

/* Đọc luồng SSE. Trả về {text, finish}. */
async function readSSE(res,onGrow){
  const reader=res.body.getReader(),dec=new TextDecoder();
  let buf='',text='',finish='';
  for(;;){
    const {done,value}=await reader.read();
    if(done)break;
    onGrow&&onGrow(0);
    buf+=dec.decode(value,{stream:true});
    let nl;
    while((nl=buf.indexOf('\n'))>=0){
      const line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);
      if(!line.startsWith('data:'))continue;
      const payload=line.slice(5).trim();
      if(!payload||payload==='[DONE]')continue;
      let obj;try{obj=JSON.parse(payload)}catch(_){continue}
      if(obj.error)throw new Error(obj.error.message||'Google trả về lỗi giữa luồng');
      const c=obj.candidates?.[0];
      if(c?.finishReason)finish=c.finishReason;
      /* Bỏ các phần "thought": đó là ghi chép suy luận của mô hình, không phải giáo án. */
      const t=(c?.content?.parts||[]).filter(x=>!x.thought).map(x=>x.text||'').join('');
      if(t){text+=t;onGrow&&onGrow(text.length)}
    }
  }
  return {text,finish};
}

async function generateOnce(fullName,model,parts,key,withThinking,onGrow){
  const ctrl=new AbortController();
  let idle=null;
  const hard=setTimeout(()=>ctrl.abort(),STREAM_TOTAL_MS);
  const arm=()=>{clearTimeout(idle);idle=setTimeout(()=>ctrl.abort(),STREAM_IDLE_MS)};
  arm();
  try{
    const base=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`;
    const res=await fetch(`${base}:streamGenerateContent?alt=sse`,{
      method:'POST',signal:ctrl.signal,
      headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:requestBody(fullName,model,parts,withThinking)});
    if(!res.ok){
      const data=await res.json().catch(()=>({}));
      const e=new Error(data?.error?.message||`Lỗi HTTP ${res.status}`);e.status=res.status;throw e;
    }
    if(!res.body||typeof res.body.getReader!=='function'){
      /* Trình duyệt không đọc được luồng: quay về cách cũ, vẫn có ích hơn là báo hỏng. */
      const r2=await fetch(`${base}:generateContent`,{method:'POST',signal:ctrl.signal,
        headers:{'Content-Type':'application/json','x-goog-api-key':key},
        body:requestBody(fullName,model,parts,withThinking)});
      const d2=await r2.json();
      if(!r2.ok){const e=new Error(d2?.error?.message||`Lỗi HTTP ${r2.status}`);e.status=r2.status;throw e}
      const c=d2.candidates?.[0];
      return {text:(c?.content?.parts||[]).filter(x=>!x.thought).map(x=>x.text||'').join('\n'),
              finish:c?.finishReason||''};
    }
    return await readSSE(res,n=>{arm();if(n)onGrow&&onGrow(n)});
  }catch(err){
    if(err.name==='AbortError')
      throw new Error(`AI ngừng phản hồi quá ${Math.round(STREAM_IDLE_MS/1000)} giây. Hãy bớt tài liệu đính kèm, giảm số tiết hoặc chọn mô hình khác ở mục nâng cao.`);
    if(err instanceof TypeError)throw new Error('Không kết nối được tới Google. Kiểm tra Internet rồi thử lại.');
    throw err;
  }finally{clearTimeout(idle);clearTimeout(hard)}
}

/* 429 là hết hạn ngạch, 500/503 là Google quá tải — cả hai đều là trạng thái NHẤT THỜI.
   Bản b15 gặp hai lỗi này liền chuyển sang mô hình dự phòng, nhưng các mô hình dùng CHUNG
   một hạn ngạch nên cũng 429 nốt, rồi báo một thông báo gộp khó hiểu. Chờ rồi thử lại
   đúng mô hình đó có ích hơn nhiều, nhất là với khoá miễn phí. */
const RETRY_DELAYS=[4000,12000];
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function callGemini(v,key){
  const parts=[{text:promptFor(v)},...(await buildFileParts(key))];
  if(!availableModels.length)await scanModels(false);
  const selected=$('model').value;
  const allCandidates=selected!=='auto'
    ?[selected,...availableModels.map(m=>m.name).filter(n=>n!==selected)]
    :availableModels.map(m=>m.name);
  if(!allCandidates.length)throw new Error('Không tìm thấy mô hình Gemini đang hoạt động cho API key này');
  const candidates=allCandidates.slice(0,MAX_MODEL_ATTEMPTS),skipped=allCandidates.length-candidates.length;
  const errors=[];
  for(let i=0;i<candidates.length;i++){
    const fullName=candidates[i],model=fullName.replace(/^models\//,'');
    setProgress(48+Math.min(i,4)*5,'Đang soạn bài...',`Mô hình ${model}${i?` (dự phòng ${i}/${candidates.length-1})`:''}`);
    let withThinking=true;
    for(let attempt=0;attempt<=RETRY_DELAYS.length;attempt++){
      try{
        const onGrow=n=>setProgress(Math.min(92,55+Math.floor(n/1200)),'Đang soạn bài...',
          `${model} · đã nhận ${n.toLocaleString('vi-VN')} ký tự`);
        const {text,finish}=await generateOnce(fullName,model,parts,key,withThinking,onGrow);
        if(!text)throw new Error('Mô hình không trả về nội dung');
        /* MAX_TOKENS nghĩa là mô hình đã viết hết hạn mức chứ không phải mô hình lỗi — thử mô
           hình dự phòng khác cũng sẽ bị cắt y hệt, chỉ tốn thêm vài phút chờ. Dừng ngay. */
        if(finish==='MAX_TOKENS')throw new Error(`Bài soạn dài hơn hạn mức của ${model} (${maxTokensFor(fullName)} token) nên bị cắt giữa chừng. Hãy giảm số tiết, chọn phong cách “Gọn, dễ triển khai”, hoặc tách bài thành 2 lần soạn.`);
        if(['SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(finish))
          throw new Error(`Phản hồi bị chặn (${finish}). Hãy giảm số tài liệu hoặc tạo lại.`);
        setModelStatus(`Đang dùng ${model}`,'ok');
        if([...$('model').options].some(o=>o.value===fullName))$('model').value=fullName;
        return text;
      }catch(err){
        const msg=err.message||'';
        /* Mô hình đời cũ không biết thinkingConfig: thử lại ngay, cùng mô hình, bỏ trường đó. */
        if(withThinking&&err.status===400&&/thinking|Unknown name|Invalid JSON payload/i.test(msg)){
          withThinking=false;attempt--;continue;
        }
        const transient=err.status===429||err.status===500||err.status===503||/quota|rate limit|overloaded|try again/i.test(msg);
        if(transient&&attempt<RETRY_DELAYS.length){
          const s=Math.round(RETRY_DELAYS[attempt]/1000);
          setProgress(50,'Google đang bận...',`${model} · chờ ${s} giây rồi thử lại (lần ${attempt+1}/${RETRY_DELAYS.length})`);
          await wait(RETRY_DELAYS[attempt]);
          continue;
        }
        /* Có những lỗi mà thử mô hình dự phòng chắc chắn cũng hỏng y hệt: bài quá dài so với
           hạn mức, khóa API sai/hết hạn, hoặc nội dung bị chặn. Dừng ngay, đừng bắt chờ thêm. */
        if(/hạn mức|API key not valid|API_KEY_INVALID|PERMISSION_DENIED|bị chặn/i.test(msg))throw err;
        errors.push(`${model}: ${msg}`);
        break;
      }
    }
  }
  throw new Error(`Đã thử ${candidates.length} mô hình nhưng đều chưa phản hồi${skipped?` (còn ${skipped} mô hình chưa thử, hãy chọn thủ công ở mục nâng cao)`:''}. ${errors.slice(0,2).join(' · ')}`);
}
function fallback(v){const p=v.periods||'…',g=clampGrade(v.grade);return `# KẾ HOẠCH BÀI DẠY\n## ${v.subject.toUpperCase()} ${g} — ${v.lesson}\n**Bộ sách:** ${v.book}  \n**Thời lượng:** ${p} tiết ${v.periods?'':'(cần xác định từ SGV)'}  \n**Đối tượng:** ${v.students}; **Sĩ số:** ${v.classSize}  \n**Thiết bị:** ${v.equipment}\n\n> Đây là khung dự thảo tạo không dùng AI (chưa gắn mã NLS/NLAI vì không tra được bảng mã ở chế độ này). Hãy bổ sung API key miễn phí để hệ thống đọc sâu tài liệu, tạo nội dung đặc thù và gắn đúng mã NLS/NLAI theo lớp ${g}.\n\n## I. MỤC TIÊU\n### 1. Về kiến thức\n- Nội dung kiến thức cốt lõi của bài ${v.lesson} theo đúng yêu cầu cần đạt của chương trình môn học.\n### 2. Về năng lực\n- Năng lực chung: tự chủ và tự học; giao tiếp và hợp tác; giải quyết vấn đề và sáng tạo.\n- Năng lực đặc thù môn học cần phát triển qua bài học.\n### 3. Về phẩm chất\n- Chăm chỉ, trung thực, trách nhiệm trong học tập và hợp tác.\n\n## II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n- Giáo viên: SGK, SGV, phiếu học tập, ${v.equipment}.\n- Học sinh: SGK, vở ghi, dụng cụ học tập.\n\n## III. TIẾN TRÌNH DẠY HỌC\n### 1. Hoạt động 1: Xác định vấn đề/nhiệm vụ học tập/Mở đầu\na) Mục tiêu — b) Nội dung — c) Sản phẩm — d) Tổ chức thực hiện (Giao nhiệm vụ → Thực hiện nhiệm vụ → Báo cáo, thảo luận → Kết luận, nhận định).\n\n### 2. Hoạt động 2: Hình thành kiến thức mới\na) Mục tiêu — b) Nội dung — c) Sản phẩm — d) Tổ chức thực hiện (4 bước như trên).\n\n### 3. Hoạt động 3: Luyện tập\na) Mục tiêu — b) Nội dung: hệ thống câu hỏi/bài tập phân hoá cho học sinh ${v.students} — c) Sản phẩm: đáp án, lời giải — d) Tổ chức thực hiện (4 bước như trên).\n\n### 4. Hoạt động 4: Vận dụng\na) Mục tiêu — b) Nội dung: vận dụng kiến thức vào tình huống thực tiễn — c) Sản phẩm: báo cáo — d) Tổ chức thực hiện: thường giao ngoài giờ học trên lớp, nộp báo cáo vào thời điểm phù hợp.\n\n*(Đánh giá thường xuyên được lồng ngay trong mục d) Tổ chức thực hiện của từng hoạt động — hỏi–đáp, viết, thực hành, sản phẩm học tập — theo đúng Phụ lục IV, Công văn 5512/BGDĐT-GDTrH; không lập cột điểm/đầu điểm riêng cho NLS/NLAI.)*\n\n## ĐIỀU CHỈNH SAU BÀI DẠY\n........................................................................`}
// Phòng hờ: model đôi khi làm mất dấu "\" của lệnh LaTeX khi viết văn xuôi (mục a/b/c ngoài
// bảng tổ chức thực hiện) — ví dụ "$\vec{a}=k\vec{b}$" bị trả về thành "$veca=kvecb$". Bên trong
// bảng (JSON lessonflow) hầu như không gặp vì model phải giữ đúng cú pháp JSON. Đây chỉ là lưới an
// toàn, KHÔNG thay thế việc dặn model giữ đúng "\" ngay trong prompt (xem promptFor()).
const LATEX_CMDS=['overrightarrow','widehat','mathbb','mathrm','Leftrightarrow','Rightarrow','leftrightarrow','rightarrow','overline','underline','forall','exists','angle','parallel','approx','equiv','notin','subset','infty','sqrt','frac','dfrac','left','right','quad','qquad','times','cdot','perp','cong','sim','circ','boxed','text','vec','hat','bar','sum','prod','int','alpha','beta','gamma','delta','theta','lambda','sigma','omega','phi','pi','leq','geq','neq','pm','mp','in'];
// Mẫu riêng hay gặp nhất ở bài vectơ: model làm mất CẢ "\" lẫn "{}" (vd "\vec{IA}" -> "vecIA",
// "\vec{0}" -> "vec0") — phải vá TRƯỚC lượt repairLatex chung ở trên (lượt chung chỉ vá được
// trường hợp còn giữ "{}", ví dụ "vec{a}" -> "\vec{a}", không tự đoán được ranh giới đối số nếu
// thiếu cả ngoặc). Chỉ áp dụng cho "vec" + (một chữ số 0) hoặc (cụm chữ hoa ngắn kiểu tên điểm
// AB, IA, OC'...) vì đây là dạng tên vectơ duy nhất xuất hiện trong nội dung hình học không gian.
const vecBareRe=/(^|[^\\}])vec(0|[A-Z][A-Za-z']{0,3}|[a-z]'?)\b/g;
const repairVecBare=s=>s.replace(vecBareRe,(m,pre,arg)=>pre+'\\vec{'+arg+'}');
const latexCmdRe=new RegExp('(^|[^\\\\a-zA-Z])('+LATEX_CMDS.join('|')+')(?=\\{|\\s|\\(|\\)|$|[+\\-=,.])','g');
const repairLatex=s=>repairVecBare(s).replace(latexCmdRe,(m,pre,cmd)=>pre+'\\'+cmd);
function inline(s){return esc(s).replace(/&lt;br\s*\/?&gt;/gi,'<br>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/\$\$([^$]+)\$\$/g,(m,g1)=>`<span class="math-display">\\[${repairLatex(g1)}\\]</span>`).replace(/\$([^$]+)\$/g,(m,g1)=>`<span class="math">\\(${repairLatex(g1)}\\)</span>`)}
function mdToHtml(md){const specs=[];md=md.replace(/```mathviz\s*([\s\S]*?)```/gi,(_,json)=>{const id=specs.push(json.trim())-1;return `\n@@MATHVIZ_${id}@@\n`});const lines=md.replace(/```[a-z]*\n?/g,'').replace(/```/g,'').split('\n');let out='',list=false;for(let i=0;i<lines.length;i++){let l=lines[i].trimEnd(),mv=l.trim().match(/^@@MATHVIZ_(\d+)@@$/);if(mv){if(list){out+='</ul>';list=false}out+=`<div class="mathviz" data-spec="${encodeURIComponent(specs[+mv[1]])}"></div>`;continue}if(l.startsWith('|')&&i+1<lines.length&&/^\|?[\s:|-]+\|?$/.test(lines[i+1].trim())){if(list){out+='</ul>';list=false}const rows=[];rows.push(l);i+=2;while(i<lines.length&&lines[i].trim().startsWith('|')){rows.push(lines[i].trim());i++}i--;out+='<table>';rows.forEach((r,ri)=>{const cells=r.replace(/^\||\|$/g,'').split('|');out+=`<tr>${cells.map(c=>`<${ri?'td':'th'}>${inline(c.trim())}</${ri?'td':'th'}>`).join('')}</tr>`});out+='</table>';continue}if(/^#{1,3} /.test(l)){if(list){out+='</ul>';list=false}const n=l.match(/^#+/)[0].length;out+=`<h${n}>${inline(l.slice(n+1))}</h${n}>`}else if(/^[-*] /.test(l)){if(!list){out+='<ul>';list=true}out+=`<li>${inline(l.slice(2))}</li>`}else if(/^\d+\. /.test(l)){if(list){out+='</ul>';list=false}out+=`<p>${inline(l)}</p>`}else if(l.startsWith('> ')){if(list){out+='</ul>';list=false}out+=`<blockquote>${inline(l.slice(2))}</blockquote>`}else if(!l){if(list){out+='</ul>';list=false}}else{if(list){out+='</ul>';list=false}out+=`<p>${inline(l)}</p>`}}if(list)out+='</ul>';return out}
/* ===== Bộ đọc biểu thức (viết lại ở b16) =====
   LỖI CỦA BẢN b15: hàm cũ thay "pi" thành "Math.PI" RỒI mới kiểm tra chuỗi bằng một biểu
   thức chính quy chỉ chấp nhận chữ thường, nên mọi hàm có số pi đều bị loại ngay tại cửa —
   sin(pi*x), cos(2pi x) không vẽ được một nét nào. Bản cũ cũng không biết ln, log cơ số,
   e^x, cot và |x|, tức là gần như toàn bộ chương Hàm số mũ – lôgarit và chương Lượng giác
   đều không có đồ thị.
   NAY: đọc biểu thức bằng bộ phân tích cú pháp đệ quy, tự dựng chuỗi JavaScript từ những
   mảnh do chính nó sinh ra, nên vừa đúng vừa không thể bị chèn mã. Quy ước Việt Nam:
   log là lôgarit thập phân, ln là lôgarit tự nhiên, log_2(x) hoặc log(2,x) là cơ số 2. */
const EXPR_FUNCS={sin:'Math.sin',cos:'Math.cos',tan:'Math.tan',sinh:'Math.sinh',cosh:'Math.cosh',
  tanh:'Math.tanh',asin:'Math.asin',arcsin:'Math.asin',acos:'Math.acos',arccos:'Math.acos',
  atan:'Math.atan',arctan:'Math.atan',sqrt:'Math.sqrt',abs:'Math.abs',exp:'Math.exp',
  ln:'Math.log',log:'Math.log10',lg:'Math.log10',floor:'Math.floor',ceil:'Math.ceil',
  round:'Math.round',sign:'Math.sign',cbrt:'Math.cbrt'};
const EXPR_CONSTS={pi:'Math.PI',e:'Math.E'};

function compileExpr(expr){
  let src=String(expr||'').toLowerCase()
    .replace(/[−–—]/g,'-').replace(/[×⋅·]/g,'*').replace(/[÷]/g,'/')
    .replace(/\\left|\\right|\\,|\\;|\\!/g,'')
    .replace(/\\(dfrac|frac|tfrac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,'(($2)/($3))')
    .replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g,'(($2)^(1/($1)))')
    .replace(/\\sqrt\s*\{([^{}]*)\}/g,'sqrt($1)')
    .replace(/\\/g,'')
    .replace(/\s+/g,'');
  src=src.replace(/^y=|^f\(x\)=|^y\(x\)=/,'');
  src=src.replace(/\bt\b/g,'x');
  if(!src)throw Error('Biểu thức rỗng');

  /* --- Tách token --- */
  const toks=[];
  for(let i=0;i<src.length;){
    const c=src[i];
    if(/[0-9.]/.test(c)){let j=i;while(j<src.length&&/[0-9.]/.test(src[j]))j++;toks.push({t:'num',v:src.slice(i,j)});i=j;continue}
    if(/[a-z]/.test(c)){let j=i;while(j<src.length&&/[a-z0-9_]/.test(src[j]))j++;toks.push({t:'id',v:src.slice(i,j)});i=j;continue}
    if('+-*/^(),|'.includes(c)){toks.push({t:c});i++;continue}
    if(c==='{'){toks.push({t:'('});i++;continue}
    if(c==='}'){toks.push({t:')'});i++;continue}
    throw Error('Ký tự không hợp lệ: '+c);
  }

  let p=0,barDepth=0;
  const peek=()=>toks[p];
  const eat=t=>{if(!toks[p]||toks[p].t!==t)throw Error('Thiếu "'+t+'"');return toks[p++]};
  /* Dấu "|" đang đóng một cặp trị tuyệt đối thì KHÔNG được hiểu là mở một atom mới,
     nếu không "|x|" bị đọc thành "|x| * |…" rồi báo thiếu vế. */
  const startsAtom=k=>!!k&&(k.t==='num'||k.t==='id'||k.t==='('||(k.t==='|'&&barDepth===0));

  function parseExpr(){
    let s=parseTerm();
    while(peek()&&(peek().t==='+'||peek().t==='-')){const op=toks[p++].t;s+=op+parseTerm()}
    return s;
  }
  function parseTerm(){
    let s=parseUnary();
    for(;;){
      const k=peek();
      if(!k)break;
      if(k.t==='*'||k.t==='/'){p++;s+=k.t+parseUnary();continue}
      /* Nhân ngầm: 2x, 2sin(x), x(x+1), (x+1)(x-1), 2pi */
      if(startsAtom(k)){s+='*'+parseUnary();continue}
      break;
    }
    return s;
  }
  function parseUnary(){
    const k=peek();
    if(k&&(k.t==='-'||k.t==='+')){p++;return (k.t==='-'?'-':'')+parseUnary()}
    return parsePower();
  }
  function parsePower(){
    const base=parseAtom();
    if(peek()&&peek().t==='^'){p++;return 'Math.pow('+base+','+parseUnary()+')'}
    return base;
  }
  function parseAtom(){
    const k=peek();
    if(!k)throw Error('Biểu thức thiếu vế');
    if(k.t==='num'){p++;if(!/^\d*\.?\d+$/.test(k.v))throw Error('Số không hợp lệ: '+k.v);return '('+k.v+')'}
    if(k.t==='('){p++;const inner=parseExpr();eat(')');return '('+inner+')'}
    if(k.t==='|'){p++;barDepth++;const inner=parseExpr();barDepth--;eat('|');return 'Math.abs('+inner+')'}
    if(k.t==='id'){
      p++;
      let name=k.v,base=null;
      const m=/^log_?(\d+(?:\.\d+)?)$/.exec(name);
      if(m){name='log';base=m[1]}
      if(name==='x')return 'x';
      if(EXPR_CONSTS[name])return EXPR_CONSTS[name];
      if(name==='log'&&peek()&&peek().t==='id'&&/^\d+$/.test(peek().v)){/* không xảy ra */}
      if(EXPR_FUNCS[name]||base!==null){
        /* sin^2(x): mũ đặt ngay sau tên hàm */
        let expo=null;
        if(peek()&&peek().t==='^'){p++;expo=parseAtom()}
        let arg;
        if(peek()&&peek().t==='('){p++;arg=parseExpr();
          if(peek()&&peek().t===','){p++;const second=parseExpr();eat(')');
            if(name==='log')return 'Math.log('+second+')/Math.log('+arg+')';
            throw Error('Hàm '+name+' không nhận hai đối số')}
          eat(')');
        } else arg=parsePower();
        let out;
        if(base!==null)out='Math.log('+arg+')/Math.log('+base+')';
        else out=EXPR_FUNCS[name]+'('+arg+')';
        if(name==='cot')out='(1/Math.tan('+arg+'))';
        return expo?'Math.pow('+out+','+expo+')':out;
      }
      if(name==='cot'||name==='sec'||name==='csc'){
        let arg;
        if(peek()&&peek().t==='('){p++;arg=parseExpr();eat(')')}else arg=parsePower();
        return name==='cot'?'(1/Math.tan('+arg+'))':name==='sec'?'(1/Math.cos('+arg+'))':'(1/Math.sin('+arg+'))';
      }
      throw Error('Chưa hỗ trợ ký hiệu "'+k.v+'"');
    }
    throw Error('Ký hiệu bất ngờ');
  }

  const js=parseExpr();
  if(p<toks.length)throw Error('Thừa ký tự ở cuối biểu thức');
  /* Chốt an toàn: chuỗi dựng ra chỉ gồm các mảnh do chính bộ đọc sinh. */
  if(!/^[0-9x+\-*/(),.\sMath.a-z0-9_]*$/.test(js.replace(/Math\.[A-Za-z0-9]+/g,'')))
    throw Error('Biểu thức không an toàn');
  const f=new Function('x','"use strict";return ('+js+')');
  if(!Number.isFinite(f(0.37))&&!Number.isFinite(f(1.7))&&!Number.isFinite(f(-1.3))&&!Number.isFinite(f(2.9)))
    throw Error('Biểu thức không cho giá trị số');
  return f;
}
const wrapMathCell=v=>{const s=String(v??'').trim();if(!s)return '';if(/^[+\-0↗↘↑↓∞]+$/.test(s))return esc(s);return s.includes('$')?inline(s):`$${esc(s)}$`};
// Nhãn đặt trong foreignObject để MathJax vẫn xử lý được $...$ bên trong SVG (phân số, chỉ số dưới...).
function svgLabel(cx,cy,content,anchor,w,h){w=w||100;h=h||24;const x=anchor==='start'?cx:anchor==='end'?cx-w:cx-w/2;const justify=anchor==='start'?'flex-start':anchor==='end'?'flex-end':'center';return `<foreignObject x="${x}" y="${cy-h/2}" width="${w}" height="${h}" style="overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" class="vt-label" style="justify-content:${justify}">${content}</div></foreignObject>`}
// Dựng bảng biến thiên dạng sơ đồ đường gấp khúc (đúng chuẩn SGK) từ schema {points,derivative,values}.
// points: N mốc x (thường có -∞/+∞ ở 2 đầu). derivative: đúng 2N-3 phần tử, xen kẽ dấu-khoảng/giá trị-tại-điểm.
// values: N giá trị y tương ứng từng điểm trong "points"; một phần tử có thể là {left,right} để biểu diễn
// điểm gián đoạn/tiệm cận (vd hàm phân thức) — khi đó vẽ dấu ngắt "‖" và tách 2 nhãn giá trị trái/phải.
function coerceLen(arr,n,fill){arr=Array.isArray(arr)?arr.slice():[];while(arr.length<n)arr.push(fill);if(arr.length>n)arr.length=n;return arr}

/* ===== Bảng xét dấu vẽ theo chuẩn SGK =====
   LỖI ĐÃ SỬA: bảng xét dấu trước đây dựng bằng <table> thường, mỗi "cells" là một <td>.
   Nhưng bảng xét dấu KHÔNG phải bảng thường: các dấu nằm XEN KẼ giữa và tại các mốc.
   Với N mốc thì có N-1 khoảng và N-2 mốc trong, tổng cộng 2N-3 ô dấu — nhiều hơn số cột
   tiêu đề. Hệ quả: thead có N ô còn tbody có 1+2N-3 ô, trình duyệt tự kéo giãn, bảng lệch
   hẳn và các mốc phình to như trong ảnh giáo viên gửi. Nay vẽ bằng SVG với đúng hình học
   xen kẽ: mốc nằm trên vạch dọc, dấu khoảng nằm giữa hai vạch. */

/* Từ bảng biến thiên suy ra luôn đồ thị. Giáo viên phản ánh bản soạn "chỉ có công thức và lời
   nói, không có hình ảnh trực quan": mô hình chịu viết bảng biến thiên nhưng gần như không bao
   giờ tự thêm khối đồ thị. Nay chỉ cần nó khai báo thêm "expr" trong chính khối bảng biến thiên
   là phần mềm vẽ luôn đồ thị bên dưới — bớt được một việc mà mô hình hay quên. */
function graphFromVariation(spec){
  const expr=String(spec.expr||'').trim();
  if(!expr)return null;
  const nums=(spec.points||[]).map(p=>Number(String(p).replace(/\\infty|∞|infty/gi,'NaN')))
    .filter(Number.isFinite);
  let xMin=-5,xMax=5;
  if(nums.length){const lo=Math.min(...nums),hi=Math.max(...nums),pad=Math.max(2,(hi-lo)*0.6||3);
    xMin=Math.floor(lo-pad);xMax=Math.ceil(hi+pad)}
  const vals=(spec.values||[]).map(v=>Number(typeof v==='object'?NaN:v)).filter(Number.isFinite);
  let yMin=-5,yMax=5;
  if(vals.length){const lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max(2,(hi-lo)*0.6||3);
    yMin=Math.floor(lo-pad);yMax=Math.ceil(hi+pad)}
  return {type:'graph',title:'Đồ thị '+(spec.funcLabel||('y = '+expr)),
    xMin,xMax,yMin,yMax,asymptotes:spec.asymptotes||[],functions:[{expr,label:spec.funcLabel||('y='+expr)}]};
}
function buildSignSVG(spec){
  const pts=(spec.columns||spec.points||[]).map(x=>String(x??''));
  const N=pts.length;
  if(N<2)return null;
  const rows=(spec.rows||[]).map(r=>({label:r.label??'',cells:coerceLen(r.cells,2*N-3,'')}));
  if(!rows.length)return null;
  /* Chuẩn SGK: không đóng khung, không kẻ cột tại nghiệm; chỉ một vạch dọc sau
     cột nhãn và các đường ngang phân hàng. Dấu khoảng nằm giữa hai mốc. */
  const W=760,leftLabel=62,rightPad=18,xStart=leftLabel+28,xEnd=W-rightPad-10,plotW=xEnd-xStart;
  const xAt=i=>xStart+(N===1?0:i*(plotW/(N-1)));
  const bandX=40,bandRow=46,padTop=8;
  const H=padTop+bandX+bandRow*rows.length+8;
  const rowTop=k=>padTop+bandX+bandRow*k;
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.title||'Bảng xét dấu')}">`;
  svg+=`<line x1="${leftLabel}" y1="${padTop}" x2="${leftLabel}" y2="${H-8}" class="vt-frame"/>`;
  for(let k=0;k<rows.length;k++){const y=rowTop(k);
    svg+=`<line x1="8" y1="${y}" x2="${W-rightPad}" y2="${y}" class="vt-frame"/>`}
  // nhãn hàng bên trái
  svg+=svgLabel(20,padTop+bandX/2,'$x$','middle',28,20);
  rows.forEach((r,k)=>{svg+=svgLabel(20,rowTop(k)+bandRow/2,wrapMathCell(r.label),'middle',30,20)});
  // các mốc trên hàng x
  pts.forEach((p,i)=>{svg+=svgLabel(xAt(i),padTop+bandX/2,wrapMathCell(p),'middle',120,22)});
  // dấu: chỉ số chẵn là dấu trên khoảng, chỉ số lẻ là giá trị tại mốc trong
  const discontinuities=new Set();
  rows.forEach((r,k)=>{
    const cy=rowTop(k)+bandRow/2;
    /* String(undefined) trả về chuỗi "undefined" chứ không phải chuỗi rỗng, nên nếu thiếu ô
       thì bảng in ra chữ "undefined" giữa bài. Phải dùng ?? '' trước khi ép kiểu. */
    for(let i=0;i<N-1;i++){const v=r.cells[2*i];
      if(String(v??'').trim())svg+=svgLabel((xAt(i)+xAt(i+1))/2,cy,wrapMathCell(v),'middle',80,22)}
    for(let i=1;i<=N-2;i++){const v=r.cells[2*i-1],sv=String(v??'').trim();
      if(/^\\?\|$/.test(sv))discontinuities.add(i);
      else if(sv)svg+=svgLabel(xAt(i),cy,wrapMathCell(v),'middle',60,22)}
  });
  discontinuities.forEach(i=>{svg+=`<line x1="${xAt(i)-3}" y1="${padTop+2}" x2="${xAt(i)-3}" y2="${H-10}" class="vt-discontinuity"/>`+
    `<line x1="${xAt(i)+3}" y1="${padTop+2}" x2="${xAt(i)+3}" y2="${H-10}" class="vt-discontinuity"/>`});
  return svg+'</svg>';
}
function buildVariationSVG(spec){
  const points=Array.isArray(spec.points)?spec.points:[];
  const N=points.length;
  if(N<2)return null;
  // Model đôi khi đếm lệch 1-2 phần tử trong "derivative"/"values" — tự đệm/cắt cho khớp thay vì
  // bỏ cuộc và báo lỗi ngay, để vẫn dựng được một sơ đồ có ích (có thể thiếu 1 dấu, còn hơn trắng trang).
  const deriv=coerceLen(spec.derivative,2*N-3,'');
  const values=coerceLen(spec.values,N,'');
  /* LỖI ĐÃ SỬA: bản cũ so sánh giá trị với đúng ký tự '+∞'. Nhưng mô hình trả về LaTeX
     "+\\infty", nên phép so sánh LUÔN trượt: vô cực không được ghim lên đỉnh/đáy khung mà bị
     tính như một mức bình thường, làm toàn bộ bảng lệch chiều — đúng hiện tượng trong ảnh. */
  const INF_POS=/^\+?\s*(\\infty|∞|infty|inf)$/i, INF_NEG=/^-\s*(\\infty|∞|infty|inf)$/i;
  const isPosInf=x=>INF_POS.test(String(x??'').trim());
  const isNegInf=x=>INF_NEG.test(String(x??'').trim());
  /* Hình học theo bảng biến thiên SGK: một cột nhãn x/y'/y, không đóng khung ngoài
     và không kẻ vạch dọc tại mọi điểm tới hạn. Chỉ điểm gián đoạn mới có hai vạch. */
  const W=760,leftLabel=62,rightPad=18,xStart=leftLabel+28,xEnd=W-rightPad-10,plotW=xEnd-xStart;
  const xAt=i=>xStart+(N===1?0:i*(plotW/(N-1)));
  const bandX=38,bandDeriv=44,bandVal=124,padTop=8,padBot=8;
  const yTop=padTop,derivTopY=yTop+bandX,valTopY=derivTopY+bandDeriv,valBotY=valTopY+bandVal,H=valBotY+padBot;
  const intervalSign=i=>deriv[2*i];
  let arriveLevel=[0],departLevel=[0];
  for(let i=0;i<N-1;i++){const s=intervalSign(i),d=s==='+'?1:s==='-'?-1:0,nextArrive=departLevel[i]+d;arriveLevel.push(nextArrive);const v=values[i+1];departLevel.push(v&&typeof v==='object'?(isPosInf(v.right)?nextArrive+3:isNegInf(v.right)?nextArrive-3:nextArrive):nextArrive)}
  const allLv=arriveLevel.concat(departLevel),minL=Math.min(...allLv),maxL=Math.max(...allLv),span=Math.max(1,maxL-minL);
  const yForLevel=lv=>valBotY-26-((lv-minL)/span)*(bandVal-52);
  const valLabel=i=>{const v=values[i];return (v&&typeof v==='object')?null:String(v)};
  const yArrive=i=>{const v=valLabel(i);if(isPosInf(v))return valTopY+16;if(isNegInf(v))return valBotY-16;return yForLevel(arriveLevel[i])};
  const yDepart=i=>{const v=valLabel(i);if(isPosInf(v))return valTopY+16;if(isNegInf(v))return valBotY-16;return yForLevel(departLevel[i])};
  const arrowId='vtArrow'+(++GRAPH_UID);
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.title||'Bảng biến thiên')}">`;
  svg+=`<defs><marker id="${arrowId}" markerWidth="7" markerHeight="7" refX="6.2" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" class="vt-arrow"/></marker></defs>`;
  svg+=`<line x1="${leftLabel}" y1="${yTop}" x2="${leftLabel}" y2="${valBotY}" class="vt-frame"/>`;
  svg+=`<line x1="8" y1="${derivTopY}" x2="${W-rightPad}" y2="${derivTopY}" class="vt-frame"/>`;
  svg+=`<line x1="8" y1="${valTopY}" x2="${W-rightPad}" y2="${valTopY}" class="vt-frame"/>`;
  svg+=svgLabel(20,(yTop+derivTopY)/2,'$x$','middle',28,20);
  svg+=svgLabel(20,(derivTopY+valTopY)/2,`$y'$`,'middle',28,20);
  svg+=svgLabel(20,(valTopY+valBotY)/2,'$y$','middle',28,20);
  points.forEach((p,i)=>{svg+=svgLabel(xAt(i),(yTop+derivTopY)/2,wrapMathCell(p),'middle',110,20)});
  for(let i=0;i<N-1;i++){const s=intervalSign(i);if(s)svg+=svgLabel((xAt(i)+xAt(i+1))/2,(derivTopY+valTopY)/2,wrapMathCell(s),'middle',60,20)}
  for(let i=1;i<N-1;i++){const v=deriv[2*i-1];if(!/^\\?\|$/.test(String(v??'').trim())&&v!==undefined)svg+=svgLabel(xAt(i),(derivTopY+valTopY)/2,wrapMathCell(v),'middle',60,20)}
  for(let i=0;i<N-1;i++){const inset=14,x1=xAt(i)+inset,x2=xAt(i+1)-inset,y1=yDepart(i),y2=yArrive(i+1);
    svg+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vt-path" marker-end="url(#${arrowId})"/>`}
  points.forEach((p,i)=>{const v=values[i],anchor=i===0?'start':(i===N-1?'end':'middle');if(v&&typeof v==='object'){const yL=isPosInf(v.left)?valTopY+16:isNegInf(v.left)?valBotY-16:yArrive(i),yR=isPosInf(v.right)?valTopY+16:isNegInf(v.right)?valBotY-16:yDepart(i),midY=(yL+yR)/2;svg+=svgLabel(xAt(i)-8,yL-14,wrapMathCell(v.left),'end',80,20);svg+=svgLabel(xAt(i)+8,yR-14,wrapMathCell(v.right),'start',80,20);/* Điểm gián đoạn: SGK vẽ hai vạch dọc song song chạy suốt hàng y (dấu ‖), không phải hai
   gạch xiên ngắn ở giữa như bản cũ — nhìn vào không ra ký hiệu gián đoạn. */
svg+=`<line x1="${xAt(i)-3}" y1="${derivTopY+2}" x2="${xAt(i)-3}" y2="${valBotY-2}" class="vt-discontinuity"/>`+
     `<line x1="${xAt(i)+3}" y1="${derivTopY+2}" x2="${xAt(i)+3}" y2="${valBotY-2}" class="vt-discontinuity"/>`}else{
    /* Nếu mô hình không tính ra giá trị cực trị, bản cũ để trống — người đọc tưởng bảng đã đủ.
       SGK dùng dấu "?" cho ô chưa điền, nên hiện "?" để giáo viên biết còn phải bổ sung. */
    const shown=String(v??'').trim()||'?';
    svg+=svgLabel(xAt(i)+(i===0?6:i===N-1?-6:0),yArrive(i)-14,wrapMathCell(shown),anchor,90,20)}});
  svg+='</svg>';
  return svg;
}

/* Tách riêng bộ vẽ đồ thị (trước đây nằm lọt trong renderMathViz) để docx-export.js dùng lại
   được khi xuất Word, thay vì phải chép lại toàn bộ mã vẽ. Nhân tiện sửa ba lỗi:
   1) id="plotClip" bị đặt cứng: hai đồ thị trở lên trong cùng một bài dùng chung một id,
      trình duyệt lấy id đầu tiên nên đồ thị sau bị cắt sai vùng.
   2) `+s.xMin||-5` trả về -5 khi xMin đúng bằng 0, vì 0 là giá trị falsy — mọi đồ thị khai
      báo xMin:0 hoặc yMin:0 đều bị vẽ sai miền. Dùng ?? và kiểm tra hữu hạn.
   3) Trục toạ độ không có số nào, giáo viên không đọc được giá trị. Nay có vạch chia.
   opt.standalone = true: nhúng kèm xmlns và CSS để SVG tự đứng một mình (dùng để đổi ra ảnh PNG). */
let GRAPH_UID=0;
const GRAPH_CSS='.plot-bg{fill:#fff;stroke:#b7c9d4}.grid-line{stroke:#dfe9ee;stroke-width:1}'
  +'.axis{stroke:#263d4c;stroke-width:1.7}.plot-path{fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}'
  +'.asymptote{fill:none;stroke:#c4473a;stroke-width:1.8;stroke-dasharray:8 6}.asymptote-label{font:italic 12px Arial,sans-serif;fill:#a9342a}'
  +'.tick{font:11px Arial,sans-serif;fill:#40566b}';
function inferAsymptotes(s){
  const explicit=Array.isArray(s.asymptotes)?s.asymptotes.filter(Boolean):[];
  if(explicit.length)return explicit;
  const expr=String(s.functions?.[0]?.expr||'').replace(/\s+/g,'');
  if(!expr.includes('/'))return [];
  const out=[];
  /* Tự nhận mẫu mẫu số bậc nhất (x-a) hoặc (x+a), phổ biến trong chương khảo sát. */
  const m=expr.match(/\/\(?x([+-])(\d+(?:\.\d+)?)\)?$/i);
  if(m)out.push({type:'vertical',value:m[1]==='-'?Number(m[2]):-Number(m[2])});
  /* Ước lượng phần đa thức khi |x| rất lớn. Với phân thức bậc tử không vượt quá
     bậc mẫu + 1, kết quả cho đúng tiệm cận ngang hoặc xiên; làm tròn nhiễu số. */
  try{const f=compileExpr(expr),M=1e5,a=(f(2*M)-f(M))/M,b=f(M)-a*M;
    if(Number.isFinite(a)&&Number.isFinite(b)){
      const aa=Math.abs(a)<1e-7?0:Math.round(a*1e6)/1e6,bb=Math.abs(b)<1e-6?0:Math.round(b*1e5)/1e5;
      if(Math.abs(aa)<1e4&&Math.abs(bb)<1e7)out.push(aa===0?{type:'horizontal',value:bb}:{type:'oblique',slope:aa,intercept:bb});
    }}catch(_){}
  return out;
}
/* Nới miền tung độ khi dữ liệu AI khai báo khung quá hẹp. Dùng phân vị thay vì
   min/max tuyệt đối để các điểm sát tiệm cận đứng không ép toàn bộ đường cong
   thành một nét gần như nằm ngang. Miền do giáo viên/AI khai báo chỉ được nới,
   không bị thu lại. */
function fitGraphYRange(s,x0,x1,y0,y1){
  if(s.autoFit===false)return {y0,y1};
  const values=[];
  for(const fn of s.functions||[]){
    let f;try{f=compileExpr(fn.expr)}catch(_){continue}
    for(let i=0;i<=1000;i++){
      const y=f(x0+(x1-x0)*i/1000);
      if(Number.isFinite(y)&&Math.abs(y)<1e9)values.push(y);
    }
  }
  if(values.length<5)return {y0,y1};
  values.sort((a,b)=>a-b);
  const q=p=>values[Math.max(0,Math.min(values.length-1,Math.floor((values.length-1)*p)))];
  const lo=q(.02),hi=q(.98),oldSpan=y1-y0;
  let next0=Math.min(y0,lo),next1=Math.max(y1,hi);
  if(next0===y0&&next1===y1)return {y0,y1};
  const pad=Math.max((next1-next0)*.07,oldSpan*.04,0.25);
  if(lo<y0)next0-=pad;
  if(hi>y1)next1+=pad;
  return {y0:next0,y1:next1};
}
function buildGraphSVG(s,opt){
  opt=opt||{};
  const num=(v,d)=>{const n=Number(v);return Number.isFinite(n)?n:d};
  const W=760,H=390,p=38;
  let x0=num(s.xMin,-5),x1=num(s.xMax,5),y0=num(s.yMin,-5),y1=num(s.yMax,5);
  if(x1<=x0){x0=-5;x1=5}
  if(y1<=y0){y0=-5;y1=5}
  ({y0,y1}=fitGraphYRange(s,x0,x1,y0,y1));
  const X=x=>p+(x-x0)/(x1-x0)*(W-2*p),Y=y=>H-p-(y-y0)/(y1-y0)*(H-2*p);
  const uid='plotClip'+(++GRAPH_UID);
  const step=r=>{const raw=(r)/10,pow=Math.pow(10,Math.floor(Math.log10(raw)||0));const m=raw/pow;return (m<1.5?1:m<3.5?2:m<7.5?5:10)*pow};
  const sx=step(x1-x0),sy=step(y1-y0);
  let svg=`<svg ${opt.standalone?'xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" '.replace('${W}',W).replace('${H}',H):''}viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title||'Đồ thị hàm số')}">`;
  if(opt.standalone)svg+=`<style>${GRAPH_CSS}</style><rect width="${W}" height="${H}" fill="#ffffff"/>`;
  svg+=`<defs><clipPath id="${uid}"><rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}"/></clipPath></defs>`;
  svg+=`<rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" class="plot-bg"/>`;
  for(let k=Math.ceil(x0/sx)*sx;k<=x1+1e-9;k+=sx)svg+=`<line x1="${X(k).toFixed(2)}" y1="${p}" x2="${X(k).toFixed(2)}" y2="${H-p}" class="grid-line"/>`;
  for(let k=Math.ceil(y0/sy)*sy;k<=y1+1e-9;k+=sy)svg+=`<line x1="${p}" y1="${Y(k).toFixed(2)}" x2="${W-p}" y2="${Y(k).toFixed(2)}" class="grid-line"/>`;
  if(y0<=0&&y1>=0)svg+=`<line x1="${p}" y1="${Y(0).toFixed(2)}" x2="${W-p}" y2="${Y(0).toFixed(2)}" class="axis"/>`;
  if(x0<=0&&x1>=0)svg+=`<line x1="${X(0).toFixed(2)}" y1="${p}" x2="${X(0).toFixed(2)}" y2="${H-p}" class="axis"/>`;
  const fmtTick=v=>Math.abs(v)<1e-9?'0':(Math.round(v*100)/100).toString();
  const baseY=(y0<=0&&y1>=0)?Y(0):H-p, baseX=(x0<=0&&x1>=0)?X(0):p;
  for(let k=Math.ceil(x0/sx)*sx;k<=x1+1e-9;k+=sx){if(Math.abs(k)<1e-9)continue;
    svg+=`<text x="${X(k).toFixed(2)}" y="${Math.min(H-6,baseY+14).toFixed(2)}" text-anchor="middle" class="tick">${fmtTick(k)}</text>`}
  for(let k=Math.ceil(y0/sy)*sy;k<=y1+1e-9;k+=sy){if(Math.abs(k)<1e-9)continue;
    svg+=`<text x="${Math.max(4,baseX-6).toFixed(2)}" y="${(Y(k)+4).toFixed(2)}" text-anchor="end" class="tick">${fmtTick(k)}</text>`}
  for(const a of inferAsymptotes(s)){
    if(a.type==='vertical'&&Number.isFinite(Number(a.value))&&a.value>=x0&&a.value<=x1){const xx=X(Number(a.value));
      svg+=`<line x1="${xx.toFixed(2)}" y1="${p}" x2="${xx.toFixed(2)}" y2="${H-p}" class="asymptote" clip-path="url(#${uid})"/>`+
           `<text x="${(xx+5).toFixed(2)}" y="${p+14}" class="asymptote-label">x=${esc(a.value)}</text>`}
    else if(a.type==='horizontal'&&Number.isFinite(Number(a.value))&&a.value>=y0&&a.value<=y1){const yy=Y(Number(a.value));
      svg+=`<line x1="${p}" y1="${yy.toFixed(2)}" x2="${W-p}" y2="${yy.toFixed(2)}" class="asymptote" clip-path="url(#${uid})"/>`+
           `<text x="${W-p-5}" y="${(yy-6).toFixed(2)}" text-anchor="end" class="asymptote-label">y=${esc(a.value)}</text>`}
    else if(a.type==='oblique') {const slope=Number(a.slope),intercept=Number(a.intercept);if(Number.isFinite(slope)&&Number.isFinite(intercept)){
      svg+=`<line x1="${X(x0).toFixed(2)}" y1="${Y(slope*x0+intercept).toFixed(2)}" x2="${X(x1).toFixed(2)}" y2="${Y(slope*x1+intercept).toFixed(2)}" class="asymptote" clip-path="url(#${uid})"/>`+
           `<text x="${X(x1).toFixed(2)}" y="${Math.max(p+14,Math.min(H-p-4,Y(slope*x1+intercept)-6)).toFixed(2)}" text-anchor="end" class="asymptote-label">y=${esc(slope)}x${intercept>=0?'+':''}${esc(intercept)}</text>`}}
  }
  let plotted=0;
  for(const fn of s.functions||[]){
    let f;try{f=compileExpr(fn.expr)}catch(_){continue}
    let d='',pen=false;
    for(let i=0;i<=700;i++){const x=x0+(x1-x0)*i/700,y=f(x),ok=Number.isFinite(y)&&y>=y0-(y1-y0)&&y<=y1+(y1-y0);
      if(ok){d+=(pen?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2);pen=true}else pen=false}
    if(d){plotted++;svg+=`<path d="${d}" stroke="${esc(fn.color||'#176fa8')}" class="plot-path" clip-path="url(#${uid})"/>`}}
  if(!plotted)svg+=`<text x="${W/2}" y="${H/2}" text-anchor="middle" class="tick">Không dựng được đường cong — kiểm tra biểu thức</text>`;
  return svg+'</svg>';
}
function renderMathViz(){document.querySelectorAll('.mathviz').forEach(el=>{try{const s=JSON.parse(decodeURIComponent(el.dataset.spec));if(s.type==='graph'){el.innerHTML=`<div class="mathviz-title">${esc(s.title||'Đồ thị')}</div>`+buildGraphSVG(s)+`<div class="mathviz-legend">${(s.functions||[]).map(f=>`<span style="--c:${esc(f.color||'#176fa8')}">$${esc(f.label||f.expr)}$</span>`).join('')}</div>`}
  else if(s.type==='variation'&&Array.isArray(s.points)){const svg=buildVariationSVG(s);if(!svg)throw new Error('variation schema không hợp lệ');const g=graphFromVariation(s);el.innerHTML=`<div class="mathviz-title">${esc(s.title||'Bảng biến thiên')}</div><div class="mathviz-scroll vt-scroll">${svg}</div>`+(g?`<div class="mathviz-title" style="margin-top:14px">${esc(g.title)}</div>${buildGraphSVG(g)}<div class="mathviz-legend"><span style="--c:#176fa8">$${esc(g.functions[0].label)}$</span></div>`:'')}else{const svg=buildSignSVG(s);if(!svg)throw new Error('sign schema không hợp lệ');el.innerHTML=`<div class="mathviz-title">${esc(s.title||(s.type==='sign'?'Bảng xét dấu':'Bảng biến thiên'))}</div><div class="mathviz-scroll vt-scroll">${svg}</div>`}}catch(e){el.innerHTML='<p class="mathviz-error">Không dựng được hình toán học này. Vui lòng tạo lại nội dung.</p>'}})}
function balancedFences(s){return (String(s).match(/```/g)||[]).length%2===0}
/* Vá dấu gạch chéo trong JSON do AI sinh ra.
   VÌ SAO PHẢI VIẾT LẠI: bản cũ dùng /\\(?!["\\/bfnrtu])/ — nghĩa là để nguyên dấu gạch
   chéo khi ký tự sau nó là b, f, n, r, t, u vì đó là ký tự thoát hợp lệ của JSON.
   Nhưng đó cũng chính là chữ cái đầu của các lệnh LaTeX hay dùng nhất:
   \frac \times \to \neq \beta \text \right \forall \bar \underline...
   Hậu quả: "\frac{1}{2}" bị JSON.parse đổi thành ký tự xuống trang + "rac{1}{2}",
   công thức mất sạch mà không có thông báo lỗi nào.
   Cách phân biệt: một ký tự thoát JSON thật chỉ có ĐÚNG MỘT chữ cái (\n rồi hết);
   còn lệnh LaTeX luôn có từ hai chữ cái trở lên (\to, \frac). */
function repairJsonEscapes(raw) {
  /* Phân biệt "\\n xuống dòng thật" với "lệnh LaTeX bắt đầu bằng n" bằng danh sách lệnh có
     thật, chứ không đoán theo ký tự liền sau. Bản trước giữ \\n chỉ khi KHÔNG có chữ cái theo
     sau — nhưng mô hình viết "...trang 10:\\na) Ta có" và "\\nb) Bảng biến thiên", tức là có
     chữ cái ngay sau, nên xuống dòng bị biến thành chữ "\\na)" hiện ra giữa ô sản phẩm. */
  const CMDS = (typeof LATEX_CMDS !== 'undefined' ? LATEX_CMDS : [])
    .concat(['frac','sqrt','text','times','to','ne','nabla','begin','end','tan','theta','tau','binom','rfloor','rceil']);
  const startsWithCmd = run => CMDS.some(c => run === c || (run.startsWith(c) && c.length >= 2));
  return String(raw).replace(/\\(u[0-9a-fA-F]{4}|[a-zA-Z]+|[\s\S])/g, (m, g) => {
    if (/^u[0-9a-fA-F]{4}$/.test(g)) return m;              // \uXXXX — mã Unicode hợp lệ
    if (g === '"' || g === '\\' || g === '/') return m;      // ký tự thoát JSON hợp lệ
    if (/^[a-zA-Z]/.test(g) && startsWithCmd(g)) return '\\' + m;  // là lệnh LaTeX → nhân đôi
    if (/^[bfnrt]/.test(g)) return m;                        // \n \t \r \b \f — xuống dòng/tab thật
    return '\\' + m;                                         // còn lại coi như LaTeX
  });
}


/* Quét cả khối có dấu ``` lẫn JSON trần. Bản cũ chỉ đọc khối có dấu ```, nên khi mô hình
   trả JSON trần (rất hay xảy ra) thì flow.js vẫn dựng được bảng trên màn hình nhưng bộ
   kiểm định lại báo "Không tìm thấy bảng lessonflow" và "Tổng thời lượng 0 phút" —
   hai phần của phần mềm nhìn thấy hai thứ khác nhau. */
function findFlowBlocks(text){
  const out=[]; text=String(text||'');
  text.replace(/```(?:lessonflow|json)?\s*([\s\S]*?)```/gi,(_,raw)=>{
    if(/['"]type['"]\s*:\s*['"]lessonflow['"]/i.test(raw))out.push({raw:raw.trim(),fenced:true});
    return _;});
  let pos=0,guard=0;
  while(guard++<500){
    const hit=text.slice(pos).search(/["']type["']\s*:\s*["']lessonflow["']/i);
    if(hit<0)break;
    const marker=pos+hit;
    let start=-1,depth=0;
    for(let i=marker;i>=0;i--){const c=text[i];if(c==='}')depth++;else if(c==='{'){if(!depth){start=i;break}depth--}}
    if(start<0){pos=marker+10;continue}
    let end=-1,d=0,inStr=false,q='',esc=false;
    for(let i=start;i<text.length;i++){const c=text[i];
      if(inStr){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)inStr=false;continue}
      if(c==='"'||c==="'"){inStr=true;q=c;continue}
      if(c==='{')d++;else if(c==='}'&&--d===0){end=i+1;break}}
    if(end<0){pos=marker+10;continue}
    const raw=text.slice(start,end);
    if(!out.some(x=>x.raw===raw.trim()))out.push({raw:raw.trim(),fenced:false});
    pos=Math.max(end,marker+10);
  }
  return out;
}
function parseLessonFlows(md){return findFlowBlocks(md).map(b=>{try{return JSON.parse(repairJsonEscapes(b.raw))}catch(e){return {__error:e.message}}})}
function allowedNLSTokens(grade){const b=nlsLevelForGrade(grade??$('grade').value);return new Set((buildNLSText([b]).match(new RegExp(`\\b\\d\\.\\d-B${b}[a-h]\\b`,'g'))||[]))}
function allowedAITokens(grade){return new Set(((AI_YCCD[String(grade)]||'').match(/\b(?:10|11|12)\.[A-D]\d\.(?:MR)?\d+\b/g)||[]))}
/* LỖI NẶNG ĐÃ SỬA — bỏ dấu tiếng Việt:
   normalize('NFD') tách được nguyên âm có dấu (ạ → a + dấu, ê → e + dấu) nhưng chữ "đ"
   (U+0111) KHÔNG có dạng phân rã nào, nên nó sống sót qua bước xoá dấu. Hệ quả:
   "Hoạt động 1" bị bỏ dấu thành "hoat đong 1", không bao giờ khớp /hoat dong 1/.
   Vì bốn phép kiểm tra Hoạt động 1–4 không được bọc trong điều kiện aiGenerated, MỌI bản
   kế hoạch đều nhận đủ 4 lỗi chặn "Thiếu Hoạt động N" và bị khoá xuất Word vĩnh viễn —
   kể cả bản soạn đúng hoàn toàn. Phải thay đ/Đ thành d TRƯỚC khi chuẩn hoá. */
function deaccent(t){return String(t||'').replace(/đ/g,'d').replace(/Đ/g,'D').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function validatePlan(md,v,aiGenerated=true){const blockers=[],warnings=[],text=String(md||''),plain=deaccent(text);if(text.length<900)blockers.push('Nội dung quá ngắn, có khả năng phản hồi bị thiếu hoặc bị cắt.');if(!balancedFences(text))blockers.push('Khối mã chưa đóng đầy đủ; phản hồi AI có thể đã bị cắt.');[['I. Mục tiêu','i. muc tieu'],['II. Thiết bị dạy học và học liệu','ii. thiet bi day hoc va hoc lieu'],['III. Tiến trình dạy học','iii. tien trinh day hoc']].forEach(([label,key])=>{if(!plain.includes(key))blockers.push(`Thiếu mục ${label}.`)});/* Khung mới đặt tên hoạt động theo giáo án mẫu của tổ chuyên môn (Khởi động / Hình thành kiến
   thức mới / Luyện tập / Vận dụng) thay cho cách đánh số Hoạt động 1-4, nên phải kiểm theo tên. */
[['Hoạt động Khởi động (Mở đầu)',/khoi dong|mo dau/],['Hình thành kiến thức mới',/hinh thanh kien thuc/],
 ['Hoạt động Luyện tập',/luyen tap/],['Hoạt động Vận dụng',/van dung/]]
  .forEach(([ten,re])=>{if(!re.test(plain))blockers.push(`Thiếu ${ten}.`)});
if(aiGenerated&&!/huong dan ve nha/.test(plain))warnings.push('Thiếu mục "Hướng dẫn về nhà".');
/* Chia tiết: giáo án mẫu chia rõ TIẾT 1, TIẾT 2... Không chia thì giáo viên không biết dạy đến đâu
   thì hết tiết, phải tự cắt lại toàn bộ — đây là than phiền thực tế của giáo viên. */
if(aiGenerated&&Number(v.periods)>1){const tiet=new Set((text.match(/TIẾT\s*\d+/gi)||[]).map(x=>x.toUpperCase().replace(/\s+/g,' ')));
  if(!tiet.size)blockers.push(`Bài ${v.periods} tiết nhưng tiến trình chưa chia theo tiết (thiếu các dòng "TIẾT 1:", "TIẾT 2:"...).`);
  else if(tiet.size<Number(v.periods))warnings.push(`Mới chia ${tiet.size}/${v.periods} tiết trong tiến trình.`);}
/* Đủ bốn phần a) b) c) d) cho mỗi hoạt động. */
if(aiGenerated){const abcd=(text.match(/d\)\s*Tổ chức thực hiện/gi)||[]).length;
  if(abcd<4)blockers.push(`Mới có ${abcd} hoạt động ghi đủ "a) Mục tiêu – b) Nội dung – c) Sản phẩm – d) Tổ chức thực hiện" (cần ít nhất 4).`);}const mt=[...new Set(text.match(/\bMT\d+\b/g)||[])],sp=[...new Set(text.match(/\bSP\d+\b/g)||[])],tc=[...new Set(text.match(/\bTC\d+\b/g)||[])];if(aiGenerated&&!mt.length)blockers.push('Chưa đánh mã mục tiêu MT1, MT2...');if(aiGenerated&&!/ma tran lien ket muc tieu/.test(plain))blockers.push('Thiếu ma trận liên kết mục tiêu – hoạt động – sản phẩm – đánh giá.');mt.forEach(x=>{if((text.match(new RegExp(`\\b${x}\\b`,'g'))||[]).length<2)warnings.push(`${x} chưa được liên kết rõ với hoạt động/sản phẩm.`)});if(aiGenerated&&!sp.length)blockers.push('Chưa đánh mã sản phẩm SP1, SP2...');if(aiGenerated&&!tc.length)blockers.push('Chưa đánh mã tiêu chí TC1, TC2...');const flows=parseLessonFlows(text);if(aiGenerated&&!flows.length)blockers.push('Không tìm thấy bảng lessonflow của các hoạt động.');let totalMinutes=0,hasDuration=true;flows.forEach((f,i)=>{if(f.__error){blockers.push(`JSON lessonflow ${i+1} không hợp lệ.`);return}if(!Array.isArray(f.rows)||!f.rows.length){blockers.push(`Lessonflow ${i+1} không có bước nào.`);return}
/* Theo prompt, lessonflow chỉ dùng cho các hoạt động Hình thành kiến thức mới; Khởi động,
   Luyện tập và Vận dụng viết văn xuôi. Vì vậy không được coi lessonflow cuối là Hoạt động 4. */
if(f.rows.length!==4){blockers.push(`Lessonflow ${i+1} phải có đúng 4 bước.`);return}f.rows.forEach((r,j)=>{if(!r.step||!Array.isArray(r.product))blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu tên bước hoặc sản phẩm.`);if(!Array.isArray(r.teacherActions)||!r.teacherActions.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu hoạt động của GV.`);if(!Array.isArray(r.studentActions)||!r.studentActions.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu hoạt động của HS.`);if(!Array.isArray(r.assessment)||!r.assessment.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu cách/tiêu chí đánh giá.`);
/* Cột "Sản phẩm dự kiến" là phần giáo viên thực sự cầm lên lớp dạy. Bản trước hay trả về nhãn rỗng
   kiểu "SP1: Kết luận về tính đơn điệu" — đọc lên không dạy được gì. Đếm độ dài để bắt lỗi này. */
const spText=(r.product||[]).map(x=>typeof x==='string'?x:'').join(' ');
if(spText&&spText.length<80)warnings.push(`Lessonflow ${i+1}, bước ${j+1}: sản phẩm dự kiến quá sơ sài (${spText.length} ký tự) — cần viết ra nội dung kiến thức hoặc lời giải, không chỉ ghi nhãn.`);if(!Array.isArray(r.goalIds)||!r.goalIds.length)warnings.push(`Lessonflow ${i+1}, bước ${j+1} chưa liên kết goalIds.`);const d=Number(r.duration);if(!Number.isFinite(d)||d<=0){hasDuration=false;blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu thời lượng hợp lệ.`)}else totalMinutes+=d})});/* Thời lượng trong lessonflow chỉ là phần Hình thành kiến thức mới; ba hoạt động còn lại
   được viết văn xuôi nên không thể cộng tự động mà vẫn bảo đảm đúng. Chỉ chặn khi riêng
   phần đã cấu trúc đã vượt toàn bộ quỹ thời gian; nếu thấp hơn thì báo rõ đây là số phút
   đã nhận diện, tránh kết luận sai rằng cả KHBD thiếu thời lượng. */
const expected=Number(v.periods)*45;
if(aiGenerated&&hasDuration&&expected){const tol=Math.max(5,Math.round(expected*0.1));
  if(totalMinutes>expected+tol)blockers.push(`Riêng các bước Hình thành kiến thức mới đã có ${totalMinutes} phút, vượt quỹ ${expected} phút (${v.periods} tiết).`);
  else warnings.push(`Đã nhận diện ${totalMinutes} phút ở các bảng Hình thành kiến thức mới; hãy đối chiếu thêm thời lượng Khởi động, Luyện tập và Vận dụng để đủ ${expected} phút.`);}const nlsUsed=[...new Set(text.match(/\b\d\.\d-B\d[a-h]\b/g)||[])],nlsAllowed=allowedNLSTokens(v.grade);nlsUsed.filter(x=>!nlsAllowed.has(x)).forEach(x=>blockers.push(`Mã NLS không được phép hoặc sai bậc: ${x}.`));const aiUsed=[...new Set(text.match(/\b(?:10|11|12)\.[A-D]\d\.(?:MR)?\d+\b/g)||[])],aiAllowed=allowedAITokens(v.grade);aiUsed.filter(x=>!aiAllowed.has(x)).forEach(x=>blockers.push(`Mã NLAI không thuộc lớp ${v.grade}: ${x}.`));aiUsed.filter(x=>/\.MR\d+$/.test(x)).forEach(x=>{const pos=text.indexOf(x),near=text.slice(pos,Math.min(text.length,pos+180)).toLowerCase();if(!/mở rộng|mo rong|không bắt buộc|khong bat buoc/.test(near))warnings.push(`Mã ${x} là nội dung mở rộng nhưng chưa ghi rõ “không bắt buộc”.`)});if(!$('includeDigital').checked&&nlsUsed.length)blockers.push('Đã tắt NLS nhưng đầu ra vẫn chứa mã NLS.');if(!$('includeAI').checked&&aiUsed.length)blockers.push('Đã tắt NLAI nhưng đầu ra vẫn chứa mã NLAI.');/* Với môn Toán, một kế hoạch bài dạy không có lấy một công thức nào thì chắc chắn là bản tóm tắt
   chứ không phải giáo án. Đây đúng là tình trạng của bản sinh ra trước khi sửa khung. */
if(aiGenerated&&isMathSubject(v)&&!/\$[^$]+\$/.test(text))blockers.push('Môn Toán nhưng cả bản kế hoạch không có công thức nào — nội dung mới ở mức đề cương, chưa dạy được.');
/* Giáo viên phản ánh: bản soạn "chỉ có công thức và lời nói, không có hình ảnh trực quan".
   Yêu cầu cần đạt của các bài này ghi rõ "nhận biết qua hình ảnh đồ thị", nên thiếu đồ thị là
   thiếu phương tiện dạy học chứ không phải thiếu trang trí. Chặn để buộc soạn lại. */
if(aiGenerated&&isMathSubject(v)&&/don dieu|cuc tri|khao sat|do thi|bien thien/.test(deaccent(v.lesson||''))){
  const coGraph=/["']type["']\s*:\s*["']graph["']/i.test(text),
        coExpr=/["']expr["']\s*:/i.test(text);
  if(!coGraph&&!coExpr)blockers.push('Bài về đồ thị/tính đơn điệu/cực trị nhưng không có đồ thị hàm số nào. Mỗi khối bảng biến thiên phải khai báo thêm "expr" để phần mềm vẽ đồ thị, hoặc thêm khối mathviz type "graph".');
}
if(aiGenerated&&text.length<12000)warnings.push(`Bản kế hoạch chỉ dài ${text.length} ký tự — giáo án đủ nội dung dạy thường dài hơn nhiều; hãy kiểm tra xem phần kiến thức và lời giải đã được viết ra đầy đủ chưa.`);
if(v.assessmentMode==='day-du'&&!/bảng kiểm|bang kiem|rubric/.test(plain))blockers.push('Đã chọn đánh giá đầy đủ nhưng chưa có bảng kiểm hoặc rubric.');if(aiGenerated&&!/dieu chinh sau bai day/.test(plain))warnings.push('Thiếu mục “Điều chỉnh sau bài dạy” — Phụ lục IV Công văn 5512 có mục này để giáo viên ghi sau khi dạy thực tế.');if($('traceSources').checked&&!/dau vet nguon va trach nhiem giai trinh/.test(plain))blockers.push('Thiếu mục Dấu vết nguồn và trách nhiệm giải trình.');/* Than phiền có thật: bật "khóa nguồn tuyệt đối" mà bản soạn vẫn ghi số trang sai. Nếu không đính
   kèm tài liệu nào thì mọi số trang đều là bịa, phải cảnh báo ngay. */
if(!selectedFiles.length&&/\btr\.?\s*\d+|trang\s+\d+/i.test(text))blockers.push('Bản kế hoạch có trích dẫn số trang sách nhưng không có tài liệu nguồn nào được đính kèm — các số trang này không kiểm chứng được.');
if(selectedFiles.length&&!/theo nguồn|theo nguon/.test(plain))warnings.push('Có tài liệu đính kèm nhưng chưa thấy nội dung được gắn nhãn “Theo nguồn”.');return {blockers:[...new Set(blockers)],warnings:[...new Set(warnings)],passed:!blockers.length,codes:[...nlsUsed,...aiUsed],totalMinutes,expectedMinutes:expected}}
function syncExportLock(){const approval=$('approveCompetencies'),blocked=!!lastValidation?.blockers?.length,needsApproval=!!lastValidation?.codes?.length;$('wordBtn').disabled=blocked||(needsApproval&&!approval?.checked);$('wordBtn').title=blocked?'Hãy tạo lại hoặc sửa các lỗi kiểm định trước khi xuất Word':needsApproval&&!approval?.checked?'Giáo viên cần duyệt mã NLS/NLAI trước khi xuất Word':''}
function renderValidation(report){lastValidation=report;const el=$('validationReport');el.hidden=false;el.className=`validation-report ${report.blockers.length?'block':report.warnings.length?'warn':'ok'}`;const title=report.blockers.length?'KHÔNG ĐẠT KIỂM ĐỊNH – đã khóa xuất Word':report.warnings.length?'ĐẠT CÓ ĐIỀU KIỆN – giáo viên cần rà soát':'ĐẠT KIỂM ĐỊNH CHUYÊN MÔN TỰ ĐỘNG';const items=[...report.blockers,...report.warnings],time=report.expectedMinutes?`<p><b>Thời lượng:</b> ${report.totalMinutes}/${report.expectedMinutes} phút.</p>`:'';const approval=report.codes.length?`<label class="check competency-approval"><input id="approveCompetencies" type="checkbox"> Tôi đã đọc, đối chiếu và duyệt các mã NLS/NLAI: ${report.codes.map(esc).join(', ')}</label>`:'';el.innerHTML=`<strong>${esc(title)}</strong>${time}${items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<span>Đủ cấu trúc, liên kết mục tiêu, thời lượng, đánh giá và mã tham chiếu.</span>'}${approval}`;$('approveCompetencies')?.addEventListener('change',syncExportLock);syncExportLock()}
function showResult(md,report){rawMarkdown=md;$('progress').hidden=true;$('emptyState').hidden=true;$('result').innerHTML=mdToHtml(md);renderMathViz();$('result').hidden=false;$('resultActions').hidden=false;$('draftNotice').hidden=false;renderValidation(report||validatePlan(md,values(),false));const typeset=()=>window.MathJax?.typesetPromise?window.MathJax.typesetPromise([$('result')]).catch(()=>{}):null;typeset()||setTimeout(typeset,800);$('validationReport').scrollIntoView({behavior:'smooth',block:'start'});saveDraft()}
$('lessonForm').onsubmit=async e=>{e.preventDefault();const v=values(),key=$('apiKey').value.trim();if(selectedFiles.length&&!$('privacyConfirm').checked){toast('Vui lòng xác nhận tài liệu đã được ẩn danh và có quyền sử dụng');$('privacyConfirm').focus();return}$('generateBtn').disabled=true;try{setProgress(10,'Đang kiểm tra nguồn...','Chuẩn bị dữ liệu bài dạy');let md;if(key){md=await callGemini(v,key);if(!md)throw new Error('AI chưa trả về nội dung')}else{await new Promise(r=>setTimeout(r,350));setProgress(70,'Đang tạo khung dự thảo...','Dùng chế độ cơ bản không cần API key');md=fallback(v)}setProgress(94,'Đang kiểm định đầu ra...','Đối chiếu cấu trúc, lessonflow và mã NLS/NLAI');const report=validatePlan(md,v,!!key);showResult(md,report);toast(report.blockers.length?'Bản dự thảo chưa đạt kiểm định':report.warnings.length?'Đã tạo – cần rà soát cảnh báo':'Đã tạo và đạt kiểm định tự động')}catch(err){$('progress').hidden=true;$('emptyState').hidden=false;toast(err.message||'Có lỗi xảy ra')}finally{$('generateBtn').disabled=false}}
$('lessonForm').addEventListener('submit',e=>{if($('sourceMode').value==='strict'&&!selectedFiles.length&&!$('notes').value.trim()){e.preventDefault();e.stopImmediatePropagation();toast('Chế độ khóa nguồn tuyệt đối yêu cầu ít nhất một tài liệu hoặc nội dung nguồn');$('dropZone').focus()}},true);
$('copyBtn').onclick=async()=>{await navigator.clipboard.writeText(rawMarkdown);toast('Đã sao chép nội dung')};
$('printBtn').onclick=()=>window.print();
/* ĐÃ GỠ: trình xuất .doc cũ (HTML đội lốt Word). Nó dựng tệp từ innerHTML sau khi MathJax
   đã vẽ, nên mọi công thức chỉ còn <svg> và biến mất khi mở bằng Word. Việc xuất nay do
   docx-export.js đảm nhiệm: dựng .docx thật từ markdown gốc, công thức chuyển sang OMML.
   Giữ lại đoạn này chỉ gây nhầm lẫn khi bảo trì vì nó bị ghi đè ngay lúc nạp trang. */


/* ===== Tự động lưu nháp (localStorage) =====
   Lưu dữ liệu form + kết quả vừa soạn để giáo viên không mất công nếu lỡ tay refresh/đóng tab.
   KHÔNG lưu apiKey — giữ đúng cam kết "khóa chỉ tồn tại trong phiên trình duyệt" đã ghi trong giao diện.
   Không lưu tệp đính kèm (File object không phù hợp để lưu localStorage và có thể rất nặng). */
const DRAFT_KEY='khbd_draft_v1';
function saveDraft(){try{const draft={values:values(),includeDigital:$('includeDigital').checked,includeAI:$('includeAI').checked,traceSources:$('traceSources').checked,style:$('style').value,resultMd:rawMarkdown||null,ts:Date.now()};localStorage.setItem(DRAFT_KEY,JSON.stringify(draft))}catch(_){/* localStorage đầy hoặc bị chặn (chế độ ẩn danh) — bỏ qua, không ảnh hưởng chức năng chính */}}
function loadDraft(){try{const raw=localStorage.getItem(DRAFT_KEY);return raw?JSON.parse(raw):null}catch(_){return null}}
function clearDraft(){try{localStorage.removeItem(DRAFT_KEY)}catch(_){}}
function scheduleDraftSave(){clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,500)}
$('lessonForm').addEventListener('input',scheduleDraftSave);
$('lessonForm').addEventListener('change',scheduleDraftSave);
function initDraft(){const d=loadDraft();if(!d)return;try{Object.entries(d.values||{}).forEach(([k,v])=>{if(v&&fields.includes(k)&&$(k))$(k).value=v});if(typeof d.includeDigital==='boolean')$('includeDigital').checked=d.includeDigital;if(typeof d.includeAI==='boolean')$('includeAI').checked=d.includeAI;if(typeof d.traceSources==='boolean')$('traceSources').checked=d.traceSources;if(d.style)$('style').value=d.style;$('grade').dispatchEvent(new Event('change'));if(d.resultMd)showResult(d.resultMd);$('clearDraftBtn').hidden=false;toast('Đã khôi phục bản nháp gần nhất (chưa gồm tệp đính kèm)')}catch(_){}}
$('clearDraftBtn').onclick=()=>{clearDraft();location.reload()};
initDraft();
