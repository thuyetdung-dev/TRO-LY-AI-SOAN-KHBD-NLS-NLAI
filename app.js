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
    headers:{'Content-Length':String(file.size),'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},
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
function mathRulesFor(v){if(!isMathSubject(v))return '6) Không áp dụng mô-đun biểu diễn Toán học vì môn đang soạn không phải môn Toán.';return `6) MÔ-ĐUN RIÊNG MÔN TOÁN: Khi bài học thực sự có nội dung xét dấu đạo hàm, đồng biến/nghịch biến, cực trị hoặc khảo sát hàm số, mọi ví dụ tương ứng phải kèm khối mathviz type "variation" theo schema {"type":"variation","title":"...","points":[...],"derivative":[...],"values":[...]}. Với N mốc x, derivative có đúng 2N-3 phần tử; điểm y'=0 ghi "0", điểm không xác định ghi ""; điểm gián đoạn dùng {"left":"...","right":"..."}. Khi cần bảng xét dấu dùng {"type":"sign","title":"...","columns":[...],"rows":[{"label":"...","cells":[...]}]}. Khi cần đồ thị dùng {"type":"graph","title":"...","xMin":-5,"xMax":5,"yMin":-5,"yMax":5,"functions":[{"expr":"x^2","label":"f(x)","color":"#176fa8"}]}. Chỉ dùng mathviz khi đúng nội dung bài, không ép dùng cho mọi bài Toán.`}
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
async function callGemini(v,key){const parts=[{text:promptFor(v)},...(await buildFileParts(key))];if(!availableModels.length)await scanModels(false);const selected=$('model').value,allCandidates=selected!=='auto'?[selected,...availableModels.map(m=>m.name).filter(n=>n!==selected)]:availableModels.map(m=>m.name);if(!allCandidates.length)throw new Error('Không tìm thấy mô hình Gemini đang hoạt động cho API key này');const candidates=allCandidates.slice(0,MAX_MODEL_ATTEMPTS),skipped=allCandidates.length-candidates.length;const errors=[];for(let i=0;i<candidates.length;i++){const fullName=candidates[i],model=fullName.replace(/^models\//,'');setProgress(48+Math.min(i,4)*5,'Đang chọn mô hình AI...',`Đang thử ${model}${i?` (dự phòng ${i}/${candidates.length-1})`:''}`);try{const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{temperature:.25,maxOutputTokens:maxTokensFor(fullName)}})}),data=await res.json();if(!res.ok)throw new Error(data?.error?.message||`Lỗi HTTP ${res.status}`);const candidate=data.candidates?.[0],finish=candidate?.finishReason||'',text=candidate?.content?.parts?.map(x=>x.text||'').join('\n')||'';if(!text)throw new Error('Mô hình không trả về nội dung');
/* MAX_TOKENS nghĩa là mô hình đã viết hết hạn mức chứ không phải mô hình lỗi — thử mô hình
   dự phòng khác cũng sẽ bị cắt y hệt, chỉ tốn thêm vài phút chờ. Dừng ngay và nói rõ cách xử lý. */
if(finish==='MAX_TOKENS')throw new Error(`Bài soạn dài hơn hạn mức của ${model} (${maxTokensFor(fullName)} token) nên bị cắt giữa chừng. Hãy giảm số tiết, chọn phong cách “Gọn, dễ triển khai”, hoặc tách bài thành 2 lần soạn.`);
if(['SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(finish))throw new Error(`Phản hồi bị chặn (${finish}). Hãy giảm số tài liệu hoặc tạo lại.`);setModelStatus(`Đang dùng ${model}`,'ok');if([...$('model').options].some(o=>o.value===fullName))$('model').value=fullName;return text}catch(err){
/* Có những lỗi mà thử mô hình dự phòng chắc chắn cũng hỏng y hệt: bài quá dài so với hạn
   mức, khóa API sai/hết hạn, hoặc nội dung bị chặn. Bản cũ vẫn thử tiếp cả 3 mô hình,
   bắt giáo viên chờ thêm vài phút rồi mới báo một thông báo gộp khó hiểu. Dừng ngay. */
if(/hạn mức|API key not valid|API_KEY_INVALID|PERMISSION_DENIED|bị chặn/i.test(err.message||''))throw err;
errors.push(`${model}: ${err.message}`)}}throw new Error(`Đã thử ${candidates.length} mô hình nhưng đều chưa phản hồi${skipped?` (còn ${skipped} mô hình chưa thử, hãy chọn thủ công ở mục nâng cao)`:''}. ${errors.slice(0,2).join(' · ')}`)}
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
function compileExpr(expr){let s=String(expr||'').toLowerCase().replace(/\^/g,'**').replace(/\bpi\b/g,'Math.PI');if(!/^[0-9x+\-*/().,\s*a-z]+$/.test(s))throw Error('Biểu thức không hợp lệ');for(const f of ['sin','cos','tan','sqrt','abs','exp','log'])s=s.replace(new RegExp(`\\b${f}\\b`,'g'),`Math.${f}`);const check=s.replace(/Math\.(?:PI|sin|cos|tan|sqrt|abs|exp|log)/g,'').replace(/x/g,'');if(/[a-z]/i.test(check))throw Error('Hàm chưa được hỗ trợ');return new Function('x',`"use strict";return (${s})`)}
const wrapMathCell=v=>{const s=String(v??'').trim();if(!s)return '';if(/^[+\-0↗↘↑↓∞]+$/.test(s))return esc(s);return s.includes('$')?inline(s):`$${esc(s)}$`};
// Nhãn đặt trong foreignObject để MathJax vẫn xử lý được $...$ bên trong SVG (phân số, chỉ số dưới...).
function svgLabel(cx,cy,content,anchor,w,h){w=w||100;h=h||24;const x=anchor==='start'?cx:anchor==='end'?cx-w:cx-w/2;const justify=anchor==='start'?'flex-start':anchor==='end'?'flex-end':'center';return `<foreignObject x="${x}" y="${cy-h/2}" width="${w}" height="${h}" style="overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" class="vt-label" style="justify-content:${justify}">${content}</div></foreignObject>`}
// Dựng bảng biến thiên dạng sơ đồ đường gấp khúc (đúng chuẩn SGK) từ schema {points,derivative,values}.
// points: N mốc x (thường có -∞/+∞ ở 2 đầu). derivative: đúng 2N-3 phần tử, xen kẽ dấu-khoảng/giá trị-tại-điểm.
// values: N giá trị y tương ứng từng điểm trong "points"; một phần tử có thể là {left,right} để biểu diễn
// điểm gián đoạn/tiệm cận (vd hàm phân thức) — khi đó vẽ dấu ngắt "‖" và tách 2 nhãn giá trị trái/phải.
function coerceLen(arr,n,fill){arr=Array.isArray(arr)?arr.slice():[];while(arr.length<n)arr.push(fill);if(arr.length>n)arr.length=n;return arr}
function buildVariationSVG(spec){
  const points=Array.isArray(spec.points)?spec.points:[];
  const N=points.length;
  if(N<2)return null;
  // Model đôi khi đếm lệch 1-2 phần tử trong "derivative"/"values" — tự đệm/cắt cho khớp thay vì
  // bỏ cuộc và báo lỗi ngay, để vẫn dựng được một sơ đồ có ích (có thể thiếu 1 dấu, còn hơn trắng trang).
  const deriv=coerceLen(spec.derivative,2*N-3,'');
  const values=coerceLen(spec.values,N,'');
  const W=760,leftLabel=40,rightPad=16,plotW=W-leftLabel-rightPad;
  const xAt=i=>leftLabel+(N===1?0:i*(plotW/(N-1)));
  const bandX=36,bandDeriv=56,bandVal=204,padTop=10,padBot=10;
  const yTop=padTop,derivTopY=yTop+bandX,valTopY=derivTopY+bandDeriv,valBotY=valTopY+bandVal,H=valBotY+padBot;
  const intervalSign=i=>deriv[2*i];
  let arriveLevel=[0],departLevel=[0];
  for(let i=0;i<N-1;i++){const s=intervalSign(i),d=s==='+'?1:s==='-'?-1:0,nextArrive=departLevel[i]+d;arriveLevel.push(nextArrive);const v=values[i+1];departLevel.push(v&&typeof v==='object'?(v.right==='+∞'?nextArrive+3:v.right==='-∞'?nextArrive-3:nextArrive):nextArrive)}
  const allLv=arriveLevel.concat(departLevel),minL=Math.min(...allLv),maxL=Math.max(...allLv),span=Math.max(1,maxL-minL);
  const yForLevel=lv=>valBotY-26-((lv-minL)/span)*(bandVal-52);
  const valLabel=i=>{const v=values[i];return (v&&typeof v==='object')?null:String(v)};
  const yArrive=i=>{const v=valLabel(i);if(v==='+∞')return valTopY+16;if(v==='-∞')return valBotY-16;return yForLevel(arriveLevel[i])};
  const yDepart=i=>{const v=valLabel(i);if(v==='+∞')return valTopY+16;if(v==='-∞')return valBotY-16;return yForLevel(departLevel[i])};
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.title||'Bảng biến thiên')}">`;
  svg+=`<rect x="${leftLabel}" y="${yTop}" width="${plotW}" height="${valBotY-yTop}" class="vt-frame" fill="none" stroke="#333" stroke-width="1.2"/>`;
  svg+=`<line x1="${leftLabel}" y1="${derivTopY}" x2="${W-rightPad}" y2="${derivTopY}" class="vt-frame" stroke="#333" stroke-width="1.2"/>`;
  svg+=`<line x1="${leftLabel}" y1="${valTopY}" x2="${W-rightPad}" y2="${valTopY}" class="vt-frame" stroke="#333" stroke-width="1.2"/>`;
  points.forEach((_,i)=>{const x=xAt(i);svg+=`<line x1="${x}" y1="${yTop}" x2="${x}" y2="${valBotY}" class="vt-grid" stroke="#333" stroke-width="1"/>`});
  svg+=svgLabel(2,(yTop+derivTopY)/2,'$x$','start',36,20);
  svg+=svgLabel(2,(derivTopY+valTopY)/2,`$y'$`,'start',36,20);
  svg+=svgLabel(2,(valTopY+valBotY)/2,'$y$','start',36,20);
  points.forEach((p,i)=>{svg+=svgLabel(xAt(i),(yTop+derivTopY)/2,wrapMathCell(p),'middle',110,20)});
  for(let i=0;i<N-1;i++){const s=intervalSign(i);if(s)svg+=svgLabel((xAt(i)+xAt(i+1))/2,(derivTopY+valTopY)/2,wrapMathCell(s),'middle',60,20)}
  for(let i=1;i<N-1;i++){const v=deriv[2*i-1];if(v!==undefined)svg+=svgLabel(xAt(i),(derivTopY+valTopY)/2,wrapMathCell(v),'middle',60,20)}
  for(let i=0;i<N-1;i++){const x1=xAt(i),x2=xAt(i+1),y1=yDepart(i),y2=yArrive(i+1);svg+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vt-path" fill="none" stroke="#164f75" stroke-width="1.8" stroke-linecap="round"/>`;const mx=(x1+x2)/2,my=(y1+y2)/2,ang=Math.atan2(y2-y1,x2-x1),ah=6,ax1=mx-ah*Math.cos(ang-0.4),ay1=my-ah*Math.sin(ang-0.4),ax2=mx-ah*Math.cos(ang+0.4),ay2=my-ah*Math.sin(ang+0.4);svg+=`<polygon points="${mx},${my} ${ax1},${ay1} ${ax2},${ay2}" class="vt-arrow" fill="#164f75"/>`}
  points.forEach((p,i)=>{const v=values[i],anchor=i===0?'start':(i===N-1?'end':'middle');if(v&&typeof v==='object'){const yL=yArrive(i),yR=yDepart(i),midY=(yL+yR)/2;svg+=svgLabel(xAt(i)-8,yL-14,wrapMathCell(v.left),'end',80,20);svg+=svgLabel(xAt(i)+8,yR-14,wrapMathCell(v.right),'start',80,20);svg+=`<line x1="${xAt(i)-6}" y1="${midY+11}" x2="${xAt(i)+2}" y2="${midY-11}" class="vt-path" stroke="#164f75" stroke-width="1.4"/><line x1="${xAt(i)-1}" y1="${midY+11}" x2="${xAt(i)+7}" y2="${midY-11}" class="vt-path" stroke="#164f75" stroke-width="1.4"/>`}else{svg+=svgLabel(xAt(i)+(i===0?6:i===N-1?-6:0),yArrive(i)-14,wrapMathCell(v),anchor,90,20)}});
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
  +'.tick{font:11px Arial,sans-serif;fill:#40566b}';
function buildGraphSVG(s,opt){
  opt=opt||{};
  const num=(v,d)=>{const n=Number(v);return Number.isFinite(n)?n:d};
  const W=760,H=390,p=38;
  let x0=num(s.xMin,-5),x1=num(s.xMax,5),y0=num(s.yMin,-5),y1=num(s.yMax,5);
  if(x1<=x0){x0=-5;x1=5}
  if(y1<=y0){y0=-5;y1=5}
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
  for(const fn of s.functions||[]){
    let f;try{f=compileExpr(fn.expr)}catch(_){continue}
    let d='',pen=false;
    for(let i=0;i<=700;i++){const x=x0+(x1-x0)*i/700,y=f(x),ok=Number.isFinite(y)&&y>=y0-(y1-y0)&&y<=y1+(y1-y0);
      if(ok){d+=(pen?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2);pen=true}else pen=false}
    svg+=`<path d="${d}" stroke="${esc(fn.color||'#176fa8')}" class="plot-path" clip-path="url(#${uid})"/>`}
  return svg+'</svg>';
}
function renderMathViz(){document.querySelectorAll('.mathviz').forEach(el=>{try{const s=JSON.parse(decodeURIComponent(el.dataset.spec));if(s.type==='graph'){el.innerHTML=`<div class="mathviz-title">${esc(s.title||'Đồ thị')}</div>`+buildGraphSVG(s)+`<div class="mathviz-legend">${(s.functions||[]).map(f=>`<span style="--c:${esc(f.color||'#176fa8')}">$${esc(f.label||f.expr)}$</span>`).join('')}</div>`}
  else if(s.type==='variation'&&Array.isArray(s.points)){const svg=buildVariationSVG(s);if(!svg)throw new Error('variation schema không hợp lệ');el.innerHTML=`<div class="mathviz-title">${esc(s.title||'Bảng biến thiên')}</div><div class="mathviz-scroll vt-scroll">${svg}</div>`}else{const cols=s.columns||[],rows=s.rows||[];el.innerHTML=`<div class="mathviz-title">${esc(s.title|| (s.type==='sign'?'Bảng xét dấu':'Bảng biến thiên'))}</div><div class="mathviz-scroll"><table class="variation-table"><thead><tr>${cols.map(c=>`<th>${wrapMathCell(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th>${wrapMathCell(r.label)}</th>${(r.cells||[]).map(c=>`<td class="variation-cell">${wrapMathCell(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}}catch(e){el.innerHTML='<p class="mathviz-error">Không dựng được hình toán học này. Vui lòng tạo lại nội dung.</p>'}})}
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
  return String(raw).replace(/\\(u[0-9a-fA-F]{4}|[a-zA-Z]+|[\s\S])/g, (m, g) => {
    if (/^u[0-9a-fA-F]{4}$/.test(g)) return m;          // \uXXXX — mã Unicode hợp lệ
    if (g === '"' || g === '\\' || g === '/') return m;  // ký tự thoát hợp lệ, giữ nguyên
    if (/^[bfnrt]$/.test(g)) return m;                   // \n \t \r \b \f đứng một mình
    return '\\' + m;                                     // còn lại là LaTeX, nhân đôi
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
/* Phụ lục IV Công văn 5512 quy định "Tổ chức thực hiện" theo 4 bước, nhưng cũng ghi rõ
   Hoạt động 4 (Vận dụng) THƯỜNG GIAO NGOÀI GIỜ HỌC TRÊN LỚP, nộp báo cáo vào thời điểm
   phù hợp. Với hoạt động giao về nhà, ba bước Thực hiện – Báo cáo – Kết luận diễn ra ở
   buổi sau chứ không nằm trong tiết đang soạn, nên ép đủ 4 bước sẽ buộc AI bịa ra hoạt
   động trên lớp không có thật. Vì vậy: các hoạt động 1–3 vẫn phải đủ 4 bước; riêng hoạt
   động cuối cùng chấp nhận 2–4 bước và chỉ nhắc nhở nếu ít hơn 4. */
const isLast=i===flows.length-1&&flows.length>=4;
if(isLast){if(f.rows.length<2||f.rows.length>4){blockers.push(`Lessonflow ${i+1} (Vận dụng) phải có từ 2 đến 4 bước.`);return}
  if(f.rows.length<4)warnings.push(`Hoạt động 4 chỉ có ${f.rows.length} bước — phù hợp nếu giao ngoài giờ lên lớp; hãy kiểm tra lại phần nộp và nhận xét sản phẩm.`);}
else if(f.rows.length!==4){blockers.push(`Lessonflow ${i+1} phải có đúng 4 bước.`);return}f.rows.forEach((r,j)=>{if(!r.step||!Array.isArray(r.product))blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu tên bước hoặc sản phẩm.`);if(!Array.isArray(r.teacherActions)||!r.teacherActions.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu hoạt động của GV.`);if(!Array.isArray(r.studentActions)||!r.studentActions.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu hoạt động của HS.`);if(!Array.isArray(r.assessment)||!r.assessment.length)blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu cách/tiêu chí đánh giá.`);
/* Cột "Sản phẩm dự kiến" là phần giáo viên thực sự cầm lên lớp dạy. Bản trước hay trả về nhãn rỗng
   kiểu "SP1: Kết luận về tính đơn điệu" — đọc lên không dạy được gì. Đếm độ dài để bắt lỗi này. */
const spText=(r.product||[]).map(x=>typeof x==='string'?x:'').join(' ');
if(spText&&spText.length<80)warnings.push(`Lessonflow ${i+1}, bước ${j+1}: sản phẩm dự kiến quá sơ sài (${spText.length} ký tự) — cần viết ra nội dung kiến thức hoặc lời giải, không chỉ ghi nhãn.`);if(!Array.isArray(r.goalIds)||!r.goalIds.length)warnings.push(`Lessonflow ${i+1}, bước ${j+1} chưa liên kết goalIds.`);const d=Number(r.duration);if(!Number.isFinite(d)||d<=0){hasDuration=false;blockers.push(`Lessonflow ${i+1}, bước ${j+1} thiếu thời lượng hợp lệ.`)}else totalMinutes+=d})});if(aiGenerated&&flows.length<4)warnings.push(`Chỉ nhận diện ${flows.length}/4 bảng tổ chức hoạt động.`);/* Thời lượng: bản cũ bắt khớp TUYỆT ĐỐI nên gần như lần nào cũng chặn xuất Word chỉ vì
   lệch 2-3 phút — trong khi giáo viên đứng lớp vẫn luôn co giãn vài phút giữa các hoạt động.
   Nay lệch trong khoảng 10% (tối thiểu 5 phút) chỉ là cảnh báo để rà lại; lệch lớn mới chặn. */
const expected=Number(v.periods)*45;
if(aiGenerated&&hasDuration&&expected){const gap=Math.abs(totalMinutes-expected),tol=Math.max(5,Math.round(expected*0.1));
  if(gap>tol)blockers.push(`Tổng thời lượng các bước là ${totalMinutes} phút, lệch ${gap} phút so với ${expected} phút (${v.periods} tiết) — vượt dung sai ${tol} phút.`);
  else if(gap)warnings.push(`Tổng thời lượng là ${totalMinutes}/${expected} phút (lệch ${gap} phút) — giáo viên cân đối lại khi lên lớp.`);}const nlsUsed=[...new Set(text.match(/\b\d\.\d-B\d[a-h]\b/g)||[])],nlsAllowed=allowedNLSTokens();nlsUsed.filter(x=>!nlsAllowed.has(x)).forEach(x=>blockers.push(`Mã NLS không được phép hoặc sai bậc: ${x}.`));const aiUsed=[...new Set(text.match(/\b(?:10|11|12)\.[A-D]\d\.(?:MR)?\d+\b/g)||[])],aiAllowed=allowedAITokens(v.grade);aiUsed.filter(x=>!aiAllowed.has(x)).forEach(x=>blockers.push(`Mã NLAI không thuộc lớp ${v.grade}: ${x}.`));aiUsed.filter(x=>/\.MR\d+$/.test(x)).forEach(x=>{const pos=text.indexOf(x),near=text.slice(pos,Math.min(text.length,pos+180)).toLowerCase();if(!/mở rộng|mo rong|không bắt buộc|khong bat buoc/.test(near))warnings.push(`Mã ${x} là nội dung mở rộng nhưng chưa ghi rõ “không bắt buộc”.`)});if(!$('includeDigital').checked&&nlsUsed.length)blockers.push('Đã tắt NLS nhưng đầu ra vẫn chứa mã NLS.');if(!$('includeAI').checked&&aiUsed.length)blockers.push('Đã tắt NLAI nhưng đầu ra vẫn chứa mã NLAI.');/* Với môn Toán, một kế hoạch bài dạy không có lấy một công thức nào thì chắc chắn là bản tóm tắt
   chứ không phải giáo án. Đây đúng là tình trạng của bản sinh ra trước khi sửa khung. */
if(aiGenerated&&isMathSubject(v)&&!/\$[^$]+\$/.test(text))blockers.push('Môn Toán nhưng cả bản kế hoạch không có công thức nào — nội dung mới ở mức đề cương, chưa dạy được.');
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
