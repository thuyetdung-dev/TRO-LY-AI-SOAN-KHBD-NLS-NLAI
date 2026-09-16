# vendor/

Thư viện ngoài được **lưu thẳng vào kho**, không tải từ CDN.

## `jszip.min.js` — JSZip 3.10.1

Dùng để đóng gói tệp `.docx` (một tệp Word thực chất là một tệp ZIP chứa XML).

**Vì sao không dùng CDN nữa:** trước đây tệp này nạp từ `cdn.jsdelivr.net`. Trường nào chặn
CDN, hoặc mạng chập lúc giáo viên bấm "Tải DOCX", là **mất luôn tính năng xuất Word** — đúng
thứ quan trọng nhất của phần mềm, và lỗi hiện ra đúng lúc giáo viên cần nó nhất. Bộ tự kiểm tra
cũng đỏ ngẫu nhiên vì lý do tương tự, mà một cổng kiểm tra đỏ thất thường thì người ta sẽ quen
bỏ qua.

**Nguồn gốc và cách đối chiếu.** Tệp này lấy từ gói npm chính thức và **trùng từng byte** với
bản mà `index.html` vẫn nạp từ CDN trước đây — mã băm SRI tính ra đúng bằng chuỗi `integrity=`
đã ghim sẵn trong `index.html`, nên không có thêm chút tin cậy nào phải đặt vào ai cả.

Kiểm chứng lại bất cứ lúc nào:

```bash
npm pack jszip@3.10.1 && tar xzf jszip-3.10.1.tgz
openssl dgst -sha384 -binary package/dist/jszip.min.js | openssl base64 -A
```

Kết quả phải đúng bằng:

```
+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG
```

Đó cũng chính là giá trị `integrity="sha384-…"` cũ trong `index.html`.

## Khi nâng cấp

1. Tải bản mới bằng `npm pack jszip@<bản-mới>`.
2. Tính lại mã băm bằng lệnh trên và ghi vào tệp này.
3. Chạy `cd tests && npm test` — có phép kiểm tra `Bộ tạo tệp nén JSZip đã sẵn sàng` và các ca
   xuất DOCX canh sẵn.
