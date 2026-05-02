(function () {
  window.prevMonth = function () {
    if (appState.ui.month === 1) {
      appState.ui.month = 12;
      appState.ui.year -= 1;
    } else {
      appState.ui.month -= 1;
    }
    router.render();
  };

  window.nextMonth = function () {
    if (appState.ui.month === 12) {
      appState.ui.month = 1;
      appState.ui.year += 1;
    } else {
      appState.ui.month += 1;
    }
    router.render();
  };

  function buildCounts() {
    const map = {};
    appState.sessions.forEach((s) => {
      if (!s.date) return;
      const d = new Date(s.date);
      if (d.getFullYear() === appState.ui.year && d.getMonth() + 1 === appState.ui.month) {
        if (s.mode === "group" && Array.isArray(s.participants)) {
          s.participants
            .filter((p) => p.present !== false)
            .forEach((p) => {
              map[p.studentId] = (map[p.studentId] || 0) + 1;
            });
        } else if (s.studentId) {
          map[s.studentId] = (map[s.studentId] || 0) + 1;
        }
      }
    });
    return map;
  }

  window.copyMonthlySheet = function () {
    const counts = buildCounts();
    const lines = [
      "📋 شيت حضور حلقة القرآن الكريم",
      `📅 ${formatMonthLabel(appState.ui.year, appState.ui.month)}`,
      `المعلم: ${appState.settings.teacherName}`,
      "─────────────────────────",
      ...appState.students.map((s, i) => {
        const c = counts[s.id] || 0;
        const lim = s.sessionLimit || appState.settings.defaultLimit || 12;
        return `${i + 1}. ${s.name}   ${c} / ${lim} حصة`;
      }),
    ];
    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => showToast("تم نسخ الشيت"))
      .catch(() => showToast("تعذر النسخ"));
  };

  window.exportMonthlySheetPdf = async function () {
    const el = document.getElementById("monthly-sheet-box");
    if (!el) return;
    await exportElementAsPdf(el, `sheet-${appState.ui.year}-${appState.ui.month}.pdf`);
  };

  window.exportMonthlySheetImage = async function () {
    const el = document.getElementById("monthly-sheet-box");
    if (!el) return;
    await exportElementAsImage(el, `sheet-${appState.ui.year}-${appState.ui.month}.png`);
  };

  window.renderMonthlySheetPage = function () {
    const counts = buildCounts();
    const totalSessions = appState.students.reduce((sum, s) => sum + (counts[s.id] || 0), 0);

    return `
      <div>
        <div class="card-soft mb-2 d-flex justify-content-between align-items-center" style="background:#fdfaf3;">
          <button class="btn btn-light" onclick="prevMonth()">‹</button>
          <div style="text-align:center;">
            <div style="font-weight:700;color:#065f46;">${formatMonthLabel(appState.ui.year, appState.ui.month)}</div>
            <div style="font-size:12px;color:#92400e;">إجمالي الحصص: ${totalSessions}</div>
          </div>
          <button class="btn btn-light" onclick="nextMonth()">›</button>
        </div>

        <div id="monthly-sheet-box" class="card-soft mb-2">
          <div style="background:#065f46;color:#fff;padding:14px;border-radius:10px 10px 0 0;text-align:center;">
            شيت حضور حلقة القرآن الكريم
            <div style="font-size:12px;opacity:0.85;">${formatMonthLabel(appState.ui.year, appState.ui.month)} · المعلم: ${appState.settings.teacherName}</div>
          </div>

          ${appState.students.length === 0 ? `
            <div style="text-align:center;color:#9ca3af;padding:30px;">أضف طلاباً أولاً</div>
          ` : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الطالب</th>
                    <th>الحضور</th>
                    <th>التقدم في الباقة</th>
                  </tr>
                </thead>
                <tbody>
                  ${appState.students
                    .map((s, i) => {
                      const c = counts[s.id] || 0;
                      const lim = s.sessionLimit || appState.settings.defaultLimit || 12;
                      const pct = Math.round((c / lim) * 100);
                      const barColor = pct >= 100 ? "#9B1D3A" : pct >= 75 ? "#C9973A" : "#065f46";
                      return `
                        <tr>
                          <td>${i + 1}</td>
                          <td>${s.name}</td>
                          <td>${c} / ${lim}</td>
                          <td>
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7280;">
                              <span>${pct}%</span>
                              <span>${c >= lim ? "✅ مكتمل" : `${lim - c} متبقي`}</span>
                            </div>
                            <div style="height:6px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                              <div style="height:100%;width:${Math.min(pct, 100)}%;background:${barColor};"></div>
                            </div>
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                  <tr style="background:#fdfaf3;">
                    <td colspan="2" style="font-weight:700;">الإجمالي الكلي للشهر</td>
                    <td colspan="2" style="font-weight:700;text-align:center;">${totalSessions} حصة</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `}
        </div>

        <div class="d-grid gap-2">
          <button class="btn btn-success" onclick="exportMonthlySheetPdf()">📄 حفظ PDF</button>
          <button class="btn btn-warning" onclick="exportMonthlySheetImage()">🖼️ حفظ صورة</button>
          <button class="btn btn-light" onclick="copyMonthlySheet()">📋 نسخ للواتساب</button>
        </div>
      </div>
    `;
  };

  window.initMonthlySheetPage = function () {
    return;
  };
})();
