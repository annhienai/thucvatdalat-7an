# 🌸 HƯỚNG DẪN THAY ẢNH, THÊM LOÀI CÂY MỚI & BẢO TRÌ WEBSITE
*(Thiết kế đơn giản nhất dành cho tác giả Trịnh Thị An – Không cần biết lập trình)*

---

## 1. HƯỚNG DẪN THAY ẢNH CHÂN DUNG TÁC GIẢ TRỊNH THỊ AN

Hiện tại, bức ảnh chân dung chính thức chị đã cung cấp đang được lưu chuẩn xác tại đường dẫn:
```text
assets/images/author/trinh-thi-an.jpg
```
Và tự động hiển thị tại **5 vị trí trang trọng** trên toàn website:
1. Thanh điều hướng trên cùng (ảnh đại diện tròn viền vàng nắng).
2. Trang chủ (chân dung lớn trong phần *“An Nhiên – Người kể chuyện hoa lá”*).
3. Chuyên mục *“Về An Nhiên”* (cùng câu chuyện thương hiệu).
4. Chuyên mục *“Nhật ký Khu vườn An Nhiên”*.
5. Chân trang (bên cạnh chữ ký thương hiệu *Trịnh Thị An – An Nhiên AI (TTA)*).

### Cách đổi sang một bức ảnh chân dung mới về sau:
- **Bước 1:** Chuẩn bị bức ảnh mới của chị (nên chọn ảnh vuông tỉ lệ 1:1 hoặc ảnh chân dung rõ nét), đổi tên file thành đúng **`trinh-thi-an.jpg`**.
- **Bước 2:** Chép đè file `trinh-thi-an.jpg` mới vào thư mục `assets/images/author/` (hoặc bấm **Add file ➔ Upload files** trong thư mục `assets/images/author/` trên GitHub).
- **Kết quả:** Cả 5 vị trí trên website sẽ tự động cập nhật sang ảnh mới mà không cần sửa bất kỳ dòng mã nào.

---

## 2. HƯỚNG DẪN THAY ẢNH BANNER TRANG CHỦ & THÊM ẢNH THƯ VIỆN

### A. Thay 7 bức ảnh Banner Hero trên Trang chủ:
Bảy bức ảnh slideshow trên Trang chủ nằm trong thư mục `assets/images/hero/`:
1. `phuong-tim-dalat.jpg` (Phượng tím Đà Lạt)
2. `mai-anh-dao-dalat.jpg` (Mai anh đào)
3. `cam-tu-cau-dalat.jpg` (Cẩm tú cầu)
4. `mimosa-dalat.jpg` (Hoa Mimosa)
5. `hoa-lan-dalat.jpg` (Hoa lan Đà Lạt)
6. `rung-thong-suong-som.jpg` (Rừng thông trong sương sớm)
7. `vuon-rau-xanh-dalat.jpg` (Những vườn rau xanh Đà Lạt)

👉 Khi chị chụp được bức ảnh thực tế ưng ý (khuyến nghị ảnh ngang tỉ lệ 16:9, kích thước khoảng `1400x800 px`, dung lượng dưới `500 KB` để web tải nhanh), chỉ cần đặt trùng tên với 1 trong 7 file trên và chép đè vào thư mục `assets/images/hero/`.

### B. Thay ảnh cho từng loài thực vật trong 100 hồ sơ:
- Mỗi loài cây có một mã định danh `id` dễ nhớ (ví dụ: `hoa-hong`, `lan-ho-diep`, `dau-tay-da-lat`, `thong-nam-la-da-lat`).
- Chị có thể chép ảnh chụp thật vào thư mục `assets/images/flowers/` hoặc `assets/images/orchids/`, sau đó mở tệp `data/plants.json` cập nhật đường dẫn tại trường `"primary": "assets/images/flowers/ten-anh.jpg"`.

---

## 3. HƯỚNG DẪN THÊM MỘT LOÀI CÂY MỚI HOẶC CẬP NHẬT DỮ LIỆU JSON

Ngay trên website (tại mục **Quản trị & Cập nhật JSON**), chị có sẵn công cụ **Tạo & Kiểm tra Hồ sơ JSON cục bộ**:
1. Điền Tên tiếng Việt, Tên khoa học, Họ thực vật, Nhóm cây và Trạng thái kiểm chứng.
2. Bấm nút **“⚙️ Tạo mã JSON chuẩn”** để hệ thống sinh ra khối dữ liệu đúng cấu trúc.
3. Bấm nút **“✅ Kiểm tra lỗi JSON”** để đảm bảo không thiếu dấu phẩy hoặc dấu ngoặc kép.
4. Sao chép khối JSON đó dán thêm vào tệp `data/plants.json` (và cập nhật `js/data-bundle.js` nếu muốn dùng offline không qua server), sau đó tải tệp lên GitHub.

---

## 4. HƯỚNG DẪN SAO LƯU & KHÔI PHỤC NHẬT KÝ KHU VƯỜN

- Vì GitHub Pages là website tĩnh (không có máy chủ cơ sở dữ liệu riêng), các ghi chú và hình ảnh chị nhập trong mục **Nhật ký Khu vườn An Nhiên** được lưu tạm thời trong bộ nhớ trình duyệt (`LocalStorage`) của thiết bị đang dùng.
- Để không bao giờ bị mất dữ liệu khi xóa lịch sử trình duyệt hoặc đổi điện thoại/máy tính mới:
  1. Sau mỗi lần cập nhật nhật ký cây, hãy bấm nút **“💾 Xuất JSON sao lưu”** để tải tệp `nhat-ky-khu-vuon-an-nhien.json` về máy hoặc lưu lên Google Drive.
  2. Khi mở trên thiết bị mới, chỉ cần bấm nút **“📂 Nhập JSON khôi phục”** và chọn lại tệp đó.
