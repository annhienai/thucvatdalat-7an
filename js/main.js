/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/main.js – Khởi tạo ứng dụng, nạp dữ liệu JSON (fetch + fallback),
 * điều hướng 14 chuyên mục, Hero Slideshow 7 cảnh Đà Lạt, Lịch hoa 12 tháng,
 * So sánh 2 loài cây và Công cụ biên tập JSON cục bộ.
 */

window.AnNhienApp = {
  data: {
    categories: [],
    sources: [],
    calendar: [],
    gallery: [],
    plants: []
  },
  state: {
    heroIndex: 0,
    heroPaused: false,
    heroTimer: null,
    selectedMonth: 1,
    compareLeftId: "phuong-tim",
    compareRightId: "mai-anh-dao",
    selectedForPrint: new Set(["phuong-tim", "mai-anh-dao", "cam-tu-cau", "lan-ho-diep", "thong-ba-la"])
  },
  heroSlides: [
    {
      title: "Phượng tím Đà Lạt (Jacaranda mimosifolia)",
      subtitle: "Sắc tím thơ mộng soi bóng bên hồ Xuân Hương trong sương sớm tháng Ba.",
      image: "assets/images/hero/phuong-tim-dalat.jpg",
      plantId: "phuong-tim"
    },
    {
      title: "Mai anh đào (Prunus cerasoides)",
      subtitle: "Sứ giả mùa xuân nhuộm hồng các triền đồi cao nguyên Lâm Viên.",
      image: "assets/images/hero/mai-anh-dao-dalat.jpg",
      plantId: "mai-anh-dao"
    },
    {
      title: "Cẩm tú cầu (Hydrangea macrophylla)",
      subtitle: "Những cánh đồng hoa cầu xanh lam – tím biếc đón nắng dịu dưới tán thông.",
      image: "assets/images/hero/cam-tu-cau-dalat.jpg",
      plantId: "cam-tu-cau"
    },
    {
      title: "Hoa Mimosa (Acacia podalyriifolia)",
      subtitle: "Lá bạc đọng sương mai cùng chùm hoa vàng rực rỡ nơi cửa ngõ phố núi.",
      image: "assets/images/hero/mimosa-dalat.jpg",
      plantId: "mimosa"
    },
    {
      title: "Thế giới Hoa lan Đà Lạt (Orchidaceae)",
      subtitle: "Vẻ đẹp vương giả của Địa lan, Hồ điệp và các loài phong lan rừng Langbiang.",
      image: "assets/images/hero/hoa-lan-dalat.jpg",
      plantId: "lan-kiem-dia-lan"
    },
    {
      title: "Rừng thông trong sương sớm (Pinus kesiya & Pinus dalatensis)",
      subtitle: "Linh hồn sinh thái của Đà Lạt với những tia nắng mai xuyên qua màn sương.",
      image: "assets/images/hero/rung-thong-suong-som.jpg",
      plantId: "thong-ba-la"
    },
    {
      title: "Những vườn rau xanh Đà Lạt & Atisô",
      subtitle: "Tinh hoa nông nghiệp cao nguyên kết tinh từ đất đỏ bazan và khí hậu ôn hòa.",
      image: "assets/images/hero/vuon-rau-xanh-dalat.jpg",
      plantId: "atiso"
    }
  ]
};

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const item = document.createElement("div");
  item.className = "toast-msg";
  item.textContent = message;
  container.appendChild(item);
  setTimeout(() => {
    item.remove();
  }, 3600);
}

window.showToast = showToast;

async function loadBotanicalDatabases() {
  const embedded = window.AN_NHIEN_DATA || {};
  try {
    const [catsRes, srcsRes, calRes, galRes, plantsRes] = await Promise.all([
      fetch("data/categories.json"),
      fetch("data/sources.json"),
      fetch("data/calendar.json"),
      fetch("data/gallery.json"),
      fetch("data/plants.json")
    ]);
    if (catsRes.ok && plantsRes.ok) {
      window.AnNhienApp.data.categories = await catsRes.json();
      window.AnNhienApp.data.sources = await srcsRes.json();
      window.AnNhienApp.data.calendar = await calRes.json();
      window.AnNhienApp.data.gallery = await galRes.json();
      window.AnNhienApp.data.plants = await plantsRes.json();
      return;
    }
  } catch (err) {
    // Khi chạy trực tiếp qua file:// hoặc môi trường sandbox cô lập, sử dụng dữ liệu đồng bộ từ data-bundle.js
  }
  window.AnNhienApp.data.categories = embedded.categories || [];
  window.AnNhienApp.data.sources = embedded.sources || [];
  window.AnNhienApp.data.calendar = embedded.calendar || [];
  window.AnNhienApp.data.gallery = embedded.gallery || [];
  window.AnNhienApp.data.plants = embedded.plants || [];
}

function initHeroSlideshow() {
  const slidesWrap = document.getElementById("hero-slides-container");
  const dotsWrap = document.getElementById("hero-dots");
  const captionEl = document.getElementById("hero-current-caption");
  const pauseBtn = document.getElementById("hero-pause-btn");
  const prevBtn = document.getElementById("hero-prev-btn");
  const nextBtn = document.getElementById("hero-next-btn");

  if (!slidesWrap || !dotsWrap) return;

  slidesWrap.innerHTML = "";
  dotsWrap.innerHTML = "";

  window.AnNhienApp.heroSlides.forEach((slide, idx) => {
    const div = document.createElement("div");
    div.className = "hero-slide" + (idx === 0 ? " active" : "");
    div.style.backgroundImage = `url('${slide.image}')`;
    slidesWrap.appendChild(div);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (idx === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Chuyển tới cảnh ${idx + 1}: ${slide.title}`);
    dot.addEventListener("click", () => goToHeroSlide(idx));
    dotsWrap.appendChild(dot);
  });

  function updateHeroUI() {
    const idx = window.AnNhienApp.state.heroIndex;
    const slide = window.AnNhienApp.heroSlides[idx];
    const slideEls = slidesWrap.querySelectorAll(".hero-slide");
    const dotEls = dotsWrap.querySelectorAll(".hero-dot");
    slideEls.forEach((el, i) => el.classList.toggle("active", i === idx));
    dotEls.forEach((el, i) => el.classList.toggle("active", i === idx));
    if (captionEl && slide) {
      captionEl.innerHTML = `<span>🌿 Cảnh ${idx + 1}/7: <strong>${slide.title}</strong> — ${slide.subtitle}</span>`;
    }
  }

  function goToHeroSlide(idx) {
    const total = window.AnNhienApp.heroSlides.length;
    window.AnNhienApp.state.heroIndex = (idx + total) % total;
    updateHeroUI();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => goToHeroSlide(window.AnNhienApp.state.heroIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => goToHeroSlide(window.AnNhienApp.state.heroIndex + 1));
  }
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      window.AnNhienApp.state.heroPaused = !window.AnNhienApp.state.heroPaused;
      pauseBtn.textContent = window.AnNhienApp.state.heroPaused ? "▶ Tiếp tục chạy ảnh" : "⏸ Tạm dừng";
    });
  }

  if (window.AnNhienApp.state.heroTimer) {
    clearInterval(window.AnNhienApp.state.heroTimer);
  }
  window.AnNhienApp.state.heroTimer = setInterval(() => {
    if (!window.AnNhienApp.state.heroPaused) {
      goToHeroSlide(window.AnNhienApp.state.heroIndex + 1);
    }
  }, 6000);

  updateHeroUI();
}

function initNavigationAndQuickMenu() {
  const mobileBtn = document.getElementById("mobile-menu-toggle");
  const primaryNav = document.getElementById("primary-nav");
  if (mobileBtn && primaryNav) {
    mobileBtn.addEventListener("click", () => {
      const open = primaryNav.classList.toggle("mobile-open");
      mobileBtn.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".nav-dropdown-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".nav-dropdown");
      if (parent) {
        parent.classList.toggle("open");
      }
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown.open").forEach(d => d.classList.remove("open"));
  });

  document.querySelectorAll(".nav-dropdown-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".nav-dropdown");
      if (parent) {
        parent.classList.toggle("open");
      }
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown.open").forEach(d => d.classList.remove("open"));
  });

  // Các nút lọc nhanh theo nhóm cây trên thanh điều hướng (Hoa Đà Lạt, Hoa lan, Cây cảnh, Rau & nông sản)
  document.querySelectorAll("[data-nav-category]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const catId = btn.getAttribute("data-nav-category");
      if (catId && window.AnNhienSearch) {
        window.AnNhienSearch.selectCategory(catId);
      }
      const target = document.getElementById("kham-pha-thuc-vat");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      if (primaryNav) primaryNav.classList.remove("mobile-open");
    });
  });

  // Cho phép chỉnh sửa lời giới thiệu tác giả trực tiếp (lưu LocalStorage)
  const editIntroBtn = document.getElementById("btn-edit-author-intro");
  const introBox = document.getElementById("author-editable-intro");
  if (editIntroBtn && introBox) {
    try {
      const savedIntro = localStorage.getItem("an_nhien_author_intro_v1");
      if (savedIntro) introBox.innerHTML = savedIntro;
    } catch (e) {}

    editIntroBtn.addEventListener("click", () => {
      const isEditing = introBox.getAttribute("contenteditable") === "true";
      if (!isEditing) {
        introBox.setAttribute("contenteditable", "true");
        introBox.focus();
        editIntroBtn.textContent = "💾 Lưu lời giới thiệu";
        showToast("Bạn có thể nhập chỉnh sửa trực tiếp lời giới thiệu rồi bấm Lưu.");
      } else {
        introBox.setAttribute("contenteditable", "false");
        try {
          localStorage.setItem("an_nhien_author_intro_v1", introBox.innerHTML);
        } catch (e) {}
        editIntroBtn.textContent = "✏️ Chỉnh sửa lời giới thiệu";
        showToast("Đã lưu lời giới thiệu của tác giả Trịnh Thị An.");
      }
    });
  }
}

function initFlowerCalendar() {
  const calendarData = window.AnNhienApp.data.calendar || [];
  const plants = window.AnNhienApp.data.plants || [];
  const monthTabs = document.getElementById("calendar-month-tabs");
  const detailBox = document.getElementById("calendar-month-detail");
  const prevBtn = document.getElementById("cal-prev-month");
  const nextBtn = document.getElementById("cal-next-month");

  if (!monthTabs || !detailBox || !calendarData.length) return;

  function renderCalendar(monthNum) {
    window.AnNhienApp.state.selectedMonth = monthNum;
    monthTabs.innerHTML = "";
    calendarData.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-nav-chip" + (item.month === monthNum ? " active" : "");
      btn.style.padding = "0.45rem 0.9rem";
      btn.textContent = `Tháng ${item.month}`;
      btn.addEventListener("click", () => renderCalendar(item.month));
      monthTabs.appendChild(btn);
    });

    const current = calendarData.find(m => m.month === monthNum) || calendarData[0];
    const matchedPlants = (current.featuredPlantIds || [])
      .map(pid => plants.find(p => p.id === pid))
      .filter(Boolean);

    detailBox.innerHTML = `
      <div class="author-feature-card" style="grid-template-columns: 360px 1fr; padding: 1.75rem;">
        <div>
          <img src="${current.coverImage}" alt="${current.name}" style="width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:14px; border:2px solid var(--sun-gold);">
          <div style="margin-top:0.75rem; font-size:0.86rem; color:var(--earth-brown); background:var(--ivory-white); padding:0.65rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <strong>📌 Lưu ý sinh học:</strong> ${current.phenologyNote}
          </div>
        </div>
        <div>
          <span class="section-eyebrow">${current.seasonTag}</span>
          <h3 style="font-size:1.6rem; margin-bottom:0.5rem;">${current.name}</h3>
          <p style="margin-bottom:1rem;">${current.description}</p>
          <p style="margin-bottom:1rem;"><strong>📍 Gợi ý địa điểm thưởng lãm tại Đà Lạt:</strong> ${current.viewingSpots}</p>
          <h4 style="font-size:1.05rem; margin-bottom:0.65rem;">🌸 Các loài thực vật tiêu biểu trong tháng (bấm để mở hồ sơ khoa học):</h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            ${matchedPlants.map(p => `
              <button type="button" class="btn btn-outline-pine" style="padding:0.45rem 0.9rem; font-size:0.88rem;" data-open-plant="${p.id}">
                🌿 ${p.identification.vietnameseName} (<em>${p.identification.genus}</em>)
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    detailBox.querySelectorAll("[data-open-plant]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-open-plant");
        if (window.AnNhienSearch) window.AnNhienSearch.openPlantModal(pid);
      });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const m = window.AnNhienApp.state.selectedMonth;
      renderCalendar(m <= 1 ? 12 : m - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const m = window.AnNhienApp.state.selectedMonth;
      renderCalendar(m >= 12 ? 1 : m + 1);
    });
  }

  renderCalendar(1);
}

function initSpeciesComparison() {
  const plants = window.AnNhienApp.data.plants || [];
  const selLeft = document.getElementById("compare-select-left");
  const selRight = document.getElementById("compare-select-right");
  const tableBody = document.getElementById("compare-table-body");

  if (!selLeft || !selRight || !tableBody || !plants.length) return;

  const optionsHtml = plants.map(p =>
    `<option value="${p.id}">${p.code} – ${p.identification.vietnameseName} (${p.identification.scientificName})</option>`
  ).join("");

  selLeft.innerHTML = optionsHtml;
  selRight.innerHTML = optionsHtml;
  selLeft.value = window.AnNhienApp.state.compareLeftId;
  selRight.value = window.AnNhienApp.state.compareRightId;

  function renderComparison() {
    const p1 = plants.find(p => p.id === selLeft.value) || plants[0];
    const p2 = plants.find(p => p.id === selRight.value) || plants[1];

    const rows = [
      ["Hình ảnh & Mã hồ sơ", `
        <div style="display:flex; align-items:center; gap:0.85rem;">
          <img src="${p1.images.primary}" alt="${p1.identification.vietnameseName}" style="width:90px; height:68px; object-fit:cover; border-radius:8px; border:1px solid var(--sun-gold);">
          <div>
            <strong>${p1.identification.vietnameseName}</strong><br>
            <small>${p1.code} • ${p1.references.status}</small>
          </div>
        </div>`,
        `<div style="display:flex; align-items:center; gap:0.85rem;">
          <img src="${p2.images.primary}" alt="${p2.identification.vietnameseName}" style="width:90px; height:68px; object-fit:cover; border-radius:8px; border:1px solid var(--sun-gold);">
          <div>
            <strong>${p2.identification.vietnameseName}</strong><br>
            <small>${p2.code} • ${p2.references.status}</small>
          </div>
        </div>`
      ],
      ["Tên khoa học được chấp nhận", `<em>${p1.identification.scientificName}</em>`, `<em>${p2.identification.scientificName}</em>`],
      ["Họ thực vật (Family)", p1.identification.family, p2.identification.family],
      ["Chi thực vật (Genus)", `<em>${p1.identification.genus}</em>`, `<em>${p2.identification.genus}</em>`],
      ["Đặc điểm phân biệt quan trọng", `<strong>${p1.morphology.keyIdentification}</strong>`, `<strong>${p2.morphology.keyIdentification}</strong>`],
      ["Đặc điểm Lá", p1.morphology.leaf, p2.morphology.leaf],
      ["Đặc điểm Hoa", p1.morphology.flower, p2.morphology.flower],
      ["Đặc điểm Thân", p1.morphology.stem, p2.morphology.stem],
      ["Điều kiện ánh sáng", p1.biology.light, p2.biology.light],
      ["Nhu cầu nước", p1.biology.water, p2.biology.water],
      ["Mùa hoa / Mùa vụ tại Đà Lạt", p1.biology.bloomSeason, p2.biology.bloomSeason],
      ["Cách chăm sóc cốt lõi", `${p1.care.watering} ${p1.care.substrate || p1.care.soilPrep}`, `${p2.care.watering} ${p2.care.substrate || p2.care.soilPrep}`]
    ];

    tableBody.innerHTML = rows.map(([label, v1, v2]) => `
      <tr>
        <th>${label}</th>
        <td>${v1 || "Chưa có dữ liệu"}</td>
        <td>${v2 || "Chưa có dữ liệu"}</td>
      </tr>
    `).join("");
  }

  selLeft.addEventListener("change", renderComparison);
  selRight.addEventListener("change", renderComparison);
  renderComparison();
}

function initCareAssistant() {
  const plants = window.AnNhienApp.data.plants || [];
  const selectEl = document.getElementById("care-plant-select");
  const formEl = document.getElementById("care-assistant-form");
  const resultEl = document.getElementById("care-assistant-result");

  if (!selectEl || !formEl || !resultEl || !plants.length) return;

  selectEl.innerHTML = plants.map(p =>
    `<option value="${p.id}">${p.identification.vietnameseName} (${p.identification.scientificName})</option>`
  ).join("");

  function renderCareGuide() {
    const pid = selectEl.value;
    const plant = plants.find(p => p.id === pid) || plants[0];
    const location = document.getElementById("care-location-input")?.value || "Đà Lạt (Cao nguyên ~1.500m)";
    const env = document.getElementById("care-env-select")?.value || "Ngoài trời / Sân vườn";
    const mode = document.getElementById("care-pot-select")?.value || "Trồng chậu";
    const status = document.getElementById("care-status-select")?.value || "Đang sinh trưởng bình thường";

    let contextualNote = "";
    if (!location.toLowerCase().includes("đà lạt") && !location.toLowerCase().includes("da lat") && !location.toLowerCase().includes("lâm đồng")) {
      contextualNote = `Bạn đang trồng tại <strong>${location}</strong> (khác với biên độ nhiệt lạnh 15–22°C của Đà Lạt). Cần ưu tiên đặt cây nơi thoáng gió, che lưới giảm nhiệt buổi trưa và tưới mát vào sáng sớm.`;
    } else {
      contextualNote = `Điều kiện khí hậu tại <strong>${location}</strong> rất thuận lợi cho nhịp sinh học tự nhiên của loài <em>${plant.identification.scientificName}</em>.`;
    }

    if (mode.includes("chậu")) {
      contextualNote += " Vì trồng trong chậu nên bộ rễ giới hạn, cần kiểm tra lỗ thoát nước đáy chậu và thay giá thể định kỳ 12–18 tháng.";
    }

    resultEl.innerHTML = `
      <div class="profile-section-card" style="background:var(--ivory-white); border:2px solid var(--sun-gold);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <span class="badge-pill badge-verified">${plant.references.status}</span>
            <h3 style="margin:0.35rem 0 0;">Hướng dẫn chăm sóc: ${plant.identification.vietnameseName}</h3>
            <div style="font-style:italic; color:var(--earth-brown);">${plant.identification.scientificName}</div>
          </div>
          <button type="button" class="btn btn-outline-pine" id="care-open-full-profile">📖 Mở hồ sơ khoa học đầy đủ</button>
        </div>

        <div class="ai-status-banner" style="background:var(--leaf-light); border-color:var(--pine-green);">
          <strong>🌿 Đánh giá điều kiện trồng hiện tại (${env} • ${mode} • ${status}):</strong><br>
          ${contextualNote}
        </div>

        <div class="profile-grid-2">
          <div class="kv-item"><span class="kv-label">1. Ánh sáng</span><span class="kv-value">${plant.biology.light}</span></div>
          <div class="kv-item"><span class="kv-label">2. Nhiệt độ</span><span class="kv-value">${plant.biology.temperature}</span></div>
          <div class="kv-item"><span class="kv-label">3. Độ ẩm</span><span class="kv-value">${plant.biology.humidity}</span></div>
          <div class="kv-item"><span class="kv-label">4. Nước tưới</span><span class="kv-value">${plant.care.watering}</span></div>
          <div class="kv-item"><span class="kv-label">5. Giá thể & Đất</span><span class="kv-value">${plant.care.soilPrep}</span></div>
          <div class="kv-item"><span class="kv-label">6. Dinh dưỡng</span><span class="kv-value">${plant.care.fertilizing}</span></div>
          <div class="kv-item"><span class="kv-label">7. Chọn & Thay chậu</span><span class="kv-value">${plant.care.potSelection}</span></div>
          <div class="kv-item"><span class="kv-label">8. Cắt tỉa</span><span class="kv-value">${plant.care.pruning}</span></div>
          <div class="kv-item"><span class="kv-label">9. Nhân giống</span><span class="kv-value">${plant.care.propagation}</span></div>
          <div class="kv-item"><span class="kv-label">10. Chăm sóc theo mùa</span><span class="kv-value">${plant.care.seasonalCare}</span></div>
          <div class="kv-item"><span class="kv-label">11. Xử lý vấn đề thường gặp</span><span class="kv-value">Vàng lá: ${plant.issues.yellowLeaves} | Sâu bệnh: ${plant.issues.pests}</span></div>
          <div class="kv-item"><span class="kv-label">12. Theo dõi phát triển</span><span class="kv-value">Khi ra nụ: ${plant.care.budCare} | Sau hoa: ${plant.care.postBloomCare}</span></div>
        </div>

        <p style="margin-top:1rem; font-size:0.86rem; color:var(--muted-text);">
          ⚠️ <em>Lưu ý khoa học:</em> Hướng dẫn trên dựa trên dữ liệu sinh thái của loài <strong>${plant.identification.vietnameseName}</strong>. Hệ thống không tự động kê đơn thuốc bảo vệ thực vật hóa học khi chưa có chẩn đoán mẫu bệnh thực tế.
        </p>
      </div>
    `;

    const openBtn = document.getElementById("care-open-full-profile");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (window.AnNhienSearch) window.AnNhienSearch.openPlantModal(plant.id);
      });
    }
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    renderCareGuide();
    showToast("Đã cập nhật phác đồ chăm sóc phù hợp với điều kiện trồng của bạn.");
  });

  selectEl.addEventListener("change", renderCareGuide);
  renderCareGuide();
}

function initAdminJsonTool() {
  const genBtn = document.getElementById("admin-generate-json-btn");
  const validateBtn = document.getElementById("admin-validate-json-btn");
  const downloadBtn = document.getElementById("admin-download-json-btn");
  const outputArea = document.getElementById("admin-json-output");
  const statusEl = document.getElementById("admin-json-status");

  if (!genBtn || !outputArea) return;

  genBtn.addEventListener("click", () => {
    const vn = document.getElementById("admin-vn-name")?.value.trim() || "Tên loài mới";
    const sci = document.getElementById("admin-sci-name")?.value.trim() || "Genus species L.";
    const fam = document.getElementById("admin-family")?.value.trim() || "Asteraceae";
    const cat = document.getElementById("admin-category")?.value || "hoa-da-lat";
    const status = document.getElementById("admin-status")?.value || "Đang biên tập";
    const slug = vn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newRecord = {
      id: slug || "loai-moi",
      code: "AN-101",
      categoryId: cat,
      identification: {
        vietnameseName: vn,
        localName: vn,
        englishName: "Đang cập nhật",
        scientificName: sci,
        synonyms: "Đang cập nhật",
        family: fam,
        genus: sci.split(" ")[0] || "Genus",
        taxonomicRank: "Loài (Species)",
        originAndDistribution: "Đang cập nhật",
        dalatConnection: "Được ghi nhận và sưu tầm trong khu vườn thực vật Đà Lạt."
      },
      references: {
        scientificSources: [
          { title: "Plants of the World Online (POWO)", url: "https://powo.science.kew.org/" }
        ],
        verificationDate: new Date().toISOString().slice(0, 10),
        status: status
      }
    };

    outputArea.value = JSON.stringify(newRecord, null, 2);
    if (statusEl) {
      statusEl.textContent = "✅ Đã tạo cấu trúc JSON hợp lệ. Lưu ý: Trang tĩnh này không tự động ghi lên GitHub; hãy tải file hoặc sao chép vào data/plants.json.";
    }
  });

  if (validateBtn) {
    validateBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(outputArea.value);
        if (!parsed.id || !parsed.identification || !parsed.identification.scientificName) {
          throw new Error("Thiếu trường bắt buộc (id hoặc identification.scientificName).");
        }
        if (statusEl) statusEl.textContent = "✅ Kiểm định JSON thành công: Cú pháp và cấu trúc hồ sơ hoàn toàn hợp lệ!";
        showToast("JSON hợp lệ!");
      } catch (err) {
        if (statusEl) statusEl.textContent = "❌ Lỗi cú pháp JSON: " + err.message;
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!outputArea.value.trim()) {
        genBtn.click();
      }
      const blob = new Blob([outputArea.value], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ho-so-thuc-vat-moi.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống tệp ho-so-thuc-vat-moi.json");
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadBotanicalDatabases();
  initHeroSlideshow();
  initNavigationAndQuickMenu();
  if (window.AnNhienSearch) window.AnNhienSearch.init();
  if (window.AnNhienEncyclopedia) window.AnNhienEncyclopedia.init();
  if (window.AnNhienGallery) window.AnNhienGallery.init();
  if (window.AnNhienPlantAI) window.AnNhienPlantAI.init();
  if (window.AnNhienGardenDiary) window.AnNhienGardenDiary.init();
  if (window.AnNhienSpeech) window.AnNhienSpeech.init();
  if (window.AnNhienPrint) window.AnNhienPrint.init();
  initFlowerCalendar();
  initSpeciesComparison();
  initCareAssistant();
  initAdminJsonTool();
});
