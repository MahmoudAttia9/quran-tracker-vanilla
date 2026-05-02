(function () {
  function renderHeader() {
    const header = document.getElementById("app-header");
    if (!appState.user) {
      header.classList.add("hidden");
      header.innerHTML = "";
      return;
    }
    header.classList.remove("hidden");
    header.innerHTML = `
      <div class="container header-inner">
        <button class="btn btn-light btn-sm menu-toggle-btn" onclick="openSidebar()">☰</button>
        <div class="header-title" style="font-family: 'Amiri', serif; font-size: 26px; color: var(--accent-gold); text-shadow: 0 2px 10px rgba(212,175,55,0.2);">رفيق المعلم</div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-weight:700; color:#fff; font-size:18px; font-family:'Amiri', serif; letter-spacing:0.5px;">${appState.settings.teacherName || "المعلم"}</div>
          <div class="avatar-glow">
            <img src="assets/logo.png" alt="logo" style="height: 38px; width: 38px; border-radius: 50%; object-fit: cover; background: #fff;" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `;
  }

  function renderSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (!appState.user) {
      sidebar.classList.add("hidden");
      overlay.classList.add("hidden");
      sidebar.innerHTML = "";
      return;
    }

    sidebar.classList.remove("hidden");
    overlay.classList.remove("hidden");

    const teacherName = appState.settings.teacherName || "المعلم";
    const tabs = [
      { key: "form", icon: "🏠", label: "الرئيسية" },
      { key: "history", icon: "📋", label: "سجلات الطلاب" },
      { key: "analysis", icon: "📊", label: "تحليل الأداء" },
      { key: "monthly", icon: "🗓️", label: "الشيت الشهري" },
      { key: "settings", icon: "⚙️", label: "الإعدادات" },
      { key: "account", icon: "👤", label: "الحساب" },
    ];

    sidebar.innerHTML = `
      <div class="executive-sidebar-header" style="padding:24px 18px;border-bottom-left-radius:16px;">
        <div style="font-size:20px;font-weight:800;color:#D4AF37;">القائمة الرئيسية</div>
        <div style="font-size:16px;opacity:0.9;margin-top:6px;color:#fff;font-family:'Amiri', serif;letter-spacing:0.5px;">👤 أهلاً بك، ${teacherName}</div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:8px;">
        ${tabs
          .map(
            (t) => `
          <button class="btn text-end executive-tab-btn ${appState.activeTab === t.key ? "active" : ""}" onclick="setActiveTab('${t.key}')">
            <span style="font-size:20px; width:24px; text-align:center;">${t.icon}</span>
            <span>${t.label}</span>
          </button>
        `
          )
          .join("")}
      </div>
      <div style="margin-top:auto;padding:16px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.2);">
        <button class="btn w-100" style="background:rgba(239,68,68,0.1);color:#fca5a5;font-weight:700;border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:12px;" onclick="handleLogout()">🚪 تسجيل خروج</button>
      </div>
    `;
  }

  function renderMain() {
    const main = document.getElementById("app-main");
    if (appState.route === "login") {
      main.innerHTML = renderLoginPage();
      initLoginPage();
      return;
    }

    main.innerHTML = renderDashboardPage();
    initDashboardPage();
  }

  window.router = {
    render() {
      renderHeader();
      renderSidebar();
      renderMain();
    },
    setRoute(route) {
      appState.route = route;
      this.render();
    },
  };

  window.openSidebar = function () {
    document.getElementById("app-sidebar").classList.add("show");
    document.getElementById("sidebar-overlay").classList.add("show");
  };

  window.closeSidebar = function () {
    document.getElementById("app-sidebar").classList.remove("show");
    document.getElementById("sidebar-overlay").classList.remove("show");
  };

  document.addEventListener("click", (e) => {
    if (e.target.id === "sidebar-overlay") {
      window.closeSidebar();
    }
  });
})();
