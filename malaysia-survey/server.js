const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = path.join(root, "data");
const dataFile = path.join(dataDir, "responses.json");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const adminLabels = {
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
};

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]\n");
}

function readResponses() {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function writeResponses(responses) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(responses, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function adminText(value) {
  return adminLabels[value] || value || "";
}

function filterResponses(responses, query) {
  const search = (query.get("search") || "").toLowerCase();
  const experience = query.get("experience") || "All";
  const risk = query.get("risk") || "All";
  const goal = query.get("goal") || "All";
  const record = query.get("record") || "All";

  return responses.filter((item) => {
    const matchesSearch = !search || [item.id, item.name, item.phone, item.assistantInfo].some((value) => String(value || "").toLowerCase().includes(search));
    return matchesSearch
      && (experience === "All" || item.experience === experience)
      && (risk === "All" || item.risk === risk)
      && (goal === "All" || item.growthGoal === goal)
      && (record === "All" || item.badRecord === record);
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function toCsv(responses) {
  const headers = ["ID", "姓名", "电话", "助理姓名及满意度", "1. 投资经验", "2. 风险承受能力", "3. 可投资资本", "4. 期望利润", "5. 是否有时间监控股市", "6. 家人朋友是否知情", "7. 是否有不良记录", "提交时间", "状态"];
  const rows = responses.map((item) => [
    item.id,
    item.name,
    item.phone,
    item.assistantInfo,
    adminText(item.experience),
    adminText(item.risk),
    item.capital,
    adminText(item.growthGoal),
    adminText(item.discipline),
    adminText(item.confidentialExecution),
    adminText(item.badRecord),
    item.submittedAt,
    adminText(item.status),
  ]);
  return "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/responses" && req.method === "GET") {
    sendJson(res, 200, readResponses());
    return;
  }

  if (url.pathname === "/api/responses.csv" && req.method === "GET") {
    const csv = toCsv(filterResponses(readResponses(), url.searchParams));
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"tickeron-malaysia-survey-results-zh.csv\"",
    });
    res.end(csv);
    return;
  }

  if (url.pathname === "/api/responses" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const responses = readResponses();
      const next = [payload, ...responses.filter((item) => item.id !== payload.id)];
      writeResponses(next);
      sendJson(res, 200, next);
    } catch (error) {
      sendJson(res, 400, { error: "Invalid response payload" });
    }
    return;
  }

  if (url.pathname.startsWith("/api/responses/") && req.method === "DELETE") {
    const id = decodeURIComponent(url.pathname.slice("/api/responses/".length));
    if (!id) {
      sendJson(res, 400, { error: "Missing response id" });
      return;
    }
    const responses = readResponses();
    const next = responses.filter((item) => item.id !== id);
    if (next.length === responses.length) {
      sendJson(res, 404, { error: "Response not found", id });
      return;
    }
    writeResponses(next);
    sendJson(res, 200, next);
    return;
  }

  serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`Tickeron survey server running at http://127.0.0.1:${port}/`);
});
