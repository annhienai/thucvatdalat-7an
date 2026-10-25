/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/print.js – XUẤT TÀI LIỆU PDF & IN ẤN KHỔ A4 (Phần XIV)
 * Hỗ trợ:
 * 1. Xuất PDF một loài thực vật.
 * 2. Xuất PDF một nhóm thực vật (Tập sách).
 * 3. Xuất tuyển tập các loài được chọn.
 * 4. Hai định dạng trình bày: PDF Nghệ thuật (ảnh lớn) & PDF Học tập tiết kiệm mực in.
 * Đầy đủ: Trang bìa, Mục lục, Tên tác giả Trịnh Thị An, Nội dung khoa học, Hình ảnh, Chú thích, Nguồn tham khảo, Số trang, Chữ ký thương hiệu.
 */

window.AnNhienPrint = {
  init() {
    this.updateCounter();
    document.getElementById("btn-print-selected-art")?.addEventListener("click", () => {
      const ids = Array.from(window.AnNhienApp.state.selectedForPrint);
      this.renderAndPrint(ids, "Tuyển tập Hồ sơ Thực vật Đà Lạt Chọn lọc", false);
    });
    document.getElementById("btn-print-selected-eco")?.addEventListener("click", () => {
      const ids = Array.from(window.AnNhienApp.state.selectedForPrint);
      this.renderAndPrint(ids, "Tài liệu Học tập & Tra cứu Thực vật Đà Lạt (Tiết kiệm mực)", true);
    });
    document.getElementById("btn-print-group")?.addEventListener("click", () => {
      const catId = document.getElementById("print-group-select")?.value || "hoa-da-lat";
      const cats = window.AnNhienApp.data.categories || [];
      const cat = cats.find(c => c.id === catId);
      const plants = (window.AnNhienApp.data.plants || []).filter(p => p.categoryId === catId);
      this.renderAndPrint(plants.map(p => p.id), `Chuyên khảo Nhóm: ${cat ? cat.name : catId}`, false);
    });
  },

  updateCounter() {
    const el = document.getElementById("print-selected-counter");
    if (el) {
      el.textContent = `${window.AnNhienApp.state.selectedForPrint.size} loài đã chọn`;
    }
  },

  printSinglePlant(plantId, ecoMode = false) {
    const plants = window.AnNhienApp.data.plants || [];
    const p = plants.find(x => x.id === plantId);
    const title = p ? `Hồ sơ Khoa học: ${p.identification.vietnameseName} (${p.identification.scientificName})` : "Hồ sơ Khoa học Thực vật";
    this.renderAndPrint([plantId], title, ecoMode);
  },

  renderAndPrint(plantIds, documentTitle, ecoMode = false) {
    const plants = window.AnNhienApp.data.plants || [];
    const selected = plantIds.map(id => plants.find(p => p.id === id)).filter(Boolean);
    if (!selected.length) {
      window.showToast("Vui lòng chọn ít nhất 1 loài thực vật để xuất PDF.");
      return;
    }

    const sheet = document.getElementById("print-area-sheet");
    if (!sheet) return;

    const today = new Date().toISOString().slice(0, 10);

    sheet.innerHTML = `
      <!-- TRANG BÌA KHỔ A4 -->
      <div class="print-cover-page">
        <p style="letter-spacing:2px; text-transform:uppercase; font-size:10pt; color:#715641;">AN NHIEN – DALAT BOTANICAL ENCYCLOPEDIA & AI GARDEN</p>
        <h1 style="font-size:22pt; color:#244A3B; margin:12px 0;">AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT</h1>
        <p style="font-style:italic; font-size:12pt; color:#715641;">“Mỗi loài cây một câu chuyện – Mỗi đóa hoa một miền thương nhớ.”</p>
        <hr style="border:none; border-top:2px solid #D9BD78; margin:18px auto; width:60%;">
        <h2 style="font-size:16pt; color:#183529; margin:16px 0;">${documentTitle}</h2>
        <p><strong>Chế độ bản in:</strong> ${ecoMode ? "PDF Học tập tiết kiệm mực in (Khổ A4)" : "PDF Nghệ thuật Khoa học (Khổ A4)"}</p>
        <p><strong>Tác giả & Người sáng lập:</strong> TRỊNH THỊ AN – Thương hiệu: AN NHIÊN AI (TTA)</p>
        <p><strong>Ngày xuất bản tài liệu:</strong> ${today} • <strong>Tổng số hồ sơ:</strong> ${selected.length} loài</p>

        <!-- MỤC LỤC -->
        <div style="text-align:left; margin-top:24px; border-top:1px solid #ccc; padding-top:12px;">
          <h3 style="font-size:13pt;">MỤC LỤC HỒ SƠ KHOA HỌC</h3>
          <ol style="columns: 2; font-size:10.5pt; line-height:1.6;">
            ${selected.map((p, i) => `<li><strong>${p.identification.vietnameseName}</strong> (<em>${p.identification.scientificName}</em>) — Mã ${p.code} [Trang ${i + 2}]</li>`).join("")}
          </ol>
        </div>

        <div style="margin-top:28px; font-size:10pt; color:#444;">
          Chữ ký thương hiệu: <strong>Trịnh Thị An – An Nhiên AI (TTA)</strong> | ĐT/Zalo: 0834 133 344
        </div>
      </div>

      <!-- CÁC TRANG HỒ SƠ KHOA HỌC -->
      ${selected.map((p, idx) => `
        <div class="print-species-page">
          <div style="display:flex; justify-content:space-between; border-bottom:2px solid #244A3B; padding-bottom:6px; margin-bottom:10px; font-size:9.5pt;">
            <span><strong>AN NHIÊN – BÁCH KHOA THỰC VẬT ĐÀ LẠT</strong> • ${p.categoryName}</span>
            <span>Mã hồ sơ: <strong>${p.code}</strong> • Trang ${idx + 2} / ${selected.length + 1}</span>
          </div>

          <div style="display:flex; gap:16px; align-items:flex-start; margin-bottom:10px;">
            <div style="flex:1;">
              <h2 style="margin:0 0 4px; font-size:16pt; color:#244A3B;">${idx + 1}. ${p.identification.vietnameseName}</h2>
              <p style="margin:0 0 6px; font-style:italic; font-size:11.5pt;">Tên khoa học chấp nhận: <strong>${p.identification.scientificName}</strong> (${p.identification.family})</p>
              <p style="margin:0; font-size:10pt;"><strong>Tên địa phương:</strong> ${p.identification.localName} | <strong>Tên tiếng Anh:</strong> ${p.identification.englishName}</p>
              <p style="margin:4px 0 0; font-size:10pt;"><strong>Nguồn gốc & Phân bố:</strong> ${p.identification.originAndDistribution}</p>
            </div>
            <div style="width:${ecoMode ? "110px" : "180px"}; text-align:center;">
              <img src="${p.images.primary}" alt="${p.identification.vietnameseName}" class="print-art-image" style="width:100%; border-radius:6px; border:1px solid #999;">
              <div style="font-size:8pt; color:#555; margin-top:3px;">${p.identification.vietnameseName} (${p.code})</div>
            </div>
          </div>

          <p style="font-size:10.5pt; margin:6px 0;"><strong>• Mối liên hệ với Đà Lạt:</strong> ${p.identification.dalatConnection}</p>
          <p style="font-size:10.5pt; margin:6px 0;"><strong>• Đặc điểm hình thái nhận diện:</strong> ${p.morphology.keyIdentification} <em>Lá:</em> ${p.morphology.leaf} <em>Hoa:</em> ${p.morphology.flower}</p>
          <p style="font-size:10.5pt; margin:6px 0;"><strong>• Sinh học & Mùa hoa:</strong> Ánh sáng: ${p.biology.light} | Nước: ${p.biology.water} | Mùa hoa: ${p.biology.bloomSeason} | Giá thể: ${p.biology.substrate}</p>
          <p style="font-size:10.5pt; margin:6px 0;"><strong>• Kỹ thuật trồng & chăm sóc:</strong> ${p.care.seedlingSelection} ${p.care.watering} ${p.care.fertilizing}</p>
          <p style="font-size:10.5pt; margin:6px 0;"><strong>• Lưu ý vấn đề thường gặp & Bảo tồn:</strong> ${p.issues.yellowLeaves} | Bảo tồn: ${p.conservation.status}</p>
          <p style="font-size:9.5pt; color:#333; margin:6px 0;">
            <strong>• Nguồn tham khảo & Kiểm chứng:</strong> Trạng thái [${p.references.status}] – Ngày kiểm chứng: ${p.references.verificationDate} – Đối chiếu POWO (powo.science.kew.org), WFO (worldfloraonline.org), IPNI & GBIF.
          </p>
          <div style="font-size:8.5pt; text-align:right; color:#555; margin-top:6px;">
            Biên soạn & Lưu trữ: <strong>Trịnh Thị An – An Nhiên AI (TTA)</strong>
          </div>
        </div>
      `).join("")}
    `;

    document.body.classList.add("print-mode-active");
    if (ecoMode) {
      document.body.classList.add("print-eco-mode");
    } else {
      document.body.classList.remove("print-eco-mode");
    }

    window.showToast("Đang mở hộp thoại In / Lưu PDF khổ A4 của trình duyệt...");
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove("print-mode-active", "print-eco-mode");
      }, 600);
    }, 250);
  }
};
