const appState = {
  route: "login",
  activeTab: "form",
  user: null,
  students: [],
  sessions: [],
  settings: {
    teacherName: "محمد محمود",
    defaultLimit: 12,
    accountingPhone: "",
  },
  ui: {
    loginMode: "login",
    loginError: "",
    historyStudentId: null,
    analysisStudentId: "all",
    analysisRange: "all",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    rewardAmount: "",
    showCertificate: false,
    studentForm: null,
    sessionForm: null,
  },
};

window.appState = appState;

let renderScheduled = false;
function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    router.render();
  });
}

window.showToast = function (msg) {
  const toastRoot = document.getElementById("app-toast");
  if (!toastRoot) return;
  toastRoot.innerHTML = `<div class="toast-pill">${msg}</div>`;
  setTimeout(() => {
    toastRoot.innerHTML = "";
  }, 3200);
};

window.formatArDate = function (iso) {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

window.formatMonthLabel = function (year, month) {
  try {
    return new Date(year, month - 1, 1).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return `${year}/${month}`;
  }
};

window.formatTime12h = function (time24) {
  if (!time24 || typeof time24 !== "string") return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const suffix = h >= 12 ? "م" : "ص";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

window.handleLogout = async function () {
  try {
    await authModule.logout();
    showToast("تم تسجيل الخروج");
  } catch (err) {
    showToast(err);
  }
};

function attachSubscriptions() {
  dbModule.subscribeStudents((data) => {
    appState.students = data;
    scheduleRender();
  });
  dbModule.subscribeSessions((data) => {
    appState.sessions = data;
    scheduleRender();
  });
  dbModule.subscribeSettings((data) => {
    appState.settings = {
      teacherName: data.teacherName || "محمد محمود",
      defaultLimit: data.defaultLimit || 12,
      accountingPhone: data.accountingPhone || "",
    };
    scheduleRender();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  authModule.onAuthStateChanged((user) => {
    if (user) {
      appState.user = user;
      dbModule.setTeacherId(user.uid);
      attachSubscriptions();
      router.setRoute("dashboard");
      return;
    }

    appState.user = null;
    dbModule.clearSubscriptions();
    appState.students = [];
    appState.sessions = [];
    router.setRoute("login");
  });
});
