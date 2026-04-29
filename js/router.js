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
        <button class="btn btn-light btn-sm" onclick="openSidebar()">☰</button>
        <div class="header-title">رفيق المعلم</div>
        <img src="assets/logo.png" alt="logo" style="height: 42px" onerror="this.style.display='none'" />
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
    ];

    sidebar.innerHTML = `
      <div style="background:#065f46;color:#fff;padding:24px 18px;border-bottom-left-radius:16px;">
        <div style="font-size:20px;font-weight:800;">القائمة الرئيسية</div>
        <div style="font-size:12px;opacity:0.85;margin-top:6px;">👤 أهلاً بك، ${teacherName}</div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:8px;">
        ${tabs
          .map(
            (t) => `
          <button class="btn btn-light text-end" style="border-radius:12px;font-weight:${
            appState.activeTab === t.key ? "700" : "500"
          };background:${
            appState.activeTab === t.key ? "#f0fdf4" : "transparent"
          };color:${
            appState.activeTab === t.key ? "#065f46" : "#4b5563"
          }" onclick="setActiveTab('${t.key}')">
            <span style="font-size:18px;margin-left:8px;">${t.icon}</span>${t.label}
          </button>
        `
          )
          .join("")}
      </div>
      <div style="margin-top:auto;padding:16px;border-top:1px solid #f3f4f6;background:#fafafa;">
        <button class="btn w-100" style="background:#fee2e2;color:#dc2626;font-weight:700;" onclick="handleLogout()">🚪 تسجيل خروج</button>
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
