const STORAGE_KEY = "tickeron-malaysia-survey-responses";
const ADMIN_AUTH_KEY = "tickeron-admin-authenticated";
const ADMIN_PASSWORD = "mycdd";

const adminLabels = {
  All: "全部",
  Beginner: "初级",
  Intermediate: "中级",
  Advanced: "高级",
  Expert: "专家",
  Conservative: "保守型",
  Moderate: "中等",
  "Moderately Aggressive": "中等激进",
  Aggressive: "进取型",
  Yes: "是",
  No: "否",
  Maybe: "或许",
  Completed: "已完成",
  "RM500 - RM30,000": "RM500 - RM30,000",
  "RM30,000 - RM100,000": "RM30,000 - RM100,000",
  "RM100,000 - RM500,000": "RM100,000 - RM500,000",
  "RM500,000 - RM2,000,000": "RM500,000 - RM2,000,000",
  "Above RM2,000,000": "RM2,000,000以上",
  "Below RM30,000": "低于 RM30,000",
  "RM30,000 - RM99,999": "RM30,000 - RM99,999",
  "RM100,000 - RM499,999": "RM100,000 - RM499,999",
  "RM500,000 - RM1,999,999": "RM500,000 - RM1,999,999",
};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const questions = [
  {
    key: "experience",
    title: "What is your investment experience?",
    type: "single",
    options: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  {
    key: "risk",
    title: "What is your investment risk tolerance?",
    type: "single",
    options: ["Conservative", "Moderate", "Moderately Aggressive", "Aggressive"],
  },
  {
    key: "capital",
    title: "Investable Capital",
    type: "number",
    placeholder: "Enter amount in RM",
  },
  {
    key: "growthGoal",
    title: "What is your asset growth target in this profit plan?",
    hint: "Please choose the option that best matches your goal.",
    type: "single",
    wide: true,
    options: ["RM500 - RM30,000", "RM30,000 - RM100,000", "RM100,000 - RM500,000", "RM500,000 - RM2,000,000", "Above RM2,000,000"],
  },
  {
    key: "discipline",
    title: "Can you strictly follow the guidelines for designated buy and sell points?",
    type: "single",
    options: ["Yes", "No", "Maybe"],
  },
  {
    key: "confidentialExecution",
    title: "Do you want the investment plan to be executed in absolute confidentiality?",
    type: "single",
    options: ["Yes", "No"],
  },
  {
    key: "badRecord",
    title: "Do you have any adverse record with any broker or trading company?",
    type: "single",
    options: ["Yes", "No"],
  },
];

const capitalBuckets = ["Below RM30,000", "RM30,000 - RM99,999", "RM100,000 - RM499,999", "RM500,000 - RM1,999,999", "Above RM2,000,000"];

function getResponses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

function saveResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

async function syncResponsesFromServer() {
  try {
    const response = await fetch("/api/responses", { cache: "no-store" });
    if (!response.ok) return getResponses();
    const responses = await response.json();
    if (Array.isArray(responses)) {
      saveResponses(responses);
      return responses;
    }
  } catch (error) {
    return getResponses();
  }
  return getResponses();
}

async function persistResponse(response) {
  try {
    const result = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
    if (!result.ok) throw new Error("Unable to save response");
    const responses = await result.json();
    if (Array.isArray(responses)) saveResponses(responses);
  } catch (error) {
    const responses = getResponses();
    if (!responses.some((item) => item.id === response.id)) {
      saveResponses([response, ...responses]);
    }
  }
}

function icon(name) {
  const icons = {
    arrowLeft: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    trend: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17 9 11l4 4 8-8"/><path d="M21 7v7h-7"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11Z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15v2"/><path d="M12 9v8"/><path d="M17 5v12"/></svg>',
    doc: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7"/><path d="M16 13h.01"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    target: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  };
  return icons[name] || "";
}

function renderSurvey() {
  let state = {
    step: 0,
    values: {
      name: "",
      phone: "",
      email: "",
      experience: "",
      risk: "",
      capital: "",
      growthGoal: "",
      discipline: "",
      confidentialExecution: "",
      badRecord: "",
    },
  };

  const app = document.querySelector("#app");
  app.innerHTML = `
    <main class="survey-shell">
      <section class="hero">
        <div class="hero-mark"><div class="bars"><span></span><span></span><span></span></div></div>
        <h1>Tickeron Student Survey</h1>
        <p class="hero-subtitle">Malaysia Investment Customer Insights</p>
        <div class="notice"><span class="notice-icon">${icon("shield")}</span><span>Your personal information will be kept strictly confidential and used only for Tickeron research.</span></div>
      </section>
      <section class="progress-card">
        <span id="stepLabel">Step 1 of 8</span>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <span class="progress-percent" id="progressPercent">13%</span>
      </section>
      <form id="surveyForm" novalidate></form>
      <section class="done-card" id="doneCard">
        <span class="notice-icon">${icon("check")}</span>
        <h2>Congratulations, your application is complete.</h2>
        <p>Please wait patiently for notification. We wish you success in your stock market investments.</p>
      </section>
    </main>
  `;

  const form = document.querySelector("#surveyForm");
  const done = document.querySelector("#doneCard");

  function validateCurrent() {
    if (state.step === 0) return state.values.name.trim() && state.values.phone.trim() && /\S+@\S+\.\S+/.test(state.values.email);
    const q = questions[state.step - 1];
    return String(state.values[q.key] || "").trim();
  }

  function renderStep() {
    const percent = state.step === 0 ? 0 : Math.round((state.step / questions.length) * 100);
    document.querySelector("#stepLabel").textContent = state.step === 0 ? "Required Information" : `Question ${state.step} of ${questions.length}`;
    document.querySelector("#progressFill").style.width = `${percent}%`;
    document.querySelector("#progressPercent").textContent = `${percent}%`;
    done.classList.remove("visible");
    form.style.display = "block";

    if (state.step === 0) {
      form.innerHTML = `
        <section class="field-card">
          <div class="question-heading">
            <span class="step-number">i</span>
            <h2>Your required information</h2>
          </div>
          <div class="field-grid">
            ${field("Full Name", "name", "Your name", state.values.name)}
            ${field("Phone Number", "phone", "+60", state.values.phone)}
            ${field("Email", "email", "name@example.com", state.values.email)}
          </div>
          <p class="error" id="errorMsg">Please enter your name, phone number, and a valid email address.</p>
        </section>
        ${actions()}
      `;
    } else {
      const q = questions[state.step - 1];
      form.innerHTML = `
        <section class="question-card">
          <div class="question-heading">
            <span class="step-number">${state.step}</span>
            <h2>${q.title}</h2>
          </div>
          ${q.hint ? `<p class="question-hint">${q.hint}</p>` : ""}
          ${questionInput(q)}
          <p class="error" id="errorMsg">Please complete this required question.</p>
        </section>
        ${actions()}
      `;
    }

    bindStepEvents();
  }

  function field(label, key, placeholder, value) {
    return `
      <div class="field">
        <label for="${key}">${label}</label>
        <input class="text-input" id="${key}" name="${key}" value="${escapeHtml(value)}" placeholder="${placeholder}" required />
      </div>
    `;
  }

  function questionInput(q) {
    if (q.type === "number") {
      return `
        <div class="field">
          <input class="text-input" id="${q.key}" name="${q.key}" inputmode="decimal" value="${escapeHtml(state.values[q.key])}" placeholder="${q.placeholder}" required />
        </div>
      `;
    }

    return `
      <div class="options ${q.wide ? "capital-goals" : ""}">
        ${q.options.map((option) => `
          <label class="choice ${state.values[q.key] === option ? "selected" : ""}">
            <input type="radio" name="${q.key}" value="${escapeHtml(option)}" ${state.values[q.key] === option ? "checked" : ""} />
            <span>${option}</span>
          </label>
        `).join("")}
      </div>
    `;
  }

  function actions() {
    return `
      <div class="form-actions">
        <button class="secondary-btn" type="button" id="backBtn">${icon("arrowLeft")} Back</button>
        <button class="primary-btn" type="submit">${state.step === questions.length ? "Submit" : "Next"} ${icon("arrowRight")}</button>
      </div>
    `;
  }

  function bindStepEvents() {
    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        state.values[input.name] = input.value;
        document.querySelector("#errorMsg").classList.remove("visible");
      });
      input.addEventListener("change", () => {
        state.values[input.name] = input.value;
        document.querySelector("#errorMsg").classList.remove("visible");
        if (input.type === "radio") {
          form.querySelectorAll(".choice").forEach((choice) => choice.classList.remove("selected"));
          input.closest(".choice").classList.add("selected");
        }
      });
    });

    document.querySelector("#backBtn").addEventListener("click", () => {
      if (state.step === 0) return;
      state.step -= 1;
      renderStep();
    });

    form.onsubmit = async (event) => {
      event.preventDefault();
      if (!validateCurrent()) {
        document.querySelector("#errorMsg").classList.add("visible");
        return;
      }
      if (state.step < questions.length) {
        state.step += 1;
        renderStep();
        return;
      }
      const responses = getResponses();
      const response = {
        id: `MY-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        ...state.values,
        submittedAt: new Date().toISOString(),
        status: "Completed",
      };
      saveResponses([response, ...responses]);
      await persistResponse(response);
      form.style.display = "none";
      done.classList.add("visible");
      document.querySelector("#stepLabel").textContent = "Completed";
      document.querySelector("#progressFill").style.width = "100%";
      document.querySelector("#progressPercent").textContent = "100%";
    };
  }

  renderStep();
}

async function renderAdmin() {
  if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== "true") {
    renderAdminLogin();
    return;
  }

  const app = document.querySelector("#app");
  app.innerHTML = `<main class="login-shell"><section class="login-card"><h1>正在加载后台...</h1><p>正在同步最新问卷记录。</p></section></main>`;
  await syncResponsesFromServer();

  app.innerHTML = `
    <main class="admin-layout">
      <aside class="sidebar">
        <div class="brand">
          <div class="bars"><span></span><span></span><span></span></div>
          <div><strong>Tickeron 学员问卷调查</strong><span>马来西亚</span></div>
        </div>
        <nav class="nav">
          <button class="active" data-view="dashboard">${icon("home")} 数据概览</button>
          <button data-view="results">${icon("chart")} 问卷结果</button>
          <button data-view="respondents">${icon("users")} 受访者</button>
          <button data-view="reports">${icon("doc")} 报告</button>
        </nav>
        <div class="sidebar-art"></div>
      </aside>
      <section class="admin-main">
        <header class="admin-header">
          <div class="admin-title">
            <h1>问卷数据分析后台</h1>
            <p>Tickeron 学员问卷调查 · 马来西亚 🇲🇾</p>
          </div>
          <div class="admin-tools">
            <input class="text-input search" id="searchInput" placeholder="搜索姓名、电话、邮箱..." />
            <button class="admin-btn" id="exportBtn">导出 CSV</button>
            <a class="admin-btn" href="#survey">打开问卷</a>
            <button class="admin-btn ghost" id="logoutBtn">退出登录</button>
          </div>
        </header>
        <section id="adminContent"></section>
      </section>
    </main>
  `;

  let activeView = "dashboard";
  let filters = {
    search: "",
    experience: "All",
    risk: "All",
    goal: "All",
    record: "All",
  };

  function filtered() {
    return getResponses().filter((item) => {
      const query = filters.search.toLowerCase();
      const matchesQuery = !query || [item.name, item.phone, item.email, item.id].some((value) => String(value).toLowerCase().includes(query));
      return matchesQuery
        && (filters.experience === "All" || item.experience === filters.experience)
        && (filters.risk === "All" || item.risk === filters.risk)
        && (filters.goal === "All" || item.growthGoal === filters.goal)
        && (filters.record === "All" || item.badRecord === filters.record);
    });
  }

  function renderView() {
    const data = filtered();
    const allResponses = getResponses();
    const total = allResponses.length;
    const today = allResponses.filter((item) => new Date(item.submittedAt).toDateString() === new Date().toDateString()).length;
    const metrics = `
      <section class="metrics">
        ${metric("总提交数", total, `当前筛选 ${data.length} 条`, "users", spark([22, 30, 26, 34, 28, 42, 38, 52]))}
        ${metric("问卷问题数", questions.length, "不含姓名、电话、邮箱", "doc", spark([7, 7, 7, 7, 7, 7, 7, 7], "teal"))}
        ${metric("平均可投资资本", `RM${formatMoney(avg(data.map((x) => Number(x.capital) || 0)))}`, data.length ? "基于当前筛选结果" : "暂无筛选结果", "trend", spark([12, 18, 16, 21, 28, 24, 32, 37], "violet"))}
        ${metric("今日新增", today, "来自全部提交记录", "clock", barsMini([5, 9, 7, 10, 8, 12, 6, 14]))}
      </section>
    `;
    const filtersMarkup = `
      <section class="filter-bar">
        ${filter("投资经验", "experienceFilter", ["All", ...questions[0].options], filters.experience)}
        ${filter("风险承受能力", "riskFilter", ["All", ...questions[1].options], filters.risk)}
        ${filter("资产增长目标", "goalFilter", ["All", ...questions[3].options], filters.goal)}
        ${filter("经纪商不良记录", "recordFilter", ["All", "Yes", "No"], filters.record)}
        <button class="admin-btn" id="clearFilters">清除筛选</button>
      </section>
    `;
    const charts = `
      <section class="dashboard-grid">
        <article class="admin-card">${donutPanel(data, "experience", "1. 投资经验", questions[0].options)}</article>
        <article class="admin-card">${barPanel(data, "risk", "2. 风险承受能力", questions[1].options)}</article>
        <article class="admin-card">${capitalPanel(data)}</article>
        <article class="admin-card">${goalPanel(data)}</article>
        <article class="admin-card">${barPanel(data, "discipline", "5. 遵守指定买卖点", questions[4].options)}</article>
        <article class="admin-card">${barPanel(data, "confidentialExecution", "6. 保密执行需求", questions[5].options)}</article>
        <article class="admin-card">${barPanel(data, "badRecord", "7. 经纪商/交易公司不良记录", questions[6].options)}</article>
        <article class="admin-card">${trendPanel(data)}</article>
        <article class="admin-card">${insightsPanel(data)}</article>
      </section>
    `;
    const table = `
      <section class="table-card">
        <h3>${activeView === "respondents" ? "受访者" : activeView === "results" ? "问卷结果" : "最近提交"}</h3>
        <div id="tableWrap"></div>
      </section>
    `;

    const contentByView = {
      dashboard: `${metrics}${filtersMarkup}${charts}${table}`,
      results: `${filtersMarkup}${charts}${table}`,
      respondents: `${filtersMarkup}${table}`,
      reports: `${metrics}<section class="dashboard-grid"><article class="admin-card wide">${insightsPanel(data)}</article><article class="admin-card">${donutPanel(data, "experience", "1. 投资经验", questions[0].options)}</article><article class="admin-card">${barPanel(data, "risk", "2. 风险承受能力", questions[1].options)}</article><article class="admin-card">${capitalPanel(data)}</article><article class="admin-card">${goalPanel(data)}</article><article class="admin-card">${barPanel(data, "discipline", "5. 遵守指定买卖点", questions[4].options)}</article><article class="admin-card">${barPanel(data, "confidentialExecution", "6. 保密执行需求", questions[5].options)}</article><article class="admin-card">${barPanel(data, "badRecord", "7. 经纪商/交易公司不良记录", questions[6].options)}</article></section>`,
    };

    document.querySelector("#adminContent").innerHTML = contentByView[activeView];
    if (document.querySelector("#tableWrap")) renderTable(data);
    bindFilterEvents();
  }

  function renderTable(data) {
    const wrap = document.querySelector("#tableWrap");
    if (!data.length) {
      wrap.innerHTML = `<div class="empty">当前筛选条件下没有匹配的提交记录。</div>`;
      return;
    }
    wrap.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>受访者 ID</th><th>姓名</th><th>电话</th><th>电子邮件</th><th>1. 投资经验</th><th>2. 风险承受能力</th><th>3. 可投资资本</th><th>4. 资产增长目标</th><th>5. 遵守买卖点</th><th>6. 保密执行</th><th>7. 不良记录</th><th>提交日期</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((item) => `
            <tr>
              <td>${item.id}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.phone)}</td>
              <td>${escapeHtml(item.email)}</td>
              <td>${adminText(item.experience)}</td>
              <td>${adminText(item.risk)}</td>
              <td>RM${formatMoney(Number(item.capital) || 0)}</td>
              <td>${adminText(item.growthGoal)}</td>
              <td>${adminText(item.discipline)}</td>
              <td>${adminText(item.confidentialExecution)}</td>
              <td>${adminText(item.badRecord)}</td>
              <td>${new Date(item.submittedAt).toLocaleDateString("en-MY")}</td>
              <td><span class="status">${adminText(item.status)}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function bindFilterEvents() {
    const experienceFilter = document.querySelector("#experienceFilter");
    const riskFilter = document.querySelector("#riskFilter");
    const goalFilter = document.querySelector("#goalFilter");
    const recordFilter = document.querySelector("#recordFilter");
    if (experienceFilter) experienceFilter.addEventListener("change", (event) => {
      filters.experience = event.target.value;
      renderView();
    });
    if (riskFilter) riskFilter.addEventListener("change", (event) => {
      filters.risk = event.target.value;
      renderView();
    });
    if (goalFilter) goalFilter.addEventListener("change", (event) => {
      filters.goal = event.target.value;
      renderView();
    });
    if (recordFilter) recordFilter.addEventListener("change", (event) => {
      filters.record = event.target.value;
      renderView();
    });
    const clearFilters = document.querySelector("#clearFilters");
    if (clearFilters) clearFilters.addEventListener("click", () => {
      filters = { search: filters.search, experience: "All", risk: "All", goal: "All", record: "All" };
      renderView();
    });
  }

  document.querySelectorAll(".nav button").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      document.querySelectorAll(".nav button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderView();
    });
  });

  document.querySelector("#searchInput").addEventListener("input", (event) => {
    filters.search = event.target.value;
    renderView();
  });
  document.querySelector("#exportBtn").addEventListener("click", () => exportCsv(filters));
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    renderAdminLogin();
  });

  renderView();
}

function renderAdminLogin() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-card">
        <div class="brand login-brand">
          <div class="bars"><span></span><span></span><span></span></div>
          <div><strong>Tickeron 学员问卷调查</strong><span>运营后台</span></div>
        </div>
        <h1>后台登录</h1>
        <p>请输入运营后台密码以查看问卷结果。</p>
        <form id="loginForm" novalidate>
          <label class="field" for="adminPassword">
            <span>密码</span>
            <input class="text-input" id="adminPassword" type="password" autocomplete="current-password" placeholder="请输入密码" />
          </label>
          <p class="error" id="loginError">密码不正确，请重试。</p>
          <button class="primary-btn login-submit" type="submit">进入后台</button>
        </form>
      </section>
    </main>
  `;

  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const password = document.querySelector("#adminPassword").value;
    if (password !== ADMIN_PASSWORD) {
      document.querySelector("#loginError").classList.add("visible");
      return;
    }
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    renderAdmin();
  });
}

function filter(label, id, options, selected = "All") {
  return `
    <div>
      <label for="${id}">${label}</label>
      <select class="select" id="${id}">
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${adminText(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function metric(label, value, note, iconName, chart) {
  return `
    <article class="admin-card metric">
      <span class="metric-icon">${icon(iconName)}</span>
      <div>
        <span>${label}</span>
        <b>${value}</b>
        <small>${note}</small>
      </div>
      ${chart}
    </article>
  `;
}

function donutPanel(data, key, title, options) {
  const counts = countBy(data, key, options);
  const total = Math.max(data.length, 1);
  const values = options.map((option) => counts[option]);
  const stops = values.reduce((acc, value, index) => {
    acc.push((acc[index - 1] || 0) + (value / total) * 100);
    return acc;
  }, []);
  return `
    <h3 class="panel-title">${title}</h3>
    <div class="donut-wrap">
      <div class="donut" data-count="${data.length}" style="--a:${stops[0]}%;--b:${stops[1]}%;--c:${stops[2]}%"></div>
      <div class="legend">
        ${options.map((option, index) => `
          <div class="legend-row"><span class="dot" style="background:${["#075eea", "#12a6aa", "#7464d8", "#f7bd45"][index]}"></span><span>${adminText(option)}</span><b>${percent(counts[option], total)}</b></div>
        `).join("")}
      </div>
    </div>
  `;
}

function barPanel(data, key, title, options) {
  const counts = countBy(data, key, options);
  const total = Math.max(data.length, 1);
  return `
    <h3 class="panel-title">${title}</h3>
    <div class="bar-list">
      ${options.map((option) => `
        <div class="bar-row">
          <span>${adminText(option)}</span>
          <span class="bar-track"><span class="bar-value" style="display:block;width:${percent(counts[option], total)}"></span></span>
          <b>${percent(counts[option], total)}</b>
        </div>
      `).join("")}
    </div>
  `;
}

function goalPanel(data) {
  const options = questions[3].options;
  const counts = countBy(data, "growthGoal", options);
  const total = Math.max(data.length, 1);
  return `
    <h3 class="panel-title">4. 资产增长目标</h3>
    <div class="goal-bars">
      ${options.map((option, index) => `
        <div class="goal-col">
          <span class="pillar" style="height:${Math.max(8, counts[option] / total * 135)}px;background:${["#075eea", "#2683e8", "#12a6aa", "#7464d8", "#f7bd45"][index]}"></span>
          <span><b>${percent(counts[option], total)}</b><br>${adminText(option).replaceAll("RM", "")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function capitalPanel(data) {
  const counts = Object.fromEntries(capitalBuckets.map((bucket) => [bucket, 0]));
  data.forEach((item) => {
    counts[capitalBucket(item.capital)] += 1;
  });
  const total = Math.max(data.length, 1);
  const values = data.map((item) => Number(item.capital) || 0).filter((value) => value > 0);
  const average = avg(values);
  return `
    <h3 class="panel-title">3. 可投资资本</h3>
    <div class="bar-list">
      ${capitalBuckets.map((bucket) => `
        <div class="bar-row">
          <span>${adminText(bucket)}</span>
          <span class="bar-track"><span class="bar-value" style="display:block;width:${percent(counts[bucket], total)}"></span></span>
          <b>${percent(counts[bucket], total)}</b>
        </div>
      `).join("")}
    </div>
    <p class="panel-note">平均值：RM${formatMoney(average)}${values.length ? "" : "（暂无数据）"}</p>
  `;
}

function capitalBucket(value) {
  const amount = Number(value) || 0;
  if (amount < 30000) return "Below RM30,000";
  if (amount < 100000) return "RM30,000 - RM99,999";
  if (amount < 500000) return "RM100,000 - RM499,999";
  if (amount < 2000000) return "RM500,000 - RM1,999,999";
  return "Above RM2,000,000";
}

function trendPanel(data) {
  const days = Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (9 - index));
    const count = data.filter((item) => new Date(item.submittedAt).toDateString() === date.toDateString()).length;
    return { label: date.toLocaleDateString("en-MY", { month: "short", day: "numeric" }), count };
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  const points = days.map((day, index) => `${index * 44 + 8},${150 - (day.count / max) * 110}`).join(" ");
  return `
    <h3 class="panel-title">提交趋势</h3>
    <svg class="trend" viewBox="0 0 420 180" preserveAspectRatio="none">
      <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#075eea" stop-opacity=".22"/><stop offset="1" stop-color="#075eea" stop-opacity=".02"/></linearGradient></defs>
      <path d="M8 150 L${points} L404 160 L8 160 Z" fill="url(#trendFill)"></path>
      <polyline points="${points}" fill="none" stroke="#075eea" stroke-width="4"></polyline>
      ${days.map((day, index) => `<text x="${index * 44 + 8}" y="176" font-size="11" fill="#66738c">${day.label}</text>`).join("")}
    </svg>
  `;
}

function productPanel(data) {
  const products = [
    ["严格遵守买卖点", "discipline", "Yes", "target"],
    ["要求保密执行", "confidentialExecution", "Yes", "shield"],
    ["无不良记录", "badRecord", "No", "check"],
    ["高级及以上", "experience", "Advanced", "trend"],
    ["进取型风险", "risk", "Aggressive", "chart"],
  ];
  const total = Math.max(data.length, 1);
  return `
    <h3 class="panel-title">运营就绪度概览</h3>
    <div class="product-grid">
      ${products.map(([label, key, value, iconName]) => {
        const count = data.filter((item) => item[key] === value || (label === "高级及以上" && item[key] === "Expert")).length;
        return `<div class="product">${icon(iconName)}<span>${label}</span><b>${percent(count, total)}</b><small>${count} 位受访者</small></div>`;
      }).join("")}
    </div>
  `;
}

function insightsPanel(data) {
  const topExperience = adminText(topValue(data, "experience") || "暂无数据");
  const cleanRecords = data.filter((item) => item.badRecord === "No").length;
  const strict = data.filter((item) => item.discipline === "Yes").length;
  const total = Math.max(data.length, 1);
  return `
    <h3 class="panel-title">AI / 运营洞察</h3>
    <div class="insights">
      <div class="insight"><span class="insight-icon">${icon("target")}</span><span><b>主要人群：</b>${topExperience}投资者目前占比最高。</span></div>
      <div class="insight"><span class="insight-icon">${icon("check")}</span><span><b>${percent(strict, total)}</b> 的受访者可以严格遵守指定买卖点。</span></div>
      <div class="insight"><span class="insight-icon">${icon("shield")}</span><span><b>${percent(cleanRecords, total)}</b> 的受访者表示在经纪商或交易公司无不良记录。</span></div>
    </div>
  `;
}

function countBy(data, key, options) {
  const counts = Object.fromEntries(options.map((option) => [option, 0]));
  data.forEach((item) => {
    if (counts[item[key]] !== undefined) counts[item[key]] += 1;
  });
  return counts;
}

function topValue(data, key) {
  const counts = {};
  data.forEach((item) => counts[item[key]] = (counts[item[key]] || 0) + 1);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function percent(value, total) {
  return `${Math.round((value / total) * 100)}%`;
}

function avg(values) {
  const clean = values.filter(Boolean);
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function formatMoney(value) {
  return Math.round(value).toLocaleString("en-MY");
}

function adminText(value) {
  return adminLabels[value] || value;
}

function spark(values, color = "blue") {
  const stroke = color === "teal" ? "#12a6aa" : color === "violet" ? "#7464d8" : "#075eea";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => `${index * 10},${40 - ((value - min) / Math.max(max - min, 1)) * 32}`).join(" ");
  return `<svg class="mini-chart" viewBox="0 0 74 48"><polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="3"/></svg>`;
}

function barsMini(values) {
  const max = Math.max(...values);
  return `<svg class="mini-chart" viewBox="0 0 74 48">${values.map((value, index) => `<rect x="${index * 9}" y="${42 - value / max * 34}" width="5" height="${value / max * 34}" fill="#12a6aa" opacity=".85"/>`).join("")}</svg>`;
}

function exportCsv(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const link = document.createElement("a");
  link.href = `/api/responses.csv?${params.toString()}`;
  link.download = "tickeron-malaysia-survey-results-zh.csv";
  link.click();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function route() {
  if (location.hash === "#admin") renderAdmin();
  else renderSurvey();
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  setTimeout(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 0);
}

window.addEventListener("hashchange", route);
route();
