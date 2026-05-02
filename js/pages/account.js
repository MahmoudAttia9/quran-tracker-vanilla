(function () {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ALGORITHMIC TASHKEEL PARSER - HYPER-PREMIUM TYPOGRAPHY ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  function renderTashkeelName(name) {
    if (!name) return "المعلم";
    
    // Advanced Regex: Captures all Arabic diacritics (Tashkeel marks)
    // Unicode Range: U+064B to U+065F (Fatha, Damma, Kasra, Sukun, Shadda, etc.)
    const tashkeelRegex = /[\u064B-\u065F\u0670]/g;
    
    let html = "";
    let buffer = "";
    
    for (let i = 0; i < name.length; i++) {
      const char = name[i];
      
      if (tashkeelRegex.test(char)) {
        // If we have accumulated base letters, wrap them first
        if (buffer) {
          html += `<span class="base-letter">${buffer}</span>`;
          buffer = "";
        }
        // Wrap the diacritic in gold-accented span
        html += `<span class="tashkeel">${char}</span>`;
      } else {
        // Accumulate base letters
        buffer += char;
      }
    }
    
    // Flush remaining buffer
    if (buffer) {
      html += `<span class="base-letter">${buffer}</span>`;
    }
    
    return html;
  }

  window.renderAccountPage = function () {
    const user = appState.user;
    const email = user ? user.email : "";
    const teacherName = appState.settings.teacherName || "";
    const initial = teacherName
      ? teacherName.charAt(0)
      : email
        ? email.charAt(0).toUpperCase()
        : "؟";

    return `
      <div class="account-page">
        <!-- VIP Hero Cover -->
        <div class="account-hero-cover exec-animate" style="--stagger: 1;">
          <div class="account-hero-overlay"></div>
        </div>

        <!-- Overlapping Profile Section -->
        <div class="account-profile-container">
          
          <div class="account-header exec-animate" style="--stagger: 2;">
            <div class="account-avatar avatar-glow">${initial}</div>
            <div class="account-greeting">
              <div class="account-welcome">مرحباً بك 👋</div>
              <div class="account-name-display tashkeel-emerald">${renderTashkeelName(teacherName || "المعلم")}</div>
            </div>
          </div>

          <!-- Dynamic Zikr Micro-system -->
          <div class="zikr-micro-bar exec-animate" style="--stagger: 3;">
            <div id="dynamic-zikr-text" class="zikr-text"></div>
          </div>

          <!-- Account Info Card -->
          <div class="card-soft account-card mt-4 exec-animate" style="--stagger: 4;">
            <h3 class="account-section-title">👤 بيانات الحساب</h3>

            <div class="mb-4">
              <div class="account-email-display">
                <span class="account-email-icon">📧</span>
                <span dir="ltr">${email}</span>
              </div>
            </div>

            <div class="form-group mb-4 exec-animate" style="--stagger: 5;">
              <input
                id="account-teacher-name"
                class="form-control account-custom-input"
                value="${teacherName}"
                placeholder=" "
              />
              <label class="form-label" for="account-teacher-name">الاسم الكريم بالتشكيل (مثال: مُحَمَّد)</label>
              <div class="account-input-line"></div>
              <div class="account-hint">هذا الاسم يظهر في الترحيب والتقارير والشهادات</div>
            </div>

            <div class="form-group mb-4 exec-animate" style="--stagger: 6;">
              <input
                id="account-teacher-phone"
                class="form-control account-custom-input"
                type="tel"
                dir="ltr"
                style="text-align: right;"
                value="${appState.settings.teacherPhone || ""}"
                placeholder=" "
              />
              <label class="form-label" for="account-teacher-phone">رقم الهاتف (اختياري)</label>
              <div class="account-input-line"></div>
              <div class="account-hint">سيظهر هذا الرقم في تقارير المتابعة لتسهيل تواصل أولياء الأمور</div>
            </div>

            <button class="btn account-save-btn exec-animate" style="--stagger: 7;" onclick="saveAccountName()">
              💾 حفظ التحديثات
            </button>
          </div>

          <!-- Danger Zone -->
          <div class="account-logout-card mt-3 exec-animate" style="--stagger: 8;">
            <div class="account-logout-content">
              <div>
                <div class="account-logout-title">تسجيل الخروج</div>
                <div class="account-logout-hint">سيتم إنهاء الجلسة الحالية بشكل آمن</div>
              </div>
              <button class="account-logout-btn" onclick="handleLogout()">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.saveAccountName = async function () {
    const nameInput = document.getElementById("account-teacher-name");
    const phoneInput = document.getElementById("account-teacher-phone");
    if (!nameInput || !phoneInput) return;

    const newName = nameInput.value.trim();
    const newPhone = phoneInput.value.trim();
    
    if (!newName) {
      showToast("اكتب اسمك أولاً");
      return;
    }

    try {
      await dbModule.saveSettings({ 
        teacherName: newName,
        teacherPhone: newPhone
      });
      showToast("✅ تم حفظ البيانات بنجاح");
      // Re-render to update the visual layout immediately
      setTimeout(() => router.render(), 300);
    } catch (err) {
      showToast("❌ خطأ أثناء حفظ البيانات");
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. AMBIENT ZIKR ENGINE - SOPHISTICATED STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  window.initAccountPage = function () {
    const zikrElement = document.getElementById("dynamic-zikr-text");
    if (!zikrElement) return;

    // Curated Zikr Array with Full Tashkeel
    const zikrs = [
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      "الْحَمْدُ لِلَّهِ حَمْداً كَثِيراً",
      "لَا إِلَهَ إِلَّا اللَّهُ",
      "اللَّهُ أَكْبَرُ"
    ];
    let zikrIndex = 0;

    function cycleZikr() {
      // Phase 1: Sophisticated Fade Out (2s)
      zikrElement.style.opacity = "0";
      zikrElement.style.filter = "blur(10px)";
      zikrElement.style.transform = "translateY(15px) translateZ(0)";
      
      setTimeout(() => {
        // Phase 2: Content Swap
        zikrElement.innerText = zikrs[zikrIndex];
        zikrIndex = (zikrIndex + 1) % zikrs.length;
        
        // Phase 3: Elegant Fade In (2s)
        zikrElement.style.opacity = "0.7";
        zikrElement.style.filter = "blur(0px)";
        zikrElement.style.transform = "translateY(0) translateZ(0)";
      }, 2000);
    }

    // Initial Display
    zikrElement.innerText = zikrs[0];
    setTimeout(() => {
      zikrElement.style.opacity = "0.7";
      zikrElement.style.filter = "blur(0px)";
      zikrElement.style.transform = "translateY(0) translateZ(0)";
    }, 500);

    // Cycle every 8 seconds (2s fade out + 4s hold + 2s fade in)
    window.accountZikrInterval = setInterval(cycleZikr, 8000);
  };
})();
