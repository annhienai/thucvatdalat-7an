/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/garden-diary.js – NHẬT KÝ KHU VƯỜN – AN NHIÊN GARDEN DIARY (Phần XV)
 * Chức năng:
 * - Tạo hồ sơ riêng cho từng chậu cây (Tên cây, Loài/giống, Ngày trồng, Vị trí, Chậu & giá thể, Ảnh ban đầu, Ghi chú).
 * - Dòng thời gian 6 giai đoạn: Ngày trồng → Ra lá → Phát triển → Ra nụ → Nở hoa → Chăm sóc sau hoa.
 * - Tải ảnh thật của người dùng vào từng mốc thời gian, so sánh ảnh Trước / Sau, và trình chiếu chuỗi ảnh (Slideshow / Timelapse từ ảnh thực tế người dùng tải lên, không mô phỏng giả).
 * - Lịch ghi chú chăm sóc: Tưới nước, Bón phân, Thay chậu, Cắt tỉa, Kiểm tra sâu bệnh, Ngày ra hoa.
 * - Lưu thử bằng LocalStorage (bọc try/catch an toàn), kèm Xuất / Nhập file JSON sao lưu dài hạn.
 */

const STORAGE_KEY_DIARY = "an_nhien_garden_diary_v1";

window.AnNhienGardenDiary = {
  stages: [
    { key: "planted", label: "1. Ngày trồng" },
    { key: "leafing", label: "2. Ra lá" },
    { key: "growing", label: "3. Phát triển" },
    { key: "budding", label: "4. Ra nụ" },
    { key: "blooming", label: "5. Nở hoa" },
    { key: "postbloom", label: "6. Sau hoa" }
  ],
  state: {
    pots: [],
    selectedPotId: null,
    activeStageKey: "planted",
    timelapseTimer: null,
    timelapseIndex: 0
  },

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.renderPotList();
    this.renderActivePotDetail();
  },

  getDefaultPots() {
    return [
      {
        id: "pot-cam-cu-01",
        name: "Chậu Cẩm Cù Trái Tim hiên nhà gỗ",
        species: "Hoya carnosa / Cẩm cù Đà Lạt",
        plantedDate: "2026-03-15",
        location: "Ban công hướng Đông đón nắng sớm",
        substrate: "Chậu đất nung 22cm – Giá thể vỏ thông + đá bọt + phân trùn quế",
        status: "Đang nhú nụ hoa chùm",
        notes: "Hồ sơ mẫu minh họa cấu trúc Nhật ký khu vườn An Nhiên. Bạn có thể chỉnh sửa, tải ảnh chụp thực tế của mình lên từng giai đoạn hoặc thêm chậu cây mới.",
        stagePhotos: {
          planted: "assets/images/plants/hoa-cam-cu.svg",
          leafing: "assets/images/plants/hoa-cam-cu.svg",
          growing: "assets/images/plants/hoa-cam-cu.svg",
          budding: "assets/images/hero/hoa-lan-dalat.jpg",
          blooming: "",
          postbloom: ""
        },
        careLogs: [
          { date: "2026-03-15", action: "Thay chậu", note: "Sang chậu đất nung thoáng rễ, trộn vỏ thông xử lý sạch." },
          { date: "2026-05-01", action: "Bón phân", note: "Bón phân hữu cơ tan chậm và phun dịch chuối loãng." },
          { date: "2026-09-20", action: "Kiểm tra sâu bệnh", note: "Bộ lá dày bóng khỏe, xuất hiện cuống nụ đầu tiên." }
        ]
      },
      {
        id: "pot-dia-lan-02",
        name: "Chậu Địa Lan Hoàng Vũ góc sân sương",
        species: "Cymbidium sinense / Địa lan Đà Lạt",
        plantedDate: "2026-01-10",
        location: "Dưới giàn lưới 50% nắng sáng",
        substrate: "Chậu sứ cao – Vỏ thông + dớn cọng + đá Pumice",
        status: "Phát triển giả hành mới khỏe mạnh",
        notes: "Theo dõi chu kỳ sinh trưởng chuẩn bị cho mùa hoa Tết.",
        stagePhotos: {
          planted: "assets/images/plants/lan-kiem-dia-lan.svg",
          leafing: "assets/images/hero/hoa-lan-dalat.jpg",
          growing: "",
          budding: "",
          blooming: "",
          postbloom: ""
        },
        careLogs: [
          { date: "2026-01-10", action: "Tưới nước", note: "Tưới nước mưa/nước lọc buổi sáng 8h00 khi sương tan." },
          { date: "2026-06-12", action: "Cắt tỉa", note: "Vệ sinh bẹ khô quanh gốc giả hành giúp thông thoáng." }
        ]
      }
    ];
  },

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DIARY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          this.state.pots = parsed;
          this.state.selectedPotId = parsed[0].id;
          return;
        }
      }
    } catch (e) {}
    this.state.pots = this.getDefaultPots();
    this.state.selectedPotId = this.state.pots[0].id;
  },

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_DIARY, JSON.stringify(this.state.pots));
    } catch (e) {
      window.showToast("Lưu ý: Bộ nhớ trình duyệt đã đầy hoặc bị giới hạn. Hãy dùng nút Xuất JSON để sao lưu về máy.");
    }
  },

  bindEvents() {
    const newPotForm = document.getElementById("diary-new-pot-form");
    if (newPotForm) {
      newPotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("diary-pot-name")?.value.trim();
        const species = document.getElementById("diary-pot-species")?.value.trim() || "Chưa rõ giống";
        const date = document.getElementById("diary-pot-date")?.value || new Date().toISOString().slice(0, 10);
        const loc = document.getElementById("diary-pot-location")?.value.trim() || "Sân vườn";
        const sub = document.getElementById("diary-pot-substrate")?.value.trim() || "Đất hữu cơ tơi xốp";
        const notes = document.getElementById("diary-pot-notes")?.value.trim() || "";

        if (!name) {
          window.showToast("Vui lòng nhập tên chậu cây để tạo hồ sơ nhật ký.");
          return;
        }

        const newPot = {
          id: "pot-" + Date.now(),
          name,
          species,
          plantedDate: date,
          location: loc,
          substrate: sub,
          status: "Mới bắt đầu trồng",
          notes,
          stagePhotos: {
            planted: "assets/images/plants/phuong-tim.svg",
            leafing: "",
            growing: "",
            budding: "",
            blooming: "",
            postbloom: ""
          },
          careLogs: [
            { date, action: "Ngày trồng", note: "Khởi tạo hồ sơ chậu cây trong Nhật ký An Nhiên." }
          ]
        };

        this.state.pots.unshift(newPot);
        this.state.selectedPotId = newPot.id;
        this.saveToStorage();
        this.renderPotList();
        this.renderActivePotDetail();
        newPotForm.reset();
        window.showToast(`Đã tạo hồ sơ nhật ký cho "${name}".`);
      });
    }

    // Xuất JSON nhật ký
    document.getElementById("diary-export-json-btn")?.addEventListener("click", () => {
      const dataStr = JSON.stringify(this.state.pots, null, 2);
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nhat-ky-khu-vuon-an-nhien-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      window.showToast("Đã xuất tệp JSON sao lưu Nhật ký khu vườn.");
    });

    // Nhập JSON nhật ký
    const importInput = document.getElementById("diary-import-json-input");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const parsed = JSON.parse(ev.target.result);
            if (!Array.isArray(parsed)) throw new Error("Định dạng file không phải mảng hồ sơ nhật ký.");
            this.state.pots = parsed;
            this.state.selectedPotId = parsed[0]?.id || null;
            this.saveToStorage();
            this.renderPotList();
            this.renderActivePotDetail();
            window.showToast(`Đã khôi phục thành công ${parsed.length} hồ sơ chậu cây!`);
          } catch (err) {
            window.showToast("Lỗi khi đọc tệp JSON: " + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  },

  renderPotList() {
    const listWrap = document.getElementById("diary-pot-list");
    if (!listWrap) return;

    if (!this.state.pots.length) {
      listWrap.innerHTML = `<p style="color:var(--muted-text);">Chưa có chậu cây nào trong nhật ký. Hãy thêm chậu cây đầu tiên ở biểu mẫu bên dưới.</p>`;
      return;
    }

    listWrap.innerHTML = this.state.pots.map(pot => {
      const active = pot.id === this.state.selectedPotId;
      return `
        <div class="kv-item" style="cursor:pointer; margin-bottom:0.65rem; border-color:${active ? "var(--pine-green)" : "var(--border-subtle)"}; background:${active ? "var(--leaf-light)" : "var(--ivory-white)"};" data-select-pot="${pot.id}">
          <div style="display:flex; justify-content:space-between; align-items:start; gap:0.5rem;">
            <strong>🌱 ${pot.name}</strong>
            <button type="button" class="btn btn-outline-pine" style="padding:0.15rem 0.5rem; font-size:0.75rem;" data-delete-pot="${pot.id}" title="Xóa chậu cây này">Xóa</button>
          </div>
          <div style="font-size:0.84rem; color:var(--earth-brown); font-style:italic;">${pot.species}</div>
          <div style="font-size:0.8rem; color:var(--muted-text);">Ngày trồng: ${pot.plantedDate} • ${pot.location}</div>
        </div>
      `;
    }).join("");

    listWrap.querySelectorAll("[data-select-pot]").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-delete-pot]")) return;
        this.state.selectedPotId = el.getAttribute("data-select-pot");
        this.renderPotList();
        this.renderActivePotDetail();
      });
    });

    listWrap.querySelectorAll("[data-delete-pot]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-delete-pot");
        this.state.pots = this.state.pots.filter(p => p.id !== id);
        if (this.state.selectedPotId === id) {
          this.state.selectedPotId = this.state.pots[0]?.id || null;
        }
        this.saveToStorage();
        this.renderPotList();
        this.renderActivePotDetail();
        window.showToast("Đã xóa chậu cây khỏi nhật ký trình duyệt.");
      });
    });
  },

  renderActivePotDetail() {
    const detailWrap = document.getElementById("diary-active-pot-detail");
    if (!detailWrap) return;

    const pot = this.state.pots.find(p => p.id === this.state.selectedPotId);
    if (!pot) {
      detailWrap.innerHTML = `<div class="profile-section-card">Hãy chọn hoặc tạo mới một chậu cây để xem dòng thời gian phát triển.</div>`;
      return;
    }

    const availablePhotos = this.stages
      .map(s => ({ stage: s.label, url: pot.stagePhotos?.[s.key] }))
      .filter(x => Boolean(x.url));

    const firstPhoto = availablePhotos[0]?.url || "assets/images/plants/hoa-cam-cu.svg";
    const latestPhoto = availablePhotos[availablePhotos.length - 1]?.url || firstPhoto;

    detailWrap.innerHTML = `
      <div class="profile-section-card" style="background:var(--ivory-white); border:2px solid var(--sun-gold);">
        <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <span class="section-eyebrow">HỒ SƠ THEO DÕI CHẬU CÂY</span>
            <h3 style="margin:0.2rem 0;">${pot.name}</h3>
            <p style="margin:0; font-style:italic; color:var(--earth-brown);">${pot.species} • Bắt đầu trồng: <strong>${pot.plantedDate}</strong></p>
          </div>
          <span class="badge-pill badge-verified">${pot.status}</span>
        </div>

        <div class="profile-grid-2" style="margin-top:1rem;">
          <div class="kv-item"><span class="kv-label">Vị trí đặt cây</span><span class="kv-value">${pot.location}</span></div>
          <div class="kv-item"><span class="kv-label">Chậu & Giá thể</span><span class="kv-value">${pot.substrate}</span></div>
        </div>
        <p style="margin:0.85rem 0 0; font-size:0.92rem;"><strong>Ghi chú:</strong> ${pot.notes}</p>

        <!-- Dòng thời gian 6 giai đoạn -->
        <h4 style="margin:1.5rem 0 0.5rem;">⏳ Dòng thời gian 6 giai đoạn sinh trưởng (Bấm vào từng mốc để xem hoặc tải ảnh lên):</h4>
        <div class="diary-timeline-bar">
          ${this.stages.map(st => {
            const hasImg = Boolean(pot.stagePhotos?.[st.key]);
            const isActive = this.state.activeStageKey === st.key;
            return `
              <button type="button" class="stage-step ${hasImg ? "completed" : ""} ${isActive ? "active" : ""}" data-stage-key="${st.key}">
                ${st.label}<br>
                <small>${hasImg ? "📸 Có ảnh" : "Chưa có ảnh"}</small>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Khung tải ảnh cho mốc đang chọn -->
        <div class="kv-item" style="margin-bottom:1.25rem; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
          <div>
            <strong>Mốc đang chọn: ${this.stages.find(s => s.key === this.state.activeStageKey)?.label}</strong><br>
            <small style="color:var(--muted-text);">Tải ảnh chụp thực tế của cây ở giai đoạn này để lưu vào dòng thời gian.</small>
          </div>
          <label class="btn btn-Pine" style="padding:0.45rem 0.95rem; font-size:0.86rem;">
            📷 Tải ảnh lên mốc này
            <input type="file" accept="image/*" id="diary-stage-photo-input" style="display:none;">
          </label>
        </div>

        <!-- So sánh ảnh Trước / Sau & Trình chiếu chuỗi ảnh thực tế -->
        <h4 style="margin:1.25rem 0 0.5rem;">🔄 So sánh ảnh Trước / Sau & Trình chiếu chuỗi ảnh đã chụp (${availablePhotos.length} mốc có ảnh):</h4>
        <div class="before-after-grid">
          <div class="kv-item" style="text-align:center;">
            <span class="kv-label">Ảnh giai đoạn đầu (${availablePhotos[0]?.stage || "Ngày trồng"})</span>
            <img src="${firstPhoto}" alt="Ảnh trước" style="width:100%; height:210px; object-fit:cover; border-radius:8px; margin-top:0.5rem;">
          </div>
          <div class="kv-item" style="text-align:center;">
            <span class="kv-label" id="diary-slideshow-label">Ảnh giai đoạn mới nhất (${availablePhotos[availablePhotos.length - 1]?.stage || "Hiện tại"})</span>
            <img src="${latestPhoto}" id="diary-slideshow-img" alt="Ảnh sau" style="width:100%; height:210px; object-fit:cover; border-radius:8px; margin-top:0.5rem;">
          </div>
        </div>
        <div style="margin-top:0.75rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
          <button type="button" class="btn btn-outline-pine" style="padding:0.45rem 0.95rem; font-size:0.86rem;" id="diary-play-timelapse-btn">
            ▶ Phát chuỗi ảnh tua nhanh (Timelapse từ ảnh đã chụp)
          </button>
          <span style="font-size:0.82rem; color:var(--muted-text);">
            * Chỉ ghép trình chiếu từ các bức ảnh thật do bạn tải lên ở các mốc thời gian, không tự tạo mô phỏng giả.
          </span>
        </div>

        <!-- Lịch sử chăm sóc (Tưới nước, Bón phân, Thay chậu, Cắt tỉa, Kiểm tra sâu bệnh, Ngày ra hoa) -->
        <h4 style="margin:1.75rem 0 0.65rem;">📋 Nhật ký lịch sử chăm sóc chậu cây:</h4>
        <form id="diary-add-log-form" style="display:grid; grid-template-columns: 150px 180px 1fr auto; gap:0.5rem; margin-bottom:1rem;">
          <input type="date" id="diary-log-date" value="${new Date().toISOString().slice(0, 10)}" required style="padding:0.5rem; border:1px solid var(--leaf-green); border-radius:6px;">
          <select id="diary-log-action" style="padding:0.5rem; border:1px solid var(--leaf-green); border-radius:6px;">
            <option value="Tưới nước">💧 Tưới nước</option>
            <option value="Bón phân">🌿 Bón phân</option>
            <option value="Thay chậu">🪴 Thay chậu</option>
            <option value="Cắt tỉa">✂️ Cắt tỉa</option>
            <option value="Kiểm tra sâu bệnh">🔎 Kiểm tra sâu bệnh</option>
            <option value="Ngày ra hoa">🌸 Ngày ra hoa</option>
          </select>
          <input type="text" id="diary-log-note" placeholder="Nhập ghi chú quan sát thực tế..." required style="padding:0.5rem; border:1px solid var(--leaf-green); border-radius:6px;">
          <button type="button" class="btn btn-Pine" id="diary-add-log-submit" style="padding:0.5rem 0.95rem;">+ Lưu mục</button>
        </form>

        <div style="display:grid; gap:0.5rem;">
          ${(pot.careLogs || []).map(log => `
            <div class="kv-item" style="display:flex; justify-content:space-between; gap:1rem; align-items:center;">
              <div>
                <strong>${log.date} • [${log.action}]</strong>: ${log.note}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Gắn sự kiện chọn mốc thời gian
    detailWrap.querySelectorAll("[data-stage-key]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.activeStageKey = btn.getAttribute("data-stage-key");
        this.renderActivePotDetail();
      });
    });

    // Tải ảnh vào mốc thời gian
    const stagePhotoInput = document.getElementById("diary-stage-photo-input");
    if (stagePhotoInput) {
      stagePhotoInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          pot.stagePhotos = pot.stagePhotos || {};
          pot.stagePhotos[this.state.activeStageKey] = ev.target.result;
          this.saveToStorage();
          this.renderActivePotDetail();
          window.showToast("Đã cập nhật ảnh vào mốc thời gian của chậu cây.");
        };
        reader.readAsDataURL(file);
      });
    }

    // Nút phát chuỗi ảnh Timelapse
    const playBtn = document.getElementById("diary-play-timelapse-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (availablePhotos.length < 2) {
          window.showToast("Hãy tải ảnh lên ít nhất 2 mốc thời gian để xem trình chiếu chuỗi ảnh phát triển.");
          return;
        }
        const imgEl = document.getElementById("diary-slideshow-img");
        const lblEl = document.getElementById("diary-slideshow-label");
        let idx = 0;
        if (this.state.timelapseTimer) clearInterval(this.state.timelapseTimer);
        this.state.timelapseTimer = setInterval(() => {
          const item = availablePhotos[idx];
          if (imgEl && item) imgEl.src = item.url;
          if (lblEl && item) lblEl.textContent = `Đang trình chiếu: ${item.stage} (${idx + 1}/${availablePhotos.length})`;
          idx++;
          if (idx >= availablePhotos.length) {
            clearInterval(this.state.timelapseTimer);
            this.state.timelapseTimer = null;
          }
        }, 1100);
      });
    }

    // Thêm ghi chú chăm sóc
    const addLogBtn = document.getElementById("diary-add-log-submit");
    if (addLogBtn) {
      addLogBtn.addEventListener("click", () => {
        const d = document.getElementById("diary-log-date")?.value || new Date().toISOString().slice(0, 10);
        const act = document.getElementById("diary-log-action")?.value || "Tưới nước";
        const note = document.getElementById("diary-log-note")?.value.trim();
        if (!note) {
          window.showToast("Vui lòng nhập nội dung ghi chú chăm sóc.");
          return;
        }
        pot.careLogs = pot.careLogs || [];
        pot.careLogs.unshift({ date: d, action: act, note });
        if (act === "Ngày ra hoa") pot.status = "Đang nở hoa rực rỡ";
        this.saveToStorage();
        this.renderActivePotDetail();
        window.showToast("Đã thêm lịch sử chăm sóc mới.");
      });
    }
  }
};
