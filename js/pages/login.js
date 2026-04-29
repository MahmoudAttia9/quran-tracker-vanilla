(function () {
  const videoSources = ["assets/vid1.mp4", "assets/vid2.mp4", "assets/vid3.mp4"];

  window.renderLoginPage = function () {
    const mode = appState.ui.loginMode || "login";
    const title = mode === "login" ? "تسجيل الدخول لحسابك" : "إنشاء حساب جديد";
    const toggleLabel = mode === "login" ? "أنشئ حساباً" : "سجل دخولك";
    const toggleHint = mode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟";
    const error = appState.ui.loginError;

    return `
      <div class="login-wrap">
        ${videoSources
          .map(
            (src, idx) =>
              `<video class="login-video" data-idx="${idx}" src="${src}" autoplay muted playsinline></video>`
          )
          .join("")}
        <div class="login-overlay"></div>
        <div class="login-panel">
          <div class="text-center mb-3">
            <img src="assets/logo.png" alt="logo" onerror="this.style.display='none'" />
            <h1 class="mt-2" style="font-size:22px;font-weight:800;color:#065f46;">رفيق المعلم</h1>
            <div style="font-size:12px;color:#d97706;font-weight:700;">رفيق المعلم.. ودليل الأكاديمية</div>
          </div>
          <h2 class="text-center mb-3" style="font-size:16px;font-weight:700;color:#6b7280;">${title}</h2>
          ${error ? `<div class="login-error mb-2">${error}</div>` : ""}
          <form id="login-form" class="d-grid gap-2">
            <input id="login-email" type="email" class="form-control" placeholder="البريد الإلكتروني" required />
            <input id="login-password" type="password" class="form-control" placeholder="كلمة المرور" required />
            <button type="submit" class="btn btn-success" style="background:#065f46;border:none;font-weight:700;">
              ${mode === "login" ? "دخول" : "تسجيل"}
            </button>
          </form>
          <button id="google-login" class="btn btn-light w-100 mt-2" style="border:1px solid #e5e7eb;font-weight:700;">
            <span style="margin-left:6px;">G</span> Google
          </button>
          <div class="text-center mt-3" style="font-size:13px;color:#6b7280;">
            ${toggleHint}
            <button id="toggle-login" type="button" class="btn btn-link p-0" style="color:#065f46;font-weight:700;text-decoration:underline;">${toggleLabel}</button>
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
      googleBtn.addEventListener("click", async () => {
        appState.ui.loginError = "";
        try {
          await authModule.loginWithGoogle();
        } catch (err) {
          appState.ui.loginError = err;
          router.render();
        }
      });
    }

    initLoginVideos();
  };

  function initLoginVideos() {
    const videos = Array.from(document.querySelectorAll(".login-video"));
    if (!videos.length) return;

    let current = 0;
    const activate = (idx) => {
      videos.forEach((v, i) => {
        if (i === idx) {
          v.classList.add("active");
          v.play().catch(() => {});
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
