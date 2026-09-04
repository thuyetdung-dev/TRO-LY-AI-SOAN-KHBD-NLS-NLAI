/* flow.js — Bảng "Tổ chức thực hiện" + giới hạn thời gian chờ AI
 * Giữ nguyên mọi tính năng bản cũ (3 cột / 5 cột, duration, sourceTag) và sửa
 * bốn lỗi: thay thế chuỗi bằng $&, bắt nhầm dấu ngoặc mở, thiếu dự phòng khi
 * thẻ đánh dấu bị gói khác, và JSON hỏng thì đổ mã thô ra giáo án.
 * Nạp SAU app.js.
 */

(function () {
  if (window.__lessonFlowPatched) return;
  const original = window.mdToHtml || (typeof mdToHtml === 'function' ? mdToHtml : null);
  if (typeof original !== 'function') {
    console.warn('[flow.js] Không thấy mdToHtml — hãy nạp app.js trước flow.js.');
    return;
  }
  window.__lessonFlowPatched = true;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const h = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  const fmt = s => h(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\$([^$]+)\$/g, '<span class="math">\\($1\\)</span>')
    .replace(/\r?\n/g, '<br>');

  /* Ép mọi kiểu dữ liệu về chuỗi, tránh in ra [object Object] khi AI trả về
     phần tử dạng {"text": "..."} thay vì chuỗi thuần. */
  function toText(x) {
    if (x == null) return '';
    if (typeof x === 'string' || typeof x === 'number') return String(x);
    if (Array.isArray(x)) return x.map(toText).filter(Boolean).join('; ');
    if (typeof x === 'object') {
      const v = x.text ?? x.content ?? x.value ?? x.name;
      return v != null ? toText(v) : Object.values(x).map(toText).filter(Boolean).join('; ');
    }
    return String(x);
  }

  const list = items => {
    const arr = (Array.isArray(items) ? items : [items]).map(toText).filter(Boolean);
    return arr.length ? `<ul>${arr.map(x => `<li>${fmt(x)}</li>`).join('')}</ul>` : '';
  };

  /* PHẢI VÁ TRƯỚC RỒI MỚI ĐỌC. Bản cũ thử JSON.parse(raw) trước và chỉ vá khi ném lỗi —
     nhưng đúng những lệnh LaTeX hay dùng nhất lại KHÔNG làm JSON.parse ném lỗi: "\f" "\b"
     "\n" "\r" "\t" là ký tự thoát hợp lệ, nên "$\frac{a}{b}$" đọc THÀNH CÔNG mà nội dung
     biến thành ký tự xuống trang + "rac{a}{b}". Công thức mất sạch, không một lời báo lỗi.
     Vá trước thì cả hai trường hợp đều đúng. */
  const fixEscapes = typeof repairJsonEscapes === 'function'
    ? repairJsonEscapes
    : raw => String(raw).replace(/\\(u[0-9a-fA-F]{4}|[a-zA-Z]+|[\s\S])/g, (m, g) =>
        (/^u[0-9a-fA-F]{4}$/.test(g) || g === '"' || g === '\\' || g === '/' || /^[bfnrt]$/.test(g))
          ? m : '\\' + m);
  function parseLoose(raw) {
    try { return JSON.parse(fixEscapes(raw)); }
    catch (_) { return JSON.parse(raw); }
  }

  const duration = r => r.duration ? `<span class="flow-duration">${h(r.duration)} phút</span>` : '';
  const source = r => r.sourceTag ? `<small class="source-tag">${h(r.sourceTag)}</small>` : '';

  function flowTable(spec) {
    const rows = Array.isArray(spec.rows) ? spec.rows : [];
    if (!rows.length) throw new Error('rows rỗng');
    const layout = document.getElementById('tableLayout')?.value || '5';
    const comp = r => (r.competency && (Array.isArray(r.competency) ? r.competency.length : toText(r.competency)))
      ? r.competency : ['—'];

    if (layout === '3') {
      const body = rows.map(r => `<tr><td><strong class="flow-step">${fmt(toText(r.step))} ${duration(r)}</strong>` +
        list(r.teacherStudent || [...(r.teacherActions || []), ...(r.studentActions || [])]) + source(r) +
        `</td><td>${list(r.product)}${list(r.assessment)}</td><td>${list(comp(r))}</td></tr>`).join('');
      return `<div class="flow-wrap"><table class="lesson-flow layout-3"><thead><tr>` +
        `<th>HĐ CỦA GV VÀ HS</th><th>SẢN PHẨM &amp; ĐÁNH GIÁ</th><th>NLS/NLAI</th>` +
        `</tr></thead><tbody>${body}</tbody></table></div>`;
    }

    const body = rows.map(r => `<tr><td><strong class="flow-step">${fmt(toText(r.step))} ${duration(r)}</strong>` +
      list(r.teacherActions || r.teacherStudent) + source(r) +
      `</td><td>${list(r.studentActions || [])}</td><td>${list(r.product)}</td>` +
      `<td>${list(r.assessment || ['—'])}</td><td>${list(comp(r))}</td></tr>`).join('');
    return `<div class="flow-wrap"><table class="lesson-flow layout-5"><thead><tr>` +
      `<th>HOẠT ĐỘNG CỦA GV</th><th>HOẠT ĐỘNG CỦA HS</th><th>SẢN PHẨM DỰ KIẾN</th><th>ĐÁNH GIÁ</th><th>NLS/NLAI</th>` +
      `</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function addFlow(raw, flows) {
    try {
      const spec = parseLoose(raw.trim());
      if (spec?.type !== 'lessonflow' || !Array.isArray(spec.rows)) return null;
      return `\n@@LESSONFLOW_${flows.push(raw.trim()) - 1}@@\n`;
    } catch (_) { return null; }
  }

  /* SỬA LỖI 1: lùi tìm dấu "{" mở ĐÚNG đối tượng chứa "type", có đếm độ sâu.
     Bản cũ lấy dấu "{" gần nhất nên bắt nhầm đối tượng con trong
     {"meta":{...},"type":"lessonflow"} → JSON hỏng → bảng không dựng được. */
  function findObjectStart(text, marker) {
    let depth = 0;
    for (let i = marker; i >= 0; i--) {
      const c = text[i];
      if (c === '}') depth++;
      else if (c === '{') { if (depth === 0) return i; depth--; }
    }
    return -1;
  }

  function findObjectEnd(text, start) {
    let depth = 0, inString = false, quote = '', escaped = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === quote) inString = false;
        continue;
      }
      if (c === '"' || c === "'") { inString = true; quote = c; continue; }
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return i + 1;
    }
    return -1;
  }

  function replaceBareFlows(text, flows) {
    let pos = 0, guard = 0;
    while (guard++ < 500) {
      const hit = text.slice(pos).search(/["']type["']\s*:\s*["']lessonflow["']/i);
      if (hit < 0) break;
      const marker = pos + hit;
      const start = findObjectStart(text, marker);
      if (start < 0) { pos = marker + 10; continue; }
      const end = findObjectEnd(text, start);
      if (end < 0) { pos = marker + 10; continue; }
      const chunk = text.slice(start, end);
      let token = addFlow(chunk, flows);
      /* Khối JSON trần mang nhãn lessonflow nhưng đọc không được: bản cũ để nguyên, nên cả
         đoạn mã thô đổ thẳng vào giữa bản kế hoạch (giáo viên nhìn thấy {"type":"lessonflow"...).
         Thay bằng một ô báo lỗi gọn để biết mà bấm soạn lại. */
      if (!token && /['"]type['"]\s*:\s*['"]lessonflow['"]/i.test(chunk)) {
        token = `\n@@LESSONFLOW_${flows.push(null) - 1}@@\n`;
        text = text.slice(0, start) + token + text.slice(end);
        pos = start + token.length;
        continue;
      }
      if (!token) {
        /* CHỐT CHẶN: nếu vì lý do nào đó "end" không nằm sau vị trí đang xét, con trỏ sẽ
           đứng yên và vòng lặp chạy mãi — trình duyệt đơ, giáo viên phải tắt tab. Luôn ép
           con trỏ tiến lên. Mã hiện tại không rơi vào tình huống này, nhưng một lần sửa
           findObjectStart sau này có thể tạo ra nó, và treo máy là kiểu hỏng tệ nhất. */
        pos = Math.max(end, marker + 10);
        continue;
      }
      text = text.slice(0, start) + token + text.slice(end);
      pos = start + token.length;
    }
    return text;
  }

  const FLOW_ERROR = '<p class="mathviz-error">Bảng tổ chức thực hiện chưa đúng cấu trúc. Vui lòng bấm soạn lại.</p>';

  window.mdToHtml = function (markdown) {
    const flows = [];
    let clean = String(markdown || '').replace(
      /```(?:lessonflow|json)?\s*([\s\S]*?)```/gi,
      (whole, raw) => {
        const token = addFlow(raw, flows);
        if (token) return token;
        /* SỬA LỖI 4: nếu khối mang nhãn lessonflow nhưng JSON hỏng, bản cũ trả
           lại nguyên khối; app.js sau đó xoá dấu ``` và đổ JSON thô vào giữa
           giáo án. Thay bằng một ô báo lỗi gọn. */
        if (/['"]type['"]\s*:\s*['"]lessonflow['"]/i.test(raw)) {
          return `\n@@LESSONFLOW_${flows.push(null) - 1}@@\n`;
        }
        return whole;
      }
    );
    clean = replaceBareFlows(clean, flows);

    clean = clean.split('\n').map(line => {
      line = /^\s*(#{1,6}\s|---\s*$)/.test(line) ? line.trimStart() : line;
      return /^#{4,6}\s/.test(line) ? line.replace(/^#{4,6}/, '###') : line;
    }).join('\n');

    let html = original(clean).replace(/<p>---<\/p>/g, '<hr>');

    flows.forEach((raw, i) => {
      let rendered = FLOW_ERROR;
      if (raw) {
        try { rendered = flowTable(parseLoose(raw)); } catch (_) { rendered = FLOW_ERROR; }
      }
      /* SỬA LỖI 2: dùng split/join thay cho replace(). Với chuỗi thay thế,
         JavaScript diễn giải $&, $', $` và $1 trong nội dung bảng — chỉ một dấu
         $ lẻ trong bài là bảng bị cắt xén hoặc nhân đôi một đoạn.
         SỬA LỖI 3: thêm nhánh dự phòng khi thẻ đánh dấu bị gói khác <p>...</p>,
         nếu không giáo viên sẽ thấy @@LESSONFLOW_0@@ nằm giữa bài. */
      const wrapped = `<p>@@LESSONFLOW_${i}@@</p>`;
      const bare = `@@LESSONFLOW_${i}@@`;
      html = html.includes(wrapped) ? html.split(wrapped).join(rendered) : html.split(bare).join(rendered);
    });

    return html;
  };
})();

/* Giới hạn thời gian chờ mỗi lượt gọi AI. Tách IIFE riêng để vẫn chạy được kể
 * cả khi phần bảng ở trên không nạp được. */
(function () {
  if (window.__aiTimeoutPatched) return;
  // Trình duyệt quá cũ không có fetch: thoát êm thay vì ném lỗi làm chết cả tệp.
  if (typeof window.fetch !== 'function' || typeof AbortController !== 'function') return;
  window.__aiTimeoutPatched = true;

  // app.js thử tối đa 3 mô hình dự phòng tuần tự. 120s cho một lượt là đủ rộng
  // để đọc tài liệu đính kèm, đồng thời chặn trần tổng thời gian chờ ở 6 phút.
  const DEFAULT_TIMEOUT = 120000;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = function (url, options = {}) {
    if (!String(url).includes(':generateContent')) return nativeFetch(url, options);

    const limit = Number(window.AI_TIMEOUT_MS) > 0 ? Number(window.AI_TIMEOUT_MS) : DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), limit);

    // Tôn trọng signal bên gọi truyền vào — bản cũ ghi đè mất.
    const outer = options.signal;
    if (outer) {
      if (outer.aborted) controller.abort();
      else outer.addEventListener('abort', () => controller.abort(), { once: true });
    }

    return nativeFetch(url, { ...options, signal: controller.signal })
      .catch(err => {
        if (err.name === 'AbortError') {
          if (outer?.aborted) throw err;
          throw new Error(`AI phản hồi quá ${Math.round(limit / 1000)} giây. Hãy bớt tài liệu đính kèm hoặc chọn mô hình khác.`);
        }
        if (err instanceof TypeError) throw new Error('Không kết nối được tới Google. Kiểm tra Internet rồi thử lại.');
        throw err;
      })
      .finally(() => clearTimeout(timer));
  };
})();
