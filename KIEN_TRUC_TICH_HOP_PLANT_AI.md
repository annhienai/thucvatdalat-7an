# 🤖 KIẾN TRÚC TÍCH HỢP NHẬN DIỆN THỰC VẬT BẰNG AI (PL@NTNET API & BACKEND PROXY)

Tài liệu này giải thích rõ kiến trúc kỹ thuật của chuyên mục **AN NHIÊN PLANT AI – BÁC SĨ KHU VƯỜN** và hướng dẫn kết nối dịch vụ nhận diện hình ảnh AI thực tế một cách an toàn khi triển khai trên **GitHub Pages**.

---

## 1. PHÂN ĐỊNH RÕ GIỮA WEBSITE TĨNH (GITHUB PAGES) VÀ DỊCH VỤ BACKEND AI

1. **Những gì hoạt động ngay lập tức trên GitHub Pages (Không cần máy chủ phụ):**
   - Giao diện chọn nhiều ảnh từ máy tính/điện thoại và chụp ảnh trực tiếp bằng Camera (`capture="environment"`).
   - Xem trước ảnh, phân loại bộ phận chụp (Hoa, Lá, Quả, Thân vỏ, Toàn cây).
   - **Khóa tra cứu hình thái thực vật Đà Lạt:** Đối chiếu màu sắc hoa, dạng sống và đặc điểm hình thái trực tiếp trên cơ sở dữ liệu `data/plants.json` (100 loài).
2. **Tại sao không nhúng trực tiếp API Key của Pl@ntNet vào file JavaScript trên GitHub Pages?**
   - Kho mã nguồn GitHub Pages là công khai. Nếu đặt `API_KEY` bí mật trong tệp `js/plant-ai.js`, bất kỳ ai mở trình duyệt đều có thể lấy khóa API của bạn, dẫn đến hết hạn mức (quota) hoặc khóa tài khoản.
   - Đồng thời, theo đúng tiêu chuẩn trung thực khoa học: khi chưa kết nối tới dịch vụ Computer Vision, website hiển thị rõ trạng thái **“Chưa kết nối dịch vụ nhận diện”** và **không bao giờ trả về kết quả nhận diện AI giả**.

---

## 2. HƯỚNG DẪN TÍCH HỢP PL@NTNET API MIỄN PHÍ QUA CLOUDFLARE WORKER (5 PHÚT)

Để bật tính năng nhận diện ảnh bằng AI thực tế từ **Pl@ntNet** mà vẫn bảo mật tuyệt đối khóa API, bạn chỉ cần tạo một **Cloudflare Worker** miễn phí làm cầu nối (Backend Proxy):

### Bước 1: Đăng ký khóa API miễn phí tại Pl@ntNet
1. Truy cập [https://my.plantnet.org/](https://my.plantnet.org/) và tạo tài khoản nhà phát triển miễn phí (hỗ trợ tới 500 lượt nhận diện/ngày).
2. Tạo một API Key mới trong mục **My API Keys**.

### Bước 2: Tạo Cloudflare Worker giữ khóa bí mật
1. Đăng nhập vào [https://dash.cloudflare.com/](https://dash.cloudflare.com/) ➔ mục **Workers & Pages** ➔ **Create Worker**.
2. Trong mục **Settings ➔ Variables and Secrets**, thêm biến môi trường dạng Secret:
   - Tên biến: `PLANTNET_API_KEY`
   - Giá trị: Khóa API bạn vừa nhận từ Pl@ntNet.
3. Dán đoạn mã chuẩn sau vào Worker và bấm **Deploy**:

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const formData = await request.formData();
      const apiUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${env.PLANTNET_API_KEY}&lang=vi`;
      const resp = await fetch(apiUrl, {
        method: "POST",
        body: formData
      });
      const result = await resp.json();
      return new Response(JSON.stringify(result), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
```

### Bước 3: Dán đường dẫn Worker vào Website An Nhiên
- Sao chép địa chỉ Worker của bạn (ví dụ: `https://annhien-plant-ai.yourname.workers.dev`) và dán vào ô **“Cấu hình URL Backend Proxy”** trong mục **An Nhiên Plant AI** trên website.
- Trạng thái sẽ lập tức chuyển sang **“🟢 Đã cấu hình Backend Proxy nhận diện”**.
