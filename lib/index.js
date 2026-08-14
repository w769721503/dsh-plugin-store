// src/index.ts
import { existsSync as existsSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join2 } from "node:path";

// src/categories.ts
var TAG_RULES = [
  { id: "vision", pattern: /vision|image|ocr|screenshot|multimodal|ui-restoration|computer-vision|grounding|pixel-diff|\bvideo\b/ },
  { id: "tui", pattern: /\btui\b|terminal|cli\b|\bink\b|xterm|console|status-line|statusline/ },
  { id: "desktop", pattern: /desktop|electron|wails|tauri|native-app|desktop-app|macos|windows-app/ },
  { id: "memory", pattern: /memory|rag|context|knowledge-graph|persistent-memory|\bkb\b|knowledge-base|recall|storage|session-persistence/ },
  { id: "messages", pattern: /notification|notify|message|chat|history|export|feedback|working-activity|alert|remind/ },
  { id: "model", pattern: /\bllm\b|model|inference|provider|deepseek|reasoning|openai|anthropic|gemini|fallback|retry|kimi/ },
  { id: "cost", pattern: /cost|token|usage|billing|budget|\btps\b|balance|meter|statistics|estimate/ },
  { id: "data", pattern: /\bdata\b|database|sqlite|\bsql\b|\bjson\b|csv|visualization|query|search|fuse|elastic|encoding|hash|zotero/ },
  { id: "testing", pattern: /test|debug|diagnostic|lint|review|quality|checkup|verify|falsify|adjudicator/ },
  { id: "security", pattern: /security|privacy|auth|sandbox|permission|encrypt|guard|anti-ads|self-control/ },
  { id: "agent", pattern: /agent|mcp|automation|workflow|subagent|collaboration|mesh|\ba2a\b|orchestrat/ },
  { id: "browser", pattern: /browser|remote|chrome|playwright|puppeteer|extension|deeplink|web-bridge|webview/ },
  { id: "input", pattern: /prompt|input|composer|slash|mention|trigger|template|suggest/ },
  { id: "research", pattern: /skill|research|paper|study|academic|education|learning|knowledge|document|reading|superpowers/ },
  { id: "fun", pattern: /game|fun|pet|music|entertainment|meme|whale|mini-game|puzzle|trolling/ },
  { id: "engineering", pattern: /\bdev\b|code|coding|typescript|sdk|git|tooling|\bapi\b|library|inspect|compiler|artifact/ },
  { id: "ui-ux", pattern: /skin|theme|sidebar|layout|interface|design|panel|\bcss\b|web-ui|webui|ui-restoration|dnd|drag-and-drop|beautif/ }
];
var CATEGORY_RULES = [
  { id: "notify", pattern: /notification|notify|message|status|alert|remind|feedback|working-activity/ },
  { id: "workflow", pattern: /workflow|automation|agent|mcp|orchestrat|mesh|\ba2a\b|subagent|pipeline|schedule|collaboration/ },
  { id: "knowledge", pattern: /skill|research|paper|study|knowledge|learning|education|academic|document|reading|memory|rag|superpowers/ },
  { id: "dev", pattern: /\bdev\b|code|typescript|sdk|git|tooling|test|debug|lint|cli|terminal|\btui\b|\bapi\b|database|json|compiler|inspect/ },
  { id: "ui", pattern: /skin|theme|sidebar|layout|interface|design|panel|web-ui|webui|\bcss\b|ui-restoration|desktop|electron|drag-and-drop/ },
  { id: "other", pattern: /[\s\S]/ }
];
var CATEGORY_DEFAULT_TAG = {
  ui: "ui-ux",
  notify: "messages",
  workflow: "agent",
  dev: "engineering",
  knowledge: "research",
  other: "engineering"
};
function classify(input) {
  const haystack = [
    ...input.topics ?? [],
    input.name ?? "",
    input.description ?? "",
    input.fullName ?? ""
  ].join(" ").toLowerCase();
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(haystack)) tags.push(rule.id);
  }
  const category = CATEGORY_RULES.find((r) => r.pattern.test(haystack))?.id ?? "other";
  const primaryTag = tags[0] ?? CATEGORY_DEFAULT_TAG[category];
  const topics = (input.topics ?? []).map((t) => t.toLowerCase());
  const indexed = topics.includes("dsh") || topics.includes("deepseek-harness") || /^dsh[-_]/.test(input.name ?? "") || /deepseek[- ]harness|dsh[- ]?plugin|dsh[- ]?插件/i.test((input.description ?? "") + " " + (input.name ?? ""));
  return { category, tags, primaryTag, indexed };
}

// src/catalog.ts
var GITHUB_API = "https://api.github.com/search/repositories";
var QUERY = "topic:dsh-plugin";
var PER_PAGE = 100;
var MAX_PAGES = 10;
var STAR_RANGES = [">=10", "5..9", "3..4", "2", "1", "0"];
var RETRY_DELAY_MS = 3e4;
var MAX_RETRIES = 3;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchShard(range, headers, delayMs) {
  const q = `${QUERY} stars:${range}`;
  const entries = [];
  let total = 0;
  let partial = false;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${GITHUB_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`;
    let data = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const res = await fetch(url, { headers });
      if (res.status === 403 || res.status === 429) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      if (!res.ok) throw new Error(`GitHub API request failed (HTTP ${res.status})`);
      data = await res.json();
      break;
    }
    if (data === null) {
      partial = true;
      break;
    }
    if (page === 1) total = typeof data.total_count === "number" ? data.total_count : 0;
    const items = Array.isArray(data.items) ? data.items : [];
    for (const item of items) entries.push(normalize(item));
    if (items.length < PER_PAGE) break;
    await sleep(delayMs);
  }
  return { total, entries, partial };
}
async function fetchCatalog(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dsh-plugin-store"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const delayMs = token ? 2100 : 6500;
  const seen = /* @__PURE__ */ new Set();
  const entries = [];
  let total = 0;
  let partial = false;
  for (const range of STAR_RANGES) {
    const shard = await fetchShard(range, headers, delayMs);
    total += shard.total;
    if (shard.partial) partial = true;
    for (const entry of shard.entries) {
      if (!seen.has(entry.full_name)) {
        seen.add(entry.full_name);
        entries.push(entry);
      }
    }
    if (shard.partial) break;
  }
  return { total, entries, partial };
}
function normalize(item) {
  const fullName = item.full_name ?? "";
  const owner = item.owner?.login ?? "";
  const name2 = item.name ?? "";
  const description = item.description ?? "";
  const topics = Array.isArray(item.topics) ? item.topics : [];
  const cls = classify({ topics, language: item.language ?? null, name: name2, description, fullName });
  return {
    full_name: fullName,
    owner,
    name: name2,
    description,
    stars: typeof item.stargazers_count === "number" ? item.stargazers_count : 0,
    created_at: item.created_at ?? "",
    updated_at: item.updated_at ?? "",
    pushed_at: item.pushed_at ?? "",
    language: item.language ?? null,
    license: item.license?.spdx_id ?? null,
    homepage: item.homepage ?? null,
    html_url: item.html_url ?? `https://github.com/${fullName}`,
    topics,
    fork: item.fork === true,
    archived: item.archived === true,
    ...cls
  };
}

// src/install.ts
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
function dshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}
function profileDir(profile) {
  return join(dshHome(), "profiles", profile);
}
function readInstalled(profile = "web") {
  const pkgPath = join(profileDir(profile), "package.json");
  if (!existsSync(pkgPath)) return { dependencies: {}, bundles: [] };
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return {
      dependencies: pkg.dependencies ?? {},
      bundles: pkg.dsh?.profile?.bundles ?? []
    };
  } catch {
    return { dependencies: {}, bundles: [] };
  }
}
function isBundle(dep, profile) {
  try {
    const manifestPath = join(profileDir(profile), "node_modules", dep, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    return manifest.dsh?.bundle?.patch !== void 0;
  } catch {
    return false;
  }
}
function reconcile(profile) {
  const pkgPath = join(profileDir(profile), "package.json");
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const deps = Object.keys(pkg.dependencies ?? {});
  const depSet = new Set(deps);
  const bundles = pkg.dsh?.profile?.bundles ?? [];
  let changed = false;
  for (const dep of deps) {
    if (isBundle(dep, profile) && !bundles.includes(dep)) {
      bundles.push(dep);
      changed = true;
    }
  }
  const filtered = bundles.filter((b) => depSet.has(b));
  if (filtered.length !== bundles.length) {
    bundles.length = 0;
    bundles.push(...filtered);
    changed = true;
  }
  if (changed) {
    pkg.dsh = {
      ...pkg.dsh,
      profile: { ...pkg.dsh?.profile ?? {}, bundles }
    };
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}
function metaFile() {
  return join(dshHome(), "plugin-store-installed.json");
}
function readInstallMeta() {
  try {
    if (!existsSync(metaFile())) return {};
    const parsed = JSON.parse(readFileSync(metaFile(), "utf8"));
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
function writeInstallMeta(meta) {
  try {
    writeFileSync(metaFile(), JSON.stringify(meta));
  } catch {
  }
}
function recordInstall(fullName, pushedAt) {
  const meta = readInstallMeta();
  meta[fullName] = { pushedAt, installedAt: Date.now() };
  writeInstallMeta(meta);
}
function recordUninstall(fullName) {
  const meta = readInstallMeta();
  delete meta[fullName];
  writeInstallMeta(meta);
}
async function inspectRepo(fullName, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dsh-plugin-store"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/repos/${fullName}/contents/package.json`, { headers });
  if (res.status === 404) {
    return { isBundle: false, packageName: null, reason: "\u8BE5\u4ED3\u5E93\u6CA1\u6709 package.json\uFF0C\u4E0D\u662F\u53EF\u5B89\u88C5\u7684 DSH \u63D2\u4EF6\u3002" };
  }
  if (!res.ok) {
    return { isBundle: false, packageName: null, reason: `\u8BFB\u53D6 package.json \u5931\u8D25\uFF08HTTP ${res.status}\uFF09\u3002` };
  }
  const data = await res.json();
  let pkg = {};
  try {
    pkg = JSON.parse(Buffer.from(data.content ?? "", "base64").toString("utf8"));
  } catch {
    return { isBundle: false, packageName: null, reason: "package.json \u89E3\u6790\u5931\u8D25\u3002" };
  }
  const bundle = pkg.dsh?.bundle?.patch !== void 0;
  return {
    isBundle: bundle,
    packageName: typeof pkg.name === "string" ? pkg.name : null,
    reason: bundle ? null : "\u8BE5\u4ED3\u5E93\u672A\u58F0\u660E dsh.bundle.patch\uFF0C\u4E0D\u662F\u53EF\u5B89\u88C5\u7684 DSH \u63D2\u4EF6\u3002"
  };
}
async function fetchRepoPushedAt(fullName, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dsh-plugin-store"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, { headers });
    if (!res.ok) return "";
    const data = await res.json();
    return typeof data.pushed_at === "string" ? data.pushed_at : "";
  } catch {
    return "";
  }
}
var INSTALL_TIMEOUT_MS = 10 * 60 * 1e3;
function pnpmRun(args, profile, onLog) {
  return new Promise((resolve) => {
    const cwd = profileDir(profile);
    const child = spawn("pnpm", args, {
      cwd,
      env: process.env,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"]
    });
    let log = "";
    const drain = (chunk) => {
      const text = chunk.toString();
      log += text;
      onLog?.(text);
    };
    child.stdout?.on("data", drain);
    child.stderr?.on("data", drain);
    const timer = setTimeout(() => {
      log += "\n[\u64CD\u4F5C\u8D85\u65F6]";
      child.kill();
    }, INSTALL_TIMEOUT_MS);
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: null, log: String(err) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, log });
    });
  });
}
function findDependencyKey(fullName, profile) {
  const deps = readInstalled(profile).dependencies;
  const needle = fullName.toLowerCase();
  const short = fullName.split("/")[1]?.toLowerCase() ?? "";
  for (const [key, value] of Object.entries(deps)) {
    if (typeof value === "string" && value.toLowerCase().includes(needle)) return key;
    if (key.toLowerCase() === short) return key;
  }
  return null;
}
async function runInstall(fullName, profile = "web", token = "", onLog) {
  try {
    const info = await inspectRepo(fullName, token);
    if (!info.isBundle) {
      return { ok: false, code: null, log: info.reason ?? "\u8BE5\u4ED3\u5E93\u4E0D\u662F\u53EF\u5B89\u88C5\u7684 DSH \u63D2\u4EF6\u3002" };
    }
  } catch {
  }
  const isUpdate = findDependencyKey(fullName, profile) !== null;
  let pushedAt = "";
  try {
    pushedAt = await fetchRepoPushedAt(fullName, token);
  } catch {
    pushedAt = "";
  }
  const result = await pnpmRun(["add", `github:${fullName}`], profile, onLog);
  if (result.code !== 0) {
    return { ok: false, code: result.code, log: result.log.slice(-4e3) || "\u5B89\u88C5\u5931\u8D25\uFF08pnpm \u9000\u51FA\u7801\u975E 0\uFF09\u3002" };
  }
  try {
    reconcile(profile);
  } catch (err) {
    return {
      ok: false,
      code: 0,
      log: `\u5B89\u88C5\u5B8C\u6210\u4F46\u5199\u5165 bundle \u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`
    };
  }
  const key = findDependencyKey(fullName, profile);
  const after = readInstalled(profile).bundles;
  if (key === null || !after.includes(key)) {
    return { ok: false, code: 0, log: "\u5DF2\u4F5C\u4E3A\u666E\u901A\u4F9D\u8D56\u5B89\u88C5\uFF0C\u4F46\u672A\u58F0\u660E dsh.bundle \u2014\u2014 \u8BE5\u4ED3\u5E93\u4E0D\u662F DSH \u63D2\u4EF6\u3002" };
  }
  recordInstall(fullName, pushedAt);
  return { ok: true, code: 0, log: isUpdate ? "\u66F4\u65B0\u6210\u529F\uFF0C\u91CD\u542F DSH \u540E\u751F\u6548\u3002" : "\u5B89\u88C5\u6210\u529F\uFF0C\u91CD\u542F DSH \u540E\u751F\u6548\u3002" };
}
async function runUninstall(fullName, profile = "web", onLog) {
  const key = findDependencyKey(fullName, profile);
  if (!key) {
    return { ok: false, code: null, log: "\u672A\u627E\u5230\u5DF2\u5B89\u88C5\u7684\u5BF9\u5E94\u63D2\u4EF6\u3002" };
  }
  const result = await pnpmRun(["remove", key], profile, onLog);
  if (result.code !== 0) {
    return { ok: false, code: result.code, log: result.log.slice(-4e3) || "\u5378\u8F7D\u5931\u8D25\uFF08pnpm \u9000\u51FA\u7801\u975E 0\uFF09\u3002" };
  }
  try {
    reconcile(profile);
  } catch (err) {
    return {
      ok: false,
      code: 0,
      log: `\u5378\u8F7D\u5B8C\u6210\u4F46\u66F4\u65B0 bundle \u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`
    };
  }
  recordUninstall(fullName);
  return { ok: true, code: 0, log: "\u5378\u8F7D\u6210\u529F\uFF0C\u91CD\u542F DSH \u540E\u751F\u6548\u3002" };
}

// src/index.ts
var CACHE_TTL_MS = 30 * 60 * 1e3;
function cacheFile() {
  return join2(dshHome(), "plugin-store-cache.json");
}
function readDiskCache() {
  try {
    if (!existsSync2(cacheFile())) return null;
    const parsed = JSON.parse(readFileSync2(cacheFile(), "utf8"));
    if (typeof parsed?.at !== "number" || !Array.isArray(parsed?.entries)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeDiskCache(cache) {
  try {
    writeFileSync2(cacheFile(), JSON.stringify(cache));
  } catch {
  }
}
var name = "dsh-plugin-store";
var inject = ["webServer"];
function apply(ctx) {
  const token = process.env.GITHUB_TOKEN || process.env.DSH_PLUGIN_STORE_TOKEN || "";
  const profile = process.env.DSH_PLUGIN_STORE_PROFILE || "web";
  let cache = readDiskCache();
  async function catalog(force) {
    if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache;
    const { total, entries, partial } = await fetchCatalog(token);
    cache = { at: Date.now(), total, entries, partial };
    writeDiskCache(cache);
    return cache;
  }
  ctx.effect(
    () => ctx.webServer.register({
      kind: "prefix",
      path: "/plugin-store",
      handler: async (req, res) => {
        const url = new URL(req.url ?? "/", "http://x");
        const pathname = url.pathname;
        try {
          if (pathname === "/plugin-store/catalog" && (req.method === "GET" || req.method === "HEAD")) {
            const force = url.searchParams.get("refresh") === "1";
            const data = await catalog(force);
            sendJson(res, 200, {
              ok: true,
              total: data.total,
              fetched: data.entries.length,
              partial: data.partial,
              entries: data.entries
            });
            return;
          }
          if (pathname === "/plugin-store/installed" && req.method === "GET") {
            sendJson(res, 200, { ok: true, ...readInstalled(profile) });
            return;
          }
          if (pathname === "/plugin-store/install-meta" && req.method === "GET") {
            sendJson(res, 200, { ok: true, meta: readInstallMeta() });
            return;
          }
          if (pathname === "/plugin-store/install" && req.method === "POST") {
            const body = await readJson(req);
            const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
            if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
              sendJson(res, 400, { ok: false, error: { code: "bad_full_name", message: "Invalid repository name." } });
              return;
            }
            const result = await runInstall(fullName, profile, token);
            sendJson(res, result.ok ? 200 : 500, {
              ok: result.ok,
              full_name: fullName,
              code: result.code,
              log: result.log.slice(-4e3)
            });
            return;
          }
          if (pathname === "/plugin-store/uninstall" && req.method === "POST") {
            const body = await readJson(req);
            const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
            if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
              sendJson(res, 400, { ok: false, error: { code: "bad_full_name", message: "Invalid repository name." } });
              return;
            }
            const result = await runUninstall(fullName, profile);
            sendJson(res, result.ok ? 200 : 500, {
              ok: result.ok,
              full_name: fullName,
              code: result.code,
              log: result.log.slice(-4e3)
            });
            return;
          }
          sendJson(res, 404, { ok: false, error: { code: "not_found", message: "Unknown route." } });
        } catch (err) {
          ctx.logger?.error(err);
          sendJson(res, 500, {
            ok: false,
            error: { code: "internal", message: err instanceof Error ? err.message : String(err) }
          });
        }
      }
    }),
    "plugin-store: routes"
  );
}
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
export {
  apply,
  inject,
  name
};
