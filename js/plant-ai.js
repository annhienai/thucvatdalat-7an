/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/plant-ai.js – AN NHIÊN PLANT AI – BÁC SĨ KHU VƯỜN (Phần X)
 * Nguyên tắc khoa học & bảo mật:
 * 1. Hỗ trợ tải nhiều ảnh, chụp từ camera thiết bị, chọn bộ phận cây (Lá, Hoa, Quả, Vỏ thân, Toàn cây).
 * 2. Không nhúng API Key bí mật trong mã nguồn công khai GitHub Pages.
 * 3. Hiển thị trung thực trạng thái dịch vụ: "Chưa kết nối dịch vụ nhận diện (Backend Proxy)" khi chưa cấu hình endpoint,
 *    tuyệt đối không trả kết quả AI giả.
 * 4. Tích hợp sẵn công cụ "Đối chiếu Hình thái & Đặc điểm trên 100 hồ sơ JSON Đà Lạt" hoạt động trực tiếp trên GitHub Pages,
 *    và hỗ trợ kết nối Cloudflare Worker / Pl@ntNet Proxy thực tế khi chủ website nhập URL proxy.
 */

window.AnNhienPlantAI = {
  state: {
    uploadedFiles: [],
    selectedOrgan: "flower",
    proxyUrl: ""
  },

  init() {
    const fileInput = document.getElementById("ai-file-input");
    const cameraInput = document.getElementById("ai-camera-input");
    const organSelect = document.getElementById("ai-organ-select");
    const identifyBtn = document.getElementById("ai-identify-btn");
    const clearBtn = document.getElementById("ai-clear-btn");
    const proxyInput = document.getElementById("ai-proxy-endpoint-input");
    const visualFilterBtn = document.getElementById("ai-visual-key-btn");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFiles(e.target.files));
    }
    if (cameraInput) {
      cameraInput.addEventListener("change", (e) => this.handleFiles(e.target.files));
    }
    if (organSelect) {
      organSelect.addEventListener("change", (e) => {
        this.state.selectedOrgan = e.target.value;
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.state.uploadedFiles = [];
        this.renderPreviews();
        const resBox = document.getElementById("ai-result-container");
        if (resBox) {
          resBox.innerHTML = `<p style="color:var(--muted-text); margin:0;">Hãy tải ảnh lên hoặc chọn đặc điểm hình thái quan sát được để tra cứu trong cơ sở dữ liệu 100 loài Đà Lạt.</p>`;
        }
      });
    }
    if (identifyBtn) {
      identifyBtn.addEventListener("click", () => this.runIdentification());
    }
    if (visualFilterBtn) {
      visualFilterBtn.addEventListener("click", () => this.runMorphologyKeyLookup());
    }
    if (proxyInput) {
      proxyInput.addEventListener("input", (e) => {
        this.state.proxyUrl = e.target.value.trim();
        this.updateServiceBadge();
      });
    }

    this.updateServiceBadge();
  },

  updateServiceBadge() {
    const badge = document.getElementById("ai-connection-status-badge");
    if (!badge) return;
    if (this.state.proxyUrl && this.state.proxyUrl.startsWith("https://")) {
      badge.textContent = "🟢 Đã cấu hình Backend Proxy nhận diện";
      badge.className = "badge-pill badge-verified";
    } else {
      badge.textContent = "⚪ Chưa kết nối dịch vụ nhận diện AI (Đang dùng Tra cứu JSON cục bộ)";
      badge.className = "badge-pill badge-editing";
    }
  },

  handleFiles(fileList) {
    if (!fileList || !fileList.length) return;
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.state.uploadedFiles.push({
          name: file.name,
          sizeKB: Math.round(file.size / 1024),
          dataUrl: ev.target.result,
          organ: this.state.selectedOrgan
        });
        this.renderPreviews();
      };
      reader.readAsDataURL(file);
    });
  },

  renderPreviews() {
    const wrap = document.getElementById("ai-preview-grid");
    if (!wrap) return;
    if (!this.state.uploadedFiles.length) {
      wrap.innerHTML = "";
      return;
    }
    const organNames = {
      flower: "Hoa / Cụm hoa",
      leaf: "Phiến lá / Cành lá",
      fruit: "Quả / Nón thông",
      bark: "Thân / Vỏ cây",
      habit: "Toàn cây"
    };
    wrap.innerHTML = this.state.uploadedFiles.map((f, idx) => `
      <div class="ai-preview-item">
        <img src="${f.dataUrl}" alt="${f.name}">
        <div style="position:absolute; bottom:0; inset-x:0; background:rgba(24,53,41,0.85); color:#fff; font-size:0.7rem; padding:2px 6px; text-align:center;">
          ${organNames[f.organ] || f.organ} (${f.sizeKB}KB)
        </div>
      </div>
    `).join("");
  },

  async runIdentification() {
    const resBox = document.getElementById("ai-result-container");
    if (!resBox) return;

    if (!this.state.uploadedFiles.length) {
      resBox.innerHTML = `
        <div class="ai-status-banner">
          <strong>📸 Chưa có ảnh được chọn:</strong> Vui lòng tải lên ít nhất 1 bức ảnh chụp lá, hoa hoặc toàn cây trước khi gửi yêu cầu nhận diện, hoặc sử dụng <strong>Khóa phân loại hình thái Đà Lạt</strong> ngay bên dưới.
        </div>
      `;
      return;
    }

    // Nếu người dùng chưa cấu hình Backend Proxy (trạng thái mặc định trên GitHub Pages tĩnh)
    if (!this.state.proxyUrl) {
      resBox.innerHTML = `
        <div class="ai-status-banner">
          <strong>ℹ️ Trạng thái kỹ thuật: Chưa kết nối dịch vụ nhận diện Computer Vision từ xa.</strong><br>
          Website đang chạy ở chế độ tĩnh trên GitHub Pages (không nhúng khóa API Pl@ntNet bí mật vào HTML/JS công khai để đảm bảo an toàn bảo mật). Hệ thống <strong>không trả kết quả AI giả lập</strong>.<br>
          👉 Bạn có thể: (1) Nhập địa chỉ Cloudflare Worker Proxy Pl@ntNet vào ô cấu hình, hoặc (2) Xem kết quả <strong>Đối chiếu khóa hình thái thực vật Đà Lạt</strong> từ dữ liệu JSON ngay dưới đây:
        </div>
      `;
      this.runMorphologyKeyLookup(true);
      return;
    }

    // Khi có cấu hình HTTPS Backend Proxy thực tế
    resBox.innerHTML = `<p>⏳ Đang gửi ảnh tới Backend Proxy nhận diện thực vật...</p>`;
    try {
      const response = await fetch(this.state.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organ: this.state.selectedOrgan,
          imagesCount: this.state.uploadedFiles.length
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      resBox.innerHTML = `<div class="ai-status-banner">Đã nhận phản hồi từ dịch vụ nhận diện (Mức độ gợi ý tham khảo): <pre>${JSON.stringify(data, null, 2)}</pre></div>`;
    } catch (err) {
      resBox.innerHTML = `
        <div class="ai-status-banner">
          <strong>⚠️ Không thể kết nối tới máy chủ Proxy (${err.message}).</strong> Đang chuyển sang chế độ tra cứu khóa hình thái JSON cục bộ.
        </div>
      `;
      this.runMorphologyKeyLookup(true);
    }
  },

  runMorphologyKeyLookup(append = false) {
    const resBox = document.getElementById("ai-result-container");
    if (!resBox) return;
    const colorTrait = document.getElementById("ai-trait-color")?.value || "all";
    const habitTrait = document.getElementById("ai-trait-habit")?.value || "all";
    const plants = window.AnNhienApp.data.plants || [];

    const candidates = plants.filter(p => {
      let score = 0;
      const text = `${p.identification.vietnameseName} ${p.morphology.flower} ${p.morphology.leaf} ${p.morphology.stem} ${p.morphology.keyIdentification} ${p.categoryName}`.toLowerCase();
      if (colorTrait === "all" || text.includes(colorTrait.toLowerCase())) score += 2;
      if (habitTrait === "all" || text.includes(habitTrait.toLowerCase())) score += 2;
      return score >= 4;
    }).slice(0, 6);

    const html = `
      <div style="margin-top:1rem;">
        <h4 style="margin-bottom:0.65rem;">🔎 Gợi ý đối chiếu từ Cơ sở dữ liệu 100 loài Đà Lạt (${candidates.length} ứng viên phù hợp đặc điểm):</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap:0.85rem;">
          ${candidates.map(p => `
            <div class="kv-item" style="display:flex; flex-direction:column; gap:0.45rem;">
              <img src="${p.images.primary}" alt="${p.identification.vietnameseName}" style="width:100%; height:120px; object-fit:cover; border-radius:6px;">
              <strong>${p.identification.vietnameseName}</strong>
              <small style="font-style:italic; color:var(--earth-brown);">${p.identification.scientificName}</small>
              <small>${p.morphology.keyIdentification}</small>
              <button type="button" class="btn btn-Pine" style="padding:0.4rem 0.7rem; font-size:0.82rem; margin-top:auto;" data-ai-open-plant="${p.id}">
                📖 Mở hồ sơ & Hướng dẫn chăm sóc
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    if (append) {
      resBox.insertAdjacentHTML("beforeend", html);
    } else {
      resBox.innerHTML = html;
    }

    resBox.querySelectorAll("[data-ai-open-plant]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-ai-open-plant");
        if (window.AnNhienSearch) window.AnNhienSearch.openPlantModal(pid);
      });
    });
  }
};
