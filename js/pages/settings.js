(function () {
  const ARABIC_DAYS = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  function ensureStudentForm() {
    if (!appState.ui.studentForm) {
      appState.ui.studentForm = {
        open: false,
        editId: null,
        name: "",
        phone: "",
        gender: "boy",
        sessionLimit: appState.settings.defaultLimit || 12,
        groupLink: "",
        schedule: [],
      };
    }
    return appState.ui.studentForm;
  }

  window.openStudentForm = function (studentId) {
    const form = ensureStudentForm();
    if (studentId) {
      const stu = appState.students.find((s) => s.id === studentId);
      if (stu) {
        form.editId = stu.id;
        form.name = stu.name || "";
        form.phone = stu.phone || "";
        form.gender = stu.gender || "boy";
        form.sessionLimit = stu.sessionLimit || 12;
        form.groupLink = stu.groupLink || "";
        form.schedule = Array.isArray(stu.schedule) ? stu.schedule : [];
      }
    } else {
      form.editId = null;
      form.name = "";
      form.phone = "";
      form.gender = "boy";
      form.sessionLimit = appState.settings.defaultLimit || 12;
      form.groupLink = "";
      form.schedule = [];
    }
    form.open = true;
    router.render();
  };

  window.closeStudentForm = function () {
    ensureStudentForm().open = false;
    router.render();
  };

  window.updateStudentFormField = function (field, value) {
    const form = ensureStudentForm();
    form[field] = value;
    if (field === "gender") {
      router.render();
    }
  };

  window.addScheduleSlot = function () {
    const form = ensureStudentForm();
    const used = form.schedule.map((s) => s.day);
    const freeDay = ARABIC_DAYS.find((d) => !used.includes(d)) || "السبت";
    form.schedule.push({ day: freeDay, time: "17:00" });
    router.render();
  };

  window.updateScheduleSlot = function (idx, field, value) {
    const form = ensureStudentForm();
    if (!form.schedule[idx]) return;
    form.schedule[idx][field] = value;
  };

  window.removeScheduleSlot = function (idx) {
    const form = ensureStudentForm();
    form.schedule.splice(idx, 1);
    router.render();
  };

  window.saveStudentForm = async function () {
    const form = ensureStudentForm();
    if (!form.name.trim()) {
      showToast("اكتب اسم الطالب أولاً");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      sessionLimit: parseInt(form.sessionLimit, 10) || 12,
      groupLink: form.groupLink.trim(),
      schedule: form.schedule,
    };

    try {
      if (form.editId) {
        await dbModule.updateStudent(form.editId, payload);
        showToast("تم تحديث الطالب");
      } else {
        await dbModule.addStudent(payload);
        showToast("تم إضافة الطالب");
      }
      form.open = false;
      router.render();
    } catch (err) {
      showToast("خطأ أثناء حفظ الطالب");
      console.error(err);
    }
  };

  window.deleteStudent = async function (id) {
    if (!window.confirm("هل تريد حذف الطالب وكل بياناته؟")) return;
    try {
      await dbModule.deleteStudent(id);
      showToast("تم حذف الطالب");
    } catch (err) {
      showToast("خطأ أثناء الحذف");
    }
  };

  window.saveSettings = async function () {
    const teacherName = document.getElementById("settings-teacher").value.trim();
    const defaultLimit = parseInt(document.getElementById("settings-limit").value, 10) || 12;
    const accountingPhone = document.getElementById("settings-phone").value.trim();

    try {
      await dbModule.saveSettings({ teacherName, defaultLimit, accountingPhone });
      showToast("تم حفظ الإعدادات");
    } catch (err) {
      showToast("خطأ أثناء حفظ الإعدادات");
    }
  };

  function renderStudentForm(form) {
    return `
      <div class="card-soft">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 style="font-size:16px;font-weight:700;color:#065f46;">${
            form.editId ? "تعديل بيانات الطالب" : "إضافة طالب جديد"
          }</h3>
          <button class="btn btn-light" onclick="closeStudentForm()">✕</button>
        </div>

        <div class="mb-2">
          <label class="form-label">اسم الطالب</label>
          <input class="form-control" value="${form.name}" oninput="updateStudentFormField('name', this.value)" />
        </div>

        <div class="mb-2">
          <label class="form-label">النوع</label>
          <div class="d-flex gap-2">
            <button class="btn ${form.gender === "boy" ? "btn-success" : "btn-outline-secondary"} flex-fill" onclick="updateStudentFormField('gender','boy')">👦 ولد</button>
            <button class="btn ${form.gender === "girl" ? "btn-warning" : "btn-outline-secondary"} flex-fill" onclick="updateStudentFormField('gender','girl')">🧕 بنت</button>
          </div>
        </div>

        <div class="mb-2">
          <label class="form-label">واتساب ولي الأمر</label>
          <input class="form-control" value="${form.phone}" oninput="updateStudentFormField('phone', this.value)" />
        </div>

        <div class="mb-2">
          <label class="form-label">رابط الجروب (اختياري)</label>
          <input class="form-control" value="${form.groupLink}" oninput="updateStudentFormField('groupLink', this.value)" />
        </div>

        <div class="mb-2">
          <label class="form-label">سعة الباقة (عدد الحصص)</label>
          <input type="number" class="form-control" value="${form.sessionLimit}" oninput="updateStudentFormField('sessionLimit', this.value)" />
        </div>

        <div class="card-soft" style="background:#f9fafb;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span style="font-weight:700;">مواعيد الحلقة الأسبوعية</span>
            <button class="btn btn-light" onclick="addScheduleSlot()">➕ إضافة موعد</button>
          </div>
          ${form.schedule.length === 0 ? `<div style="color:#9ca3af;font-size:12px;">لا توجد مواعيد حتى الآن</div>` : ""}
          ${form.schedule
            .map(
              (slot, idx) => `
            <div class="d-flex gap-2 align-items-center mb-2">
              <select class="form-select" onchange="updateScheduleSlot(${idx}, 'day', this.value)">
                ${ARABIC_DAYS.map(
                  (d) => `<option value="${d}" ${d === slot.day ? "selected" : ""}>${d}</option>`
                ).join("")}
              </select>
              <input type="time" class="form-control" value="${slot.time}" oninput="updateScheduleSlot(${idx}, 'time', this.value)" />
              <button class="btn btn-outline-danger" onclick="removeScheduleSlot(${idx})">×</button>
            </div>
          `
            )
            .join("")}
        </div>

        <button class="btn btn-success w-100 mt-3" onclick="saveStudentForm()">💾 حفظ الطالب</button>
      </div>
    `;
  }

  function renderSettingsMain() {
    return `
      <div class="card-soft mb-3">
        <h3 style="font-size:16px;font-weight:700;color:#065f46;">⚙️ إعدادات المنصة</h3>
        <div class="mb-2">
          <label class="form-label">اسم المعلم</label>
          <input id="settings-teacher" class="form-control" value="${appState.settings.teacherName}" />
        </div>
        <div class="mb-2">
          <label class="form-label">الحد الافتراضي للباقة</label>
          <input id="settings-limit" type="number" class="form-control" value="${appState.settings.defaultLimit}" />
        </div>
        <div class="mb-2">
          <label class="form-label">رقم المحاسب</label>
          <input id="settings-phone" class="form-control" value="${appState.settings.accountingPhone}" />
        </div>
        <button class="btn btn-warning" onclick="saveSettings()">حفظ الإعدادات</button>
      </div>

      <div class="card-soft">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 style="font-size:16px;font-weight:700;color:#065f46;">👥 إدارة الطلاب (${appState.students.length})</h3>
          <button class="btn btn-success" onclick="openStudentForm()">➕ طالب جديد</button>
        </div>
        ${appState.students.length === 0 ? `<div style="color:#9ca3af;">لا يوجد طلاب مسجلين بعد.</div>` : ""}
        <div class="d-grid gap-2">
          ${appState.students
            .map(
              (s) => `
            <div class="card-soft" style="padding:12px;">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div style="font-weight:700;">${s.gender === "girl" ? "🧕" : "👦"} ${s.name}</div>
                  <div style="font-size:12px;color:#6b7280;">الباقة: ${s.sessionLimit || 12} حصة | المواعيد: ${
                s.schedule?.length || 0
              }</div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-light" onclick="openStudentForm('${s.id}')">✏️</button>
                  <button class="btn btn-outline-danger" onclick="deleteStudent('${s.id}')">🗑️</button>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  window.renderSettingsPage = function () {
    const form = ensureStudentForm();
    if (form.open) return renderStudentForm(form);
    return renderSettingsMain();
  };

  window.initSettingsPage = function () {
    return;
  };
})();
