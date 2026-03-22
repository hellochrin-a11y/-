const translations = {
  en: {
    pageTitle: "Study Timer",
    language: "Language",
    heroEyebrow: "Study Timer",
    heroTitle: "Made by Chaerin",
    heroDescription: "Set your own time or start with a preset, and every finished session is saved to a text file.",
    timerMode: "Timer",
    stopwatchMode: "Stopwatch",
    minutesLabel: "Custom Time",
    subjectLabel: "Choose Subject",
    newSubjectPlaceholder: "Example: Science",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    done: "Done",
    quit: "Quit",
    ready: "Ready",
    timeRemaining: "Time Remaining",
    timeElapsed: "Time Elapsed",
    thisSubject: "This Subject",
    totalStudied: "Total Studied",
  start: "Start",
  running: "Running",
  resume: "Resume",
    pause: "Pause",
    reset: "Stop",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    recentSessions: "Recent Sessions",
    noRecords: "No records yet.",
    items: "items",
    sessions: "sessions",
    setMinutes: (minutes) => `Set for ${minutes} min`,
    started: (label) => `"${label}" started`,
    paused: "Timer paused",
    resetDone: "Session stopped",
    saveConfirm: "Do you want to save this study session before stopping?",
    quitDone: "Session closed",
    completedSaved: "Session completed and saved",
    saved: "Session saved",
    saveFailed: "Failed to save session",
    historyFailed: "Failed to load history",
    subjectsFailed: "Failed to load subjects",
    enterSubject: "Please enter a subject name",
    subjectCreated: (label) => `"${label}" created`,
    editSubjectPrompt: (label) => `Edit subject name for "${label}"`,
    subjectEdited: (label) => `Renamed to "${label}"`,
    chooseSubjectFirst: "Choose a subject first",
    manageSubjects: "Manage Subjects",
    deleteSubjectConfirm: (label) => `Delete "${label}" from the subject list?`,
    subjectDeleted: (label) => `"${label}" deleted`,
    restartServer: "Please restart the server and try again",
    subjectCheck: "Please check the subject name",
    subjectFailed: "Failed to create subject",
    subjectDefault: "",
    noSubjects: "No subjects yet",
    minutesShort: "m",
    secondsShort: "s",
  },
  ko: {
    pageTitle: "스터디 타이머",
    language: "언어",
    heroEyebrow: "스터디 타이머",
    heroTitle: "Made by Chaerin",
    heroDescription: "시간을 직접 설정하거나 프리셋으로 시작하고, 완료된 세션은 텍스트 파일에 저장됩니다.",
    timerMode: "타이머",
    stopwatchMode: "스톱워치",
    minutesLabel: "직접 설정",
    subjectLabel: "과목 선택",
    newSubjectPlaceholder: "예: Science",
    create: "생성",
    edit: "수정",
    delete: "삭제",
    done: "완료",
    quit: "종료",
    ready: "준비됨",
    timeRemaining: "남은 시간",
    timeElapsed: "경과 시간",
    thisSubject: "이 과목",
    totalStudied: "총 공부 시간",
  start: "시작",
  running: "진행 중",
  resume: "재시작",
    pause: "멈춤",
    reset: "중지",
    daily: "일자별",
    weekly: "주별",
    monthly: "월별",
    recentSessions: "최근 세션",
    noRecords: "기록이 없습니다.",
    items: "건",
    sessions: "회 세션",
    setMinutes: (minutes) => `설정 시간 ${minutes}분`,
    started: (label) => `"${label}" 집중 시작`,
    paused: "타이머를 멈췄습니다",
    resetDone: "세션을 중지했습니다",
    saveConfirm: "중지하기 전에 이번 공부 세션을 저장할까요?",
    quitDone: "세션을 종료했습니다",
    completedSaved: "세션이 완료되어 저장되었습니다",
    saved: "세션을 저장했습니다",
    saveFailed: "기록 저장에 실패했습니다",
    historyFailed: "히스토리를 불러오지 못했습니다",
    subjectsFailed: "과목 목록을 불러오지 못했습니다",
    enterSubject: "새 과목 이름을 입력해 주세요",
    subjectCreated: (label) => `"${label}" 과목을 만들었습니다`,
    editSubjectPrompt: (label) => `"${label}" 과목 이름을 수정해 주세요`,
    subjectEdited: (label) => `"${label}" 이름으로 변경했습니다`,
    chooseSubjectFirst: "먼저 과목을 선택해 주세요",
    manageSubjects: "과목 관리",
    deleteSubjectConfirm: (label) => `"${label}" 과목을 목록에서 삭제할까요?`,
    subjectDeleted: (label) => `"${label}" 과목을 삭제했습니다`,
    restartServer: "서버를 다시 시작한 뒤 다시 시도해 주세요",
    subjectCheck: "과목 이름을 다시 확인해 주세요",
    subjectFailed: "과목 생성에 실패했습니다",
    subjectDefault: "",
    noSubjects: "과목이 없습니다",
    minutesShort: "분",
    secondsShort: "초",
  },
};

const state = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  language: "en",
  mode: "timer",
  targetMinutes: 30,
  label: "",
  subjects: [],
  isManagingSubjects: false,
  historyView: "daily",
  remainingSeconds: 30 * 60,
  elapsedSeconds: 0,
  timerId: null,
  startedAt: null,
  isRunning: false,
  isPaused: false,
  history: {
    allTimeSeconds: 0,
    daily: [],
    weekly: [],
    monthly: [],
    subjects: [],
    recentSessions: [],
  },
};

const elements = {
  languageLabel: document.getElementById("language-label"),
  languageSelect: document.getElementById("language-select"),
  modeButtons: Array.from(document.querySelectorAll(".mode-button")),
  presetButtons: Array.from(document.querySelectorAll(".preset-button")),
  heroCard: document.querySelector(".hero-card"),
  heroEyebrow: document.getElementById("hero-eyebrow"),
  heroTitle: document.getElementById("hero-title"),
  heroDescription: document.getElementById("hero-description"),
  timerPanel: document.getElementById("timer-panel"),
  modeTrack: document.getElementById("mode-track"),
  minutesLabel: document.getElementById("minutes-label"),
  minutesInput: document.getElementById("minutes-input"),
  decreaseMinutes: document.getElementById("decrease-minutes"),
  increaseMinutes: document.getElementById("increase-minutes"),
  subjectLabel: document.getElementById("subject-label"),
  subjectSelect: document.getElementById("subject-select"),
  manageSubjectsButton: document.getElementById("manage-subjects-button"),
  subjectManager: document.getElementById("subject-manager"),
  subjectManagerList: document.getElementById("subject-manager-list"),
  newSubjectInput: document.getElementById("new-subject-input"),
  createSubjectButton: document.getElementById("create-subject-button"),
  timerDisplay: document.getElementById("timer-display"),
  focusTimer: document.getElementById("focus-timer"),
  statusLine: document.getElementById("status-line"),
  focusStatusLine: document.getElementById("focus-status-line"),
  focusLabel: document.querySelector(".focus-label"),
  startButton: document.getElementById("start-button"),
  pauseButton: document.getElementById("pause-button"),
  quitButton: document.getElementById("quit-button"),
  focusSubjectName: document.getElementById("focus-subject-name"),
  subjectTotalLabel: document.querySelector("#subject-total").previousElementSibling,
  subjectTotal: document.getElementById("subject-total"),
  allTimeTotalLabel: document.querySelector("#all-time-total").previousElementSibling,
  allTimeTotal: document.getElementById("all-time-total"),
  dailyTitle: document.getElementById("daily-title"),
  weeklyTitle: document.getElementById("weekly-title"),
  monthlyTitle: document.getElementById("monthly-title"),
  recentTitle: document.getElementById("recent-title"),
  historyTabs: Array.from(document.querySelectorAll(".history-tab")),
  historyPanelTitle: document.getElementById("history-panel-title"),
  historyPanelCount: document.getElementById("history-panel-count"),
  historyPanelContent: document.getElementById("history-panel-content"),
};

const STORAGE_KEY_HISTORY = "study_timer_history";
const STORAGE_KEY_SUBJECTS = "study_timer_subjects";

boot();

async function boot() {
  bindEvents();
  applyLanguage();
  await loadSubjects();
  syncInputs();
  updatePresetSelection();
  renderTimer();
  renderProgress();
  await loadHistory();
}

function bindEvents() {
  elements.languageSelect.addEventListener("change", () => {
    state.language = elements.languageSelect.value || "en";
    applyLanguage();
    renderSubjectOptions();
    renderProgress();
    renderHistory();
  });

  for (const button of elements.modeButtons) {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  }

  for (const button of elements.presetButtons) {
    button.addEventListener("click", () => applyMinutes(Number(button.dataset.minutes)));
  }

  elements.decreaseMinutes.addEventListener("click", () => applyMinutes(state.targetMinutes - 1));
  elements.increaseMinutes.addEventListener("click", () => applyMinutes(state.targetMinutes + 1));

  elements.minutesInput.addEventListener("input", () => {
    const minutes = clampMinutes(Number(elements.minutesInput.value) || 1);
    applyMinutes(minutes, false);
  });

  elements.subjectSelect.addEventListener("change", () => {
    state.label = elements.subjectSelect.value || t().subjectDefault;
    renderProgress();
    updateFocusMode();
  });

  elements.createSubjectButton.addEventListener("click", createSubject);
  elements.manageSubjectsButton.addEventListener("click", toggleSubjectManager);
  elements.newSubjectInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      createSubject();
    }
  });

  elements.startButton.addEventListener("click", startTimer);
  elements.pauseButton.addEventListener("click", handlePauseResume);
  elements.quitButton.addEventListener("click", quitSession);
  for (const button of elements.historyTabs) {
    button.addEventListener("click", () => {
      state.historyView = button.dataset.historyView;
      renderHistory();
    });
  }
}

function applyLanguage() {
  const text = t();
  document.documentElement.lang = state.language;
  document.title = text.pageTitle;
  elements.languageLabel.textContent = text.language;
  elements.heroEyebrow.textContent = text.heroEyebrow;
  elements.heroTitle.textContent = text.heroTitle;
  elements.heroDescription.textContent = text.heroDescription;
  for (const button of elements.modeButtons) {
    button.textContent = button.dataset.mode === "stopwatch" ? text.stopwatchMode : text.timerMode;
  }
  elements.minutesLabel.textContent = text.minutesLabel;
  elements.subjectLabel.textContent = text.subjectLabel;
  elements.newSubjectInput.placeholder = text.newSubjectPlaceholder;
  elements.createSubjectButton.textContent = text.create;
  elements.manageSubjectsButton.textContent = state.isManagingSubjects ? text.done : text.edit;
  elements.quitButton.textContent = text.quit;
  elements.focusLabel.textContent = state.mode === "stopwatch" ? text.timeElapsed : text.timeRemaining;
  elements.subjectTotalLabel.textContent = text.thisSubject;
  elements.allTimeTotalLabel.textContent = text.totalStudied;
  elements.dailyTitle.textContent = text.daily;
  elements.weeklyTitle.textContent = text.weekly;
  elements.monthlyTitle.textContent = text.monthly;
  elements.recentTitle.textContent = text.recentSessions;
  updateActionButtons();
  updateModeUI();
  renderSubjectManager();
  if (!elements.statusLine.textContent.trim()) {
    setStatus(text.ready);
  }
}

function t() {
  return translations[state.language] || translations.en;
}

function applyMinutes(minutes, shouldUpdateInput = true) {
  if (state.isRunning || state.mode === "stopwatch") {
    return;
  }

  state.targetMinutes = clampMinutes(minutes);
  state.remainingSeconds = state.targetMinutes * 60;
  state.elapsedSeconds = 0;
  state.isPaused = false;

  if (shouldUpdateInput) {
    elements.minutesInput.value = String(state.targetMinutes);
  }

  renderTimer();
  renderProgress();
  updatePresetSelection();
  setStatus(t().setMinutes(state.targetMinutes));
}

function setMode(mode) {
  if (!["timer", "stopwatch"].includes(mode) || state.isRunning) {
    return;
  }

  state.mode = mode;
  state.isPaused = false;
  state.elapsedSeconds = 0;
  state.startedAt = null;
  state.remainingSeconds = mode === "stopwatch" ? 0 : state.targetMinutes * 60;
  updateModeUI();
  updateActionButtons();
  renderTimer();
  renderProgress();
  setStatus(t().ready);
}

function clampMinutes(value) {
  return Math.max(1, Math.min(720, Math.round(value)));
}

function syncInputs() {
  elements.languageSelect.value = state.language;
  elements.minutesInput.value = String(state.targetMinutes);
  renderSubjectOptions();
}

function updatePresetSelection() {
  const suffix = t().minutesShort;
  for (const button of elements.presetButtons) {
    const minutes = Number(button.dataset.minutes);
    button.classList.toggle("active", minutes === state.targetMinutes);
    button.textContent = `${minutes}${suffix}`;
  }
}

function updateModeUI() {
  for (const button of elements.modeButtons) {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  }

  elements.timerPanel.classList.toggle("stopwatch-mode", state.mode === "stopwatch");
  elements.modeTrack.style.transform = state.mode === "stopwatch" ? "translateX(-100%)" : "translateX(0)";
  elements.focusLabel.textContent = state.mode === "stopwatch" ? t().timeElapsed : t().timeRemaining;
}

function updateActionButtons() {
  const text = t();
  elements.pauseButton.textContent = state.isPaused ? text.resume : text.pause;
  const hasActiveSession = state.isRunning || state.isPaused;
  elements.pauseButton.hidden = !hasActiveSession;
  elements.startButton.hidden = hasActiveSession;
  elements.quitButton.hidden = false;

  elements.startButton.textContent = text.start;
}

function handlePauseResume() {
  if (state.isPaused) {
    startTimer();
    return;
  }

  pauseTimer();
}

function startTimer() {
  if (state.isRunning) {
    return;
  }

  if (!state.startedAt) {
    state.startedAt = new Date();
  }

  state.isRunning = true;
  state.isPaused = false;
  updateActionButtons();
  setStatus(t().started(state.label));
  updateFocusMode();

  state.timerId = window.setInterval(() => {
    state.elapsedSeconds += 1;
    if (state.mode === "timer") {
      state.remainingSeconds -= 1;
    } else {
      state.remainingSeconds = state.elapsedSeconds;
    }
    renderTimer();
    renderProgress();

    if (state.mode === "timer" && state.remainingSeconds <= 0) {
      finishTimer(true);
    }
  }, 1000);
}

function pauseTimer() {
  if (!state.isRunning) {
    return;
  }

  clearInterval(state.timerId);
  state.timerId = null;
  state.isRunning = false;
  state.isPaused = true;
  updateActionButtons();
  setStatus(t().paused);
  updateFocusMode();
}

async function finishTimer(completed) {
  clearInterval(state.timerId);
  state.timerId = null;
  state.isRunning = false;
  state.isPaused = false;
  updateActionButtons();

  await saveCurrentSession(completed);
  clearCurrentSession();
  setStatus(completed ? t().completedSaved : t().saved);
}

async function quitSession() {
  const hasProgress = state.elapsedSeconds > 0;

  if (state.isRunning) {
    pauseTimer();
  }

  if (hasProgress) {
    const shouldSave = window.confirm(t().saveConfirm);
    if (shouldSave) {
      await saveCurrentSession(false);
    }
  }

  clearCurrentSession();
  setStatus(t().quitDone);
}

async function saveCurrentSession(completed) {
  if (!state.startedAt || state.elapsedSeconds <= 0) {
    return;
  }

  const session = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    label: state.label,
    mode: state.mode,
    targetMinutes: state.mode === "stopwatch" ? 0 : state.targetMinutes,
    durationSeconds: state.elapsedSeconds,
    startedAt: state.startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    completed,
    timeZone: state.timeZone,
  };

  if (!state.subjects.some(s => s.toLowerCase() === session.label.toLowerCase())) {
    state.subjects.push(session.label);
    state.subjects.sort((a, b) => a.localeCompare(b));
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(state.subjects));
  }

  const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
  const records = storedHistory ? JSON.parse(storedHistory) : [];
  records.push(session);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(records));

  await loadHistory();
  await loadSubjects(state.label);
}

function clearCurrentSession() {
  state.startedAt = null;
  state.elapsedSeconds = 0;
  state.remainingSeconds = state.mode === "stopwatch" ? 0 : state.targetMinutes * 60;
  state.isRunning = false;
  state.isPaused = false;
  updateActionButtons();
  renderTimer();
  renderProgress();
  updateFocusMode();
}

function renderTimer() {
  const displaySeconds = state.mode === "stopwatch" ? state.elapsedSeconds : state.remainingSeconds;
  const value = formatClock(displaySeconds);
  elements.timerDisplay.textContent = value;
  elements.focusTimer.textContent = value;
}

function renderProgress() {
  const subjectTotalSeconds = getCurrentSubjectSeconds();
  elements.subjectTotal.textContent = formatDuration(subjectTotalSeconds + state.elapsedSeconds);
  elements.allTimeTotal.textContent = formatDuration(state.history.allTimeSeconds + state.elapsedSeconds);
  elements.focusSubjectName.textContent = state.label;
}

async function loadHistory() {
  const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
  const records = storedHistory ? JSON.parse(storedHistory) : [];
  records.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));

  state.history = buildHistoryPayload(records, state.timeZone);
  renderHistory();
  renderProgress();
}

async function loadSubjects(preferredLabel = state.label) {
  const stored = localStorage.getItem(STORAGE_KEY_SUBJECTS);
  state.subjects = stored ? JSON.parse(stored) : [];
  const matchingSubject = state.subjects.find(
    (item) => item.toLowerCase() === String(preferredLabel).trim().toLowerCase()
  );
  state.label = matchingSubject || state.subjects[0] || "";
  renderSubjectOptions();
}

async function createSubject() {
  const label = elements.newSubjectInput.value.trim().replace(/\s+/g, " ");
  if (!label) {
    setStatus(t().enterSubject);
    return;
  }
  if (label.length > 60) {
    setStatus(t().subjectCheck);
    return;
  }

  if (!state.subjects.some(s => s.toLowerCase() === label.toLowerCase())) {
    state.subjects.push(label);
    state.subjects.sort((a, b) => a.localeCompare(b));
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(state.subjects));
  }

  state.label = label;
  elements.newSubjectInput.value = "";
  renderSubjectOptions();
  renderSubjectManager();
  renderProgress();
  updateFocusMode();
  setStatus(t().subjectCreated(state.label));
}

async function deleteSubject(subjectLabel = state.label) {
  if (!subjectLabel) {
    setStatus(t().chooseSubjectFirst);
    return;
  }

  const confirmed = window.confirm(t().deleteSubjectConfirm(subjectLabel));
  if (!confirmed) return;

  state.subjects = state.subjects.filter(s => s.toLowerCase() !== subjectLabel.toLowerCase());
  localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(state.subjects));
  state.label = state.subjects[0] || "";
  renderSubjectOptions();
  renderSubjectManager();
  renderProgress();
  updateFocusMode();
  setStatus(t().subjectDeleted(subjectLabel));
}

async function editSubject(subjectLabel = state.label) {
  if (!subjectLabel) {
    setStatus(t().chooseSubjectFirst);
    return;
  }

  const nextLabel = window.prompt(t().editSubjectPrompt(subjectLabel), subjectLabel);
  if (nextLabel === null) {
    return;
  }

  const trimmed = nextLabel.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > 60) {
    setStatus(t().subjectCheck);
    return;
  }

  const exists = state.subjects.some(s => s.toLowerCase() === trimmed.toLowerCase());
  if (exists && subjectLabel.toLowerCase() !== trimmed.toLowerCase()) {
    setStatus(t().subjectCheck);
    return;
  }

  state.subjects = state.subjects.map(s => s.toLowerCase() === subjectLabel.toLowerCase() ? trimmed : s);
  state.subjects.sort((a, b) => a.localeCompare(b));
  localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(state.subjects));
  state.label = trimmed;

  const historyStored = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (historyStored) {
    const records = JSON.parse(historyStored);
    records.forEach(r => {
      if (r.label.toLowerCase() === subjectLabel.toLowerCase()) r.label = trimmed;
    });
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(records));
  }

  renderSubjectOptions();
  renderSubjectManager();
  await loadHistory();
  renderProgress();
  updateFocusMode();
  setStatus(t().subjectEdited(state.label));
}

function renderSubjectOptions() {
  if (!state.subjects.length) {
    elements.subjectSelect.innerHTML = `<option value="">${escapeHtml(t().noSubjects)}</option>`;
    elements.subjectSelect.value = "";
    return;
  }

  elements.subjectSelect.innerHTML = state.subjects
    .map((subject) => {
      const selected = subject === state.label ? " selected" : "";
      return `<option value="${escapeHtml(subject)}"${selected}>${escapeHtml(subject)}</option>`;
    })
    .join("");
}

function toggleSubjectManager() {
  state.isManagingSubjects = !state.isManagingSubjects;
  if (!state.isManagingSubjects) {
    elements.newSubjectInput.value = "";
  }
  renderSubjectManager();
  applyLanguage();
}

function renderSubjectManager() {
  elements.subjectManager.hidden = !state.isManagingSubjects;

  if (!state.isManagingSubjects) {
    return;
  }

  if (!state.subjects.length) {
    elements.subjectManagerList.innerHTML = `<div class="empty-state">${escapeHtml(t().noSubjects)}</div>`;
    return;
  }

  elements.subjectManagerList.innerHTML = state.subjects
    .map(
      (subject) => `
        <div class="subject-manager-row">
          <div class="subject-manager-name">${escapeHtml(subject)}</div>
          <button class="ghost-button" type="button" data-subject-action="edit" data-subject-name="${escapeHtml(subject)}">${escapeHtml(t().edit)}</button>
          <button class="ghost-button" type="button" data-subject-action="delete" data-subject-name="${escapeHtml(subject)}">${escapeHtml(t().delete)}</button>
        </div>
      `
    )
    .join("");

  for (const button of elements.subjectManagerList.querySelectorAll("[data-subject-action]")) {
    button.addEventListener("click", () => {
      const label = button.dataset.subjectName || "";
      if (button.dataset.subjectAction === "edit") {
        editSubject(label);
      } else {
        deleteSubject(label);
      }
    });
  }
}

function renderHistory() {
  for (const button of elements.historyTabs) {
    button.classList.toggle("active", button.dataset.historyView === state.historyView);
  }

  if (state.historyView === "daily") {
    elements.historyPanelTitle.textContent = t().daily;
    renderDailySessions(elements.historyPanelContent, elements.historyPanelCount, state.history.recentSessions);
    return;
  }

  if (state.historyView === "weekly") {
    elements.historyPanelTitle.textContent = t().weekly;
    renderAggregateList(elements.historyPanelContent, elements.historyPanelCount, state.history.weekly, "week");
    return;
  }

  if (state.historyView === "monthly") {
    elements.historyPanelTitle.textContent = t().monthly;
    renderAggregateList(elements.historyPanelContent, elements.historyPanelCount, state.history.monthly, "month");
    return;
  }

  elements.historyPanelTitle.textContent = t().recentSessions;
  renderRecentList(elements.historyPanelContent, elements.historyPanelCount, state.history.recentSessions);
}

function renderAggregateList(container, countElement, items, keyName) {
  countElement.textContent = `${items.length} ${t().items}`;

  if (!items.length) {
    container.className = "history-list empty-state";
    container.textContent = t().noRecords;
    return;
  }

  container.className = "history-list";
  container.innerHTML = items
    .map((item) => {
      const title = keyName === "date" ? t().daily : item[keyName];
      return `
        <article class="history-item">
          <div class="history-meta">
            <strong>${title}</strong>
            <span>${item.sessions} ${t().sessions}</span>
          </div>
          <strong>${formatDuration(item.totalSeconds)}</strong>
        </article>
      `
    })
    .join("");
}

function renderDailySessions(container, countElement, items) {
  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone: state.timeZone });
  const todaySessions = items
    .filter((item) => new Date(item.endedAt).toLocaleDateString("sv-SE", { timeZone: state.timeZone }) === todayKey)
    .sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt));

  countElement.textContent = `${todaySessions.length} ${t().items}`;

  if (!todaySessions.length) {
    container.className = "history-list empty-state";
    container.textContent = t().noRecords;
    return;
  }

  container.className = "history-list";
  container.innerHTML = todaySessions
    .map((item) => {
      const endedAt = new Date(item.endedAt);
      const stamp = endedAt.toLocaleTimeString(state.language === "ko" ? "ko-KR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <article class="history-item">
          <div class="history-meta">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${stamp}</span>
          </div>
          <strong>${formatDuration(item.durationSeconds)}</strong>
        </article>
      `;
    })
    .join("");
}

function renderRecentList(container, countElement, items) {
  countElement.textContent = `${items.length} ${t().items}`;

  if (!items.length) {
    container.className = "history-list empty-state";
    container.textContent = t().noRecords;
    return;
  }

  container.className = "history-list";
  container.innerHTML = items
    .map((item) => {
      const endedAt = new Date(item.endedAt);
      const stamp = endedAt.toLocaleString(state.language === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <article class="history-item">
          <div class="history-meta">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${stamp}</span>
          </div>
          <strong>${formatDuration(item.durationSeconds)}</strong>
        </article>
      `;
    })
    .join("");
}

function setStatus(message) {
  elements.statusLine.textContent = message;
  elements.focusStatusLine.textContent = message;
}

function updateFocusMode() {
  const inFocusMode = state.isRunning || state.isPaused;
  elements.heroCard.classList.toggle("focus-hero", inFocusMode);
  elements.timerPanel.classList.toggle("focus-mode", inFocusMode);
  elements.focusSubjectName.textContent = state.label;
}

function getCurrentSubjectSeconds() {
  const normalizedLabel = state.label.trim().toLowerCase();
  const subjectEntry = state.history.subjects.find((item) => item.label.trim().toLowerCase() === normalizedLabel);
  return subjectEntry ? subjectEntry.totalSeconds : 0;
}

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const text = t();

  if (minutes === 0) {
    return `${seconds}${text.secondsShort}`;
  }

  if (seconds === 0) {
    return `${minutes}${text.minutesShort}`;
  }

  return `${minutes}${text.minutesShort} ${seconds}${text.secondsShort}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
