# 🚀 HƯỚNG DẪN ĐƯA WEBSITE LÊN GITHUB PAGES TỪNG BƯỚC
*(Dành cho người không chuyên lập trình – Chỉ dùng chuột kéo thả trên trình duyệt)*

Website **AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT** sử dụng toàn bộ đường dẫn tương đối (`css/style.css`, `assets/images/author/trinh-thi-an.jpg`, `data/plants.json`) và có sẵn file `.nojekyll`, nên tương thích 100% với **GitHub Pages** (cả dạng `username.github.io` lẫn dạng thư mục dự án `username.github.io/an-nhien-botanical/`).

---

## BƯỚC 1: GIẢI NÉN TỆP ZIP DỰ ÁN
1. Tải tệp `an-nhien-botanical-website.zip` về máy tính của bạn.
2. Nhấp chuột phải vào tệp ZIP và chọn **Extract All... (Giải nén)**.
3. Bên trong thư mục giải nén, bạn sẽ thấy đầy đủ các tệp: `index.html`, `.nojekyll`, và các thư mục `css/`, `js/`, `data/`, `assets/`.

---

## BƯỚC 2: TẠO KHO LƯU TRỮ (REPOSITORY) MỚI TRÊN GITHUB
1. Truy cập [https://github.com](https://github.com) và đăng nhập vào tài khoản GitHub của bạn (nếu chưa có, bấm **Sign up** để tạo miễn phí bằng email).
2. Ở góc trên bên phải màn hình, bấm dấu **`+`** rồi chọn **New repository**.
3. Điền thông tin:
   - **Repository name (Tên kho):** Nhập `an-nhien-botanical` (hoặc `bach-khoa-thuc-vat-dalat`).
   - **Description (Mô tả):** `An Nhiên – Bách Khoa Toàn Thư Thực Vật Đà Lạt | Trịnh Thị An – An Nhiên AI (TTA)`
   - Chọn **Public (Công khai)** để sử dụng GitHub Pages miễn phí.
   - Đánh dấu tích vào ô **Add a README file** (hoặc để trống đều được).
4. Bấm nút màu xanh **Create repository**.

---

## BƯỚC 3: TẢI CÁC TỆP WEBSITE LÊN GITHUB
1. Trong giao diện kho vừa tạo, bấm nút **Add file** ➔ chọn **Upload files**.
2. Mở thư mục `an-nhien-botanical` đã giải nén trên máy tính, chọn toàn bộ các tệp và thư mục bên trong (`index.html`, `.nojekyll`, `css`, `js`, `data`, `assets`, `README.md`...) rồi **kéo thả trực tiếp** vào khung giữa màn hình GitHub.
   - *Lưu ý quan trọng:* Hãy kéo các tệp sao cho `index.html` nằm ngay ở cấp ngoài cùng của kho lưu trữ.
3. Chờ thanh tiến trình tải xong 100%, kéo xuống cuối trang, ở ô **Commit changes**, nhập: `Xuất bản website An Nhiên Bách Khoa Thực Vật Đà Lạt` rồi bấm nút xanh **Commit changes**.

---

## BƯỚC 4: BẬT GITHUB PAGES ĐỂ XUẤT BẢN WEBSITE THỰC TẾ
1. Trên thanh menu của kho lưu trữ GitHub, bấm vào mục **Settings (Cài đặt)** (biểu tượng bánh răng).
2. Ở cột menu bên trái, bấm vào mục **Pages**.
3. Tại phần **Build and deployment**:
   - Mục **Source**: Chọn **Deploy from a branch**.
   - Mục **Branch**: Chọn nhánh **`main`** (hoặc `master`), ô bên cạnh giữ nguyên là **`/ (root)`**, sau đó bấm **Save**.
4. Chờ khoảng **1 đến 2 phút**, tải lại trang (F5), bạn sẽ thấy dòng thông báo ở đầu trang:
   > **Your site is live at `https://<ten-tai-khoan-cua-ban>.github.io/an-nhien-botanical/`**
5. Bấm vào đường link đó để mở website chính thức của bạn trên Internet (có sẵn chứng chỉ bảo mật **HTTPS**). Bạn có thể gửi đường link này qua Zalo, Facebook hoặc gắn vào phần mô tả kênh YouTube **An Nhiên AI Music (TTA)**.
