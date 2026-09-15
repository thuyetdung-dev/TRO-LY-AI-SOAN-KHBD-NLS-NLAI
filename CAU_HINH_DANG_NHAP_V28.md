# CẤU HÌNH ĐĂNG NHẬP V28 TRÊN VERCEL

Trong Vercel → Project → Settings → Environment Variables, tạo 5 biến sau cho Production, Preview và Development:

- `AUTH_SESSION_SECRET`: chuỗi bí mật ngẫu nhiên tối thiểu 32 ký tự.
- `ADMIN_USERNAME`: tên đăng nhập quản trị.
- `ADMIN_PASSWORD`: mật khẩu mạnh của quản trị.
- `TEACHER_USERNAME`: tên đăng nhập giáo viên.
- `TEACHER_PASSWORD`: mật khẩu mạnh của giáo viên.

Sau khi lưu, chọn **Redeploy** deployment mới nhất. Không ghi các giá trị bí mật vào GitHub, ảnh chụp hoặc tin nhắn công khai.

## Kiểm tra

1. Mở trang ở cửa sổ ẩn danh.
2. Kiểm tra đăng nhập sai bị từ chối.
3. Kiểm tra cả hai thẻ Quản trị và Giáo viên.
4. Bấm Đăng xuất và xác nhận không vào lại nếu chưa đăng nhập.
5. Phiên tự hết hạn sau 8 giờ.

Bản này phù hợp cho một tài khoản quản trị và một tài khoản giáo viên dùng chung. Khi cần cấp tài khoản riêng cho nhiều giáo viên, nên chuyển sang cơ sở dữ liệu và mật khẩu băm.
