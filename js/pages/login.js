(function () {
  const videoSources = ["assets/vid1.mp4", "assets/vid2.mp4", "assets/vid3.mp4"];

  window.renderLoginPage = function () {
    const mode = appState.ui.loginMode || "login";
    const title = mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد";
    const toggleLabel = mode === "login" ? "أنشئ حساباً جديداً" : "سجل دخولك الآن";
    const toggleHint = mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟";
    const error = appState.ui.loginError;

    // Use a placeholder empty space because placeholder-shown pseudo-class is used for floating labels
    return `
      <div class="royal-login-wrap" id="royal-login-wrap">
        <div id="royal-glow" class="royal-mouse-glow"></div>
        <div class="royal-islamic-pattern"></div>
        <div id="zikr-particles-container" class="zikr-particles-container"></div>
        
        <div class="royal-glass-card royal-anim-card">
          <div class="text-center mb-5">
            <div style="font-family:'Amiri', serif; font-size:32px; color:#D4AF37; margin-bottom:12px; font-weight:700; text-shadow: 0 4px 15px rgba(212,175,55,0.3);" class="royal-anim-item delay-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h2 style="font-size:24px; font-weight:800; color:#fff;" class="royal-anim-item delay-2">${title}</h2>
            <p style="color:#A0AEC0; font-size:14px; margin-top:8px; font-weight:500;" class="royal-anim-item delay-2">رفيق المعلم - Royal Islamic Futurism</p>
          </div>

          ${error ? `<div class="login-error-box mb-4 royal-anim-item delay-3">⚠️ ${error}</div>` : ""}

          <form id="login-form" class="d-grid gap-4 mt-2">
            <div class="royal-input-group royal-anim-item delay-3">
              <input id="login-email" type="email" class="royal-input" placeholder=" " required dir="ltr" />
              <label class="royal-floating-label">البريد الإلكتروني</label>
              <div class="royal-focus-line"></div>
            </div>

            <div class="royal-input-group royal-anim-item delay-4">
              <input id="login-password" type="password" class="royal-input" placeholder=" " required dir="ltr" style="padding-left: 45px;" />
              <label class="royal-floating-label">كلمة المرور</label>
              <div class="royal-focus-line"></div>
              <button type="button" id="toggle-password" class="password-toggle-btn">
                <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>

            <button type="submit" class="royal-btn-gold mt-3 royal-anim-item delay-5">
              <span class="btn-shimmer"></span>
              ${mode === "login" ? "دخول" : "إنشاء حساب"}
            </button>
          </form>

          <div class="royal-divider royal-anim-item delay-6">
            <span>أو الدخول باستخدام</span>
          </div>

          <button id="google-login" type="button" class="royal-btn-outline royal-anim-item delay-6 w-100">
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
            <span style="margin-right: 10px; font-family:'Tajawal', sans-serif;">Google</span>
          </button>

          <div class="text-center mt-5 royal-anim-item delay-7" style="font-size:14px;color:#A0AEC0;">
            ${toggleHint}
            <button id="toggle-login" type="button" class="btn btn-link p-0 royal-link">${toggleLabel}</button>
          </div>
        </div>
      </div>
    `;
  };

  window.initLoginPage = function () {
    const form = document.getElementById("login-form");
    const toggleBtn = document.getElementById("toggle-login");
    const googleBtn = document.getElementById("google-login");

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        appState.ui.loginError = "";
        try {
          if (appState.ui.loginMode === "signup") {
            await authModule.signUpWithEmail(email, password);
          } else {
            await authModule.loginWithEmail(email, password);
          }
        } catch (err) {
          appState.ui.loginError = err;
          router.render();
        }
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        appState.ui.loginMode = appState.ui.loginMode === "login" ? "signup" : "login";
        appState.ui.loginError = "";
        router.render();
      });
    }

    if (googleBtn) {
      googleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        appState.ui.loginError = "";
        try {
          await authModule.loginWithGoogle();
        } catch (err) {
          appState.ui.loginError = err;
          router.render();
        }
      });
    }

    initRoyalEffects();
  };

  function initRoyalEffects() {
    const wrap = document.getElementById("royal-login-wrap");
    const glow = document.getElementById("royal-glow");
    
    // Smooth mouse glow effect
    if (wrap && glow) {
      let isMouseMoving = false;
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      
      wrap.addEventListener("mousemove", (e) => {
        isMouseMoving = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        requestAnimationFrame(() => {
          glow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });
      });
    }

    // Spiritual Particle System (Zikr)
    const zikrContainer = document.getElementById("zikr-particles-container");
    if (zikrContainer && !window._zikrInterval) {
      const words = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "لَا إِلَهَ إِلَّا اللَّهُ", "اللَّهُ أَكْبَرُ", "أَسْتَغْفِرُ اللَّهَ"];
      
      window._zikrInterval = setInterval(() => {
        if (!document.getElementById("zikr-particles-container")) {
          clearInterval(window._zikrInterval);
          window._zikrInterval = null;
          return;
        }

        const particle = document.createElement("div");
        particle.className = "zikr-particle";
        particle.innerText = words[Math.floor(Math.random() * words.length)];
        
        // Random horizontal positioning
        particle.style.left = `${Math.random() * 80 + 10}%`; // Keep away from exact edges
        
        // Random size and depth
        const size = Math.random() * 16 + 18; // 18px to 34px
        particle.style.fontSize = `${size}px`;
        
        // Random duration to make it feel organic
        const duration = Math.random() * 4 + 8; // 8s to 12s
        particle.style.animationDuration = `${duration}s`;
        
        zikrContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), duration * 1000);
      }, window._zikrSpeed || 2000); // Dynamic speed
    }

    // Auto-focus email input after animation completes to show off the glowing line
    setTimeout(() => {
      const emailInput = document.getElementById("login-email");
      if (emailInput) emailInput.focus();
    }, 1200);

    // Password Toggle Logic
    const togglePasswordBtn = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("login-password");
    const eyeIcon = document.getElementById("eye-icon");
    
    if (togglePasswordBtn && passwordInput && eyeIcon) {
      togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        
        if (isPassword) {
          // Eye off icon
          eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
          eyeIcon.setAttribute('stroke', '#D4AF37');
        } else {
          // Eye icon
          eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
          eyeIcon.setAttribute('stroke', '#A0AEC0');
        }
      });
    }

    // Input-reactive Zikr (Speeds up when typing)
    const inputs = document.querySelectorAll(".royal-input");
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        if (window._zikrInterval) {
          clearInterval(window._zikrInterval);
          window._zikrInterval = null;
        }
        window._zikrSpeed = 800; // Fast particles when typing
        initRoyalEffects(); // Restart interval with new speed
        
        clearTimeout(window._typingTimeout);
        window._typingTimeout = setTimeout(() => {
          if (window._zikrInterval) {
            clearInterval(window._zikrInterval);
            window._zikrInterval = null;
          }
          window._zikrSpeed = 2000; // Normal slow particles
          initRoyalEffects();
        }, 1000);
      });
    });
  }

  function initLoginVideos() {
    const videos = Array.from(document.querySelectorAll(".login-video"));
    if (!videos.length) return;

    let current = 0;
    const activate = (idx) => {
      videos.forEach((v, i) => {
        if (i === idx) {
          v.classList.add("active");
          v.play().catch(() => { });
        } else {
          v.classList.remove("active");
          v.pause();
          v.currentTime = 0;
        }
      });
    };

    activate(current);

    videos.forEach((video, idx) => {
      video.onended = () => {
        current = (idx + 1) % videos.length;
        activate(current);
      };
    });
  }
})();
