/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/gallery.js – Thư viện ảnh thực vật 12 Album nghệ thuật,
 * tìm theo tên, lọc danh mục, phân biệt rõ Ảnh thật / Minh họa thực vật học / Ảnh nghệ thuật AI,
 * xem toàn màn hình Lightbox, phóng to (Zoom), chuyển trước/sau và tải ảnh.
 */

window.AnNhienGallery = {
  state: {
    selectedAlbum: "ALL",
    mediaFilter: "ALL", // "ALL" | "REAL_OR_PLATE" | "AI"
    keyword: "",
    currentIndex: 0,
    zoomLevel: 1
  },

  init() {
    this.renderAlbumPills();
    this.bindEvents();
    this.renderGrid();
  },

  getGalleryItems() {
    const baseItems = window.AnNhienApp.data.gallery || [];
    const plants = window.AnNhienApp.data.plants || [];

    // Bổ sung thêm các bản vẽ tiêu bản từ nhóm cây nổi bật để thư viện phong phú
    const extraItems = plants.slice(0, 12).map(p => ({
      id: `herbarium-${p.id}`,
      albumName: p.categoryName,
      title: `Tiêu bản hình thái: ${p.identification.vietnameseName}`,
      scientificName: p.identification.scientificName,
      plantId: p.id,
      image: p.images.svgIllustration,
      source: `Herbarium Dalatense (${p.code}) – An Nhiên Botanical`,
      mediaType: "Minh họa Khoa học Thực vật (Botanical Plate SVG)",
      isAI: false,
      caption: `Bản đồ họa nhận diện loài ${p.identification.vietnameseName} (${p.identification.scientificName}) thuộc họ ${p.identification.family}.`
    }));

    const all = [...baseItems, ...extraItems];

    return all.filter(item => {
      if (this.state.selectedAlbum !== "ALL" && item.albumName !== this.state.selectedAlbum) return false;
      if (this.state.mediaFilter === "REAL_OR_PLATE" && item.isAI) return false;
      if (this.state.mediaFilter === "AI" && !item.isAI) return false;
      if (this.state.keyword.trim()) {
        const q = this.state.keyword.toLowerCase();
        const hay = `${item.title} ${item.scientificName} ${item.albumName} ${item.caption}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  },

  renderAlbumPills() {
    const wrap = document.getElementById("gallery-album-pills");
    if (!wrap) return;
    const albums = [
      "ALL",
      "Phượng tím",
      "Mai anh đào",
      "Mimosa",
      "Cẩm tú cầu",
      "Hoa lan",
      "Hoa hồng",
      "Hoa dại",
      "Rau Đà Lạt",
      "Cây ăn quả",
      "Rừng thông",
      "Khu vườn An Nhiên",
      "Thực vật sáng tạo bằng AI"
    ];

    wrap.innerHTML = albums.map(a => `
      <button type="button" class="quick-nav-chip ${this.state.selectedAlbum === a ? "active" : ""}" style="padding:0.4rem 0.85rem;" data-album="${a}">
        ${a === "ALL" ? "🖼️ Tất cả Album (12 chủ đề)" : a}
      </button>
    `).join("");

    wrap.querySelectorAll("[data-album]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.selectedAlbum = btn.getAttribute("data-album");
        this.renderAlbumPills();
        this.renderGrid();
      });
    });
  },

  bindEvents() {
    const searchInput = document.getElementById("gallery-search-input");
    const mediaSelect = document.getElementById("gallery-media-filter");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.state.keyword = e.target.value;
        this.renderGrid();
      });
    }

    if (mediaSelect) {
      mediaSelect.addEventListener("change", (e) => {
        this.state.mediaFilter = e.target.value;
        this.renderGrid();
      });
    }

    // Lightbox controls
    document.getElementById("lightbox-close-btn")?.addEventListener("click", () => this.closeLightbox());
    document.getElementById("lightbox-prev-btn")?.addEventListener("click", () => this.stepLightbox(-1));
    document.getElementById("lightbox-next-btn")?.addEventListener("click", () => this.stepLightbox(1));
    document.getElementById("lightbox-zoom-in")?.addEventListener("click", () => {
      this.state.zoomLevel = Math.min(2.2, +(this.state.zoomLevel + 0.25).toFixed(2));
      this.applyZoom();
    });
    document.getElementById("lightbox-zoom-out")?.addEventListener("click", () => {
      this.state.zoomLevel = Math.max(0.8, +(this.state.zoomLevel - 0.25).toFixed(2));
      this.applyZoom();
    });

    const backdrop = document.getElementById("gallery-lightbox");
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closeLightbox();
      });
    }
  },

  renderGrid() {
    const grid = document.getElementById("gallery-grid-container");
    if (!grid) return;
    const list = this.getGalleryItems();

    if (!list.length) {
      grid.innerHTML = `<div class="profile-section-card" style="grid-column:1/-1; text-align:center;">Không có hình ảnh nào khớp bộ lọc hiện tại.</div>`;
      return;
    }

    grid.innerHTML = list.map((item, idx) => `
      <figure class="plant-card" style="margin:0;">
        <div class="plant-card-thumb-wrap" style="cursor:pointer;" data-open-lightbox="${idx}">
          <img src="${item.image}" alt="${item.title}" class="plant-card-thumb" loading="lazy">
          <div class="plant-card-badges">
            <span class="badge-pill badge-code">${item.albumName}</span>
            <span class="badge-pill ${item.isAI ? "badge-editing" : "badge-verified"}">
              ${item.isAI ? "🎨 Ảnh nghệ thuật AI" : "🔬 Ảnh thật / Tiêu bản"}
            </span>
          </div>
        </div>
        <figcaption class="plant-card-body">
          <h4 style="margin:0 0 0.25rem; font-size:1.1rem; color:var(--pine-green);">${item.title}</h4>
          <div style="font-style:italic; font-size:0.88rem; color:var(--earth-brown); margin-bottom:0.45rem;">${item.scientificName}</div>
          <p style="font-size:0.86rem; color:var(--muted-text); margin:0 0 0.75rem;">${item.caption}</p>
          <div style="font-size:0.78rem; color:var(--earth-brown); margin-bottom:0.75rem;"><strong>Nguồn:</strong> ${item.source}</div>
          <div class="plant-card-actions">
            <button type="button" class="btn btn-Pine" data-open-lightbox="${idx}">🔍 Xem lớn & Phóng to</button>
            ${item.plantId ? `<button type="button" class="btn btn-outline-pine" data-gallery-plant="${item.plantId}">📖 Hồ sơ loài</button>` : ""}
          </div>
        </figcaption>
      </figure>
    `).join("");

    grid.querySelectorAll("[data-open-lightbox]").forEach(el => {
      el.addEventListener("click", () => {
        const i = parseInt(el.getAttribute("data-open-lightbox"), 10);
        this.openLightbox(i);
      });
    });

    grid.querySelectorAll("[data-gallery-plant]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-gallery-plant");
        if (window.AnNhienSearch) window.AnNhienSearch.openPlantModal(pid);
      });
    });
  },

  openLightbox(idx) {
    const list = this.getGalleryItems();
    if (!list.length) return;
    this.state.currentIndex = (idx + list.length) % list.length;
    this.state.zoomLevel = 1;
    const item = list[this.state.currentIndex];

    const lb = document.getElementById("gallery-lightbox");
    const imgEl = document.getElementById("lightbox-img");
    const titleEl = document.getElementById("lightbox-title");
    const metaEl = document.getElementById("lightbox-meta");
    const downloadLink = document.getElementById("lightbox-download-link");

    if (!lb || !imgEl) return;
    imgEl.src = item.image;
    imgEl.alt = item.title;
    imgEl.style.transform = "scale(1)";

    if (titleEl) {
      titleEl.innerHTML = `${item.title} — <em>${item.scientificName}</em>`;
    }
    if (metaEl) {
      metaEl.innerHTML = `
        <strong>Phân loại tư liệu:</strong> ${item.mediaType} • <strong>Nguồn:</strong> ${item.source}<br>
        ${item.caption}
      `;
    }
    if (downloadLink) {
      downloadLink.onclick = () => {
        const a = document.createElement("a");
        a.href = item.image;
        a.download = `${item.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
    }

    lb.classList.add("open");
  },

  stepLightbox(delta) {
    const list = this.getGalleryItems();
    if (!list.length) return;
    this.openLightbox(this.state.currentIndex + delta);
  },

  applyZoom() {
    const imgEl = document.getElementById("lightbox-img");
    if (imgEl) {
      imgEl.style.transform = `scale(${this.state.zoomLevel})`;
    }
  },

  closeLightbox() {
    const lb = document.getElementById("gallery-lightbox");
    if (lb) lb.classList.remove("open");
  }
};
