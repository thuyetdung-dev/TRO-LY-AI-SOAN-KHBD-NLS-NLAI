/* no-key-flow.js — V28.2: lối soạn bài cho giáo viên CHƯA CÓ KHOÁ AI.
 *
 * VÌ SAO CÓ TỆP NÀY. Muốn dùng phần mềm ở mức đầy đủ thì phải có khoá API Gemini, hoặc nhà
 * trường phải cấu hình khoá OpenAI trên máy chủ. Rất nhiều thầy cô không có cả hai, nhưng lại
 * ĐANG DÙNG Claude, Gemini, ChatGPT hay NotebookLM hằng ngày qua trình duyệt — miễn phí. Chỗ
 * thiếu không phải là AI, mà là một cây cầu: chép prompt mang sang bên đó, rồi mang kết quả
 * quay về đây để phần mềm kiểm định, dựng hình và xuất Word.
 *
 * BA NÚT, ĐÚNG BA VIỆC:
 *   1. Chép prompt        — dựng ĐÚNG prompt mà phần mềm vẫn gửi cho AI, đưa vào bộ nhớ tạm.
 *   2. Tải về tệp .txt    — cho máy chặn bộ nhớ tạm, hoặc thầy cô muốn giữ lại dùng nhiều lần.
 *   3. Mở tệp kết quả     — nạp văn bản AI trả về, chạy qua đúng đường showResult/validatePlan.
 *
 * KHÔNG dựng đường đi riêng cho kết quả. Văn bản nạp vào đi qua CÙNG một cửa với bản do AI
 * trong phần mềm sinh ra, nên được kiểm định như nhau, dựng hình như nhau, xuất Word như nhau.
 * Bài học của b20 và b21 là hai đường vẽ song song thì sớm muộn cũng lệch nhau.
 *
 * Nạp SAU app.js (cần promptFor, promptVietTiep, noiTiepVanBan, planLooksComplete, values,
 * showResult, validatePlan) và SAU figure-normalize.js để showResult đã được bọc sẵn.
 */

(function () {
  'use strict';
  if (window.__khbdNoKeyPatched) return;
  window.__khbdNoKeyPatched = true;

  const $ = id => document.getElementById(id);
  const baoTin = m => {
    if (typeof toast === 'function') return toast(m);
    const t = $('toast');
    if (t) { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600); }
  };

  /* ===== 1. Dựng prompt =====
     Dùng thẳng promptFor của app.js, không chép lại nội dung prompt ra đây: prompt là thứ được
     sửa liên tục qua từng bản, chép ra là chắc chắn có ngày hai bản lệch nhau mà không ai biết. */
  const DUOI_PROMPT = `

ĐỊNH DẠNG TRẢ LỜI (bắt buộc, vì bản trả lời sẽ được nạp thẳng vào phần mềm):
- Chỉ in ra bản kế hoạch bài dạy. Bắt đầu NGAY bằng dòng tiêu đề "# KẾ HOẠCH BÀI DẠY".
- Không chào hỏi, không giải thích, không nhận xét trước hay sau bài.
- KHÔNG bọc toàn bộ câu trả lời trong một khối mã. Chỉ các khối lessonflow và mathviz mới nằm trong khối mã, đúng như đã dặn ở trên.`;

  function promptNgoai() {
    if (typeof promptFor !== 'function' || typeof values !== 'function') return '';
    return promptFor(values()) + DUOI_PROMPT;
  }

  /* Ba ô tối thiểu phải có thì prompt mới dùng được. Thiếu tên bài mà vẫn chép prompt đi thì
     AI soạn ra bài của người khác — thà chặn ngay và trỏ đúng ô còn thiếu. */
  const BAT_BUOC = [['subject', 'Môn học'], ['grade', 'Lớp'], ['lesson', 'Tên bài học']];
  function thieuO() {
    for (const [id, ten] of BAT_BUOC) {
      const el = $(id);
      if (el && !String(el.value || '').trim()) return { el, ten };
    }
    return null;
  }

  /* ===== 2. Nạp văn bản AI trả về =====
     Mô hình bên ngoài không bị ràng buộc gì nên hay thêm thắt. Ba kiểu thêm thắt thường gặp,
     xử lý hết ở đây để thầy cô không phải sửa tay: */
  function bocLaiKetQua(raw) {
    let s = String(raw || '').replace(/^﻿/, '').replace(/\r\n/g, '\n').trim();
    if (!s) return '';

    /* (a) Cả câu trả lời bị bọc trong một khối mã ```markdown ... ```
       BA ĐIỀU KIỆN, thiếu một là gỡ nhầm — phép kiểm ngược đã bắt được đúng ca đó:
       1. NHÃN phải là nhãn của lớp vỏ (markdown, md, text, txt, hoặc không nhãn). Nhãn
          lessonflow hay mathviz nghĩa là cái ``` ở đầu tệp LÀ khối dữ liệu của chính bài —
          gỡ đi thì bảng tổ chức thực hiện hoặc hình vẽ mất sạch.
       2. Gỡ xong số dấu ``` còn lại phải CHẴN, nếu không là đã cắt vào giữa một khối.
       3. Không nhãn mà ruột là một đối tượng JSON trọn vẹn thì cũng là khối dữ liệu, không
          phải lớp vỏ. */
    const VO = new Set(['', 'markdown', 'md', 'text', 'txt']);
    const dauKhoi = /^```([a-zA-Z]*)[ \t]*\n/, cuoiKhoi = /\n```[ \t]*$/;
    const nhan = (s.match(dauKhoi) || [])[1];
    if (nhan !== undefined && cuoiKhoi.test(s) && VO.has(String(nhan).toLowerCase())) {
      const thu = s.replace(dauKhoi, '').replace(cuoiKhoi, '').trim();
      const chan = typeof balancedFences === 'function' ? balancedFences(thu)
        : (thu.match(/```/g) || []).length % 2 === 0;
      const laDuLieu = thu.startsWith('{') && thu.endsWith('}');
      if (chan && !laDuLieu) s = thu;
    }

    /* (b) Tệp .json kiểu LessonStudio: lấy phần văn bản kế hoạch bên trong ra. */
    if (s.startsWith('{')) {
      try {
        const o = JSON.parse(typeof repairJsonEscapes === 'function' ? repairJsonEscapes(s) : s);
        const than = o && (o.markdown || o.md || o.plan || o.content || o.noiDung);
        if (typeof than === 'string' && than.trim()) s = than.replace(/\r\n/g, '\n').trim();
      } catch (_) { /* không phải JSON thì cứ coi là văn bản thường */ }
    }

    /* (c) Vài dòng chào hỏi trước tiêu đề bài. Chỉ cắt khi tiêu đề "# ..." nằm ở đầu tệp
       (trong 40 dòng đầu) — nếu không sẽ có ngày cắt nhầm vào giữa một bài không có tiêu đề
       cấp một và mất trắng phần đầu. */
    const dong40 = s.split('\n');
    for (let i = 0; i < Math.min(40, dong40.length); i++) {
      if (/^#\s+\S/.test(dong40[i])) {
        if (i > 0 && dong40.slice(0, i).join('').trim()) s = dong40.slice(i).join('\n').trim();
        break;
      }
    }
    return s;
  }

  /* Ghép nhiều phần khi AI in chưa hết bài và thầy cô phải gõ "tiếp".
     Dùng noiTiepVanBan của app.js — hàm đó đã lo việc cắt bỏ đoạn mô hình chép lại ở chỗ nối,
     chuyện tưởng nhỏ nhưng b26 đã cho thấy nối thẳng thì bản in có đoạn lặp mà nhìn không ra. */
  function ghepCacPhan(ds) {
    const phan = ds.map(bocLaiKetQua).filter(Boolean);
    if (!phan.length) return '';
    return phan.reduce((a, b) => (typeof noiTiepVanBan === 'function' ? noiTiepVanBan(a, b) : a + '\n' + b));
  }

  function nap(md) {
    if (typeof showResult !== 'function') return baoTin('Chưa nạp được: thiếu bộ dựng kết quả.');
    const bao = typeof validatePlan === 'function' ? validatePlan(md, values(), true) : undefined;
    showResult(md, bao);
    if (typeof window.khbdSaveVersion === 'function') window.khbdSaveVersion(true);
    /* Cảnh báo bài bị cụt — đây là lỗi hay gặp nhất của lối làm thủ công, và nếu không nói ra
       thì thầy cô chỉ phát hiện lúc đã xuất Word hoặc tệ hơn là lúc đang đứng lớp. */
    if (typeof planLooksComplete === 'function' && !planLooksComplete(md)) {
      baoTin('Đã nạp, nhưng bài có vẻ chưa hết — hãy gõ “tiếp” bên AI rồi nạp kèm phần sau.');
      $('vietTiepRow')?.removeAttribute('hidden');
    } else {
      baoTin('Đã nạp bản kế hoạch và kiểm định xong');
      $('vietTiepRow')?.setAttribute('hidden', '');
    }
  }

  /* ===== 3. Chép vào bộ nhớ tạm =====
     navigator.clipboard cần trang chạy trên https. Mở tệp bằng file:// hoặc trình duyệt cũ thì
     không có, nên phải có đường lui bằng textarea ẩn — mất đường lui là nút bấm chết lặng. */
  async function chep(text, loi) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return baoTin(loi); }
      throw new Error('không có clipboard API');
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        baoTin(ok ? loi : 'Trình duyệt chặn chép tự động — hãy bấm “Tải về tệp .txt”.');
      } catch (e) { baoTin('Trình duyệt chặn chép tự động — hãy bấm “Tải về tệp .txt”.'); }
    }
  }

  /* Tải về kèm BOM UTF-8: thiếu nó thì Notepad mở ra "Ká∫ø ho·∫°ch" — tiếng Việt nát hết,
     và thầy cô sẽ tưởng phần mềm hỏng chứ không nghĩ tới bảng mã. */
  function taiVe(text, ten) {
    const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = ten;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function tenTep() {
    const v = typeof values === 'function' ? values() : {};
    const sach = s => (typeof deaccent === 'function' ? deaccent(String(s || '')) : String(s || ''))
      .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_').slice(0, 40);
    return ['PROMPT_KHBD', sach(v.subject) || 'Mon', sach(v.grade) || 'Lop', sach(v.lesson)]
      .filter(Boolean).join('_') + '.txt';
  }

  /* ===== Nối vào các nút ===== */
  function layPrompt() {
    const thieu = thieuO();
    if (thieu) { baoTin('Hãy điền “' + thieu.ten + '” trước khi lấy prompt.'); thieu.el.focus(); return ''; }
    const p = promptNgoai();
    if (!p) baoTin('Chưa dựng được prompt — hãy tải lại trang.');
    return p;
  }

  $('copyPromptBtn')?.addEventListener('click', () => {
    const p = layPrompt();
    if (p) chep(p, 'Đã chép prompt — dán vào AI, đính kèm sách giáo khoa rồi gửi');
  });
  $('downloadPromptBtn')?.addEventListener('click', () => {
    const p = layPrompt();
    if (p) { taiVe(p, tenTep()); baoTin('Đã tải tệp prompt về máy'); }
  });
  $('copyVietTiepBtn')?.addEventListener('click', () => {
    if (typeof promptVietTiep !== 'function') return baoTin('Chưa dựng được lời nhắc viết tiếp.');
    chep(promptVietTiep(), 'Đã chép lời nhắc — dán vào AI để nó viết nốt phần còn lại');
  });
  $('openPlanBtn')?.addEventListener('click', () => $('planFile')?.click());

  $('planFile')?.addEventListener('change', async e => {
    const ds = [...(e.target.files || [])];
    e.target.value = '';                       /* cho phép chọn lại đúng tệp đó lần sau */
    if (!ds.length) return;
    if (ds.some(f => f.size > 5 * 1024 * 1024)) return baoTin('Tệp quá lớn — bản kế hoạch chỉ là văn bản, không quá 5 MB.');
    try {
      /* Sắp theo tên để "phan1.txt, phan2.txt" ghép đúng thứ tự dù trình duyệt trả về lộn xộn. */
      ds.sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi', { numeric: true, sensitivity: 'base' }));
      const reader = window.khbdReadTextFile;
      if (typeof reader !== 'function') throw new Error('Thiếu bộ đọc văn bản thống nhất. Hãy tải lại trang.');
      const thongTin = await Promise.all(ds.map(reader));
      const box = $('planFileInfo');
      if (box) {
        box.hidden = false;
        box.innerHTML = '<strong>KHBD kết quả để mở và kiểm định</strong>' + thongTin.map(x =>
          `<article class="file-inspect ${x.empty ? 'file-error' : ''}"><b>${esc(x.name)}</b><span>${esc(x.encoding)} · ${x.characters.toLocaleString('vi-VN')} ký tự</span>${x.empty ? '<em>Tệp rỗng</em>' : `<details><summary>Xem trước nội dung</summary><pre>${esc(x.preview)}</pre></details>`}</article>`).join('');
      }
      const noi = thongTin.map(x => x.text);
      const md = ghepCacPhan(noi);
      if (!md) return baoTin('Tệp rỗng hoặc không đọc được nội dung.');
      if (md.length < 400) return baoTin('Nội dung quá ngắn, chưa giống một bản kế hoạch bài dạy.');
      nap(md);
    } catch (err) { baoTin('Không đọc được tệp: ' + (err && err.message || err)); }
  });

  /* Mở sẵn khối hướng dẫn khi chưa có khoá nào — đúng lúc thầy cô cần nhìn thấy nó nhất. */
  document.addEventListener('DOMContentLoaded', () => {
    const hop = $('noKeyBox');
    if (hop && !String($('apiKey')?.value || '').trim() && $('aiProvider')?.value === 'gemini') hop.open = true;
  });

  /* Mở ra cho bộ kiểm tra và cho các mô-đun khác dùng lại. */
  window.khbdPromptNgoai = promptNgoai;
  window.khbdBocKetQua = bocLaiKetQua;
  window.khbdGhepCacPhan = ghepCacPhan;
  window.khbdNapKetQua = nap;
})();
