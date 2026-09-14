# HƯỚNG DẪN ĐƯA V27.5 LÊN GITHUB

## Phiên bản

- Build: **b27.5**
- Nhánh: `codex/v27.5-image-replacement`
- Pull Request: V27.5 – Sửa và thay hình minh họa
- Nhánh đích: `main`

## Cách kiểm tra trước khi hợp nhất

1. Mở Pull Request V27.5 trên GitHub.
2. Chọn **Files changed** và xác nhận có các tệp:
   - `app.js`
   - `index.html`
   - `image-editor.js`
   - `image-editor.css`
3. Mở bản xem trước của nhánh và kiểm tra đầu trang hiện `b27.5`.
4. Soạn một KHBD có ít nhất hai hình minh họa.
5. Bấm **Sửa hình**, lần lượt chọn từng hình và kiểm tra:
   - Chọn tệp PNG/JPG/WebP.
   - Kéo-thả ảnh.
   - Dán ảnh bằng Ctrl+V.
   - Xem trước trước khi áp dụng.
   - Sửa mô tả, chú thích và chiều rộng 30%–100%.
   - Ảnh xuất hiện đúng vị trí.
   - Khôi phục đúng hình tự động ban đầu.
6. Tải DOCX, đổi phần mở rộng thành `.zip` để kiểm tra nội bộ:
   - Có ảnh trong `word/media/`.
   - `word/document.xml` tham chiếu đúng ảnh.
   - Chú thích và kích thước đúng.
7. Kiểm tra lại các chức năng cũ: soạn bài, chỉnh nội dung, chỉnh hình Toán, lịch sử, sao chép, in/PDF và xuất DOCX.
8. Chỉ bấm **Merge pull request** sau khi các bước trên đạt.

## Cách hợp nhất

Trên trang Pull Request:

1. Bấm **Merge pull request**.
2. Bấm **Confirm merge**.
3. Chờ hệ thống triển khai từ `main`.
4. Mở trang web và nhấn **Ctrl+Shift+R** để xóa bộ nhớ đệm.
5. Xác nhận thanh tiêu đề hiển thị `2026-09-14 · b27.5`.

## Hoàn tác nếu cần

Không xóa lịch sử. Trên GitHub, mở Pull Request đã hợp nhất và dùng **Revert**, sau đó tạo Pull Request hoàn tác riêng để kiểm tra trước khi hợp nhất.
