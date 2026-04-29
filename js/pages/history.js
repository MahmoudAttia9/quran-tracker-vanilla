(function () {
  window.openHistoryStudent = function (id) {
    appState.ui.historyStudentId = id;
    router.render();
  };

  window.backToHistoryList = function () {
    appState.ui.historyStudentId = null;
    router.render();
  };

  window.deleteSession = async function (id) {
    if (!window.confirm("هل تريد حذف الجلسة؟")) return;
    try {
      await dbModule.deleteSession(id);
      showToast("تم حذف الجلسة");
    } catch (err) {
      showToast("خطأ أثناء الحذف");
    }
  };

  function renderStudentList() {
    if (!appState.students.length) {
      return `<div class="card-soft">لا يوجد طلاب مسجلين.</div>`;
    }

    const sessionsByStudent = appState.sessions.reduce((acc, s) => {
      if (!acc[s.studentId]) acc[s.studentId] = [];
      acc[s.studentId].push(s);
      return acc;
    }, {});

    return appState.students
      .map((s) => {
        const all = sessionsByStudent[s.id] || [];
        const limit = s.sessionLimit || appState.settings.defaultLimit || 12;
        const count = all.length;
        const pkgCount = count % limit === 0 && count > 0 ? limit : count % limit;
        const pct = limit ? Math.round((pkgCount / limit) * 100) : 0;
        const last = all.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return `
          <div class="card-soft mb-2" style="cursor:pointer;" onclick="openHistoryStudent('${s.id}')">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div style="font-weight:700;color:#065f46;">${s.gender === "girl" ? "🧕" : "👦"} ${s.name}</div>
              <div class="badge-soft">إجمالي الجلسات: ${count}</div>
            </div>
            <div style="font-size:12px;color:#6b7280;">
              الباقة الحالية: <strong>${pkgCount} / ${limit}</strong>
              ${last ? ` | آخر حصة: ${last.dateAr || formatArDate(last.date)}` : ""}
            </div>
            <div style="height:6px;background:#f3f4f6;border-radius:4px;margin-top:8px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(pct, 100)}%;background:${pct >= 100 ? "#9B1D3A" : "#065f46"};"></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderStudentTimeline(student) {
    const sessions = appState.sessions
      .filter((s) => s.studentId === student.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!sessions.length) {
      return `<div class="card-soft">لا توجد جلسات لهذا الطالب بعد.</div>`;
    }

    return sessions
      .map((s) => `
        <div class="card-soft mb-2" style="border-right:4px solid ${s.sessionType === "islamic" ? "#c9973a" : "#065f46"};">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div style="display:flex;gap:6px;">
              <span class="badge-soft">حصة ${s.packageSessionNum}</span>
              <span class="badge-soft" style="background:${s.sessionType === "islamic" ? "#fdfaf3" : "#f0fdf4"};color:${s.sessionType === "islamic" ? "#c9973a" : "#065f46"};">${s.sessionType === "islamic" ? "📘 تربية" : "📿 قرآن"}</span>
            </div>
            <div style="font-size:12px;color:#6b7280;">${s.dateAr || formatArDate(s.date)}</div>
          </div>

          ${s.sessionType === "islamic" ? `
            <div style="font-size:13px;line-height:1.6;">
              <strong>📘 تفاصيل:</strong> ${s.islamic?.general || "—"}
            </div>
          ` : `
            <div style="font-size:13px;line-height:1.6;">
              ${s.hifz?.text ? `<div><strong>✨ تسميع:</strong> ${s.hifz.text}</div>` : ""}
              ${s.recent?.text ? `<div><strong>🔄 قريب:</strong> ${s.recent.text}</div>` : ""}
              ${s.distant?.text ? `<div><strong>🕰️ بعيد:</strong> ${s.distant.text}</div>` : ""}
            </div>
          `}

          <div class="d-flex justify-content-between align-items-center mt-2" style="font-size:12px;color:#6b7280;">
            <div class="badge-soft" style="background:#fdfaf3;">التقييم: ⭐ ${s.overall || 0}</div>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteSession('${s.id}')">حذف</button>
          </div>
        </div>
      `)
      .join("");
  }

  window.renderHistoryPage = function () {
    if (!appState.ui.historyStudentId) {
      return `
        <div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <span style="font-size:18px;">📋</span>
            <span style="font-size:16px;font-weight:700;color:#065f46;">سجلات الطلاب</span>
          </div>
          ${renderStudentList()}
        </div>
      `;
    }

    const student = appState.students.find((s) => s.id === appState.ui.historyStudentId);
    if (!student) return `<div class="card-soft">الطالب غير موجود</div>`;

    return `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div style="font-size:16px;font-weight:700;color:#065f46;">سجل ${student.name}</div>
          <button class="btn btn-light" onclick="backToHistoryList()">🔙 رجوع</button>
        </div>
        ${renderStudentTimeline(student)}
      </div>
    `;
  };

  window.initHistoryPage = function () {
    return;
  };
})();
