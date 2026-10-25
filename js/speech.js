/**
 * AN NHIÊN – BÁCH KHOA TOÀN THƯ THỰC VẬT ĐÀ LẠT
 * js/speech.js – NGHE BÁCH KHOA THỰC VẬT BẰNG GIỌNG NÓI TIẾNG VIỆT (Phần XIII)
 * Sử dụng Web Speech API (window.speechSynthesis), kiểm tra trung thực khả năng hỗ trợ
 * của trình duyệt, cho phép Đọc, Tạm dừng, Tiếp tục, Dừng, Chọn tốc độ và Chọn giọng.
 */

window.AnNhienSpeech = {
  state: {
    supported: false,
    voices: [],
    selectedVoiceURI: "",
    rate: 1.0
  },

  init() {
    this.state.supported = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);
    const statusEl = document.getElementById("tts-global-status");
    const voiceSelect = document.getElementById("tts-voice-select");
    const rateSelect = document.getElementById("tts-rate-select");

    if (!this.state.supported) {
      if (statusEl) {
        statusEl.textContent = "⚠️ Trình duyệt hiện tại không hỗ trợ Web Speech API. Vui lòng mở bằng Google Chrome, Microsoft Edge hoặc Safari để nghe giọng đọc tiếng Việt.";
      }
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices() || [];
      this.state.voices = allVoices;
      const viVoices = allVoices.filter(v => v.lang.toLowerCase().includes("vi"));
      const listToShow = viVoices.length ? viVoices : allVoices.slice(0, 10);

      if (voiceSelect) {
        if (listToShow.length) {
          voiceSelect.innerHTML = listToShow.map(v =>
            `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`
          ).join("");
          this.state.selectedVoiceURI = listToShow[0].voiceURI;
        } else {
          voiceSelect.innerHTML = `<option value="">Giọng mặc định của hệ thống (vi-VN)</option>`;
        }
      }

      if (statusEl) {
        statusEl.textContent = viVoices.length
          ? `🟢 Sẵn sàng đọc Tiếng Việt (${viVoices.length} giọng tiếng Việt khả dụng trên thiết bị).`
          : `🟡 Trình duyệt hỗ trợ đọc giọng nói (Sử dụng bộ phát âm mặc định của hệ điều hành).`;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    if (voiceSelect) {
      voiceSelect.addEventListener("change", (e) => {
        this.state.selectedVoiceURI = e.target.value;
      });
    }

    if (rateSelect) {
      rateSelect.addEventListener("change", (e) => {
        this.state.rate = parseFloat(e.target.value) || 1.0;
      });
    }

    document.getElementById("tts-btn-play-sample")?.addEventListener("click", () => {
      const scope = document.getElementById("tts-scope-select")?.value || "intro";
      const plants = window.AnNhienApp.data.plants || [];
      if (scope === "intro") {
        this.speakText("Chào mừng bạn đến với An Nhiên – Bách khoa toàn thư thực vật Đà Lạt. Mỗi loài cây một câu chuyện, mỗi đóa hoa một miền thương nhớ. Tác giả và người sáng lập: Trịnh Thị An – An Nhiên AI.");
      } else if (scope === "chapter1") {
        const ch1 = plants.filter(p => p.volumeNumber === 1).slice(0, 5).map(p => `${p.identification.vietnameseName}, tên khoa học ${p.identification.scientificName}. ${p.identification.dalatConnection}`).join(" ");
        this.speakText(`Đọc Tập 1: Những mùa hoa Đà Lạt. ${ch1}`);
      } else {
        const p = plants[0];
        if (p) {
          this.speakText(`Hồ sơ loài ${p.identification.vietnameseName}, tên khoa học ${p.identification.scientificName}. ${p.morphology.keyIdentification}. Hướng dẫn chăm sóc: ${p.care.watering}`);
        }
      }
    });

    document.getElementById("tts-btn-pause")?.addEventListener("click", () => this.pause());
    document.getElementById("tts-btn-resume")?.addEventListener("click", () => this.resume());
    document.getElementById("tts-btn-stop")?.addEventListener("click", () => this.stop());
  },

  speakText(text) {
    if (!this.state.supported) {
      window.showToast("Thiết bị hoặc trình duyệt này không hỗ trợ bộ đọc giọng nói Web Speech API.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "vi-VN";
      utter.rate = this.state.rate || 1.0;
      if (this.state.selectedVoiceURI && this.state.voices.length) {
        const match = this.state.voices.find(v => v.voiceURI === this.state.selectedVoiceURI);
        if (match) utter.voice = match;
      }
      window.speechSynthesis.speak(utter);
      window.showToast("🔊 Đang đọc nội dung Bách khoa thực vật...");
    } catch (err) {
      window.showToast("Không thể kích hoạt giọng đọc trên trình duyệt hiện tại.");
    }
  },

  pause() {
    if (this.state.supported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.showToast("⏸ Đã tạm dừng giọng đọc.");
    }
  },

  resume() {
    if (this.state.supported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      window.showToast("▶ Tiếp tục đọc nội dung.");
    }
  },

  stop() {
    if (this.state.supported) {
      window.speechSynthesis.cancel();
    }
  }
};
