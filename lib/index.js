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
async function fetchCatalog(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dsh-plugin-store"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const entries = [];
  let total = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${GITHUB_API}?q=${encodeURIComponent(QUERY)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`;
    const res = await fetch(url, { headers });
    if (res.status === 403 || res.status === 429) {
      throw new Error("GitHub API rate limit reached. Add a GITHUB_TOKEN to raise the limit, or retry later.");
    }
    if (!res.ok) throw new Error(`GitHub API request failed (HTTP ${res.status})`);
    const data = await res.json();
    total = typeof data.total_count === "number" ? data.total_count : total;
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) break;
    for (const item of items) entries.push(normalize(item));
    if (entries.length >= 1e3 || items.length < PER_PAGE) break;
  }
  return { total, entries };
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
function isBundle(dep) {
  try {
    const manifestPath = join(dshHome(), "profiles", "node_modules", dep, "package.json");
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
  const bundles = pkg.dsh?.profile?.bundles ?? [];
  let changed = false;
  for (const dep of deps) {
    if (isBundle(dep) && !bundles.includes(dep)) {
      bundles.push(dep);
      changed = true;
    }
  }
  if (changed) {
    pkg.dsh = {
      ...pkg.dsh,
      profile: { ...pkg.dsh?.profile ?? {}, bundles }
    };
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}
var INSTALL_TIMEOUT_MS = 10 * 60 * 1e3;
function runInstall(fullName, profile = "web", onLog) {
  return new Promise((resolve) => {
    const spec = `github:${fullName}`;
    const cwd = profileDir(profile);
    const child = spawn("pnpm", ["add", spec], {
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
      log += "\n[timed out after 10 minutes]";
      child.kill();
    }, INSTALL_TIMEOUT_MS);
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, code: null, log: String(err) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        try {
          reconcile(profile);
        } catch (err) {
          log += `
[reconcile failed: ${err instanceof Error ? err.message : String(err)}]`;
        }
      }
      resolve({ ok: code === 0, code, log });
    });
  });
}

// src/index.ts
var CACHE_TTL_MS = 10 * 60 * 1e3;
var name = "dsh-plugin-store";
var inject = ["webServer"];
function apply(ctx) {
  const token = process.env.GITHUB_TOKEN || process.env.DSH_PLUGIN_STORE_TOKEN || "";
  const profile = process.env.DSH_PLUGIN_STORE_PROFILE || "web";
  let cache = null;
  async function catalog() {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache;
    const { total, entries } = await fetchCatalog(token);
    cache = { at: Date.now(), total, entries };
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
            const data = await catalog();
            sendJson(res, 200, { ok: true, total: data.total, fetched: data.entries.length, entries: data.entries });
            return;
          }
          if (pathname === "/plugin-store/installed" && req.method === "GET") {
            sendJson(res, 200, { ok: true, ...readInstalled(profile) });
            return;
          }
          if (pathname === "/plugin-store/install" && req.method === "POST") {
            const body = await readJson(req);
            const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
            if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
              sendJson(res, 400, { ok: false, error: { code: "bad_full_name", message: "Invalid repository name." } });
              return;
            }
            const result = await runInstall(fullName, profile);
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
