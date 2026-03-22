const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const HISTORY_FILE = path.join(DATA_DIR, "study-history.jsonl");
const SUBJECTS_FILE = path.join(DATA_DIR, "subjects.txt");

ensureStorage();

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && requestUrl.pathname === "/api/history") {
      const records = await readRecords();
      const timeZone = sanitizeTimeZone(requestUrl.searchParams.get("timeZone"));
      sendJson(res, 200, buildHistoryPayload(records, timeZone));
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/subjects") {
      sendJson(res, 200, { subjects: await readSubjects() });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/subjects") {
      const body = await readJsonBody(req);
      const subject = normalizeSubject(body.label);
      const subjects = await addSubject(subject);
      sendJson(res, 201, { subject, subjects });
      return;
    }

    if (req.method === "DELETE" && requestUrl.pathname === "/api/subjects") {
      const body = await readJsonBody(req);
      const subject = normalizeSubject(body.label);
      const subjects = await deleteSubject(subject);
      sendJson(res, 200, { deleted: subject, subjects });
      return;
    }

    if (req.method === "PATCH" && requestUrl.pathname === "/api/subjects") {
      const body = await readJsonBody(req);
      const currentLabel = normalizeSubject(body.currentLabel);
      const nextLabel = normalizeSubject(body.nextLabel);
      const subjects = await renameSubject(currentLabel, nextLabel);
      sendJson(res, 200, { subject: nextLabel, subjects });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/sessions") {
      const body = await readJsonBody(req);
      const session = normalizeSession(body);
      await addSubject(session.label);
      await fs.promises.appendFile(HISTORY_FILE, `${JSON.stringify(session)}\n`, "utf8");
      const records = await readRecords();
      const timeZone = sanitizeTimeZone(body.timeZone);
      sendJson(res, 201, {
        message: "Session saved",
        session,
        history: buildHistoryPayload(records, timeZone),
      });
      return;
    }

    if (req.method === "GET") {
      await serveStaticFile(requestUrl.pathname, res);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Study timer app listening on http://localhost:${PORT}`);
});

function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, "", "utf8");
  }
  if (!fs.existsSync(SUBJECTS_FILE)) {
    fs.writeFileSync(SUBJECTS_FILE, "", "utf8");
  }
}

async function serveStaticFile(requestPath, res) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const contents = await fs.promises.readFile(finalPath);
    res.writeHead(200, { "Content-Type": getContentType(finalPath) });
    res.end(contents);
  } catch {
    sendJson(res, 404, { error: "File not found" });
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
  };

  return contentTypes[ext] || "application/octet-stream";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(Object.assign(new Error("Request body too large"), { statusCode: 413 }));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }));
      }
    });

    req.on("error", reject);
  });
}

function normalizeSession(body) {
  const startedAt = new Date(body.startedAt);
  const endedAt = new Date(body.endedAt);
  const durationSeconds = Number(body.durationSeconds);
  const targetMinutes = Number(body.targetMinutes);
  const mode = body.mode === "stopwatch" ? "stopwatch" : "timer";

  if (
    Number.isNaN(startedAt.getTime()) ||
    Number.isNaN(endedAt.getTime()) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    !Number.isFinite(targetMinutes) ||
    (mode === "timer" && targetMinutes <= 0) ||
    (mode === "stopwatch" && targetMinutes < 0)
  ) {
    throw Object.assign(new Error("Invalid session payload"), { statusCode: 400 });
  }

  const savedAt = new Date();

  return {
    id: body.id || `${savedAt.getTime()}`,
    label: normalizeSubject(body.label),
    mode,
    targetMinutes: Math.round(targetMinutes),
    durationSeconds: Math.round(durationSeconds),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    completed: Boolean(body.completed),
    savedAt: savedAt.toISOString(),
  };
}

function normalizeSubject(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error("Subject name is required"), { statusCode: 400 });
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length > 60) {
    throw Object.assign(new Error("Subject name is too long"), { statusCode: 400 });
  }

  return normalized;
}

async function readRecords() {
  const raw = await fs.promises.readFile(HISTORY_FILE, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));
}

async function readSubjects() {
  const raw = await fs.promises.readFile(SUBJECTS_FILE, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((value) => value.toLowerCase() !== "study session")
    .filter((value, index, array) => {
      const normalized = value.toLowerCase();
      return array.findIndex((item) => item.toLowerCase() === normalized) === index;
    });
}

async function addSubject(subject) {
  const subjects = await readSubjects();
  const exists = subjects.some((item) => item.toLowerCase() === subject.toLowerCase());

  if (!exists) {
    await fs.promises.appendFile(SUBJECTS_FILE, `${subject}\n`, "utf8");
    subjects.push(subject);
  }

  return subjects.sort((a, b) => a.localeCompare(b));
}

async function deleteSubject(subject) {
  const subjects = await readSubjects();
  const filtered = subjects.filter((item) => item.toLowerCase() !== subject.toLowerCase());
  await fs.promises.writeFile(SUBJECTS_FILE, filtered.length ? `${filtered.join("\n")}\n` : "", "utf8");
  return filtered.sort((a, b) => a.localeCompare(b));
}

async function renameSubject(currentLabel, nextLabel) {
  const subjects = await readSubjects();
  const exists = subjects.some((item) => item.toLowerCase() === nextLabel.toLowerCase());
  const currentExists = subjects.some((item) => item.toLowerCase() === currentLabel.toLowerCase());

  if (!currentExists) {
    throw Object.assign(new Error("Subject not found"), { statusCode: 404 });
  }

  if (exists && currentLabel.toLowerCase() !== nextLabel.toLowerCase()) {
    throw Object.assign(new Error("Subject already exists"), { statusCode: 400 });
  }

  const renamedSubjects = subjects
    .map((item) => (item.toLowerCase() === currentLabel.toLowerCase() ? nextLabel : item))
    .filter((value, index, array) => {
      const normalized = value.toLowerCase();
      return array.findIndex((item) => item.toLowerCase() === normalized) === index;
    })
    .sort((a, b) => a.localeCompare(b));

  await fs.promises.writeFile(SUBJECTS_FILE, renamedSubjects.length ? `${renamedSubjects.join("\n")}\n` : "", "utf8");
  await renameSubjectInHistory(currentLabel, nextLabel);
  return renamedSubjects;
}

async function renameSubjectInHistory(currentLabel, nextLabel) {
  const records = await readRecords();
  const updated = records.map((record) =>
    record.label.toLowerCase() === currentLabel.toLowerCase() ? { ...record, label: nextLabel } : record
  );
  const contents = updated
    .slice()
    .reverse()
    .map((record) => JSON.stringify(record))
    .join("\n");
  await fs.promises.writeFile(HISTORY_FILE, contents ? `${contents}\n` : "", "utf8");
}

function buildHistoryPayload(records, timeZone = "UTC") {
  const daily = new Map();
  const weekly = new Map();
  const monthly = new Map();
  const subjects = new Map();
  let allTimeSeconds = 0;

  for (const record of records) {
    const ended = new Date(record.endedAt);
    const localDate = ended.toLocaleDateString("sv-SE", { timeZone });
    const monthKey = localDate.slice(0, 7);
    const weekKey = getWeekKey(ended, timeZone);

    addAggregate(daily, localDate, record.durationSeconds);
    addAggregate(weekly, weekKey, record.durationSeconds);
    addAggregate(monthly, monthKey, record.durationSeconds);
    addAggregate(subjects, record.label, record.durationSeconds);
    allTimeSeconds += record.durationSeconds;
  }

  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone });

  return {
    todaySeconds: daily.get(todayKey)?.totalSeconds || 0,
    allTimeSeconds,
    daily: mapToSortedArray(daily, "date"),
    weekly: mapToSortedArray(weekly, "week"),
    monthly: mapToSortedArray(monthly, "month"),
    subjects: mapToSortedArray(subjects, "label"),
    recentSessions: records.slice(0, 30),
  };
}

function addAggregate(targetMap, key, seconds) {
  const current = targetMap.get(key) || { totalSeconds: 0, sessions: 0 };
  current.totalSeconds += seconds;
  current.sessions += 1;
  targetMap.set(key, current);
}

function mapToSortedArray(targetMap, labelKey) {
  return Array.from(targetMap.entries())
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    .map(([key, value]) => ({
      [labelKey]: key,
      totalSeconds: value.totalSeconds,
      sessions: value.sessions,
    }));
}

function getWeekKey(date, timeZone) {
  const local = new Date(date.toLocaleString("en-US", { timeZone }));
  const utc = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function sanitizeTimeZone(candidate) {
  if (!candidate) {
    return "UTC";
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return "UTC";
  }
}
