# Trợ lý soạn Kế hoạch bài dạy — NLS/NLAI

Phần mềm web hỗ trợ giáo viên soạn Kế hoạch bài dạy (KHBD) theo Chương trình GDPT 2018,
tích hợp năng lực số (NLS) và năng lực AI (NLAI), xuất ra tệp Word.

Phiên bản hiện tại: **V28.1** — số hiệu nằm ở `APP_BUILD` trong `app.js` và hiện trên thanh
tiêu đề của trang. Nếu con số trên trang không khớp bản vừa tải lên, trình duyệt còn giữ bản cũ
trong bộ nhớ đệm: bấm `Ctrl+Shift+R`.

## Chạy thử tại máy

Không cần cài gì, nhưng **phải phục vụ qua HTTP**, không mở bằng `file://`:

```bash
python3 -m http.server 8000
# rồi mở http://127.0.0.1:8000
```

Ở chế độ này `/api/*` không tồn tại nên màn hình đăng nhập sẽ không vượt qua được — xem mục
"Ranh giới bảo vệ" bên dưới.

## Chạy bộ tự kiểm tra

Bộ kiểm tra hiện có hơn 140 phép thử về công thức Toán, đồ thị, bảng biến thiên, bảng xét dấu,
hình khối không gian, xuất DOCX, kiểm định NLS/NLAI và định tuyến nguồn AI.

**Bằng tay:** mở `http://127.0.0.1:8000/test.html` rồi bấm nút chạy.

**Tự động** (khuyên dùng — không phải nhớ bấm nút):

```bash
cd tests
npm ci
npx playwright install --with-deps chromium   # chỉ cần một lần
npm test
```

Máy đã có sẵn Chromium (máy ảo, vùng chứa, máy không nối mạng) thì khỏi tải lại bản của
Playwright — chỉ cần chỉ đường:

```bash
CHROMIUM_PATH=/duong/dan/toi/chrome npm test
```

Trả về mã thoát `0` khi đạt hết, `1` khi có ca hỏng **hoặc có lỗi nạp trang**. Bộ này cũng chạy
tự động trên GitHub Actions ở mỗi lần push và mỗi pull request
(`.github/workflows/tu-kiem-tra.yml`).

**Quy tắc:** mọi thay đổi đều phải chạy bộ này trước khi đưa lên. Lỗi nạp trang (`pageerror`)
cũng phải coi là hỏng — một lỗi như vậy từng làm chết 1000 dòng cuối của `app.js` và khiến 57
phép thử báo hỏng giả trong nhiều bản phát hành liên tiếp mà không ai biết. Đó cũng là lý do
`tests/run.mjs` bắt cả `pageerror` chứ không chỉ đếm ca đỏ.

Thư mục `tests/` có `package.json` riêng, cố ý **không** đặt ở gốc kho: để Vercel vẫn nhận đây
là trang tĩnh kèm serverless function, chứ không tưởng là dự án Node cần build.

`test.html` phải nạp **đúng danh sách và đúng thứ tự** các tệp JS như `index.html`. Các tệp
chia sẻ trạng thái qua biến toàn cục, nên thứ tự nạp chính là kiến trúc của phần mềm. Thêm tệp
mới vào `index.html` thì phải thêm vào `test.html` cùng lúc.

## Triển khai

Chạy trên **Vercel**. Thư mục `api/` là các Serverless Function; phần còn lại là tệp tĩnh.

Cần đặt 6 biến môi trường (Settings → Environment Variables, cho cả Production, Preview,
Development), xem `CAU_HINH_DANG_NHAP_V28.md`:

| Biến | Dùng để |
|---|---|
| `AUTH_SESSION_SECRET` | ký cookie phiên — tối thiểu 32 ký tự ngẫu nhiên |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | tài khoản quản trị |
| `TEACHER_USERNAME` / `TEACHER_PASSWORD` | tài khoản giáo viên (hiện dùng chung) |
| `OPENAI_API_KEY` | khóa OpenAI, chỉ nằm ở máy chủ |
| `OPENAI_MODEL` | tùy chọn, mặc định `gpt-5-mini` |

Không đặt khóa Gemini ở máy chủ: khóa Gemini do từng giáo viên tự dán vào trình duyệt và chỉ
tồn tại trong phiên làm việc đó.

## Ranh giới bảo vệ — đọc kỹ trước khi giới thiệu cho nhà trường

Màn hình đăng nhập **không** khóa được phần mềm. Nó ẩn giao diện bằng CSS
(`visibility:hidden`), còn toàn bộ mã JavaScript vẫn tải và chạy trước khi biết người dùng là
ai. Đường Gemini chạy hoàn toàn trong trình duyệt bằng khóa của chính giáo viên, không cần máy
chủ này một lần nào.

Thứ **thực sự** được bảo vệ bằng phiên đăng nhập là `/api/openai` — tức là khóa OpenAI của nhà
trường. Đó cũng là thứ đáng bảo vệ nhất, vì nó tốn tiền.

Ngoài ra, hiện cả trường dùng **chung một tài khoản giáo viên**: không thu hồi được quyền của
một người, không biết ai đã dùng. Trước khi cấp cho nhiều trường, cần chuyển sang tài khoản
riêng từng người với mật khẩu băm (`scrypt`/`argon2`) lưu trong cơ sở dữ liệu.

## Cấu trúc mã

| Tệp | Vai trò |
|---|---|
| `app.js` | lõi: dựng prompt, gọi Gemini/OpenAI, đọc biểu thức Toán, dựng SVG, kiểm định KHBD |
| `standards.js` | bảng mã năng lực NLS/NLAI theo lớp |
| `flow.js` | đọc và dựng bảng tiến trình hoạt động (`lessonflow`) |
| `docx-export.js` | dựng tệp Word (OOXML) — cần JSZip |
| `professional.js` | lịch sử phiên bản, bản nháp (lưu ở `localStorage`) |
| `math-editor.js`, `image-editor.js` | chỉnh hình Toán và ảnh minh họa |
| `figure-normalize.js` | bọc mọi đặc tả hình viết dạng JSON trần vào khối `mathviz` trước khi dựng hình và xuất Word |
| `math-audit.js`, `validation-ux.js`, `guided-fix.js` | kiểm định và trợ lý sửa lỗi |
| `validation-duration-v28.js` | thay hàm kiểm thời lượng theo tiết của `app.js` |
| `v28.js` | thanh công cụ V28: sửa bằng biểu mẫu, AI đề xuất, hoàn tác, preflight DOCX |
| `login.js`, `api/_auth.js`, `api/auth-*.js` | đăng nhập và phiên |
| `api/openai.js` | proxy giữ khóa OpenAI ở máy chủ |
| `vendor/jszip.min.js` | JSZip 3.10.1 lưu thẳng trong kho — xem `vendor/README.md` |

Thư viện ngoài duy nhất còn nạp từ mạng là **MathJax** (chỉ dùng để hiển thị công thức trên
màn hình). Mất mạng thì công thức hiện ra dạng LaTeX thô nhưng **xuất Word vẫn chạy**, vì JSZip
đã nằm sẵn trong kho.

Mọi lời gọi AI ngắn (nút "AI sửa các cảnh báo", "AI đề xuất bản nháp", "Kiểm tra kết nối AI")
đều đi qua `askAI()` trong `app.js` — hàm này tự định tuyến theo nguồn AI giáo viên đang chọn.
**Không gọi thẳng `/api/openai` từ nơi khác**; có một phép kiểm tra tự động canh việc này.

## Nợ kỹ thuật đã biết

- `app.js` hiện 1800+ dòng trong một tệp, nhiều dòng rất dài — nên tách thành ES module theo
  ranh giới có sẵn (`expr-parser`, `mathviz`, `markdown`, `validate`, `gemini-client`, `ui`).
- `validation-duration-v28.js` ghi đè một hàm của `app.js` — một quy tắc đang có hai chỗ viết.
- Lịch sử phiên bản KHBD nằm ở `localStorage`: mất sạch khi giáo viên đổi máy hoặc xoá dữ liệu
  trình duyệt.
- Bộ đếm chống dò mật khẩu nằm trong RAM của từng instance serverless, nên reset theo cold
  start và không dọn entry cũ.
- Phần hình học, bảng biến thiên và kiểm định hiện gắn chặt với môn Toán. Bộ khung chung dùng
  được cho các môn khác nhưng cần tách trước.

## Tài liệu khác

- `HUONG_DAN_SU_DUNG.txt` — hướng dẫn cho giáo viên
- `CAU_HINH_DANG_NHAP_V28.md` — cấu hình đăng nhập
- `HUONG_DAN_CAU_HINH_OPENAI_V27.6.md` — cấu hình OpenAI
- `BAO_CAO_DANH_GIA_VA_HIEU_CHINH.txt` — nhật ký từng vòng đánh giá và sửa chữa
