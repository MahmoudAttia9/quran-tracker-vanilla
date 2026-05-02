(function () {
  const tabs = [
    { key: "form", icon: "🏠", label: "الرئيسية" },
    { key: "history", icon: "📋", label: "السجل" },
    { key: "analysis", icon: "📊", label: "التحليل" },
    { key: "monthly", icon: "🗓️", label: "الشيت الشهري" },
    { key: "settings", icon: "⚙️", label: "الإعدادات" },
    { key: "account", icon: "👤", label: "الحساب" },
  ];

  window.setActiveTab = function (tab) {
    appState.activeTab = tab;
    window.closeSidebar?.();
    router.render();
  };

  function renderTabs() {
    return tabs
      .map(
        (t) => `
        <button class="tab-pill ${
          appState.activeTab === t.key ? "active" : ""
        }" onclick="setActiveTab('${t.key}')">
          <span style="margin-left:6px;">${t.icon}</span>${t.label}
        </button>
      `
      )
      .join("");
  }

  function renderActiveTab() {
    switch (appState.activeTab) {
      case "history":
        return renderHistoryPage();
      case "analysis":
        return renderAnalysisPage();
      case "monthly":
        return renderMonthlySheetPage();
      case "settings":
        return renderSettingsPage();
      case "account":
        return renderAccountPage();
      default:
        return renderSessionForm();
    }
  }

  window.renderDashboardPage = function () {
    return `
      <div class="d-flex flex-column gap-3" style="animation: execFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
        <div>${renderActiveTab()}</div>
      </div>
    `;
  };

  window.initDashboardPage = function () {
    switch (appState.activeTab) {
      case "history":
        initHistoryPage();
        break;
      case "analysis":
        initAnalysisPage();
        break;
      case "monthly":
        initMonthlySheetPage();
        break;
      case "settings":
        initSettingsPage();
        break;
      case "account":
        initAccountPage();
        break;
      default:
        initSessionForm();
    }
  };
})();
