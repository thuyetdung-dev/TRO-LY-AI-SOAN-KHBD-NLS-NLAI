# CẤU HÌNH OPENAI AN TOÀN — V27.6

## 1. Chọn đúng dự án Vercel

Mở dự án Vercel đang triển khai kho `TRO-LY-AI-SOAN-KHBD-NLS-NLAI`. Không nhập key vào một dự án khác.

## 2. Thêm biến môi trường

Vào **Settings → Environment Variables → Add Environment Variable**:

- Name: `OPENAI_API_KEY`
- Value: API key OpenAI
- Type: Secret
- Environments: Production, Preview, Development

Có thể thêm tùy chọn:

- Name: `OPENAI_MODEL`
- Value: `gpt-5-mini`

Không thêm tiền tố `NEXT_PUBLIC_` hoặc `VITE_`.

## 3. Triển khai lại

Vào **Deployments**, mở deployment mới nhất và chọn **Redeploy**. Sau đó nhấn Ctrl+Shift+R trên trang.

## 4. Sử dụng

Trong mục **Nguồn AI**, chọn **OpenAI — khóa bảo vệ trên Vercel**. Trang web sẽ ẩn ô nhập Gemini và gọi `/api/openai`; API key không được gửi xuống trình duyệt.

OpenAI mode nhận tối đa 5 tệp, tổng khoảng 3 MB mỗi yêu cầu. Với tài liệu lớn, dán phần cần dùng vào ô **Nội dung bổ sung hoặc trích đoạn nguồn**.

## 5. Kiểm tra bảo mật

- Không đưa key vào GitHub, mã JavaScript, URL hoặc ảnh chụp.
- Không gửi key cho người khác.
- Đặt giới hạn chi tiêu trong OpenAI Platform.
- Nếu nghi ngờ key bị lộ, thu hồi key cũ và tạo key mới.
