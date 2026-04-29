(function () {
  const TAJWEED = [
    "الإدغام",
    "الإخفاء",
    "الإقلاب",
    "الغنة",
    "المدود",
    "الوقف والابتداء",
    "أخرى",
  ];

  const ISLAMIC_CATEGORIES = [
    {
      id: "asma",
      label: "أسماء حسنى",
      fields: [
        { key: "name", label: "الاسم", placeholder: "مثال: الرحمن" },
        { key: "notes", label: "ملاحظات التدبر", placeholder: "ما تم تدبره..." },
      ],
    },
    {
      id: "hadith",
      label: "حديث",
      fields: [
        { key: "text", label: "نص الحديث", placeholder: "نص الحديث الشريف..." },
        { key: "notes", label: "ملاحظات", placeholder: "الشرح والتطبيق..." },
      ],
    },
    {
      id: "prophet",
      label: "قصص الأنبياء",
      fields: [
        { key: "prophet", label: "اسم النبي", placeholder: "مثال: نوح عليه السلام" },
        { key: "notes", label: "الدروس والعبر", placeholder: "ما استفدناه..." },
      ],
    },
    {
      id: "story",
      label: "قصة وعبرة",
      fields: [
        { key: "title", label: "اسم القصة", placeholder: "عنوان القصة..." },
        { key: "lesson", label: "العبرة", placeholder: "العبرة المستفادة..." },
      ],
    },
    {
      id: "sahabi",
      label: "صحابي/صحابية",
      fields: [
        { key: "name", label: "اسم الصحابي", placeholder: "مثال: أبو بكر الصديق" },
        { key: "notes", label: "أبرز الصفات", placeholder: "صفاته ومناقبه..." },
      ],
    },
  ];

  function ensureSessionForm() {
    if (!appState.ui.sessionForm) {
      appState.ui.sessionForm = {
        studentId: "",
        sessionType: "quran",
        date: new Date().toISOString().split("T")[0],
        hifzText: "",
        hifzRating: 0,
        hifzNotes: "",
        recentText: "",
        recentRating: 0,
        recentNotes: "",
        distantText: "",
        distantRating: 0,
        distantNotes: "",
        tajweed: [],
        att: 0,
        inter: 0,
        ach: 0,
        hwNew: { surah: "", from: "", to: "" },
        hwRecent: { surah: "", from: "", to: "" },
        hwDistant: { surah: "", from: "", to: "" },
        islamicGeneral: "",
        islamicBlocks: [],
        islamicRating: 0,
        islamicNotes: "",
        islamicHw: "",
      };
    }
    return appState.ui.sessionForm;
  }

  function renderStars(field, value) {
    const stars = [1, 2, 3, 4, 5]
      .map(
        (i) => `<span class="star ${i <= value ? "" : "inactive"}" onclick="setRating('${field}', ${i})">⭐</span>`
      )
      .join("");
    return `<div class="rating-stars">${stars}<span class="star inactive" onclick="setRating('${field}', 0)">✖</span></div>`;
  }

  window.setRating = function (field, value) {
    const form = ensureSessionForm();
    form[field] = value;
    router.render();
  };

  window.updateSessionField = function (field, value) {
    const form = ensureSessionForm();
    form[field] = value;
  };

  window.updateSessionNestedField = function (group, field, value) {
    const form = ensureSessionForm();
    if (!form[group]) form[group] = {};
    form[group][field] = value;
  };

  window.toggleTajweed = function (item, checked) {
    const form = ensureSessionForm();
    if (checked) {
      if (!form.tajweed.includes(item)) form.tajweed.push(item);
    } else {
      form.tajweed = form.tajweed.filter((t) => t !== item);
    }
  };

  window.addIslamicBlock = function (type) {
    const form = ensureSessionForm();
    const category = ISLAMIC_CATEGORIES.find((c) => c.id === type);
    if (!category) return;
    form.islamicBlocks.push({
      id: `b-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      data: {},
    });
    router.render();
  };

  window.updateIslamicBlock = function (id, field, value) {
    const form = ensureSessionForm();
    const block = form.islamicBlocks.find((b) => b.id === id);
    if (!block) return;
    block.data[field] = value;
  };

  window.removeIslamicBlock = function (id) {
    const form = ensureSessionForm();
    form.islamicBlocks = form.islamicBlocks.filter((b) => b.id !== id);
    router.render();
  };

  function computeNextPackageCount(studentId, limit) {
    const count = appState.sessions.filter((s) => s.studentId === studentId).length;
    return (count % limit) + 1;
  }

  window.saveSession = async function () {
    const form = ensureSessionForm();
    if (!form.studentId) {
      showToast("اختر الطالب أولاً");
      return;
    }

    if (form.sessionType === "quran" && !form.hifzText.trim()) {
      showToast("اكتب نص التسميع");
      return;
    }

    const student = appState.students.find((s) => s.id === form.studentId);
    const limit = student?.sessionLimit || appState.settings.defaultLimit || 12;
    const packageSessionNum = computeNextPackageCount(form.studentId, limit);
    const overall = form.att + form.inter + form.ach > 0 ?
      Math.round(((form.att + form.inter + form.ach) / 3) * 10) / 10 : 0;

    const sessionData = {
      studentId: form.studentId,
      studentName: student?.name || "",
      date: form.date,
      dateAr: formatArDate(form.date),
      sessionType: form.sessionType,
      packageSessionNum,
      overall,
      hifz: form.sessionType === "quran" ? { text: form.hifzText, rating: form.hifzRating, notes: form.hifzNotes } : null,
      recent: form.sessionType === "quran" ? { text: form.recentText, rating: form.recentRating, notes: form.recentNotes } : null,
      distant: form.sessionType === "quran" ? { text: form.distantText, rating: form.distantRating, notes: form.distantNotes } : null,
      tajweed: form.sessionType === "quran" ? form.tajweed : [],
      homework: form.sessionType === "quran" ? {
        new: form.hwNew,
        recent: form.hwRecent,
        distant: form.hwDistant,
      } : null,
      islamic: form.sessionType === "islamic" ? {
        general: form.islamicGeneral,
        blocks: form.islamicBlocks,
        rating: form.islamicRating,
        notes: form.islamicNotes,
        homework: form.islamicHw,
      } : null,
      scores: { att: form.att, inter: form.inter, ach: form.ach },
    };

    try {
      await dbModule.addSession(sessionData);
      showToast("تم تسجيل الجلسة بنجاح");
      appState.ui.sessionForm = null;
      router.render();
    } catch (err) {
      console.error(err);
      showToast("خطأ أثناء حفظ الجلسة");
    }
  };

  function renderIslamicBlocks(blocks) {
    if (!blocks.length) {
      return `<div style="font-size:12px;color:#9ca3af;">لم يتم إضافة أقسام بعد.</div>`;
    }
    return blocks
      .map((block) => {
        const category = ISLAMIC_CATEGORIES.find((c) => c.id === block.type);
        if (!category) return "";
        return `
          <div class="card-soft" style="background:#f9fafb;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div style="font-weight:700;">${category.label}</div>
              <button class="btn btn-light" onclick="removeIslamicBlock('${block.id}')">×</button>
            </div>
            ${category.fields
              .map(
                (f) => `
              <div class="mb-2">
                <label class="form-label">${f.label}</label>
                <input class="form-control" value="${block.data[f.key] || ""}" placeholder="${f.placeholder}" oninput="updateIslamicBlock('${block.id}', '${f.key}', this.value)" />
              </div>
            `
              )
              .join("")}
          </div>
        `;
      })
      .join("");
  }

  window.renderSessionForm = function () {
    const form = ensureSessionForm();
    const students = appState.students;

    if (!students.length) {
      return `<div class="card-soft">لا يوجد طلاب حالياً. أضف طالباً من الإعدادات أولاً.</div>`;
    }

    const selectedStudent = students.find((s) => s.id === form.studentId);
    const limit = selectedStudent?.sessionLimit || appState.settings.defaultLimit || 12;
    const packageNum = selectedStudent ? computeNextPackageCount(selectedStudent.id, limit) : "-";

    return `
      <div class="card-soft">
        <div class="d-flex gap-2 mb-3">
          <button class="btn ${form.sessionType === "quran" ? "btn-success" : "btn-outline-success"} flex-fill" onclick="updateSessionField('sessionType','quran'); router.render();">📿 قرآن</button>
          <button class="btn ${form.sessionType === "islamic" ? "btn-warning" : "btn-outline-warning"} flex-fill" onclick="updateSessionField('sessionType','islamic'); router.render();">📘 تربية إسلامية</button>
        </div>

        <div class="mb-2">
          <label class="form-label">الطالب</label>
          <select class="form-select" onchange="updateSessionField('studentId', this.value); router.render();">
            <option value="">اختر الطالب...</option>
            ${students
              .map(
                (s) => `<option value="${s.id}" ${s.id === form.studentId ? "selected" : ""}>${s.name}</option>`
              )
              .join("")}
          </select>
        </div>

        <div class="mb-2">
          <label class="form-label">تاريخ الجلسة</label>
          <input type="date" class="form-control" value="${form.date}" onchange="updateSessionField('date', this.value)" />
        </div>

        ${selectedStudent ? `
          <div class="badge-soft mb-3">الحصة رقم ${packageNum} من باقة ${limit}</div>
        ` : ""}

        ${form.sessionType === "quran" ? `
          <div class="card-soft mb-2" style="background:#f0fdf4;">
            <label class="form-label">التسميع الجديد</label>
            <input class="form-control mb-2" value="${form.hifzText}" oninput="updateSessionField('hifzText', this.value)" />
            ${renderStars("hifzRating", form.hifzRating)}
            <textarea class="form-control mt-2" placeholder="ملاحظات" oninput="updateSessionField('hifzNotes', this.value)">${form.hifzNotes}</textarea>
          </div>

          <div class="card-soft mb-2" style="background:#f9fafb;">
            <label class="form-label">الماضي القريب</label>
            <input class="form-control mb-2" value="${form.recentText}" oninput="updateSessionField('recentText', this.value)" />
            ${renderStars("recentRating", form.recentRating)}
            <textarea class="form-control mt-2" placeholder="ملاحظات" oninput="updateSessionField('recentNotes', this.value)">${form.recentNotes}</textarea>
          </div>

          <div class="card-soft mb-2" style="background:#f9fafb;">
            <label class="form-label">الماضي البعيد</label>
            <input class="form-control mb-2" value="${form.distantText}" oninput="updateSessionField('distantText', this.value)" />
            ${renderStars("distantRating", form.distantRating)}
            <textarea class="form-control mt-2" placeholder="ملاحظات" oninput="updateSessionField('distantNotes', this.value)">${form.distantNotes}</textarea>
          </div>

          <div class="card-soft mb-2">
            <label class="form-label">أحكام التجويد</label>
            <div class="d-flex flex-wrap gap-2">
              ${TAJWEED.map(
                (t) => `
                  <label class="form-check" style="margin-left:8px;">
                    <input class="form-check-input" type="checkbox" ${form.tajweed.includes(t) ? "checked" : ""} onchange="toggleTajweed('${t}', this.checked)" />
                    <span class="form-check-label">${t}</span>
                  </label>
                `
              ).join("")}
            </div>
          </div>

          <div class="card-soft mb-2" style="background:#fdfaf3;">
            <label class="form-label">الواجب المنزلي</label>
            <div class="row g-2">
              <div class="col-12 col-md-4">
                <input class="form-control" placeholder="سورة الجديد" value="${form.hwNew.surah}" oninput="updateSessionNestedField('hwNew','surah', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="من" value="${form.hwNew.from}" oninput="updateSessionNestedField('hwNew','from', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="إلى" value="${form.hwNew.to}" oninput="updateSessionNestedField('hwNew','to', this.value)" />
              </div>
            </div>
            <div class="row g-2 mt-2">
              <div class="col-12 col-md-4">
                <input class="form-control" placeholder="سورة القريب" value="${form.hwRecent.surah}" oninput="updateSessionNestedField('hwRecent','surah', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="من" value="${form.hwRecent.from}" oninput="updateSessionNestedField('hwRecent','from', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="إلى" value="${form.hwRecent.to}" oninput="updateSessionNestedField('hwRecent','to', this.value)" />
              </div>
            </div>
            <div class="row g-2 mt-2">
              <div class="col-12 col-md-4">
                <input class="form-control" placeholder="سورة البعيد" value="${form.hwDistant.surah}" oninput="updateSessionNestedField('hwDistant','surah', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="من" value="${form.hwDistant.from}" oninput="updateSessionNestedField('hwDistant','from', this.value)" />
              </div>
              <div class="col-6 col-md-4">
                <input class="form-control" placeholder="إلى" value="${form.hwDistant.to}" oninput="updateSessionNestedField('hwDistant','to', this.value)" />
              </div>
            </div>
          </div>
        ` : `
          <div class="card-soft mb-2">
            <label class="form-label">الدرس العام</label>
            <textarea class="form-control" oninput="updateSessionField('islamicGeneral', this.value)">${form.islamicGeneral}</textarea>
          </div>

          <div class="card-soft mb-2">
            <div class="d-flex flex-wrap gap-2 mb-2">
              ${ISLAMIC_CATEGORIES.map(
                (c) => `<button class="btn btn-light" onclick="addIslamicBlock('${c.id}')">➕ ${c.label}</button>`
              ).join("")}
            </div>
            ${renderIslamicBlocks(form.islamicBlocks)}
          </div>

          <div class="card-soft mb-2" style="background:#fdfaf3;">
            <label class="form-label">تقييم الجلسة</label>
            ${renderStars("islamicRating", form.islamicRating)}
            <textarea class="form-control mt-2" placeholder="ملاحظات" oninput="updateSessionField('islamicNotes', this.value)">${form.islamicNotes}</textarea>
          </div>

          <div class="card-soft mb-2" style="background:#f0fdf4;">
            <label class="form-label">واجب التربية الإسلامية</label>
            <input class="form-control" value="${form.islamicHw}" oninput="updateSessionField('islamicHw', this.value)" />
          </div>
        `}

        <div class="card-soft mt-3">
          <div class="row g-2">
            <div class="col-4">
              <label class="form-label">الانتباه</label>
              <input type="number" min="0" max="5" class="form-control" value="${form.att}" oninput="updateSessionField('att', Number(this.value))" />
            </div>
            <div class="col-4">
              <label class="form-label">التفاعل</label>
              <input type="number" min="0" max="5" class="form-control" value="${form.inter}" oninput="updateSessionField('inter', Number(this.value))" />
            </div>
            <div class="col-4">
              <label class="form-label">الإنجاز</label>
              <input type="number" min="0" max="5" class="form-control" value="${form.ach}" oninput="updateSessionField('ach', Number(this.value))" />
            </div>
          </div>
        </div>

        <button class="btn btn-success w-100 mt-3" onclick="saveSession()">💾 حفظ الجلسة</button>
      </div>
    `;
  };

  window.initSessionForm = function () {
    return;
  };
})();
