window.__ModuleLoader__.load({
  id: "dsh-plugin-store",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client/index.tsx
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(index_exports);

    // src/client/StoreTab.tsx
    var import_react = require("react");

    // src/taxonomy.ts
    var CATEGORIES = [
      { id: "ui", zh: "\u754C\u9762\u589E\u5F3A", en: "UI enhancement" },
      { id: "notify", zh: "\u901A\u77E5", en: "Notifications" },
      { id: "workflow", zh: "\u5DE5\u4F5C\u6D41\u81EA\u52A8\u5316", en: "Workflow automation" },
      { id: "dev", zh: "\u5F00\u53D1\u8F85\u52A9", en: "Developer tools" },
      { id: "knowledge", zh: "\u77E5\u8BC6\u5B66\u4E60", en: "Knowledge & learning" },
      { id: "other", zh: "\u5176\u4ED6\u5DE5\u5177", en: "Other tools" }
    ];
    var TAGS = [
      { id: "ui-ux", zh: "\u754C\u9762\u4E0E\u4F53\u9A8C", en: "UI & experience" },
      { id: "desktop", zh: "\u684C\u9762\u5BA2\u6237\u7AEF", en: "Desktop client" },
      { id: "tui", zh: "\u7EC8\u7AEF\u4E0ETUI", en: "Terminal & TUI" },
      { id: "input", zh: "\u8F93\u5165\u4E0E\u63D0\u793A\u8BCD", en: "Input & prompts" },
      { id: "browser", zh: "\u6D4F\u89C8\u5668\u4E0E\u8FDC\u7A0B", en: "Browser & remote" },
      { id: "memory", zh: "\u8BB0\u5FC6\u4E0E\u4E0A\u4E0B\u6587", en: "Memory & context" },
      { id: "messages", zh: "\u6D88\u606F\u4E0E\u901A\u77E5", en: "Messages & notifications" },
      { id: "vision", zh: "\u89C6\u89C9\u4E0E\u56FE\u50CF", en: "Vision & image" },
      { id: "model", zh: "\u6A21\u578B\u4E0E\u63A8\u7406", en: "Model & inference" },
      { id: "cost", zh: "\u6210\u672C\u4E0E\u7528\u91CF", en: "Cost & usage" },
      { id: "data", zh: "\u6570\u636E\u4E0E\u53EF\u89C6\u5316", en: "Data & visualization" },
      { id: "testing", zh: "\u6D4B\u8BD5\u4E0E\u8BCA\u65AD", en: "Testing & diagnostics" },
      { id: "security", zh: "\u5B89\u5168\u4E0E\u9690\u79C1", en: "Security & privacy" },
      { id: "agent", zh: "Agent\u4E0E\u81EA\u52A8\u5316", en: "Agent & automation" },
      { id: "engineering", zh: "\u5F00\u53D1\u4E0E\u5DE5\u7A0B", en: "Engineering" },
      { id: "research", zh: "\u7814\u7A76\u4E0E\u77E5\u8BC6", en: "Research & knowledge" },
      { id: "fun", zh: "\u8DA3\u5473\u4E0E\u5A31\u4E50", en: "Fun & entertainment" }
    ];
    var SORTS = [
      { id: "stars", zh: "GitHub Stars", en: "GitHub Stars" },
      { id: "recent", zh: "\u6700\u8FD1\u6DFB\u52A0", en: "Recently added" },
      { id: "updated", zh: "\u6700\u8FD1\u66F4\u65B0", en: "Recently updated" },
      { id: "name", zh: "\u540D\u79F0", en: "Name" }
    ];

    // src/client/StoreTab.tsx
    var import_jsx_runtime = require("react/jsx-runtime");
    var PAGE_SIZES = [10, 30, 50];
    var TAG_LABEL = Object.fromEntries(TAGS.map((t) => [t.id, t.zh]));
    var CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.zh]));
    function formatDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return `${d.getFullYear()}\u5E74${d.getMonth() + 1}\u6708${d.getDate()}\u65E5`;
    }
    function searchText(entry) {
      return [
        entry.full_name,
        entry.owner,
        entry.name,
        entry.description,
        ...entry.topics,
        TAG_LABEL[entry.primaryTag] ?? "",
        CATEGORY_LABEL[entry.category] ?? ""
      ].join(" ").toLowerCase();
    }
    function pageList(current, total) {
      if (total <= 7) {
        const out = [];
        for (let i = 1; i <= total; i++) out.push(i);
        return out;
      }
      const pages = [1];
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      if (start > 2) pages.push("\u2026");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push("\u2026");
      pages.push(total);
      return pages;
    }
    function StoreTab({ t }) {
      const [catalog, setCatalog] = (0, import_react.useState)(null);
      const [loading, setLoading] = (0, import_react.useState)(true);
      const [error, setError] = (0, import_react.useState)(null);
      const [notice, setNotice] = (0, import_react.useState)(null);
      const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
      const [query, setQuery] = (0, import_react.useState)("");
      const [category, setCategory] = (0, import_react.useState)("all");
      const [tag, setTag] = (0, import_react.useState)("all");
      const [sort, setSort] = (0, import_react.useState)("stars");
      const [page, setPage] = (0, import_react.useState)(1);
      const [pageSize, setPageSize] = (0, import_react.useState)(10);
      const [jump, setJump] = (0, import_react.useState)("");
      const [installedSpecs, setInstalledSpecs] = (0, import_react.useState)([]);
      const [installing, setInstalling] = (0, import_react.useState)({});
      const [installErrors, setInstallErrors] = (0, import_react.useState)({});
      (0, import_react.useEffect)(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        const url = refreshKey > 0 ? "/plugin-store/catalog?refresh=1" : "/plugin-store/catalog";
        Promise.all([
          fetch(url).then((r) => r.json()),
          fetch("/plugin-store/installed").then((r) => r.json())
        ]).then(
          ([c, i]) => {
            if (!alive) return;
            if (!c || c.ok !== true) throw new Error(c?.error?.message || "catalog load failed");
            setCatalog(c);
            const deps = i && i.dependencies && typeof i.dependencies === "object" ? Object.values(i.dependencies) : [];
            setInstalledSpecs(deps.filter((s) => typeof s === "string"));
            setLoading(false);
          },
          (e) => {
            if (!alive) return;
            setError(e instanceof Error ? e.message : String(e));
            setLoading(false);
          }
        );
        return () => {
          alive = false;
        };
      }, [refreshKey]);
      const facetCounts = (0, import_react.useMemo)(() => {
        const entries = catalog?.entries ?? [];
        const byTag = {};
        let indexed = 0;
        for (const e of entries) {
          if (e.indexed) indexed++;
          const key = e.primaryTag;
          byTag[key] = (byTag[key] ?? 0) + 1;
        }
        return { byTag, indexed, total: entries.length };
      }, [catalog]);
      const filtered = (0, import_react.useMemo)(() => {
        const entries = catalog?.entries ?? [];
        const q = query.trim().toLowerCase();
        return entries.filter((e) => {
          if (q && !searchText(e).includes(q)) return false;
          if (category !== "all" && e.category !== category) return false;
          if (tag === "indexed") return e.indexed;
          if (tag !== "all" && e.primaryTag !== tag && !e.tags.includes(tag)) return false;
          return true;
        });
      }, [catalog, query, category, tag]);
      const sorted = (0, import_react.useMemo)(() => {
        const list = [...filtered];
        switch (sort) {
          case "recent":
            list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
            break;
          case "updated":
            list.sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""));
            break;
          case "name":
            list.sort((a, b) => a.full_name.localeCompare(b.full_name));
            break;
          default:
            list.sort((a, b) => b.stars - a.stars);
        }
        return list;
      }, [filtered, sort]);
      const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
      const currentPage = Math.min(page, totalPages);
      const pageEntries = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      const isInstalled = (entry) => {
        if (installing[entry.full_name] === "installed") return true;
        const needle = entry.full_name.toLowerCase();
        return installedSpecs.some((s) => s.toLowerCase().includes(needle));
      };
      const showNotice = (type, text) => {
        setNotice({ type, text });
        setTimeout(() => setNotice(null), 6e3);
      };
      const install = (entry) => {
        setInstalling((prev) => ({ ...prev, [entry.full_name]: "installing" }));
        setInstallErrors((prev) => {
          const next = { ...prev };
          delete next[entry.full_name];
          return next;
        });
        fetch("/plugin-store/install", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ full_name: entry.full_name })
        }).then((r) => r.json()).then((res) => {
          if (res && res.ok) {
            setInstalling((prev) => ({ ...prev, [entry.full_name]: "installed" }));
            setInstalledSpecs((prev) => [...prev, entry.full_name]);
            showNotice("success", res.log || `${entry.full_name} ${t("installSuccess")}`);
          } else {
            setInstalling((prev) => ({ ...prev, [entry.full_name]: "error" }));
            const msg = res?.log || res?.error?.message || t("installFailed");
            setInstallErrors((prev) => ({ ...prev, [entry.full_name]: msg }));
            showNotice("error", `${entry.full_name}: ${msg}`);
          }
        }).catch((e) => {
          const msg = e instanceof Error ? e.message : String(e);
          setInstalling((prev) => ({ ...prev, [entry.full_name]: "error" }));
          setInstallErrors((prev) => ({ ...prev, [entry.full_name]: msg }));
          showNotice("error", `${entry.full_name}: ${msg}`);
        });
      };
      const resetPage = () => setPage(1);
      const jumpTo = () => {
        const n = Number(jump);
        if (Number.isInteger(n) && n >= 1 && n <= totalPages) {
          setPage(n);
          setJump("");
        }
      };
      const total = catalog?.total ?? 0;
      const fetched = catalog?.fetched ?? 0;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-root", "aria-busy": loading, children: [
        loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-status", children: t("loading") }) : null,
        error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-failure", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", children: error }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setRefreshKey((k) => k + 1), children: t("retry") })
        ] }) : null,
        catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-notice", "data-type": notice.type, role: "status", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice.text }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setNotice(null), "aria-label": t("close"), children: "\xD7" })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-heading", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
              total,
              " ",
              t("total")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              t("indexedCount"),
              " ",
              facetCounts.indexed,
              fetched > 0 && fetched < total ? ` \xB7 \u5DF2\u52A0\u8F7D ${fetched}` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-refresh", onClick: () => setRefreshKey((k) => k + 1), disabled: loading, children: t("refresh") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-toolbar", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "ps-search", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "search",
                value: query,
                placeholder: t("search"),
                "aria-label": t("search"),
                onChange: (e) => {
                  setQuery(e.currentTarget.value);
                  resetPage();
                }
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ps-select", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-select-label", children: t("category") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "select",
                {
                  value: category,
                  onChange: (e) => {
                    setCategory(e.currentTarget.value);
                    resetPage();
                  },
                  "aria-label": t("category"),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "all", children: t("allCategories") }),
                    CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: c.id, children: c.zh }, c.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ps-select", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-select-label", children: t("sort") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "select",
                {
                  value: sort,
                  onChange: (e) => {
                    setSort(e.currentTarget.value);
                    resetPage();
                  },
                  "aria-label": t("sort"),
                  children: SORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s.id, children: s.zh }, s.id))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-tags", role: "toolbar", "aria-label": t("allTags"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                type: "button",
                className: "ps-chip",
                "data-active": tag === "all",
                onClick: () => {
                  setTag("all");
                  resetPage();
                },
                children: [
                  t("allTags"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-chip-count", children: facetCounts.total })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                type: "button",
                className: "ps-chip",
                "data-active": tag === "indexed",
                onClick: () => {
                  setTag("indexed");
                  resetPage();
                },
                children: [
                  t("indexed"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-chip-count", children: facetCounts.indexed })
                ]
              }
            ),
            TAGS.map((tg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                type: "button",
                className: "ps-chip",
                "data-active": tag === tg.id,
                onClick: () => {
                  setTag(tg.id);
                  resetPage();
                },
                children: [
                  tg.zh,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-chip-count", children: facetCounts.byTag[tg.id] ?? 0 })
                ]
              },
              tg.id
            ))
          ] }),
          facetCounts.total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-status", children: t("empty") }) : null,
          facetCounts.total > 0 && sorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-status", children: t("emptySearch") }) : null,
          pageEntries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "ps-cards", children: pageEntries.map((entry) => {
            const phase = installing[entry.full_name];
            const installedNow = isInstalled(entry);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "ps-card", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-card-top", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-badge", children: TAG_LABEL[entry.primaryTag] ?? entry.primaryTag }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ps-stars", children: [
                  "\u2605 ",
                  entry.stars.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ps-name", title: entry.full_name, children: entry.full_name }),
              entry.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-desc", children: entry.description }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-meta", children: [
                entry.language ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.language }) : null,
                entry.license ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.license }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(entry.created_at) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "ps-details", href: entry.html_url, target: "_blank", rel: "noreferrer", children: t("viewDetails") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "ps-install",
                    "data-state": phase === "error" ? "error" : installedNow ? "installed" : "idle",
                    disabled: phase === "installing" || installedNow,
                    onClick: () => install(entry),
                    children: phase === "installing" ? t("installing") : installedNow ? `${t("installed")} \xB7 ${t("restartHint")}` : t("install")
                  }
                )
              ] }),
              phase === "error" && installErrors[entry.full_name] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-install-error", children: installErrors[entry.full_name] }) : null
            ] }, entry.full_name);
          }) }) : null,
          sorted.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-pagination", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ps-select", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-select-label", children: t("perPage") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "select",
                {
                  value: pageSize,
                  onChange: (e) => {
                    setPageSize(Number(e.currentTarget.value));
                    resetPage();
                  },
                  "aria-label": t("perPage"),
                  children: PAGE_SIZES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: n, children: n }, n))
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-pager", disabled: currentPage <= 1, onClick: () => setPage(currentPage - 1), children: t("prev") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ps-pages", children: pageList(currentPage, totalPages).map(
              (p, idx) => p === "\u2026" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-ellipsis", children: "\u2026" }, `e${idx}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "ps-pagenum",
                  "data-active": p === currentPage,
                  onClick: () => setPage(p),
                  children: p
                },
                p
              )
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "ps-pager",
                disabled: currentPage >= totalPages,
                onClick: () => setPage(currentPage + 1),
                children: t("next")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ps-jump", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-select-label", children: t("jumpTo") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "number",
                  min: 1,
                  max: totalPages,
                  value: jump,
                  onChange: (e) => setJump(e.currentTarget.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") jumpTo();
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-pager", onClick: jumpTo, children: t("go") })
            ] })
          ] }) : null
        ] }) : null
      ] });
    }

    // src/client/store.css
    var store_default = ".ps-root {\n  width: 100%;\n  max-width: 900px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  color: var(--dsw-alias-label-primary);\n}\n\n.ps-status {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.ps-failure {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 13px;\n}\n.ps-failure p { margin: 0; }\n.ps-failure button {\n  border: 1px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  cursor: pointer;\n  background: transparent;\n  border-radius: 6px;\n  padding: 4px 10px;\n}\n\n.ps-toolbar {\n  display: flex;\n  gap: 10px;\n  align-items: center;\n  flex-wrap: wrap;\n}\n\n.ps-search {\n  flex: 1 1 240px;\n  display: flex;\n  align-items: center;\n  position: relative;\n}\n.ps-search input {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  width: 100%;\n  height: 36px;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  border-radius: 8px;\n  outline: none;\n  padding: 0 12px;\n  font-size: 13px;\n}\n.ps-search input:focus-visible {\n  border-color: var(--dsw-alias-state-business-primary);\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent);\n}\n\n.ps-select {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.ps-select-label {\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n}\n.ps-select select {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  height: 36px;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  border-radius: 8px;\n  padding: 0 8px;\n  font-size: 13px;\n  cursor: pointer;\n}\n\n.ps-heading {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 0 2px;\n}\n.ps-heading h3 {\n  margin: 0;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 20px;\n}\n.ps-heading span {\n  color: var(--dsw-alias-label-tertiary);\n  font-variant-numeric: tabular-nums;\n  font-size: 12px;\n  line-height: 18px;\n}\n.ps-refresh {\n  margin-left: auto;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 4px 12px;\n}\n.ps-refresh:disabled {\n  cursor: default;\n  opacity: 0.6;\n}\n\n.ps-tags {\n  display: flex;\n  gap: 6px;\n  overflow-x: auto;\n  flex-wrap: nowrap;\n  padding-bottom: 4px;\n  scrollbar-width: thin;\n}\n.ps-tags::-webkit-scrollbar {\n  height: 6px;\n}\n.ps-tags::-webkit-scrollbar-thumb {\n  background: var(--dsw-alias-border-l2);\n  border-radius: 3px;\n}\n.ps-chip {\n  flex: 0 0 auto;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 999px;\n  padding: 3px 10px;\n  white-space: nowrap;\n}\n.ps-chip:hover { border-color: var(--dsw-alias-border-l1); }\n.ps-chip[data-active='true'] {\n  border-color: var(--dsw-alias-state-business-primary);\n  color: var(--dsw-alias-state-business-primary);\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);\n}\n.ps-chip-count {\n  color: var(--dsw-alias-label-tertiary);\n  margin-left: 4px;\n  font-variant-numeric: tabular-nums;\n}\n\n.ps-cards {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  align-items: start;\n  gap: 10px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n@media (max-width: 640px) {\n  .ps-cards { grid-template-columns: minmax(0, 1fr); }\n}\n\n.ps-card {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  border-radius: 10px;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-width: 0;\n}\n.ps-card-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.ps-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  line-height: 16px;\n  padding: 1px 8px;\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);\n  color: var(--dsw-alias-state-business-primary);\n  white-space: nowrap;\n}\n.ps-stars {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n.ps-name {\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 18px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ps-desc {\n  margin: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  min-height: 36px;\n}\n.ps-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px 12px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  line-height: 16px;\n}\n.ps-actions {\n  display: flex;\n  gap: 8px;\n  margin-top: 2px;\n}\n.ps-actions a,\n.ps-actions button {\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  border-radius: 6px;\n  padding: 4px 12px;\n  cursor: pointer;\n  text-decoration: none;\n  display: inline-flex;\n  align-items: center;\n}\n.ps-details {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n}\n.ps-install {\n  border: 1px solid transparent;\n  background: var(--dsw-alias-state-business-primary);\n  color: #fff;\n}\n.ps-install:disabled {\n  cursor: default;\n  opacity: 0.6;\n}\n.ps-install[data-state='installed'] {\n  background: transparent;\n  border-color: var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-tertiary);\n}\n.ps-install[data-state='error'] {\n  background: var(--dsw-alias-state-error-primary);\n}\n.ps-install-error {\n  margin: 0;\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 11px;\n  line-height: 16px;\n  word-break: break-all;\n}\n\n.ps-pagination {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 2px;\n}\n.ps-pageinfo {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n}\n.ps-pager {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 4px 12px;\n}\n.ps-pager:disabled {\n  cursor: default;\n  opacity: 0.5;\n}\n\n.ps-notice {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 8px 12px;\n  font-size: 13px;\n  line-height: 20px;\n}\n.ps-notice[data-type='success'] {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2ea44f) 40%, transparent);\n  color: var(--dsw-alias-state-success-primary, #2ea44f);\n}\n.ps-notice[data-type='error'] {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);\n  color: var(--dsw-alias-state-error-primary);\n}\n.ps-notice button {\n  border: none;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  font-size: 16px;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 2px;\n}\n\n.ps-pages {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.ps-pagenum {\n  min-width: 28px;\n  height: 28px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 1;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 0 6px;\n}\n.ps-pagenum[data-active='true'] {\n  border-color: var(--dsw-alias-state-business-primary);\n  background: var(--dsw-alias-state-business-primary);\n  color: #fff;\n}\n.ps-ellipsis {\n  color: var(--dsw-alias-label-tertiary);\n  padding: 0 2px;\n}\n\n.ps-jump {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.ps-jump input {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  width: 56px;\n  height: 28px;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 12px;\n  border-radius: 6px;\n  padding: 0 8px;\n}\n";

    // src/client/index.tsx
    var NS = "settings.pluginStore";
    var zh = {
      tab: "\u63D2\u4EF6\u5546\u5E97",
      loading: "\u6B63\u5728\u52A0\u8F7D\u63D2\u4EF6\u5546\u5E97\u2026",
      error: "\u6682\u65F6\u65E0\u6CD5\u52A0\u8F7D\u63D2\u4EF6\u5546\u5E97\u3002",
      retry: "\u91CD\u8BD5",
      search: "\u641C\u7D22\u540D\u79F0\u3001\u7B80\u4ECB\u3001\u6807\u7B7E\u3001\u4F5C\u8005\u2026",
      sort: "\u6392\u5E8F",
      category: "\u5206\u7C7B",
      allCategories: "\u5168\u90E8\u5206\u7C7B",
      allTags: "\u5168\u90E8\u7C7B\u578B",
      indexed: "\u5DF2\u6536\u5F55",
      total: "\u4E2A\u63D2\u4EF6",
      indexedCount: "\u5DF2\u6536\u5F55",
      viewDetails: "\u67E5\u770B\u8BE6\u60C5",
      install: "\u5B89\u88C5",
      installing: "\u5B89\u88C5\u4E2D\u2026",
      installed: "\u5DF2\u5B89\u88C5",
      restartHint: "\u91CD\u542F\u540E\u751F\u6548",
      installFailed: "\u5B89\u88C5\u5931\u8D25",
      empty: "\u6682\u65E0\u63D2\u4EF6\u3002",
      emptySearch: "\u6CA1\u6709\u5339\u914D\u7684\u63D2\u4EF6\u3002",
      refresh: "\u5237\u65B0",
      perPage: "\u6BCF\u9875",
      prev: "\u4E0A\u4E00\u9875",
      next: "\u4E0B\u4E00\u9875",
      installSuccess: "\u5B89\u88C5\u6210\u529F\uFF0C\u91CD\u542F\u540E\u751F\u6548",
      jumpTo: "\u8DF3\u8F6C",
      go: "\u524D\u5F80",
      close: "\u5173\u95ED"
    };
    var en = {
      tab: "Plugin store",
      loading: "Loading the plugin store\u2026",
      error: "The plugin store is temporarily unavailable.",
      retry: "Retry",
      search: "Search name, description, tag, author\u2026",
      sort: "Sort",
      category: "Category",
      allCategories: "All categories",
      allTags: "All types",
      indexed: "Indexed",
      total: "plugins",
      indexedCount: "indexed",
      viewDetails: "Details",
      install: "Install",
      installing: "Installing\u2026",
      installed: "Installed",
      restartHint: "restart to apply",
      installFailed: "Install failed",
      empty: "No plugins available.",
      emptySearch: "No matching plugins.",
      refresh: "Refresh",
      perPage: "Per page",
      prev: "Prev",
      next: "Next",
      installSuccess: "Installed. Restart to apply.",
      jumpTo: "Jump to",
      go: "Go",
      close: "Close"
    };
    var inject = ["slots", "locale"];
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "plugin-store: dictionaries");
      const t = ctx.locale.bind(NS);
      ctx.effect(() => injectCss(), "plugin-store: css");
      ctx.slots.inject(
        "settings.plugins.tab",
        () => ctx.slots.register(
          {
            name: "settings.plugins.tab",
            id: "store",
            order: 5,
            label: () => t("tab"),
            locale: NS,
            inject: () => ({})
          },
          StoreTab
        )
      );
    }
    function injectCss() {
      if (typeof document === "undefined") return () => {
      };
      const id = "dsh-plugin-store-css";
      if (document.getElementById(id)) return () => {
      };
      const el = document.createElement("style");
      el.id = id;
      el.dataset.plugin = "dsh-plugin-store";
      el.textContent = store_default;
      document.head.appendChild(el);
      return () => el.remove();
    }

    return module.exports;
  },
});
