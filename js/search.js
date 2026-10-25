/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/search.js – Công cụ tra cứu thực vật thông minh (hỗ trợ tiếng Việt có dấu & không dấu),
 * bộ lọc 5 chiều, hiển thị lưới 100 hồ sơ thực vật và mở Modal Hồ sơ Khoa học 9 mục (A–I).
 */

function normalizeVietnamese(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

window.AnNhienSearch = {
  state: {
    query: "",
    category: "all",
    season: "all",
    light: "all",
    water: "all",
    status: "all",
    pageSize: 12,
    visibleCount: 12,
    currentModalPlantId: null
  },

  init() {
    this.renderCategoryTabs();
    this.bindEvents();
    this.applyFilters();
  },

  renderCategoryTabs() {
    const cats = window.AnNhienApp.data.categories || [];
    const plants = window.AnNhienApp.data.plants || [];
    const wrap = document.getElementById("category-tabs-container");
    if (!wrap) return;

    const allBtn = `
      <button type="button" class="category-tab-btn ${this.state.category === "all" ? "active" : ""}" data-cat-id="all">
        <div style="font-size:1.35rem;">🌿</div>
        <div style="font-weight:700; margin-top:0.2rem;">Tất cả thực vật</div>
        <span class="cat-count-badge">${plants.length} hồ sơ</span>
      </button>
    `;

    const catBtns = cats.map(c => {
      const count = plants.filter(p => p.categoryId === c.id).length;
      const active = this.state.category === c.id ? "active" : "";
      return `
        <button type="button" class="category-tab-btn ${active}" data-cat-id="${c.id}">
          <div style="font-size:1.35rem;">${c.icon}</div>
          <div style="font-weight:700; margin-top:0.2rem;">${c.name}</div>
          <span class="cat-count-badge">${count} hồ sơ</span>
        </button>
      `;
    }).join("");

    wrap.innerHTML = allBtn + catBtns;

    wrap.querySelectorAll("[data-cat-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectCategory(btn.getAttribute("data-cat-id"));
      });
    });
  },

  selectCategory(catId) {
    this.state.category = catId;
    this.state.visibleCount = 20;
    const catSelect = document.getElementById("filter-category-select");
    if (catSelect) catSelect.value = catId;
    this.renderCategoryTabs();
    this.applyFilters();
  },

  bindEvents() {
    const grandInput = document.getElementById("grand-search-input");
    const grandBtn = document.getElementById("grand-search-btn");
    const filterSearchInput = document.getElementById("filter-keyword-input");
    const catSelect = document.getElementById("filter-category-select");
    const seasonSelect = document.getElementById("filter-season-select");
    const lightSelect = document.getElementById("filter-light-select");
    const waterSelect = document.getElementById("filter-water-select");
    const statusSelect = document.getElementById("filter-status-select");
    const resetBtn = document.getElementById("filter-reset-btn");
    const showAllBtn = document.getElementById("btn-show-all-100");
    const loadMoreBtn = document.getElementById("btn-load-more-plants");

    const syncQuery = (val, shouldScroll = false) => {
      this.state.query = val;
      if (grandInput && grandInput.value !== val) grandInput.value = val;
      if (filterSearchInput && filterSearchInput.value !== val) filterSearchInput.value = val;
      this.state.visibleCount = 24;
      this.applyFilters();
      if (shouldScroll) {
        const sec = document.getElementById("kham-pha-thuc-vat");
        if (sec) sec.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (grandInput) {
      grandInput.addEventListener("input", (e) => syncQuery(e.target.value, false));
      grandInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          syncQuery(grandInput.value, true);
        }
      });
    }

    if (grandBtn && grandInput) {
      grandBtn.addEventListener("click", () => syncQuery(grandInput.value, true));
    }

    if (filterSearchInput) {
      filterSearchInput.addEventListener("input", (e) => syncQuery(e.target.value, false));
    }

    // Các gợi ý tìm kiếm nhanh dưới banner (có dấu & không dấu)
    document.querySelectorAll("[data-quick-query]").forEach(chip => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-quick-query") || "";
        syncQuery(q, true);
      });
    });

    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.state.category = e.target.value;
        this.renderCategoryTabs();
        this.applyFilters();
      });
    }
    if (seasonSelect) {
      seasonSelect.addEventListener("change", (e) => {
        this.state.season = e.target.value;
        this.applyFilters();
      });
    }
    if (lightSelect) {
      lightSelect.addEventListener("change", (e) => {
        this.state.light = e.target.value;
        this.applyFilters();
      });
    }
    if (waterSelect) {
      waterSelect.addEventListener("change", (e) => {
        this.state.water = e.target.value;
        this.applyFilters();
      });
    }
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        this.state.status = e.target.value;
        this.applyFilters();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.state.query = "";
        this.state.category = "all";
        this.state.season = "all";
        this.state.light = "all";
        this.state.water = "all";
        this.state.status = "all";
        this.state.visibleCount = 12;
        if (grandInput) grandInput.value = "";
        if (filterSearchInput) filterSearchInput.value = "";
        if (catSelect) catSelect.value = "all";
        if (seasonSelect) seasonSelect.value = "all";
        if (lightSelect) lightSelect.value = "all";
        if (waterSelect) waterSelect.value = "all";
        if (statusSelect) statusSelect.value = "all";
        this.renderCategoryTabs();
        this.applyFilters();
      });
    }

    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        this.state.visibleCount = 100;
        this.applyFilters();
        window.showToast("Đang hiển thị toàn bộ danh sách hồ sơ thực vật khớp bộ lọc.");
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        this.state.visibleCount += 16;
        this.applyFilters();
      });
    }

    // Đóng modal hồ sơ
    const closeBtn = document.getElementById("modal-close-btn");
    const backdrop = document.getElementById("plant-profile-modal");
    if (closeBtn && backdrop) {
      closeBtn.addEventListener("click", () => this.closePlantModal());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closePlantModal();
      });
    }
  },

  getFilteredPlants() {
    const plants = window.AnNhienApp.data.plants || [];
    const qNorm = normalizeVietnamese(this.state.query);

    return plants.filter(p => {
      if (this.state.category !== "all" && p.categoryId !== this.state.category) return false;
      if (this.state.status !== "all" && p.references.status !== this.state.status) return false;

      if (this.state.season !== "all") {
        const sNorm = normalizeVietnamese(p.biology.bloomSeason);
        if (!sNorm.includes(normalizeVietnamese(this.state.season)) && !sNorm.includes("quanh nam")) {
          return false;
        }
      }

      if (this.state.light !== "all") {
        const lNorm = normalizeVietnamese(p.biology.light);
        if (!lNorm.includes(normalizeVietnamese(this.state.light))) return false;
      }

      if (this.state.water !== "all") {
        const wNorm = normalizeVietnamese(p.biology.water);
        if (!wNorm.includes(normalizeVietnamese(this.state.water))) return false;
      }

      if (qNorm) {
        const hay = p.searchIndex || normalizeVietnamese(
          `${p.identification.vietnameseName} ${p.identification.scientificName} ${p.identification.localName} ${p.identification.family}`
        );
        return hay.includes(qNorm);
      }

      return true;
    });
  },

  applyFilters() {
    const filtered = this.getFilteredPlants();
    const grid = document.getElementById("plants-grid-container");
    const countLabel = document.getElementById("plants-result-summary");
    const loadMoreWrap = document.getElementById("plants-load-more-wrap");

    if (!grid) return;

    if (countLabel) {
      countLabel.innerHTML = `Tìm thấy <strong>${filtered.length}</strong> / 100 hồ sơ thực vật Đà Lạt (đang hiển thị <strong>${Math.min(filtered.length, this.state.visibleCount)}</strong> hồ sơ).`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="profile-section-card" style="grid-column: 1 / -1; text-align:center; padding: 2.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">🌱</div>
          <h3>Chưa tìm thấy hồ sơ thực vật trùng khớp với từ khóa của bạn</h3>
          <p style="color:var(--muted-text); max-width:580px; margin:0.5rem auto 1.25rem;">
            Bạn có thể thử tìm bằng tên không dấu (ví dụ: <em>"Cam tu cau"</em>, <em>"Phuong tim"</em>, <em>"Lan ho diep"</em>), tên khoa học (<em>"Pinus"</em>, <em>"Jacaranda"</em>) hoặc bấm đặt lại bộ lọc để xem toàn bộ 100 loài.
          </p>
          <button type="button" class="btn btn-Pine" id="empty-reset-btn">Xem lại toàn bộ 100 loài</button>
        </div>
      `;
      const emptyBtn = document.getElementById("empty-reset-btn");
      if (emptyBtn) {
        emptyBtn.addEventListener("click", () => {
          document.getElementById("filter-reset-btn")?.click();
        });
      }
      if (loadMoreWrap) loadMoreWrap.style.display = "none";
      return;
    }

    const slice = filtered.slice(0, this.state.visibleCount);
    grid.innerHTML = slice.map(p => {
      const isVerified = p.references.status === "Đã kiểm chứng";
      const badgeClass = isVerified ? "badge-verified" : "badge-editing";
      const isSelectedPrint = window.AnNhienApp.state.selectedForPrint.has(p.id);
      return `
        <article class="plant-card">
          <div class="plant-card-thumb-wrap">
            <img src="${p.images.primary}" alt="${p.identification.vietnameseName}" class="plant-card-thumb" loading="lazy">
            <div class="plant-card-badges">
              <span class="badge-pill badge-code">${p.code}</span>
              <span class="badge-pill ${badgeClass}">${p.references.status}</span>
            </div>
          </div>
          <div class="plant-card-body">
            <div class="plant-card-cat">${p.categoryName}</div>
            <h3 class="plant-card-title">${p.identification.vietnameseName}</h3>
            <div class="plant-card-sci">${p.identification.scientificName}</div>
            <div class="plant-card-meta">
              <div><strong>Họ:</strong> ${p.identification.family}</div>
              <div><strong>Mùa hoa/vụ:</strong> ${p.biology.bloomSeason}</div>
              <div><strong>Ánh sáng:</strong> ${p.biology.light}</div>
            </div>
            <div class="plant-card-actions">
              <button type="button" class="btn btn-Pine" data-open-modal="${p.id}">📖 Hồ sơ khoa học</button>
              <button type="button" class="btn btn-outline-pine" data-toggle-print="${p.id}" title="Chọn vào tuyển tập xuất PDF">
                ${isSelectedPrint ? "✓ Đã chọn in" : "+ Chọn in PDF"}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll("[data-open-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openPlantModal(btn.getAttribute("data-open-modal"));
      });
    });

    grid.querySelectorAll("[data-toggle-print]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-toggle-print");
        if (window.AnNhienApp.state.selectedForPrint.has(pid)) {
          window.AnNhienApp.state.selectedForPrint.delete(pid);
        } else {
          window.AnNhienApp.state.selectedForPrint.add(pid);
        }
        this.applyFilters();
        if (window.AnNhienPrint) window.AnNhienPrint.updateCounter();
      });
    });

    if (loadMoreWrap) {
      loadMoreWrap.style.display = filtered.length > this.state.visibleCount ? "block" : "none";
    }
  },

  openPlantModal(plantId) {
    const plants = window.AnNhienApp.data.plants || [];
    const plant = plants.find(p => p.id === plantId);
    const modal = document.getElementById("plant-profile-modal");
    const titleEl = document.getElementById("modal-plant-title");
    const subtitleEl = document.getElementById("modal-plant-subtitle");
    const contentEl = document.getElementById("modal-plant-body");

    if (!plant || !modal || !contentEl) return;

    this.state.currentModalPlantId = plant.id;
    if (titleEl) titleEl.textContent = `${plant.code} • ${plant.identification.vietnameseName}`;
    if (subtitleEl) {
      subtitleEl.innerHTML = `<em>${plant.identification.scientificName}</em> — ${plant.identification.family} • Trạng thái: <strong>${plant.references.status}</strong>`;
    }

    contentEl.innerHTML = `
      <!-- Thanh điều khiển Giọng đọc Tiếng Việt & Xuất PDF cho hồ sơ này -->
      <div class="tts-bar">
        <strong>🔊 Nghe & Xuất Hồ Sơ:</strong>
        <button type="button" class="btn btn-Pine" style="padding:0.4rem 0.85rem; font-size:0.86rem;" id="modal-tts-read-all">▶ Đọc toàn bộ hồ sơ</button>
        <button type="button" class="btn btn-outline-pine" style="padding:0.4rem 0.85rem; font-size:0.86rem;" id="modal-tts-read-care">🌱 Chỉ đọc mục Chăm sóc</button>
        <button type="button" class="btn btn-outline-pine" style="padding:0.4rem 0.85rem; font-size:0.86rem;" id="modal-tts-stop">⏹ Dừng đọc</button>
        <button type="button" class="btn btn-primary" style="padding:0.4rem 0.85rem; font-size:0.86rem; margin-left:auto;" id="modal-print-art-btn">🖨️ Xuất PDF Nghệ thuật (A4)</button>
        <button type="button" class="btn btn-outline-pine" style="padding:0.4rem 0.85rem; font-size:0.86rem;" id="modal-print-eco-btn">📄 Xuất PDF Học tập (Tiết kiệm mực)</button>
      </div>

      <!-- Khung ảnh tổng quan & minh họa thực vật học -->
      <div class="profile-section-card" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.25rem; align-items:center;">
        <div>
          <img src="${plant.images.primary}" alt="${plant.identification.vietnameseName}" style="width:100%; border-radius:12px; border:2px solid var(--sun-gold);">
          <p style="font-size:0.84rem; color:var(--muted-text); margin:0.4rem 0 0;">${plant.images.caption}</p>
        </div>
        <div>
          <img src="${plant.images.svgIllustration}" alt="Bản đồ họa hình thái ${plant.identification.vietnameseName}" style="width:100%; border-radius:12px; border:1px solid var(--border-subtle);">
          <p style="font-size:0.84rem; color:var(--muted-text); margin:0.4rem 0 0;">Thẻ tiêu bản đồ họa thực vật học (Herbarium Dalatense • ${plant.code}).</p>
        </div>
      </div>

      <!-- A. THÔNG TIN NHẬN DIỆN -->
      <div class="profile-section-card" id="sec-a-ident">
        <h3>A. Thông tin nhận diện & Danh pháp khoa học</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Tên tiếng Việt</span><span class="kv-value">${plant.identification.vietnameseName}</span></div>
          <div class="kv-item"><span class="kv-label">Tên địa phương</span><span class="kv-value">${plant.identification.localName}</span></div>
          <div class="kv-item"><span class="kv-label">Tên tiếng Anh</span><span class="kv-value">${plant.identification.englishName}</span></div>
          <div class="kv-item"><span class="kv-label">Tên khoa học được chấp nhận</span><span class="kv-value"><em>${plant.identification.scientificName}</em></span></div>
          <div class="kv-item"><span class="kv-label">Tên đồng nghĩa (Synonyms)</span><span class="kv-value"><em>${plant.identification.synonyms}</em></span></div>
          <div class="kv-item"><span class="kv-label">Họ thực vật (Family)</span><span class="kv-value">${plant.identification.family}</span></div>
          <div class="kv-item"><span class="kv-label">Chi thực vật (Genus)</span><span class="kv-value"><em>${plant.identification.genus}</em></span></div>
          <div class="kv-item"><span class="kv-label">Cấp phân loại</span><span class="kv-value">${plant.identification.taxonomicRank}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Nguồn gốc & Phân bố</span><span class="kv-value">${plant.identification.originAndDistribution}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Mối liên hệ với Đà Lạt</span><span class="kv-value">${plant.identification.dalatConnection}</span></div>
        </div>
      </div>

      <!-- B. ĐẶC ĐIỂM HÌNH THÁI -->
      <div class="profile-section-card" id="sec-b-morph">
        <h3>B. Đặc điểm hình thái nhận diện</h3>
        <div class="profile-grid-2">
          <div class="kv-item" style="grid-column: 1 / -1; border-left:4px solid var(--pine-green);"><span class="kv-label">Đặc điểm nhận diện quan trọng nhất</span><span class="kv-value">${plant.morphology.keyIdentification}</span></div>
          <div class="kv-item"><span class="kv-label">Rễ</span><span class="kv-value">${plant.morphology.root}</span></div>
          <div class="kv-item"><span class="kv-label">Thân</span><span class="kv-value">${plant.morphology.stem}</span></div>
          <div class="kv-item"><span class="kv-label">Lá</span><span class="kv-value">${plant.morphology.leaf}</span></div>
          <div class="kv-item"><span class="kv-label">Nụ</span><span class="kv-value">${plant.morphology.bud}</span></div>
          <div class="kv-item"><span class="kv-label">Hoa</span><span class="kv-value">${plant.morphology.flower}</span></div>
          <div class="kv-item"><span class="kv-label">Quả</span><span class="kv-value">${plant.morphology.fruit}</span></div>
          <div class="kv-item"><span class="kv-label">Hạt</span><span class="kv-value">${plant.morphology.seed}</span></div>
          <div class="kv-item"><span class="kv-label">Kích thước trưởng thành</span><span class="kv-value">${plant.morphology.matureSize}</span></div>
        </div>
      </div>

      <!-- C. ĐỜI SỐNG SINH HỌC -->
      <div class="profile-section-card" id="sec-c-bio">
        <h3>C. Đời sống sinh học & Sinh thái</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Chu kỳ sống</span><span class="kv-value">${plant.biology.lifeCycle}</span></div>
          <div class="kv-item"><span class="kv-label">Ánh sáng</span><span class="kv-value">${plant.biology.light}</span></div>
          <div class="kv-item"><span class="kv-label">Nhiệt độ ưa thích</span><span class="kv-value">${plant.biology.temperature}</span></div>
          <div class="kv-item"><span class="kv-label">Độ ẩm</span><span class="kv-value">${plant.biology.humidity}</span></div>
          <div class="kv-item"><span class="kv-label">Nhu cầu nước</span><span class="kv-value">${plant.biology.water}</span></div>
          <div class="kv-item"><span class="kv-label">Đất hoặc giá thể</span><span class="kv-value">${plant.biology.substrate}</span></div>
          <div class="kv-item"><span class="kv-label">Mùa hoa / Mùa vụ</span><span class="kv-value">${plant.biology.bloomSeason}</span></div>
          <div class="kv-item"><span class="kv-label">Cơ chế sinh sản</span><span class="kv-value">${plant.biology.reproduction}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Môi trường sống tại Đà Lạt</span><span class="kv-value">${plant.biology.habitat}</span></div>
        </div>
      </div>

      <!-- D. TRỒNG VÀ CHĂM SÓC -->
      <div class="profile-section-card" id="sec-d-care">
        <h3>D. Kỹ thuật trồng và chăm sóc</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Chọn cây giống</span><span class="kv-value">${plant.care.seedlingSelection}</span></div>
          <div class="kv-item"><span class="kv-label">Chọn chậu / Vị trí</span><span class="kv-value">${plant.care.potSelection}</span></div>
          <div class="kv-item"><span class="kv-label">Chuẩn bị đất / Giá thể</span><span class="kv-value">${plant.care.soilPrep}</span></div>
          <div class="kv-item"><span class="kv-label">Tưới nước</span><span class="kv-value">${plant.care.watering}</span></div>
          <div class="kv-item"><span class="kv-label">Bón phân</span><span class="kv-value">${plant.care.fertilizing}</span></div>
          <div class="kv-item"><span class="kv-label">Cắt tỉa</span><span class="kv-value">${plant.care.pruning}</span></div>
          <div class="kv-item"><span class="kv-label">Nhân giống</span><span class="kv-value">${plant.care.propagation}</span></div>
          <div class="kv-item"><span class="kv-label">Chăm sóc theo mùa</span><span class="kv-value">${plant.care.seasonalCare}</span></div>
          <div class="kv-item"><span class="kv-label">Chăm sóc khi ra nụ</span><span class="kv-value">${plant.care.budCare}</span></div>
          <div class="kv-item"><span class="kv-label">Chăm sóc sau ra hoa</span><span class="kv-value">${plant.care.postBloomCare}</span></div>
        </div>
      </div>

      <!-- E. NHỮNG VẤN ĐỀ THƯỜNG GẶP -->
      <div class="profile-section-card" id="sec-e-issues">
        <h3>E. Những vấn đề thường gặp & Cách kiểm tra thực tế</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Vàng lá</span><span class="kv-value">${plant.issues.yellowLeaves}</span></div>
          <div class="kv-item"><span class="kv-label">Thối rễ</span><span class="kv-value">${plant.issues.rootRot}</span></div>
          <div class="kv-item"><span class="kv-label">Rụng nụ</span><span class="kv-value">${plant.issues.budDrop}</span></div>
          <div class="kv-item"><span class="kv-label">Không ra hoa</span><span class="kv-value">${plant.issues.noBloom}</span></div>
          <div class="kv-item"><span class="kv-label">Cháy lá</span><span class="kv-value">${plant.issues.leafScorch}</span></div>
          <div class="kv-item"><span class="kv-label">Sâu bệnh</span><span class="kv-value">${plant.issues.pests}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Chậm phát triển</span><span class="kv-value">${plant.issues.slowGrowth}</span></div>
        </div>
      </div>

      <!-- F. GIÁ TRỊ VÀ VĂN HÓA -->
      <div class="profile-section-card" id="sec-f-culture">
        <h3>F. Giá trị sinh thái và Văn hóa Đà Lạt</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Vai trò trong cảnh quan</span><span class="kv-value">${plant.culture.landscapeRole}</span></div>
          <div class="kv-item"><span class="kv-label">Giá trị sinh thái</span><span class="kv-value">${plant.culture.ecologicalValue}</span></div>
          <div class="kv-item"><span class="kv-label">Giá trị kinh tế</span><span class="kv-value">${plant.culture.economicValue}</span></div>
          <div class="kv-item"><span class="kv-label">Ý nghĩa với Đà Lạt</span><span class="kv-value">${plant.culture.dalatMeaning}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Câu chuyện văn hóa</span><span class="kv-value">${plant.culture.culturalStories}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Điều thú vị về loài</span><span class="kv-value">${plant.culture.funFacts}</span></div>
        </div>
      </div>

      <!-- G. BẢO TỒN VÀ AN TOÀN -->
      <div class="profile-section-card" id="sec-g-cons">
        <h3>G. Bảo tồn đa dạng sinh học và An toàn</h3>
        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">Tình trạng bảo tồn</span><span class="kv-value">${plant.conservation.status}</span></div>
          <div class="kv-item"><span class="kv-label">Nguy cơ sinh thái</span><span class="kv-value">${plant.conservation.ecologicalRisks}</span></div>
          <div class="kv-item"><span class="kv-label">Độc tính</span><span class="kv-value">${plant.conservation.toxicity}</span></div>
          <div class="kv-item"><span class="kv-label">Lưu ý với người & vật nuôi</span><span class="kv-value">${plant.conservation.petAndHumanSafety}</span></div>
          <div class="kv-item" style="grid-column: 1 / -1;"><span class="kv-label">Quy định bảo vệ thực vật</span><span class="kv-value">${plant.conservation.regulations}</span></div>
        </div>
      </div>

      <!-- H. HÌNH ẢNH CÁC BỘ PHẬN -->
      <div class="profile-section-card" id="sec-h-images">
        <h3>H. Tư liệu hình ảnh theo cấu trúc (Toàn cây • Thân • Lá • Nụ • Hoa • Quả • Môi trường)</h3>
        <p style="font-size:0.9rem; color:var(--muted-text);">
          Hồ sơ đang sử dụng bộ thẻ tiêu bản đồ họa thực vật học và ảnh cảnh quan chuẩn. Chủ website có thể bổ sung ảnh chụp cận cảnh từng bộ phận (Rễ, Thân, Lá, Nụ, Hoa, Quả) vào thư mục <code>assets/images/</code> theo hướng dẫn quản trị.
        </p>
      </div>

      <!-- I. TÀI LIỆU THAM KHẢO -->
      <div class="profile-section-card" id="sec-i-refs">
        <h3>I. Tài liệu tham khảo & Kiểm chứng khoa học</h3>
        <p><strong>Trạng thái hồ sơ:</strong> <span class="badge-pill badge-verified">${plant.references.status}</span> • <strong>Ngày đối chiếu:</strong> ${plant.references.verificationDate}</p>
        <p style="font-size:0.92rem;">${plant.references.note}</p>
        <ul>
          ${plant.references.scientificSources.map(s => `
            <li><a href="${s.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline; font-weight:600;">${s.title}</a> (${s.url})</li>
          `).join("")}
        </ul>
      </div>
    `;

    modal.classList.add("open");

    // Gắn sự kiện TTS & Print trong modal
    document.getElementById("modal-tts-read-all")?.addEventListener("click", () => {
      if (window.AnNhienSpeech) {
        const text = `${plant.identification.vietnameseName}. Tên khoa học: ${plant.identification.scientificName}, thuộc họ ${plant.identification.family}. Mối liên hệ với Đà Lạt: ${plant.identification.dalatConnection}. Đặc điểm nhận diện: ${plant.morphology.keyIdentification}. Đời sống sinh học: Ánh sáng ${plant.biology.light}, mùa hoa ${plant.biology.bloomSeason}. Kỹ thuật chăm sóc: ${plant.care.watering} ${plant.care.soilPrep}. Câu chuyện văn hóa: ${plant.culture.culturalStories}`;
        window.AnNhienSpeech.speakText(text);
      }
    });

    document.getElementById("modal-tts-read-care")?.addEventListener("click", () => {
      if (window.AnNhienSpeech) {
        const text = `Hướng dẫn chăm sóc loài ${plant.identification.vietnameseName}: Chọn giống: ${plant.care.seedlingSelection}. Đất và giá thể: ${plant.care.soilPrep}. Tưới nước: ${plant.care.watering}. Bón phân: ${plant.care.fertilizing}. Chăm sóc khi ra nụ: ${plant.care.budCare}.`;
        window.AnNhienSpeech.speakText(text);
      }
    });

    document.getElementById("modal-tts-stop")?.addEventListener("click", () => {
      if (window.AnNhienSpeech) window.AnNhienSpeech.stop();
    });

    document.getElementById("modal-print-art-btn")?.addEventListener("click", () => {
      if (window.AnNhienPrint) window.AnNhienPrint.printSinglePlant(plant.id, false);
    });

    document.getElementById("modal-print-eco-btn")?.addEventListener("click", () => {
      if (window.AnNhienPrint) window.AnNhienPrint.printSinglePlant(plant.id, true);
    });
  },

  closePlantModal() {
    const modal = document.getElementById("plant-profile-modal");
    if (modal) modal.classList.remove("open");
    if (window.AnNhienSpeech) window.AnNhienSpeech.stop();
  }
};
