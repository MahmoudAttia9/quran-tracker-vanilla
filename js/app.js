const appState = {
  route: "login",
  activeTab: "form",
  user: null,
  students: [],
  groups: [],
  sessions: [],
  settings: {
    teacherName: "",
    defaultLimit: 12,
    accountingPhone: "",
  },
  ui: {
    loginMode: "login",
    loginError: "",
    sessionScope: "individual",
    searchQuery: "",
    searchGender: "all",
    selectedStudentId: "",
    selectedGroupId: "",
    historyStudentId: null,
    analysisStudentId: "all",
    analysisRange: "all",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    rewardAmount: "",
    showCertificate: false,
    report: null,
    editSessionId: null,
    studentForm: null,
    groupForm: null,
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

window.getStudentById = function (id) {
  return appState.students.find((s) => s.id === id);
};

window.getGroupById = function (id) {
  return appState.groups.find((g) => g.id === id);
};

window.getGroupMembers = function (groupId) {
  const group = getGroupById(groupId);
  if (!group || !Array.isArray(group.studentIds)) return [];
  return appState.students.filter((s) => group.studentIds.includes(s.id));
};

window.getStudentSessions = function (studentId) {
  return appState.sessions
    .map((session) => {
      if (session.mode === "group") {
        const participant = session.participants?.find(
          (p) => p.studentId === studentId && p.present !== false
        );
        if (!participant) return null;
        return { ...session, participant };
      }
      if (session.studentId === studentId) return session;
      return null;
    })
    .filter(Boolean);
};

window.countStudentSessions = function (studentId) {
  return getStudentSessions(studentId).length;
};

window.getNextPackageNum = function (studentId, limit) {
  const count = countStudentSessions(studentId);
  return (count % limit) + 1;
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
  dbModule.subscribeGroups((data) => {
    appState.groups = data;
    scheduleRender();
  });
  dbModule.subscribeSessions((data) => {
    appState.sessions = data;
    scheduleRender();
  });
  dbModule.subscribeSettings((data) => {
    const user = appState.user;
    const fallbackName = user
      ? user.displayName || user.email?.split("@")[0] || "المعلم"
      : "المعلم";
    appState.settings = {
      teacherName: data.teacherName || fallbackName,
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
    appState.groups = [];
    appState.sessions = [];
    router.setRoute("login");
  });
});

/* =========================================
   EXECUTIVE DASHBOARD GLOBAL UI ENGINE
   ========================================= */

// 1. The "Living Zikr" Engine
function initLivingZikr() {
  const zikrWords = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "لَا إِلَهَ إِلَّا اللَّهُ", "اللَّهُ أَكْبَرُ"];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;";
  document.body.appendChild(container);

  setInterval(() => {
    if (appState.route === "login") return; // Keep it subtle only on dashboard
    const particle = document.createElement("div");
    particle.innerText = zikrWords[Math.floor(Math.random() * zikrWords.length)];
    particle.style.cssText = `
      position: absolute;
      left: ${Math.random() * 90 + 5}vw;
      bottom: -50px;
      font-family: 'Amiri', serif;
      font-size: ${Math.random() * 24 + 16}px;
      color: #D4AF37;
      opacity: 0;
      filter: blur(4px);
      transition: opacity 2s ease, filter 2s ease;
      animation: zikrDrift ${Math.random() * 10 + 15}s linear forwards;
    `;
    container.appendChild(particle);

    setTimeout(() => {
      particle.style.opacity = "0.03";
      particle.style.filter = "blur(3px)";
    }, 100);

    setTimeout(() => {
      particle.remove();
    }, 25000);
  }, 4000);
}

// Ensure the animation exists in the document
const style = document.createElement('style');
style.textContent = `
  @keyframes zikrDrift {
    to { transform: translateY(-120vh) rotate(${Math.random() * 20 - 10}deg); opacity: 0; filter: blur(8px); }
  }
`;
document.head.appendChild(style);

// 2. Mouse Spotlight Effect for Rows
document.addEventListener("mousemove", (e) => {
  if (appState.route === "login") return;
  document.querySelectorAll(".spotlight-row").forEach(row => {
    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    row.style.setProperty("--x", `${x}px`);
    row.style.setProperty("--y", `${y}px`);
  });
});

// 3. Intersection Observer for Scroll Animations
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Override scheduleRender to re-attach observers and upgrade UI elements
const originalScheduleRender = scheduleRender;
window.scheduleRender = function() {
  originalScheduleRender();
  setTimeout(() => {
    // Convert regular cards and rows to use the new classes
    document.querySelectorAll('.card-soft').forEach((el, index) => {
      el.style.animationPlayState = 'paused';
      scrollObserver.observe(el);
      // Give them staggered delays dynamically if not handled by CSS
      el.style.animationDelay = `${(index % 10) * 0.1}s`;
    });
    
    // Convert list items to spotlight rows
    document.querySelectorAll('[onclick^="openHistoryStudent"], [onclick^="openMonthlyStudent"]').forEach(el => {
      el.classList.add('spotlight-row');
    });
  }, 50);
};

// Initialize Zikr
document.addEventListener("DOMContentLoaded", () => {
  initLivingZikr();
});
