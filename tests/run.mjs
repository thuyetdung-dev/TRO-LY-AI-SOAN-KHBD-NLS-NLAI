#!/usr/bin/env node
/* Chạy bộ tự kiểm tra trong test.html bằng Chromium không giao diện.
   Dùng cho GitHub Actions, và chạy được ngay tại máy:  cd tests && npm install && node run.mjs

   VÌ SAO CẦN TỆP NÀY: bộ kiểm tra 130+ ca đã có sẵn từ lâu, nhưng phải mở trình duyệt và bấm
   nút mới chạy. Vì thế nó từng báo hỏng 57 ca suốt nhiều bản phát hành mà không ai biết —
   con người quên bấm nút, máy thì không quên. */

import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname, join, normalize, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const THU_MUC_TESTS = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(THU_MUC_TESTS, '..');
const CONG = Number(process.env.PORT || 8899);
const HAN_CHO_MS = Number(process.env.TEST_TIMEOUT_MS || 180000);

const KIEU = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
};

/* Máy chủ tĩnh tí hon — không phụ thuộc python hay gói ngoài nào, nên chạy giống nhau ở
   mọi máy và mọi runner. Chỉ phục vụ tệp bên trong thư mục kho. */
const server = createServer(async (req, res) => {
  try {
    const duongDan = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const tep = join(GOC, normalize(duongDan).replace(/^(\.\.[/\\])+/, ''));
    if (!tep.startsWith(GOC)) { res.writeHead(403).end('Cấm'); return; }
    const noiDung = await readFile(tep);
    res.writeHead(200, {'Content-Type': KIEU[extname(tep).toLowerCase()] || 'application/octet-stream'});
    res.end(noiDung);
  } catch { res.writeHead(404).end('Không tìm thấy'); }
});

await new Promise((ok, loi) => server.listen(CONG, '127.0.0.1', ok).on('error', loi));

const trinhDuyet = await chromium.launch();
const trang = await trinhDuyet.newPage();

/* Lỗi lúc nạp trang cũng phải tính là HỎNG.
   Chính một lỗi như vậy — syncProvider ném TypeError vì thiếu một dấu "?." — đã làm chết
   1000 dòng cuối của app.js và khiến 57 ca báo hỏng giả. Nếu chỉ đếm ca đỏ thì lần sau vẫn
   mất cả buổi đi tìm nguyên nhân ở nhầm chỗ. */
const loiNapTrang = [];
trang.on('pageerror', e => loiNapTrang.push(String(e && e.stack || e).split('\n').slice(0, 3).join('\n')));

let ma = 0;
try {
  await trang.goto(`http://127.0.0.1:${CONG}/test.html`, {waitUntil: 'load', timeout: 60000});
  await trang.click('#run');
  await trang.waitForFunction(
    () => document.getElementById('verdict').className !== 'run',
    null, {timeout: HAN_CHO_MS});

  const ketLuan = (await trang.$eval('#verdict', e => e.textContent)).trim();
  /* Bỏ ký tự dấu ✕ ở đầu mỗi dòng (cột "mark" của giao diện) để khỏi in ra hai lần. */
  const hong = await trang.$$eval('.case.bad', cs =>
    cs.map(c => c.innerText.replace(/\s*\n\s*/g, ' — ').replace(/^✕\s*—?\s*/, '').trim()));
  const boQua = await trang.$$eval('.case.skip', cs => cs.length);

  console.log(`\nKẾT LUẬN: ${ketLuan}${boQua ? ` (bỏ qua ${boQua})` : ''}\n`);
  hong.forEach(h => console.log('  ✕ ' + h));
  loiNapTrang.forEach(e => console.log('\n  LỖI NẠP TRANG:\n' + e.split('\n').map(l => '    ' + l).join('\n')));

  if (hong.length || loiNapTrang.length) {
    console.log(`\n→ HỎNG: ${hong.length} phép kiểm tra, ${loiNapTrang.length} lỗi nạp trang.`);
    if (hong.some(h => /JSZip/i.test(h)))
      console.log('  Gợi ý: ca JSZip cần Internet (tải từ cdn.jsdelivr.net).');
    ma = 1;
  } else {
    console.log('→ ĐẠT toàn bộ.');
  }
} catch (e) {
  console.error('\n→ Không chạy được bộ kiểm tra:', e && e.message || e);
  loiNapTrang.forEach(x => console.error('  LỖI NẠP TRANG: ' + x));
  ma = 1;
} finally {
  await trinhDuyet.close();
  server.close();
}

process.exit(ma);
