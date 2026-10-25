# 🌿 AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
**AN NHIEN – DALAT BOTANICAL ENCYCLOPEDIA & AI GARDEN**

> **Khẩu hiệu thương hiệu:** *“Mỗi loài cây một câu chuyện – Mỗi đóa hoa một miền thương nhớ.”*  
> **Khẩu hiệu khám phá:** *“Mở một trang sách – Khám phá một sự sống.”*  
> **Thông điệp trợ lý AI:** *“Chụp một chiếc lá – Khám phá cả một thế giới xanh.”*  
> **Tác giả & Người sáng lập:** **TRỊNH THỊ AN – Thương hiệu: AN NHIÊN AI (TTA)**

---

## I. GIỚI THIỆU TỔNG QUAN DỰ ÁN

Website **AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT** là một hệ thống thư viện khoa học thực vật, bảo tàng thực vật số, sách điện tử 7 tập và nhật ký làm vườn mang dấu ấn thương hiệu cá nhân của tác giả **Trịnh Thị An – An Nhiên AI (TTA)**.

Dự án được thiết kế hoàn chỉnh bằng chuẩn **HTML5, CSS3, JavaScript (ES6+)** và cơ sở dữ liệu **JSON chuẩn hóa**, tương thích 100% để xuất bản miễn phí và lâu dài trên **GitHub Pages**.

### Ba giá trị cốt lõi:
1. **ĐẸP VỀ NGHỆ THUẬT:** Phong cách *Luxury Botanical Garden & Digital Botanical Museum* lấy cảm hứng từ sương sớm, nắng dịu và rừng thông Đà Lạt với bảng màu chuẩn (`#244A3B`, `#83A88A`, `#F7F5ED`, `#D9BD78`, `#D9A8AC`, `#715641`, `#FFFEFA`).
2. **SÂU VỀ TRI THỨC:** Tích hợp 100 hồ sơ thực vật chia theo 7 nhóm chuyên khảo, Sách điện tử lật trang A–Z, Lịch hoa Đà Lạt 12 tháng, Trợ lý chăm sóc cây 12 bước và Nhật ký khu vườn 6 giai đoạn.
3. **ĐÚNG VỀ KHOA HỌC:** Danh pháp thực vật được đối chiếu từ **Plants of the World Online (POWO – Kew)**, **World Flora Online (WFO)**, **IPNI** và **GBIF**, gắn nhãn minh bạch trạng thái hồ sơ (*Đã kiểm chứng* / *Đang biên tập* / *Cần bổ sung nguồn*).

---

## II. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
an-nhien-botanical/
├── index.html                          # Trang chính tích hợp đầy đủ 14 chuyên mục
├── .nojekyll                           # Tệp cấu hình chuẩn cho GitHub Pages
├── css/
│   └── style.css                       # Giao diện Luxury Botanical, Responsive & CSS In A4
├── js/
│   ├── data-bundle.js                  # Bản sao dữ liệu đồng bộ giúp chạy được cả khi mở trực tiếp
│   ├── main.js                         # Điều phối ứng dụng, Slideshow, Lịch hoa, So sánh, JSON Admin
│   ├── search.js                       # Tìm kiếm Tiếng Việt có dấu/không dấu, Bộ lọc & Modal A–I
│   ├── encyclopedia.js                 # Bách khoa toàn thư điện tử 7 Tập & Mục lục A–Z
│   ├── gallery.js                      # Thư viện ảnh 12 Album, Lightbox phóng to, phân biệt Ảnh AI/Thật
│   ├── plant-ai.js                     # Giao diện An Nhiên Plant AI & Khóa phân loại hình thái
│   ├── garden-diary.js                 # Nhật ký khu vườn 6 giai đoạn, Trước/Sau, Xuất/Nhập JSON
│   ├── speech.js                       # Đọc nội dung bằng giọng nói Tiếng Việt (Web Speech API)
│   └── print.js                        # Xuất/In PDF khổ A4 (Chế độ Nghệ thuật & Tiết kiệm mực)
├── data/
│   ├── plants.json                     # Cơ sở dữ liệu 100 hồ sơ thực vật Đà Lạt (7 nhóm)
│   ├── categories.json                 # Dữ liệu 7 nhóm thực vật & 7 tập Bách khoa
│   ├── calendar.json                   # Dữ liệu Lịch hoa Đà Lạt 12 tháng
│   ├── gallery.json                    # Dữ liệu 12 Album Thư viện ảnh
│   └── sources.json                    # Danh mục nguồn cơ sở dữ liệu khoa học quốc tế
├── assets/
│   └── images/
│       ├── author/
│       │   └── trinh-thi-an.jpg        # Ảnh chân dung chính thức của tác giả Trịnh Thị An
│       ├── hero/                       # 7 ảnh phong cảnh & hoa Đà Lạt cho Banner Hero
│       └── plants/                     # 100 bản vẽ tiêu bản thực vật học SVG (Herbarium Dalatense)
├── README.md                           # Tài liệu tổng quan & hướng dẫn chạy thử
├── HUONG_DAN_GITHUB_PAGES.md           # Hướng dẫn đưa website lên GitHub Pages từng bước
├── HUONG_DAN_QUAN_TRI_VA_THAY_ANH.md   # Hướng dẫn thay ảnh, thêm cây mới & bảo trì cho người không chuyên
└── KIEN_TRUC_TICH_HOP_PLANT_AI.md      # Kiến trúc tích hợp Pl@ntNet API qua Cloudflare Worker bảo mật
```

---

## III. CÁCH CHẠY THỬ WEBSITE TRÊN MÁY TÍNH

Website được thiết kế thông minh với cơ chế **kép**:
1. **Chạy qua máy chủ cục bộ (Khuyến nghị chuẩn kỹ thuật):**
   Vì website đọc dữ liệu từ các tệp `data/plants.json`, `data/categories.json` bằng lệnh `fetch()`, khi kiểm thử trên máy tính bạn có thể mở bằng:
   - **Cách 1 (Python):** Mở Terminal / Command Prompt tại thư mục `an-nhien-botanical` và chạy:
     ```bash
     python3 -m http.server 8080
     ```
     Sau đó mở trình duyệt tại địa chỉ: `http://localhost:8080`
   - **Cách 2 (VS Code):** Cài tiện ích **Live Server**, nhấp chuột phải vào `index.html` và chọn **"Open with Live Server"**.
2. **Mở trực tiếp `index.html`:**
   Nhờ tệp `js/data-bundle.js` được đóng gói đồng bộ cùng `data/*.json`, ngay cả khi bạn nhấp đúp trực tiếp vào `index.html` qua giao thức `file://`, toàn bộ 100 hồ sơ thực vật, công cụ tìm kiếm, sách điện tử và nhật ký vẫn hiển thị và hoạt động mượt mà.

---

## IV. THÔNG TIN LIÊN HỆ CHÍNH THỨC CỦA TÁC GIẢ

- **Tác giả & Người sáng lập:** TRỊNH THỊ AN
- **Thương hiệu:** AN NHIÊN AI (TTA)
- **Điện thoại / Zalo:** [0834 133 344](tel:0834133344) (`https://zalo.me/0834133344`)
- **Facebook:** [https://www.facebook.com/trinhthi.an.5](https://www.facebook.com/trinhthi.an.5)
- **YouTube Âm nhạc:** [An Nhiên AI Music (TTA)](https://youtube.com/@annhienaimusictta?si=5pXWSG77iLaLYkJh)
