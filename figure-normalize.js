/* figure-normalize.js — V28.1
 *
 * VÌ SAO CÓ TỆP NÀY. Giáo viên gửi ảnh chụp bản in Bài 6 "Vectơ trong không gian": giữa phần
 * "b) Nội dung" hiện nguyên một dòng mã
 *     {"type":"solid","title":"Hình hộp ABCD.A'B'C'D'","shape":"hinh-hop", ...}
 * và khoanh bút đỏ: "Hiển thị ảnh của hình (không hiển thị các mã này)". Cùng lúc, hộp thoại
 * "Sửa hoặc thay hình minh họa" báo "Chưa có hình trong bản kế hoạch" — dù bài rõ ràng đang
 * có một hình hộp.
 *
 * HAI LỖI ẤY LÀ MỘT. Phần mềm chỉ nhận ra hình khi JSON nằm trong khối mã mang đúng nhãn
 * mathviz (app.js: /```mathviz ... ```/). Mô hình ngôn ngữ thì rất hay trả về JSON TRẦN,
 * hoặc bọc trong khối mã nhãn khác (```json). Khi đó:
 *   - app.js xoá dấu ``` rồi đổ nguyên chuỗi JSON vào giữa giáo án  → giáo viên thấy mã thô;
 *   - không có phần tử .mathviz nào được dựng                        → không có SVG nào;
 *   - image-editor.js quét "#result .mathviz svg" nên đếm được 0 hình → danh sách rỗng;
 *   - docx-export.js cũng chỉ quét khối có dấu ```                   → tệp Word không có hình.
 * Một nguyên nhân, bốn chỗ hỏng.
 *
 * CÁCH SỬA: chuẩn hoá VĂN BẢN MARKDOWN ở một chỗ duy nhất, trước khi mọi bộ phận khác đọc nó.
 * Mọi đặc tả hình — dù trần, dù mang nhãn khối mã khác — đều được bọc lại thành khối mathviz
 * đúng chuẩn. Nhờ vậy màn hình, danh sách sửa hình, bộ kiểm định và tệp Word cùng nhìn thấy
 * một thứ. Đây đúng cách flow.js đã làm cho bảng "Tổ chức thực hiện" từ trước (findFlowBlocks
 * đọc cả JSON trần), nay áp dụng nốt cho hình vẽ.
 *
 * Nạp SAU app.js, flow.js, docx-export.js, image-editor.js và math-editor.js.
 */

(function () {
  'use strict';
  if (window.__khbdFigureNormalizePatched) return;
  window.__khbdFigureNormalizePatched = true;

  /* Các loại hình mà phần mềm dựng được. Giữ đúng một danh sách ở đây để không bao giờ
     xảy ra cảnh nơi này nhận, nơi kia không. */
  const LOAI_HINH = ['solid', 'hinh-khong-gian', 'hinhkhong gian', 'graph', 'variation', 'sign'];
  const NHAN_LOAI = /["']type["']\s*:\s*["'](solid|hinh-khong-gian|hinhkhong gian|graph|variation|sign)["']/i;
  const LA_HINH = t => LOAI_HINH.includes(String(t || '').trim().toLowerCase());

  const fixEscapes = raw => (typeof repairJsonEscapes === 'function'
    ? repairJsonEscapes(raw) : String(raw));
  function parseLoose(raw) {
    try { return JSON.parse(fixEscapes(raw)); }
    catch (_) { return JSON.parse(raw); }
  }

  /* Lùi tìm dấu "{" mở ĐÚNG đối tượng chứa nhãn, có đếm độ sâu — nếu lấy dấu "{" gần nhất
     thì với {"meta":{...},"type":"solid"} sẽ bắt nhầm đối tượng con và JSON hỏng. */
  function moDauDoiTuong(text, marker) {
    let sau = 0;
    for (let i = marker; i >= 0; i--) {
      const c = text[i];
      if (c === '}') sau++;
      else if (c === '{') { if (!sau) return i; sau--; }
    }
    return -1;
  }
  function ketDoiTuong(text, start) {
    let sau = 0, trongChuoi = false, nhay = '', thoat = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (trongChuoi) {
        if (thoat) thoat = false;
        else if (c === '\\') thoat = true;
        else if (c === nhay) trongChuoi = false;
        continue;
      }
      if (c === '"' || c === "'") { trongChuoi = true; nhay = c; continue; }
      if (c === '{') sau++;
      else if (c === '}' && --sau === 0) return i + 1;
    }
    return -1;
  }

  /* Cất tạm một đoạn văn bản để vòng quét sau không nhìn vào bên trong nó. */
  function catTam(text, doan, kho, ten) {
    const the = `@@${ten}_${kho.push(doan) - 1}@@`;
    return { text: text.replace(doan, the), the };
  }

  /* Bọc một đặc tả hình thành khối mã mathviz đúng chuẩn, luôn nằm trên dòng riêng. */
  const khoiMathviz = raw => '\n\n```mathviz\n' + String(raw).trim() + '\n```\n\n';

  /* ===== Bước 1: khối mã mang nhãn khác nhưng ruột là đặc tả hình ===== */
  function doiNhanKhoi(md) {
    return String(md).replace(/```([a-zA-Z]*)[ \t]*\r?\n?([\s\S]*?)```/g, (whole, nhan, than) => {
      const l = String(nhan || '').toLowerCase();
      if (l === 'mathviz') return whole;                 /* đã đúng nhãn */
      let spec = null;
      try { spec = parseLoose(than.trim()); } catch (_) { return whole; }
      if (!spec || typeof spec !== 'object') return whole;
      if (spec.type === 'lessonflow') return whole;      /* bảng tổ chức — của flow.js */
      if (!LA_HINH(spec.type)) return whole;
      return khoiMathviz(than);
    });
  }

  /* ===== Bước 2: JSON trần nằm giữa bài ===== */
  function bocJsonTran(md) {
    let text = String(md);

    /* Cất các khối mã đã có ra trước — tuyệt đối không ngó vào trong chúng. */
    const khoiMa = [];
    text = text.replace(/```[a-zA-Z]*[ \t]*\r?\n?[\s\S]*?```/g,
      m => `@@KHOIMA_${khoiMa.push(m) - 1}@@`);

    /* Cất nốt bảng "Tổ chức thực hiện" viết dạng JSON trần: bên trong nó có thể có chữ
       "type" của phần tử con, quét vào đấy là cắt nát bảng của flow.js. */
    const bangFlow = [];
    if (typeof findFlowBlocks === 'function') {
      findFlowBlocks(text).forEach(b => {
        if (b.fenced || !b.raw) return;
        if (text.indexOf(b.raw) < 0) return;
        text = catTam(text, b.raw, bangFlow, 'KHOIFLOW').text;
      });
    }

    let pos = 0, chan = 0;
    while (chan++ < 500) {
      const hit = text.slice(pos).search(NHAN_LOAI);
      if (hit < 0) break;
      const marker = pos + hit;
      const start = moDauDoiTuong(text, marker);
      if (start < 0) { pos = marker + 10; continue; }
      const end = ketDoiTuong(text, start);
      if (end < 0) { pos = marker + 10; continue; }
      const doan = text.slice(start, end);

      /* Đối tượng lồng trong một đối tượng lớn hơn (ví dụ một hàng của lessonflow) thì để yên:
         cắt nó ra là làm hỏng đối tượng cha.
         CÁCH NHẬN BIẾT — xem ký tự có nghĩa đứng ngay trước. Là ":" "," "[" hay "{" thì nó đang
         nằm trong một cấu trúc JSON khác. KHÔNG được dò ngược cả bài tìm dấu "{" bao ngoài:
         giáo án Toán đầy công thức LaTeX kiểu \frac{a}{b}, dò ngược sẽ vớ phải dấu ngoặc của
         công thức ở đoạn trên và tưởng nhầm hình nào cũng là hình lồng.
         CHỖ DỄ SAI: chỉ xét ký tự TRÊN CÙNG MỘT DÒNG. Câu tiếng Việt dẫn vào hình gần như bao
         giờ cũng kết thúc bằng dấu hai chấm — "Quan sát hình sau:" rồi xuống dòng mới đến JSON.
         Nếu bỏ qua dấu xuống dòng thì đúng trường hợp phổ biến nhất lại bị tưởng là hình lồng
         và không hình nào được dựng. Đối tượng nằm đầu dòng thì không thể là giá trị của một
         đối tượng khác. */
      const dauDong = text.lastIndexOf('\n', start - 1) + 1;
      const truoc = text.slice(dauDong, start).replace(/\s+$/, '').slice(-1);
      if (truoc === ':' || truoc === ',' || truoc === '[' || truoc === '{') { pos = end; continue; }

      let spec = null;
      try { spec = parseLoose(doan); } catch (_) { spec = null; }
      /* Đọc được và đúng là hình → bọc thành khối mathviz.
         Đọc KHÔNG được mà vẫn mang nhãn hình → cũng bọc: renderMathViz sẽ hiện ô báo lỗi gọn
         thay vì đổ nguyên dòng mã vào giữa giáo án. Mã thô giữa bài dạy không bao giờ là ý muốn
         của người soạn. */
      if (spec && !LA_HINH(spec.type)) { pos = end; continue; }

      const the = khoiMathviz(doan);
      text = text.slice(0, start) + the + text.slice(end);
      pos = start + the.length;
    }

    bangFlow.forEach((raw, i) => { text = text.split(`@@KHOIFLOW_${i}@@`).join(raw); });
    khoiMa.forEach((raw, i) => { text = text.split(`@@KHOIMA_${i}@@`).join(raw); });
    return text;
  }

  /* Hàm chính. Không phá gì nếu văn bản đã sạch, và chạy hai lần cũng ra cùng kết quả. */
  function chuanHoaHinh(md) {
    if (typeof md !== 'string' || !md) return md;
    if (!NHAN_LOAI.test(md)) return md;            /* không có hình nào — về ngay */
    try { return bocJsonTran(doiNhanKhoi(md)); }
    catch (e) { console.warn('[figure-normalize] bỏ qua vì lỗi:', e); return md; }
  }
  window.khbdChuanHoaHinh = chuanHoaHinh;

  /* ===== Gắn vào các cửa ngõ có sẵn =====
     Bọc ở đây thay vì sửa rải rác trong app.js: mọi đường vào đều đi qua đúng một hàm, nên
     không có lối nào lọt lưới, và gỡ tệp này ra là phần mềm trở về hành vi cũ nguyên vẹn. */
  function boc(ten, doiSoThuNhatLaMd) {
    const cu = window[ten];
    if (typeof cu !== 'function') return;
    window[ten] = function (...args) {
      if (doiSoThuNhatLaMd && typeof args[0] === 'string') args[0] = chuanHoaHinh(args[0]);
      return cu.apply(this, args);
    };
  }
  boc('mdToHtml', true);       /* dựng trên màn hình */
  boc('showResult', true);     /* nguồn của rawMarkdown → kéo theo bản nháp, lịch sử, Word */
  boc('validatePlan', true);   /* bộ kiểm định đếm đúng số hình, không báo thiếu hình oan */
  boc('buildDocxParts', true); /* xuất Word */
  if (typeof window.khbdRunMathAudit === 'function') boc('khbdRunMathAudit', true);
})();
