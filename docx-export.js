/* docx-export.js — Xuất DOCX từ MARKDOWN GỐC, giữ nguyên công thức toán.
 * ---------------------------------------------------------------------------
 * VÌ SAO PHẢI VIẾT LẠI:
 * Bản trong professional.js dựng DOCX từ innerText của #result. Sau khi MathJax
 * đã vẽ, mỗi công thức chỉ còn là <svg> — innerText của nó rỗng hoặc bị làm
 * phẳng ("x²+1" thành "x2+1", "a/b" thành "ab"). Nghĩa là mọi công thức trong
 * giáo án Toán đều biến mất hoặc sai khi mở bằng Word. Đậm/nghiêng cũng mất vì
 * mỗi thẻ chỉ sinh đúng một <w:r>.
 *
 * CÁCH LÀM MỚI: đọc thẳng rawMarkdown (biến toàn cục của app.js) — nơi công
 * thức vẫn còn nguyên dạng $...$ — rồi dịch LaTeX sang OMML, tức định dạng
 * công thức gốc của Microsoft Word. Giáo viên mở ra sửa được như tự gõ.
 *
 * NGUYÊN TẮC: không bao giờ âm thầm đánh rơi nội dung. Lệnh LaTeX nào chưa
 * dịch được thì in ra nguyên văn bằng phông Cambria Math để giáo viên nhìn thấy
 * và tự sửa, thay vì mất trắng.
 *
 * Nạp SAU professional.js (ghi đè wordBtn.onclick).
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS_M = 'http://schemas.openxmlformats.org/officeDocument/2006/math';

  const xml = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

  /* =========================================================================
   * PHẦN A — LaTeX → OMML
   * ========================================================================= */

  const SYM = {
    alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ε', varepsilon:'ε', zeta:'ζ',
    eta:'η', theta:'θ', iota:'ι', kappa:'κ', lambda:'λ', mu:'μ', nu:'ν', xi:'ξ',
    pi:'π', rho:'ρ', sigma:'σ', tau:'τ', upsilon:'υ', phi:'φ', varphi:'φ', chi:'χ',
    psi:'ψ', omega:'ω', Gamma:'Γ', Delta:'Δ', Theta:'Θ', Lambda:'Λ', Xi:'Ξ', Pi:'Π',
    Sigma:'Σ', Phi:'Φ', Psi:'Ψ', Omega:'Ω',
    times:'×', cdot:'·', div:'÷', pm:'±', mp:'∓', ast:'∗',
    leq:'≤', le:'≤', geq:'≥', ge:'≥', neq:'≠', ne:'≠', approx:'≈', equiv:'≡',
    sim:'∼', cong:'≅', propto:'∝',
    in:'∈', notin:'∉', ni:'∋', subset:'⊂', subseteq:'⊆', supset:'⊃', supseteq:'⊇',
    cup:'∪', cap:'∩', setminus:'\\', emptyset:'∅', varnothing:'∅',
    infty:'∞', partial:'∂', nabla:'∇', forall:'∀', exists:'∃', nexists:'∄',
    neg:'¬', land:'∧', lor:'∨', therefore:'∴', because:'∵',
    to:'→', rightarrow:'→', longrightarrow:'⟶', leftarrow:'←', Rightarrow:'⇒',
    Leftarrow:'⇐', Leftrightarrow:'⇔', leftrightarrow:'↔', mapsto:'↦',
    angle:'∠', perp:'⊥', parallel:'∥', triangle:'△', square:'□', circ:'∘',
    degree:'°', prime:'′', ldots:'…', dots:'…', cdots:'⋯', vdots:'⋮',
    mathbb:null, mathrm:null, mathbf:null,
    quad:' ', qquad:'  ', ',':' ', ';':' ', ':':' ', '!':'',
    left:null, right:null, displaystyle:null, limits:null, nolimits:null
  };

  const BB = { R:'ℝ', N:'ℕ', Z:'ℤ', Q:'ℚ', C:'ℂ', P:'ℙ' };
  const FUNCS = ['sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan',
    'sinh','cosh','tanh','log','ln','lg','exp','lim','max','min','sup','inf',
    'det','dim','gcd','deg','arg','mod'];
  const NARY = { sum:'∑', prod:'∏', coprod:'∐', int:'∫', iint:'∬', iiint:'∭', oint:'∮', bigcup:'⋃', bigcap:'⋂' };
  const ACCENT = {
    vec:'\u20D7', overrightarrow:'\u20D7', overleftarrow:'\u20D6',
    hat:'\u0302', widehat:'\u0302', tilde:'\u0303', widetilde:'\u0303',
    dot:'\u0307', ddot:'\u0308', check:'\u030C', breve:'\u0306'
  };
  const OPEN = { '(':')', '[':']', '\\{':'\\}', '|':'|', '\\|':'\\|', '\\langle':'\\rangle' };

  function tokenize(src) {
    const out = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') {
        const m = /^\\([a-zA-Z]+|.)/.exec(src.slice(i));
        out.push({ t: 'cmd', v: m[1] });
        i += m[0].length;
      } else if (c === '{' || c === '}' || c === '^' || c === '_' || c === '&') {
        out.push({ t: c }); i++;
      } else if (/\s/.test(c)) {
        i++;
      } else if (/[0-9]/.test(c)) {
        const m = /^[0-9]+(?:[.,][0-9]+)?/.exec(src.slice(i));
        out.push({ t: 'num', v: m[0] }); i += m[0].length;
      } else {
        out.push({ t: 'ch', v: c }); i++;
      }
    }
    return out;
  }

  const mr = (text, plain) =>
    `<m:r>${plain ? '<m:rPr><m:sty m:val="p"/></m:rPr>' : ''}<m:t xml:space="preserve">${xml(text)}</m:t></m:r>`;
  const wrap = nodes => nodes.join('') || mr('');

  /* Bộ phân tích đệ quy. Trả về mảng chuỗi OMML. */
  function parse(tokens, state) {
    const out = [];
    while (state.i < tokens.length) {
      const tk = tokens[state.i];

      if (tk.t === '}') break;
      if (tk.t === '&') { state.i++; continue; }

      if (tk.t === '{') {
        state.i++;
        const inner = parse(tokens, state);
        if (tokens[state.i]?.t === '}') state.i++;
        out.push(...inner);
        continue;
      }

      if (tk.t === '^' || tk.t === '_') {
        const isSup = tk.t === '^';
        state.i++;
        const script = readAtom(tokens, state);
        // Kiểm tra cặp còn lại: x_a^b
        let other = null, otherIsSup = null;
        const nx = tokens[state.i];
        if (nx && (nx.t === '^' || nx.t === '_') && (nx.t === '^') !== isSup) {
          otherIsSup = nx.t === '^';
          state.i++;
          other = readAtom(tokens, state);
        }
        const base = out.length ? out.pop() : mr('');
        if (other) {
          const sub = isSup ? other : script, sup = isSup ? script : other;
          out.push(`<m:sSubSup><m:e>${base}</m:e><m:sub>${wrap(sub)}</m:sub><m:sup>${wrap(sup)}</m:sup></m:sSubSup>`);
        } else if (isSup) {
          out.push(`<m:sSup><m:e>${base}</m:e><m:sup>${wrap(script)}</m:sup></m:sSup>`);
        } else {
          out.push(`<m:sSub><m:e>${base}</m:e><m:sub>${wrap(script)}</m:sub></m:sSub>`);
        }
        continue;
      }

      if (tk.t === 'num') { out.push(mr(tk.v, true)); state.i++; continue; }

      if (tk.t === 'ch') {
        const ch = tk.v;
        if (ch in OPEN) { out.push(readDelim(tokens, state, ch, OPEN[ch])); continue; }
        state.i++;
        out.push(mr(ch, !/[a-zA-Z]/.test(ch)));
        continue;
      }

      // tk.t === 'cmd'
      const name = tk.v;
      state.i++;

      if (name === 'left') {
        const d = tokens[state.i];
        let open = d ? (d.t === 'cmd' ? '\\' + d.v : d.v) : '(';
        if (open === '.') open = '';
        state.i++;
        const inner = parse(tokens, state);
        // \right
        let close = '';
        if (tokens[state.i]?.t === 'cmd' && tokens[state.i].v === 'right') {
          state.i++;
          const e = tokens[state.i];
          close = e ? (e.t === 'cmd' ? '\\' + e.v : e.v) : '';
          if (close === '.') close = '';
          state.i++;
        }
        out.push(delim(open, close, wrap(inner)));
        continue;
      }
      if (name === 'right') { state.i++; continue; }

      if (name === 'frac' || name === 'dfrac' || name === 'tfrac' || name === 'cfrac') {
        const a = readAtom(tokens, state), b = readAtom(tokens, state);
        out.push(`<m:f><m:fPr><m:type m:val="bar"/></m:fPr><m:num>${wrap(a)}</m:num><m:den>${wrap(b)}</m:den></m:f>`);
        continue;
      }
      if (name === 'binom') {
        const a = readAtom(tokens, state), b = readAtom(tokens, state);
        out.push(delim('(', ')', `<m:f><m:fPr><m:type m:val="noBar"/></m:fPr><m:num>${wrap(a)}</m:num><m:den>${wrap(b)}</m:den></m:f>`));
        continue;
      }
      if (name === 'sqrt') {
        let deg = null;
        if (tokens[state.i]?.t === 'ch' && tokens[state.i].v === '[') {
          state.i++;
          const d = [];
          while (state.i < tokens.length && !(tokens[state.i].t === 'ch' && tokens[state.i].v === ']')) {
            d.push(...parse1(tokens, state));
          }
          state.i++;
          deg = d;
        }
        const e = readAtom(tokens, state);
        out.push(deg
          ? `<m:rad><m:deg>${wrap(deg)}</m:deg><m:e>${wrap(e)}</m:e></m:rad>`
          : `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${wrap(e)}</m:e></m:rad>`);
        continue;
      }
      if (name in ACCENT) {
        const e = readAtom(tokens, state);
        out.push(`<m:acc><m:accPr><m:chr m:val="${ACCENT[name]}"/></m:accPr><m:e>${wrap(e)}</m:e></m:acc>`);
        continue;
      }
      if (name === 'overline' || name === 'bar') {
        const e = readAtom(tokens, state);
        out.push(`<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>${wrap(e)}</m:e></m:bar>`);
        continue;
      }
      if (name === 'underline') {
        const e = readAtom(tokens, state);
        out.push(`<m:bar><m:barPr><m:pos m:val="bot"/></m:barPr><m:e>${wrap(e)}</m:e></m:bar>`);
        continue;
      }
      if (name in NARY) {
        let sub = null, sup = null;
        for (let k = 0; k < 2; k++) {
          const n = tokens[state.i];
          if (n?.t === '_') { state.i++; sub = readAtom(tokens, state); }
          else if (n?.t === '^') { state.i++; sup = readAtom(tokens, state); }
          else break;
        }
        const isInt = /int/.test(name);
        const body = readAtom(tokens, state, true);
        out.push(`<m:nary><m:naryPr><m:chr m:val="${NARY[name]}"/><m:limLoc m:val="${isInt ? 'subSup' : 'undOvr'}"/>` +
          `${sub ? '' : '<m:subHide m:val="1"/>'}${sup ? '' : '<m:supHide m:val="1"/>'}</m:naryPr>` +
          `<m:sub>${sub ? wrap(sub) : ''}</m:sub><m:sup>${sup ? wrap(sup) : ''}</m:sup><m:e>${wrap(body)}</m:e></m:nary>`);
        continue;
      }
      if (name === 'text' || name === 'textrm' || name === 'textbf' || name === 'mbox') {
        out.push(mr(readRaw(tokens, state), true));
        continue;
      }
      if (name === 'mathbb') {
        const raw = readRaw(tokens, state);
        out.push(mr(raw.split('').map(c => BB[c] || c).join(''), true));
        continue;
      }
      if (name === 'mathrm' || name === 'operatorname') {
        out.push(mr(readRaw(tokens, state), true));
        continue;
      }
      if (FUNCS.includes(name)) {
        let fname = mr(name, true);
        const n = tokens[state.i];
        if (n?.t === '_') {
          state.i++;
          const lim = readAtom(tokens, state);
          fname = `<m:limLow><m:e>${fname}</m:e><m:lim>${wrap(lim)}</m:lim></m:limLow>`;
        }
        const arg = readAtom(tokens, state, true);
        out.push(`<m:func><m:funcPr/><m:fName>${fname}</m:fName><m:e>${wrap(arg)}</m:e></m:func>`);
        continue;
      }
      if (name in SYM) {
        const s = SYM[name];
        if (s) out.push(mr(s, true));
        continue;
      }
      if (name === 'begin' || name === 'end') { readRaw(tokens, state); continue; }
      if (name === '\\') { out.push(mr(' ')); continue; }

      // CHƯA DỊCH ĐƯỢC: in nguyên văn để giáo viên thấy và sửa, không âm thầm bỏ.
      out.push(mr('\\' + name, true));
    }
    return out;
  }

  function parse1(tokens, state) {
    const before = state.i;
    const r = [];
    const tk = tokens[state.i];
    if (!tk) return r;
    if (tk.t === 'ch' || tk.t === 'num') { state.i++; return [mr(tk.v, tk.t === 'num')]; }
    state.i = before;
    return readAtom(tokens, state);
  }

  /* Đọc một "nguyên tử": {nhóm} hoặc một ký tự/lệnh đơn. */
  function readAtom(tokens, state, optional) {
    const tk = tokens[state.i];
    if (!tk) return [mr('')];
    if (tk.t === '{') {
      state.i++;
      const inner = parse(tokens, state);
      if (tokens[state.i]?.t === '}') state.i++;
      return inner.length ? inner : [mr('')];
    }
    if (optional && (tk.t === '^' || tk.t === '_' || tk.t === '}')) return [mr('')];
    if (tk.t === 'num') { state.i++; return [mr(tk.v, true)]; }
    if (tk.t === 'ch') { state.i++; return [mr(tk.v, !/[a-zA-Z]/.test(tk.v))]; }
    if (tk.t === 'cmd') {
      const sub = { i: state.i };
      const saved = tokens.slice(state.i);
      const r = parse(saved.slice(0, guessLen(saved)), { i: 0 });
      state.i += guessLen(saved);
      return r.length ? r : [mr('')];
    }
    state.i++;
    return [mr('')];
  }

  /* Ước lượng số token cần cho một lệnh đơn lẻ đứng làm đối số. */
  function guessLen(toks) {
    const t = toks[0];
    if (!t || t.t !== 'cmd') return 1;
    const n = t.v;
    let need = 0;
    if (n === 'frac' || n === 'dfrac' || n === 'binom') need = 2;
    else if (n === 'sqrt' || n in ACCENT || n === 'text' || n === 'mathbb' || n === 'overline' || n === 'bar') need = 1;
    let i = 1;
    while (need > 0 && i < toks.length) {
      if (toks[i].t === '{') {
        let d = 0;
        while (i < toks.length) {
          if (toks[i].t === '{') d++;
          else if (toks[i].t === '}') { d--; if (!d) { i++; break; } }
          i++;
        }
      } else i++;
      need--;
    }
    return i;
  }

  function readRaw(tokens, state) {
    if (tokens[state.i]?.t !== '{') {
      const t = tokens[state.i];
      state.i++;
      return t ? (t.v || '') : '';
    }
    state.i++;
    let s = '', d = 1;
    while (state.i < tokens.length) {
      const t = tokens[state.i];
      if (t.t === '{') d++;
      else if (t.t === '}') { d--; if (!d) { state.i++; break; } }
      s += t.v != null ? t.v : (t.t === 'cmd' ? '\\' + t.v : '');
      if (t.t === 'cmd') s = s.slice(0, -String(t.v).length) + (SYM[t.v] || t.v);
      state.i++;
    }
    return s;
  }

  function delim(open, close, inner) {
    const clean = c => (c || '').replace(/^\\/, '');
    return `<m:d><m:dPr><m:begChr m:val="${xml(clean(open))}"/><m:endChr m:val="${xml(clean(close))}"/></m:dPr><m:e>${inner}</m:e></m:d>`;
  }

  function readDelim(tokens, state, open, close) {
    state.i++;
    const inner = [];
    let depth = 1;
    while (state.i < tokens.length) {
      const t = tokens[state.i];
      if (t.t === 'ch' && t.v === open && open !== close) depth++;
      if (t.t === 'ch' && t.v === close) { depth--; if (!depth) { state.i++; break; } }
      if (t.t === '}') break;
      inner.push(...parse1(tokens, state));
    }
    return delim(open, close, wrap(inner));
  }

  /* API chính: LaTeX → chuỗi <m:oMath> */
  function latexToOmml(tex) {
    try {
      const src = typeof repairLatex === 'function' ? repairLatex(String(tex)) : String(tex);
      const nodes = parse(tokenize(src), { i: 0 });
      return `<m:oMath>${wrap(nodes)}</m:oMath>`;
    } catch (_) {
      // Không dựng được: giữ nguyên văn bản LaTeX bằng Cambria Math.
      return null;
    }
  }

  /* =========================================================================
   * PHẦN B — Markdown → khối nội dung
   * ========================================================================= */

  /* QUAN TRỌNG: các thẻ con của w:rPr phải theo ĐÚNG trình tự schema OOXML
   * (rFonts → b → i → color → sz). Sai thứ tự thì Word báo "nội dung không đọc
   * được" và đòi sửa chữa tệp, dù XML vẫn hợp lệ về mặt cú pháp. */
  const RPR = o => {
    const p = [];
    if (o.code) p.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>');
    if (o.b) p.push('<w:b/>');
    if (o.i) p.push('<w:i/>');
    if (o.color) p.push(`<w:color w:val="${o.color}"/>`);
    if (o.small) p.push('<w:sz w:val="20"/><w:szCs w:val="20"/>');
    return p.length ? `<w:rPr>${p.join('')}</w:rPr>` : '';
  };
  const run = (text, o = {}) =>
    `<w:r>${RPR(o)}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
  const mathFallback = tex =>
    `<w:r><w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/><w:color w:val="B00020"/></w:rPr><w:t xml:space="preserve">${xml(tex)}</w:t></w:r>`;

  /* Chuyển một dòng markdown thành các <w:r>/<m:oMath>, giữ **đậm**, *nghiêng*, $toán$. */
  function runsFrom(text, base = {}) {
    const s = String(text ?? '');
    const out = [];
    // Tách công thức trước để dấu * bên trong LaTeX không bị hiểu là in nghiêng.
    const parts = s.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    for (const part of parts) {
      if (!part) continue;
      const m2 = /^\$\$([\s\S]+)\$\$$/.exec(part) || /^\$([\s\S]+)\$$/.exec(part);
      if (m2) {
        const omml = latexToOmml(m2[1]);
        out.push(omml || mathFallback(part));
        continue;
      }
      let rest = part;
      const re = /(\*\*.+?\*\*|\*[^*]+\*|`[^`]+`)/g;
      let last = 0, m;
      while ((m = re.exec(rest))) {
        if (m.index > last) out.push(run(rest.slice(last, m.index), base));
        const tk = m[0];
        if (tk.startsWith('**')) out.push(run(tk.slice(2, -2), { ...base, b: true }));
        else if (tk.startsWith('`')) out.push(run(tk.slice(1, -1), { ...base, code: true }));
        else out.push(run(tk.slice(1, -1), { ...base, i: true }));
        last = m.index + tk.length;
      }
      if (last < rest.length) out.push(run(rest.slice(last), base));
    }
    return out.join('') || run('');
  }

  /* Trình tự bắt buộc của w:pPr: pStyle → keepNext → spacing → ind → jc. */
  const para = (content, opt = {}) => {
    const p = [];
    if (opt.style) p.push(`<w:pStyle w:val="${opt.style}"/>`);
    if (opt.keepNext) p.push('<w:keepNext/>');
    if (opt.spaceBefore != null || opt.spaceAfter != null)
      p.push(`<w:spacing w:before="${opt.spaceBefore || 0}" w:after="${opt.spaceAfter ?? 60}"/>`);
    if (opt.indent) p.push(`<w:ind w:left="${opt.indent}" w:hanging="${opt.hanging || 0}"/>`);
    if (opt.align) p.push(`<w:jc w:val="${opt.align}"/>`);
    return `<w:p>${p.length ? `<w:pPr>${p.join('')}</w:pPr>` : ''}${content}</w:p>`;
  };

  function tableXml(rows, widths, opt = {}) {
    const total = widths.reduce((a, b) => a + b, 0), FULL = 9354;
    const grid = widths.map(w => `<w:gridCol w:w="${Math.round(w / total * FULL)}"/>`).join('');
    const body = rows.map((cells, ri) => {
      const head = ri === 0 && opt.header !== false;
      const tds = cells.map((c, ci) => {
        const w = Math.round(widths[ci] / total * FULL);
        const shade = head ? '<w:shd w:val="clear" w:fill="D9E2EC"/>' : '';
        const content = Array.isArray(c) ? c.join('') : c;
        return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${shade}<w:vAlign w:val="top"/></w:tcPr>${content || para(run(''))}</w:tc>`;
      }).join('');
      return `<w:tr>${head ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${tds}</w:tr>`;
    }).join('');
    // Trình tự bắt buộc của w:tblPr: tblW → tblBorders → tblLayout.
    return `<w:tbl><w:tblPr><w:tblW w:w="${FULL}" w:type="dxa"/><w:tblBorders>` +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
        .map(s => `<w:${s} w:val="single" w:sz="6" w:color="595959"/>`).join('') +
      `</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
  }

  const cellParas = (items, opt = {}) => {
    const arr = (Array.isArray(items) ? items : [items])
      .map(x => typeof x === 'string' ? x : (x?.text ?? x?.content ?? (x == null ? '' : String(x))))
      .filter(s => String(s).trim());
    if (!arr.length) return para(run('—'));
    return arr.map(t => para(run('• ') + runsFrom(t, opt), { indent: 170, hanging: 170, spaceAfter: 20 })).join('');
  };

  /* Vá dấu gạch chéo TRƯỚC khi đọc, cùng một cách với app.js và flow.js — nếu ba nơi hiểu
     khác nhau thì màn hình một đằng, tệp Word một nẻo. */
  const fixEscapes = typeof repairJsonEscapes === 'function'
    ? repairJsonEscapes
    : raw => String(raw).replace(/\\(u[0-9a-fA-F]{4}|[a-zA-Z]+|[\s\S])/g, (m, g) =>
        (/^u[0-9a-fA-F]{4}$/.test(g) || g === '"' || g === '\\' || g === '/' || /^[bfnrt]$/.test(g))
          ? m : '\\' + m);
  function parseLoose(raw) {
    try { return JSON.parse(fixEscapes(raw)); }
    catch (_) { return JSON.parse(raw); }
  }

  function flowTableXml(spec) {
    const rows = Array.isArray(spec.rows) ? spec.rows : [];
    const layout = $('tableLayout')?.value || '5';
    const H = o => para(runsFrom(o, { b: true }), { spaceAfter: 20 });

    if (layout === '3') {
      const head = ['HĐ CỦA GV VÀ HS', 'SẢN PHẨM & ĐÁNH GIÁ', 'NLS/NLAI'].map(H);
      const body = rows.map(r => [
        para(runsFrom(String(r.step || '') + (r.duration ? ` (${r.duration} phút)` : ''), { b: true }), { spaceAfter: 20 })
          + cellParas(r.teacherStudent || [...(r.teacherActions || []), ...(r.studentActions || [])])
          + (r.sourceTag ? para(runsFrom(String(r.sourceTag), { i: true, small: true }), { spaceAfter: 20 }) : ''),
        cellParas(r.product) + cellParas(r.assessment),
        cellParas(r.competency?.length ? r.competency : ['—'])
      ]);
      return tableXml([head, ...body], [40, 44, 16]);
    }
    const head = ['HOẠT ĐỘNG CỦA GV', 'HOẠT ĐỘNG CỦA HS', 'SẢN PHẨM DỰ KIẾN', 'ĐÁNH GIÁ', 'NLS/NLAI'].map(H);
    const body = rows.map(r => [
      para(runsFrom(String(r.step || '') + (r.duration ? ` (${r.duration} phút)` : ''), { b: true }), { spaceAfter: 20 })
        + cellParas(r.teacherActions || r.teacherStudent)
        + (r.sourceTag ? para(runsFrom(String(r.sourceTag), { i: true, small: true }), { spaceAfter: 20 }) : ''),
      cellParas(r.studentActions || []),
      cellParas(r.product),
      cellParas(r.assessment || ['—']),
      cellParas(r.competency?.length ? r.competency : ['—'])
    ]);
    return tableXml([head, ...body], [26, 22, 24, 16, 12]);
  }

  /* ---- Đồ thị hàm số: SVG → PNG → nhúng thật vào DOCX ----
   * Word không đọc được SVG (bản cũ hơn Office 2019 hoàn toàn không, bản mới cũng
   * hay vỡ nét), nên phải chuyển thành ảnh raster. Việc chuyển là bất đồng bộ (phải
   * chờ trình duyệt tải ảnh), trong khi bộ dựng markdown chạy đồng bộ — vì vậy làm
   * hai lượt: lượt một quét trước toàn bộ đồ thị và đổi ra PNG, lượt hai mới dựng
   * thân tài liệu với ảnh đã sẵn sàng. */
  const GRAPH_W = 760, GRAPH_H = 390;
  const EMU_PER_TWIP = 635;
  /* Vùng chữ = khổ A4 (11906 twip) trừ lề trái 1418 và lề phải 1134 = 9354 twip ≈ 16,5 cm.
     Dùng 9638 như trước sẽ làm ảnh và bảng rộng hơn vùng chữ 0,5 cm và tràn ra ngoài lề. */
  const CONTENT_TWIPS = 9354;

  /* Có thể thay thế khi kiểm thử ngoài trình duyệt. */
  window.rasterizeSVG = window.rasterizeSVG || function (svg, w, h, scale) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      img.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = Math.round(w * scale);
          cv.height = Math.round(h * scale);
          const cx = cv.getContext('2d');
          cx.fillStyle = '#ffffff';
          cx.fillRect(0, 0, cv.width, cv.height);
          cx.drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(b => b ? b.arrayBuffer().then(resolve, reject) : reject(new Error('toBlob rỗng')), 'image/png');
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('Không tải được ảnh SVG'));
      img.src = url;
    });
  };

  /* Quét trước mọi khối mathviz type "graph" trong markdown và đổi sang PNG. */
  async function collectGraphs(md) {
    const specs = [];
    String(md || '').replace(/```([a-zA-Z]*)\s*\n?([\s\S]*?)```/g, (whole, lang, body) => {
      try {
        const spec = parseLoose(body.trim());
        /* Bảng biến thiên có khai báo "expr" cũng sinh ra một đồ thị ngay dưới nó trên màn hình,
           nên tệp Word phải có đúng số ảnh và đúng thứ tự, nếu không ảnh sẽ gán nhầm khối. */
        if (spec?.type === 'graph') specs.push(spec);
        else if (spec?.type === 'variation' && spec.expr && typeof graphFromVariation === 'function') {
          const g = graphFromVariation(spec);
          if (g) specs.push(g);
        }
      } catch (_) { }
      return whole;
    });
    if (!specs.length || typeof buildGraphSVG !== 'function') return [];
    const out = [];
    for (const spec of specs) {
      try {
        const svg = buildGraphSVG(spec, { standalone: true });
        const bytes = await window.rasterizeSVG(svg, GRAPH_W, GRAPH_H, 2);
        out.push({ spec, bytes });
      } catch (_) {
        out.push({ spec, bytes: null });   // thất bại thì ghi chú, không làm hỏng cả tệp
      }
    }
    return out;
  }

  function drawingXml(index, relId) {
    const cx = CONTENT_TWIPS * EMU_PER_TWIP;
    const cy = Math.round(cx * GRAPH_H / GRAPH_W);
    const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
      `<wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>` +
      `<wp:docPr id="${index}" name="Đồ thị ${index}"/>` +
      `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${A}" noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
      `<a:graphic xmlns:a="${A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
      `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
      `<pic:nvPicPr><pic:cNvPr id="${index}" name="image${index}.png"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
      `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  }

  /* mathviz: bảng xét dấu / bảng biến thiên → bảng Word thật; đồ thị → ảnh PNG. */
  function mathvizXml(spec, images) {
    if (spec.type === 'graph') {
      const slot = images && images.shift();
      const title = spec.title ? para(runsFrom(spec.title, { b: true }), { align: 'center', spaceAfter: 60 }) : '';
      const legend = (spec.functions || []).map(f => f.label || f.expr).filter(Boolean);
      const caption = legend.length
        ? para(runsFrom('*' + legend.map(t => t.includes('$') ? t : `$${t}$`).join(';  ') + '*', { small: true }), { align: 'center' })
        : '';
      if (slot && slot.bytes) {
        return title + para(drawingXml(slot.index, slot.relId), { align: 'center' }) + caption;
      }
      return title + para(runsFrom('*[Không chuyển được đồ thị sang ảnh — xem bản trên màn hình hoặc in ra PDF]*', { i: true })) + caption;
    }
    /* Bảng xét dấu và bảng biến thiên KHÔNG phải bảng thường: các dấu nằm XEN KẼ giữa và tại
       các mốc. Với N mốc thì bảng Word phải có 1 + (2N-1) cột — cột nhãn, rồi lần lượt
       mốc / khoảng / mốc / khoảng... Bản cũ đổ thẳng "cells" thành ô nên hàng tiêu đề có N ô
       còn hàng dấu có 2N-3 ô, số ô lệch nhau và Word vỡ bảng. */
    const interleave = (points, cells) => {
      const N = points.length, slots = 2 * N - 1;
      const rowX = [], rowV = [];
      for (let j = 0; j < slots; j++) {
        rowX.push(j % 2 === 0 ? String(points[j / 2] ?? '') : '');
        rowV.push(j === 0 || j === slots - 1 ? '' : String(cells[j - 1] ?? ''));
      }
      return { rowX, rowV, slots };
    };

    if (spec.type === 'sign' || (spec.columns && spec.rows)) {
      const pts = (spec.columns || spec.points || []).map(String);
      const rows = spec.rows || [];
      if (pts.length < 2 || !rows.length)
        return para(runsFrom('*[Bảng xét dấu chưa đủ dữ liệu]*', { i: true }));
      const first = interleave(pts, rows[0].cells || []);
      const cell = (t, bold) => para(runsFrom(wrapMath(t), bold ? { b: true } : {}), { align: 'center', spaceAfter: 20 });
      const head = [para(runsFrom('$x$', { b: true }))].concat(first.rowX.map(t => cell(t, true)));
      const body = rows.map(r => {
        const it = interleave(pts, r.cells || []);
        return [para(runsFrom(wrapMath(r.label), { b: true }))].concat(it.rowV.map(t => cell(t)));
      });
      const widths = [2].concat(Array(first.slots).fill(1).map((_, j) => j % 2 === 0 ? 1.4 : 1));
      return (spec.title ? para(runsFrom(spec.title, { b: true }), { align: 'center', spaceAfter: 60 }) : '')
        + tableXml([head, ...body], widths);
    }

    if (spec.type === 'variation' && Array.isArray(spec.points)) {
      const pts = spec.points.map(String);
      const N = pts.length;
      if (N < 2) return para(runsFrom('*[Bảng biến thiên chưa đủ dữ liệu]*', { i: true }));
      const it = interleave(pts, spec.derivative || []);
      const cell = (t, bold) => para(runsFrom(wrapMath(t), bold ? { b: true } : {}), { align: 'center', spaceAfter: 20 });
      const head = [para(runsFrom('$x$', { b: true }))].concat(it.rowX.map(t => cell(t, true)));
      const rowD = [para(runsFrom("$y'$", { b: true }))].concat(it.rowV.map(t => cell(t)));
      /* Hàng y: mũi tên lên xuống không vẽ được bằng ô bảng Word, nên ghi giá trị tại mốc kèm
         chiều biến thiên bằng ký hiệu ↗ ↘ để giáo viên đọc được ngay và sửa tay nếu muốn. */
      const vals = spec.values || [];
      const dir = k => { const sgn = (spec.derivative || [])[2 * k]; return sgn === '+' ? '↗' : sgn === '-' ? '↘' : ''; };
      const rowY = [para(runsFrom('$y$', { b: true }))];
      for (let j = 0; j < it.slots; j++) {
        if (j % 2 === 0) {
          const v = vals[j / 2];
          const t = (v && typeof v === 'object') ? `${v.left ?? ''} ‖ ${v.right ?? ''}` : (String(v ?? '').trim() || '?');
          rowY.push(cell(t, true));
        } else rowY.push(cell(dir((j - 1) / 2)));
      }
      const widths = [2].concat(Array(it.slots).fill(1).map((_, j) => j % 2 === 0 ? 1.4 : 1));
      let out = (spec.title ? para(runsFrom(spec.title, { b: true }), { align: 'center', spaceAfter: 60 }) : '')
        + tableXml([head, rowD, rowY], widths, { header: false });
      if (spec.expr) {
        const slot = images && images.shift();
        if (slot && slot.bytes) {
          out += para(runsFrom('Đồ thị hàm số ' + (spec.funcLabel || 'y = ' + spec.expr), { b: true }),
                      { align: 'center', spaceBefore: 120, spaceAfter: 60 })
               + para(drawingXml(slot.index, slot.relId), { align: 'center' });
        }
      }
      return out;
    }
    return para(runsFrom('*[Hình minh hoạ toán học — xem bản trên màn hình]*', { i: true }));
  }
  const wrapMath = v => {
    const s = String(v ?? '').trim();
    if (!s || /^[+\-0↗↘↑↓∞‖]+$/.test(s)) return s;
    return s.includes('$') ? s : `$${s}$`;
  };

  /* Markdown → thân document.xml */
  function markdownToBody(md, images) {
    const src = String(md || '');
    const blocks = [];

    // Tách các khối mã ra trước.
    const fenced = [];
    const clean = src.replace(/```([a-zA-Z]*)\s*\n?([\s\S]*?)```/g, (whole, lang, body) => {
      fenced.push({ lang: (lang || '').toLowerCase(), body: body.trim(), whole });
      return `\n@@FENCE_${fenced.length - 1}@@\n`;
    });

    const lines = clean.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trimEnd();
      const t = l.trim();

      const f = /^@@FENCE_(\d+)@@$/.exec(t);
      if (f) {
        const blk = fenced[+f[1]];
        try {
          if (blk.lang === 'mathviz') { blocks.push(mathvizXml(parseLoose(blk.body), images)); continue; }
          const spec = parseLoose(blk.body);
          if (spec?.type === 'lessonflow') { blocks.push(flowTableXml(spec)); continue; }
          if (spec?.type) { blocks.push(mathvizXml(spec, images)); continue; }
        } catch (_) { /* rơi xuống dưới */ }
        blocks.push(para(runsFrom('[Khối dữ liệu chưa đọc được — kiểm tra lại trên màn hình]', { i: true, small: true })));
        continue;
      }

      if (!t) continue;
      if (/^-{3,}$/.test(t)) { blocks.push(para(run(''), { spaceAfter: 0 })); continue; }

      const h = /^(#{1,6})\s+(.*)$/.exec(t);
      if (h) {
        const n = Math.min(3, h[1].length);
        blocks.push(para(runsFrom(h[2], { b: true }),
          { style: n === 1 ? 'Title' : n === 2 ? 'Heading1' : 'Heading2', keepNext: true, spaceBefore: n === 1 ? 0 : 200, spaceAfter: 80, align: n === 1 ? 'center' : undefined }));
        continue;
      }

      // Bảng markdown
      if (t.startsWith('|') && /^\|?[\s:|-]+\|?$/.test((lines[i + 1] || '').trim())) {
        const rows = [t];
        i += 2;
        while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
        i--;
        const cells = rows.map(r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
        const n = Math.max(...cells.map(c => c.length));
        blocks.push(tableXml(
          cells.map((row, ri) => Array.from({ length: n }, (_, ci) =>
            para(runsFrom(row[ci] || '', ri === 0 ? { b: true } : {}), { spaceAfter: 20 }))),
          Array(n).fill(1)));
        continue;
      }

      if (/^>\s?/.test(t)) {
        blocks.push(para(runsFrom(t.replace(/^>\s?/, ''), { i: true }), { indent: 340 }));
        continue;
      }
      if (/^[-*+]\s+/.test(t)) {
        blocks.push(para(run('• ') + runsFrom(t.replace(/^[-*+]\s+/, '')), { indent: 340, hanging: 170, spaceAfter: 30 }));
        continue;
      }
      const num = /^(\d+[.)])\s+(.*)$/.exec(t);
      if (num) {
        blocks.push(para(run(num[1] + ' ') + runsFrom(num[2]), { indent: 340, hanging: 170, spaceAfter: 30 }));
        continue;
      }
      blocks.push(para(runsFrom(t)));
    }
    return blocks.join('');
  }

  /* =========================================================================
   * PHẦN C — Đóng gói .docx
   * ========================================================================= */

  const CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '</Types>';

  const ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '</Relationships>';

  const STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="16436B"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="16436B"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1F4E79"/></w:rPr></w:style>' +
    '</w:styles>';

  function coreXml(title) {
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      `<dc:title>${xml(title)}</dc:title><dc:creator>Trợ lý soạn KHBD</dc:creator>` +
      `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created></cp:coreProperties>`;
  }

  function documentXml(body) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
      `xmlns:m="${NS_M}" ` +
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>` +
      '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1418" w:header="709" w:footer="709"/>' +
      '</w:sectPr></w:body></w:document>';
  }

  /* Bất đồng bộ vì phải chờ trình duyệt vẽ xong từng đồ thị thành PNG. */
  window.buildDocxParts = async function (md, title) {
    const graphs = await collectGraphs(md);
    const media = {}, rels = [];
    graphs.forEach((g, n) => {
      if (!g.bytes) return;
      const index = n + 1;
      g.index = index;
      g.relId = 'rIdImg' + index;
      media['word/media/image' + index + '.png'] = g.bytes;
      rels.push(`<Relationship Id="${g.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${index}.png"/>`);
    });

    const body = documentXml(markdownToBody(md, graphs.slice()));
    const types = rels.length
      ? CONTENT_TYPES.replace('<Default Extension="rels"', '<Default Extension="png" ContentType="image/png"/><Default Extension="rels"')
      : CONTENT_TYPES;

    return Object.assign({
      '[Content_Types].xml': types,
      '_rels/.rels': ROOT_RELS,
      'docProps/core.xml': coreXml(title || 'Kế hoạch bài dạy'),
      'word/document.xml': body,
      'word/styles.xml': STYLES,
      'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels.join('') + '</Relationships>'
    }, media);
  };

  /* =========================================================================
   * PHẦN D — Kiểm tra lần cuối và tải về
   * ========================================================================= */

  function finalAudit(md) {
    const errors = [];
    if (!String(md || '').trim()) errors.push('Bản kế hoạch đang trống.');
    if ($('validationReport')?.classList.contains('block'))
      errors.push('Bản kế hoạch còn lỗi kiểm định chuyên môn chưa xử lý.');
    const plain = String(md || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    [['I. Mục tiêu', 'muc tieu'], ['II. Thiết bị dạy học', 'thiet bi day hoc'], ['III. Tiến trình dạy học', 'tien trinh day hoc']]
      .forEach(([label, key]) => { if (!plain.includes(key)) errors.push(`Thiếu mục ${label}.`); });
    const ap = $('approveCompetencies');
    if (ap && !ap.checked) errors.push('Chưa duyệt mã NLS/NLAI.');
    return [...new Set(errors)];
  }

  async function exportDocx() {
    // Ưu tiên markdown gốc. Nếu giáo viên đã sửa tay trên màn hình, cảnh báo.
    const md = (typeof rawMarkdown === 'string' && rawMarkdown.trim()) ? rawMarkdown : '';
    if (!md) {
      alert('Chưa có nội dung để xuất. Hãy soạn kế hoạch bài dạy trước.');
      return;
    }
    if ($('result')?.classList.contains('edited-by-hand')) {
      if (!confirm('Bạn đã sửa tay trên màn hình. Bản DOCX được dựng từ nội dung AI trả về nên có thể chưa gồm các sửa đổi đó.\n\nVẫn tiếp tục xuất?')) return;
    }
    const errors = finalAudit(md);
    if (errors.length) {
      alert('CHƯA THỂ XUẤT DOCX:\n\n- ' + errors.join('\n- '));
      return;
    }
    if (typeof JSZip === 'undefined') {
      alert('Chưa tải được bộ tạo DOCX. Hãy kết nối Internet rồi mở lại trang.');
      return;
    }

    const btn = $('wordBtn');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Đang tạo...';
    try {
      const v = { subject: $('subject').value, grade: $('grade').value, lesson: $('lesson').value };
      const parts = await window.buildDocxParts(md, `KHBD ${v.subject} ${v.grade} — ${v.lesson}`);
      const zip = new JSZip();
      Object.entries(parts).forEach(([path, content]) => zip.file(path, content));
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `KHBD_${v.subject}_${v.grade}_${v.lesson.replace(/[^a-zA-Z0-9À-ỹ]+/g, '_').slice(0, 55)}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      if (typeof window.khbdSaveVersion === 'function') window.khbdSaveVersion(true);
      const t = $('toast');
      if (t) { t.textContent = 'Đã tạo tệp DOCX (công thức và đồ thị giữ nguyên)'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600); }
    } catch (err) {
      alert('Không tạo được tệp DOCX: ' + (err.message || err));
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  if ($('wordBtn')) $('wordBtn').onclick = exportDocx;
  $('result')?.addEventListener('input', () => $('result').classList.add('edited-by-hand'));
})();
