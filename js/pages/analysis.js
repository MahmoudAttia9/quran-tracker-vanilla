(function () {
  let chartInstance = null;

  window.setAnalysisStudent = function (id) {
    appState.ui.analysisStudentId = id;
    router.render();
  };

  window.setAnalysisRange = function (range) {
    appState.ui.analysisRange = range;
    router.render();
  };

  window.showCertificate = function () {
    appState.ui.showCertificate = true;
    router.render();
  };

  window.hideCertificate = function () {
    appState.ui.showCertificate = false;
    router.render();
  };

  function filterSessionsByRange(sessions, range) {
    if (range === "all") return sessions;
    const now = Date.now();
    const limit = range === "week" ? 7 : 30;
    return sessions.filter((s) => new Date(s.date).getTime() >= now - limit * 86400000);
  }

  function buildChartData(sessions) {
    return sessions.slice(-20).map((s, i) => ({ label: i + 1, value: s.overall || 0 }));
  }

  function renderCertificate(student, rangeLabel) {
    return `
      <div class="card-soft" id="certificate-box" style="background:linear-gradient(135deg,#fdfaf3,#fff);text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#065f46;">شهادة تفوق ${rangeLabel}</div>
        <div style="margin-top:6px;font-size:14px;">هذا تكريم للطالب/الطالبة:</div>
        <div style="font-size:22px;font-weight:800;color:#c9973a;margin:10px 0;">${student.name}</div>
        <div style="font-size:13px;">المعلم: ${appState.settings.teacherName}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:8px;">${formatArDate(new Date().toISOString())}</div>
      </div>
    `;
  }

  window.exportCertificateImage = async function () {
    const el = document.getElementById("certificate-box");
    if (!el) return;
    await exportElementAsImage(el, "certificate.png");
  };

  window.exportCertificatePdf = async function () {
    const el = document.getElementById("certificate-box");
    if (!el) return;
    await exportElementAsPdf(el, "certificate.pdf");
  };

  window.exportCertificateGif = async function () {
    const el = document.getElementById("certificate-box");
    if (!el) return;
    await exportElementAsGif(el, "certificate.gif");
  };

  window.renderAnalysisPage = function () {
    const selectedId = appState.ui.analysisStudentId;
    const student = selectedId === "all" ? null : appState.students.find((s) => s.id === selectedId);

    const baseSessions = selectedId === "all"
      ? appState.sessions
      : appState.sessions.filter((s) => s.studentId === selectedId).sort((a, b) => new Date(a.date) - new Date(b.date));

    const targetSessions = filterSessionsByRange(baseSessions, appState.ui.analysisRange);
    const chartData = buildChartData(targetSessions);

    let weeklyAvg = 0;
    let monthlyAvg = 0;
    if (student) {
      const now = Date.now();
      const weekSessions = baseSessions.filter((s) => new Date(s.date).getTime() >= now - 7 * 86400000);
      const monthSessions = baseSessions.filter((s) => new Date(s.date).getTime() >= now - 30 * 86400000);
      const calc = (arr) => arr.length ? arr.reduce((sum, s) => sum + (s.overall || 0), 0) / arr.length : 0;
      weeklyAvg = calc(weekSessions);
      monthlyAvg = calc(monthSessions);
    }

    const showReward = student && (weeklyAvg >= 4 || monthlyAvg >= 4.5);

    return `
      <div>
        <div class="card-soft mb-2">
          <div class="mb-2" style="font-weight:700;color:#065f46;">🎯 تخصيص التحليل</div>
          <select class="form-select mb-2" onchange="setAnalysisStudent(this.value)">
            <option value="all" ${selectedId === "all" ? "selected" : ""}>📊 جميع الطلاب</option>
            ${appState.students.map((s) => `<option value="${s.id}" ${s.id === selectedId ? "selected" : ""}>👤 ${s.name}</option>`).join("")}
          </select>
          <div class="d-flex gap-2">
            <button class="btn ${appState.ui.analysisRange === "week" ? "btn-primary" : "btn-light"} flex-fill" onclick="setAnalysisRange('week')">📅 أسبوع</button>
            <button class="btn ${appState.ui.analysisRange === "month" ? "btn-success" : "btn-light"} flex-fill" onclick="setAnalysisRange('month')">📆 شهر</button>
            <button class="btn ${appState.ui.analysisRange === "all" ? "btn-dark" : "btn-light"} flex-fill" onclick="setAnalysisRange('all')">📊 الكل</button>
          </div>
        </div>

        ${chartData.length === 0 ? `<div class="card-soft">لا توجد بيانات كافية للتحليل.</div>` : `
          <div class="card-soft mb-2">
            <div style="font-weight:700;color:#065f46;">📈 معدل الإنجاز</div>
            <div style="height:240px;">
              <canvas id="analysis-chart"></canvas>
            </div>
          </div>
        `}

        ${showReward ? `
          <div class="card-soft mb-2" style="background:linear-gradient(135deg,#f0fdf4,#d1fae5);">
            <div style="font-weight:700;margin-bottom:8px;">🎉 أداء متميز</div>
            <input class="form-control mb-2" placeholder="مبلغ المكافأة (ج.م)" value="${appState.ui.rewardAmount || ""}" oninput="appState.ui.rewardAmount=this.value" />
            <button class="btn btn-success w-100" onclick="showCertificate()">إصدار شهادة تفوق</button>
          </div>
        ` : ""}

        ${appState.ui.showCertificate && student ? `
          <div class="card-soft mb-2">
            ${renderCertificate(student, monthlyAvg >= 4.5 ? "الشهر" : "الأسبوع")}
            <div class="d-flex flex-wrap gap-2 mt-3">
              <button class="btn btn-success" onclick="exportCertificateImage()">🖼️ صورة</button>
              <button class="btn btn-warning" onclick="exportCertificatePdf()">📄 PDF</button>
              <button class="btn btn-dark" onclick="exportCertificateGif()">🎞️ GIF</button>
              <button class="btn btn-light" onclick="hideCertificate()">إغلاق</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  };

  window.initAnalysisPage = function () {
    const canvas = document.getElementById("analysis-chart");
    if (!canvas) return;

    const selectedId = appState.ui.analysisStudentId;
    const baseSessions = selectedId === "all"
      ? appState.sessions
      : appState.sessions.filter((s) => s.studentId === selectedId).sort((a, b) => new Date(a.date) - new Date(b.date));

    const targetSessions = filterSessionsByRange(baseSessions, appState.ui.analysisRange);
    const data = buildChartData(targetSessions);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "التقييم",
            data: data.map((d) => d.value),
            borderColor: "#065f46",
            backgroundColor: "rgba(6,95,70,0.15)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 5 },
        },
      },
    });
  };
})();
