/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/encyclopedia.js – Cuốn sách khoa học nghệ thuật 7 Tập, Mục lục A–Z,
 * hiệu ứng chuyển trang mượt không làm mất chữ, chế độ đọc liên tục,
 * điều chỉnh cỡ chữ, thanh tiến độ và kết nối đọc giọng nói Tiếng Việt.
 */

window.AnNhienEncyclopedia = {
  state: {
    mode: "paged", // "paged" | "continuous" | "toc"
    currentVolume: 1,
    activeLetter: "ALL",
    currentPageIndex: 0,
    fontScale: 1
  },

  init() {
    this.renderVolumeButtons();
    this.renderAZBar();
    this.bindControls();
    this.renderBookView();
  },

  getVolumePlants() {
    const plants = window.AnNhienApp.data.plants || [];
    return plants.filter(p => {
      const matchVol = this.state.currentVolume === 0 || p.volumeNumber === this.state.currentVolume;
      if (!matchVol) return false;
      if (this.state.activeLetter !== "ALL") {
        const firstChar = p.identification.vietnameseName
          .trim()
          .charAt(0)
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/Đ/g, "D");
        return firstChar === this.state.activeLetter;
      }
      return true;
    });
  },

  renderVolumeButtons() {
    const cats = window.AnNhienApp.data.categories || [];
    const wrap = document.getElementById("book-volumes-strip");
    if (!wrap) return;

    const allVolBtn = `
      <button type="button" class="volume-btn ${this.state.currentVolume === 0 ? "active" : ""}" data-vol="0">
        📚 Trọn bộ 7 Tập (100 loài)
      </button>
    `;

    wrap.innerHTML = allVolBtn + cats.map(c => `
      <button type="button" class="volume-btn ${this.state.currentVolume === c.volumeNumber ? "active" : ""}" data-vol="${c.volumeNumber}">
        ${c.icon} ${c.volumeTitle}
      </button>
    `).join("");

    wrap.querySelectorAll("[data-vol]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.currentVolume = parseInt(btn.getAttribute("data-vol"), 10);
        this.state.activeLetter = "ALL";
        this.state.currentPageIndex = 0;
        this.renderVolumeButtons();
        this.renderAZBar();
        this.renderBookView();
      });
    });
  },

  renderAZBar() {
    const wrap = document.getElementById("book-az-bar");
    if (!wrap) return;
    const letters = ["ALL", "A", "B", "C", "D", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "S", "T", "V", "X"];
    wrap.innerHTML = letters.map(l => `
      <button type="button" class="az-letter-btn ${this.state.activeLetter === l ? "active" : ""}" data-letter="${l}">
        ${l === "ALL" ? "A–Z (Tất cả)" : l}
      </button>
    `).join("");

    wrap.querySelectorAll("[data-letter]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.activeLetter = btn.getAttribute("data-letter");
        this.state.currentPageIndex = 0;
        this.renderAZBar();
        this.renderBookView();
      });
    });
  },

  bindControls() {
    document.getElementById("book-prev-page")?.addEventListener("click", () => {
      const list = this.getVolumePlants();
      if (!list.length) return;
      this.state.mode = "paged";
      this.state.currentPageIndex = (this.state.currentPageIndex - 1 + list.length) % list.length;
      this.renderBookView();
    });

    document.getElementById("book-next-page")?.addEventListener("click", () => {
      const list = this.getVolumePlants();
      if (!list.length) return;
      this.state.mode = "paged";
      this.state.currentPageIndex = (this.state.currentPageIndex + 1) % list.length;
      this.renderBookView();
    });

    document.getElementById("book-toc-btn")?.addEventListener("click", () => {
      this.state.mode = this.state.mode === "toc" ? "paged" : "toc";
      this.renderBookView();
    });

    document.getElementById("book-continuous-btn")?.addEventListener("click", () => {
      this.state.mode = this.state.mode === "continuous" ? "paged" : "continuous";
      this.renderBookView();
    });

    document.getElementById("book-font-dec")?.addEventListener("click", () => {
      this.state.fontScale = Math.max(0.88, +(this.state.fontScale - 0.08).toFixed(2));
      document.documentElement.style.setProperty("--encyclopedia-scale", String(this.state.fontScale));
    });

    document.getElementById("book-font-inc")?.addEventListener("click", () => {
      this.state.fontScale = Math.min(1.32, +(this.state.fontScale + 0.08).toFixed(2));
      document.documentElement.style.setProperty("--encyclopedia-scale", String(this.state.fontScale));
    });

    document.getElementById("book-tts-page-btn")?.addEventListener("click", () => {
      const list = this.getVolumePlants();
      const current = list[this.state.currentPageIndex] || list[0];
      if (current && window.AnNhienSpeech) {
        const text = `Bách khoa toàn thư thực vật Đà Lạt. ${current.volumeTitle}. Trang loài ${current.identification.vietnameseName}, tên khoa học ${current.identification.scientificName}. ${current.identification.dalatConnection}. Đặc điểm nhận diện: ${current.morphology.keyIdentification}. Điều kiện sinh thái: ${current.biology.light}, mùa hoa ${current.biology.bloomSeason}. Hướng dẫn chăm sóc: ${current.care.watering}`;
        window.AnNhienSpeech.speakText(text);
      }
    });
  },

  renderBookView() {
    const spreadEl = document.getElementById("book-spread-container");
    const pageInfoEl = document.getElementById("book-page-counter");
    const progressFill = document.getElementById("book-progress-fill");
    const tocBtn = document.getElementById("book-toc-btn");
    const contBtn = document.getElementById("book-continuous-btn");

    if (!spreadEl) return;

    const list = this.getVolumePlants();
    if (tocBtn) tocBtn.textContent = this.state.mode === "toc" ? "📖 Đọc từng trang" : "📑 Mục lục tập sách";
    if (contBtn) contBtn.textContent = this.state.mode === "continuous" ? "📄 Chế độ lật từng trang" : "📜 Chế độ đọc liên tục";

    if (!list.length) {
      spreadEl.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem;">
          <h3>Không có loài thực vật nào bắt đầu bằng chữ cái "${this.state.activeLetter}" trong tập này</h3>
          <p>Hãy bấm chọn <strong>A–Z (Tất cả)</strong> hoặc chuyển sang tập sách khác.</p>
        </div>
      `;
      if (pageInfoEl) pageInfoEl.textContent = "Trang 0 / 0";
      if (progressFill) progressFill.style.width = "0%";
      return;
    }

    if (this.state.currentPageIndex >= list.length) {
      this.state.currentPageIndex = 0;
    }

    if (this.state.mode === "toc") {
      spreadEl.innerHTML = `
        <div>
          <div style="border-bottom:2px solid var(--sun-gold); padding-bottom:0.85rem; margin-bottom:1.25rem;">
            <span class="section-eyebrow">MỤC LỤC TRA CỨU NHANH</span>
            <h3 style="margin:0.25rem 0 0;">Danh mục ${list.length} hồ sơ trong phạm vi đang chọn</h3>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:0.75rem;">
            ${list.map((p, idx) => `
              <button type="button" class="kv-item" style="text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" data-goto-idx="${idx}">
                <div>
                  <strong>${idx + 1}. ${p.identification.vietnameseName}</strong><br>
                  <small style="font-style:italic; color:var(--earth-brown);">${p.identification.scientificName}</small>
                </div>
                <span class="badge-pill badge-code">${p.code}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
      spreadEl.querySelectorAll("[data-goto-idx]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.state.currentPageIndex = parseInt(btn.getAttribute("data-goto-idx"), 10);
          this.state.mode = "paged";
          this.renderBookView();
        });
      });
      if (pageInfoEl) pageInfoEl.textContent = `Mục lục (${list.length} loài)`;
      if (progressFill) progressFill.style.width = "100%";
      return;
    }

    if (this.state.mode === "continuous") {
      spreadEl.innerHTML = `
        <div>
          <div style="border-bottom:2px solid var(--sun-gold); padding-bottom:0.85rem; margin-bottom:1.5rem;">
            <span class="section-eyebrow">CHẾ ĐỘ ĐỌC LIÊN TỤC</span>
            <h3 style="margin:0.25rem 0 0;">Đang hiển thị liên tiếp ${list.length} trang sách thực vật</h3>
          </div>
          ${list.map((p, idx) => this.renderSinglePageHTML(p, idx + 1, list.length)).join('<hr style="border:none; border-top:2px dashed var(--sun-gold); margin:2.5rem 0;">')}
        </div>
      `;
      this.bindInnerPageButtons(spreadEl);
      if (pageInfoEl) pageInfoEl.textContent = `Đọc liên tục (${list.length} trang)`;
      if (progressFill) progressFill.style.width = "100%";
      return;
    }

    // Chế độ lật từng trang (Paged mode)
    const p = list[this.state.currentPageIndex];
    const pageNum = this.state.currentPageIndex + 1;
    const pct = Math.round((pageNum / list.length) * 100);

    spreadEl.style.opacity = "0.4";
    setTimeout(() => {
      spreadEl.innerHTML = this.renderSinglePageHTML(p, pageNum, list.length);
      this.bindInnerPageButtons(spreadEl);
      spreadEl.style.opacity = "1";
    }, 90);

    if (pageInfoEl) pageInfoEl.textContent = `Trang ${pageNum} / ${list.length}`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  },

  renderSinglePageHTML(p, pageNum, totalPages) {
    return `
      <div class="book-page-article">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.75rem; margin-bottom:1.25rem; font-size:0.88rem; color:var(--earth-brown);">
          <span><strong>${p.volumeTitle}</strong> • Mã tiêu bản: ${p.code}</span>
          <span>Trang sách ${pageNum} / ${totalPages} • Trạng thái: <strong>${p.references.status}</strong></span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.75rem; align-items:start;">
          <div>
            <img src="${p.images.primary}" alt="${p.identification.vietnameseName}" style="width:100%; border-radius:12px; border:2px solid var(--sun-gold); margin-bottom:0.85rem;">
            <img src="${p.images.svgIllustration}" alt="Minh họa ${p.identification.vietnameseName}" style="width:100%; border-radius:12px; border:1px solid var(--border-subtle);">
          </div>
          <div>
            <span class="section-eyebrow">${p.categoryName}</span>
            <h3 style="font-size:1.85rem; margin:0.25rem 0;">${p.identification.vietnameseName}</h3>
            <p style="font-family:var(--font-serif); font-style:italic; font-size:1.15rem; color:var(--earth-brown); margin-top:0;">
              ${p.identification.scientificName} — ${p.identification.family}
            </p>
            <p><strong>Mối liên hệ với Đà Lạt:</strong> ${p.identification.dalatConnection}</p>
            <p><strong>Đặc điểm nhận diện cốt lõi:</strong> ${p.morphology.keyIdentification}</p>
            <div class="profile-grid-2" style="margin:1rem 0;">
              <div class="kv-item"><span class="kv-label">Mùa hoa / Mùa vụ</span><span class="kv-value">${p.biology.bloomSeason}</span></div>
              <div class="kv-item"><span class="kv-label">Ánh sáng & Nước</span><span class="kv-value">${p.biology.light} • ${p.biology.water}</span></div>
            </div>
            <p><strong>Chăm sóc tại khu vườn:</strong> ${p.care.watering} ${p.care.soilPrep}</p>
            <p><strong>Câu chuyện & Giá trị:</strong> ${p.culture.culturalStories}</p>
            <div style="display:flex; flex-wrap:wrap; gap:0.65rem; margin-top:1.25rem;">
              <button type="button" class="btn btn-Pine" data-book-open-modal="${p.id}">🔍 Xem trọn bộ 9 mục khoa học (A–I)</button>
              <button type="button" class="btn btn-outline-pine" data-book-print-one="${p.id}">🖨️ In trang sách này (A4)</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindInnerPageButtons(container) {
    container.querySelectorAll("[data-book-open-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-book-open-modal");
        if (window.AnNhienSearch) window.AnNhienSearch.openPlantModal(pid);
      });
    });
    container.querySelectorAll("[data-book-print-one]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-book-print-one");
        if (window.AnNhienPrint) window.AnNhienPrint.printSinglePlant(pid, false);
      });
    });
  }
};
