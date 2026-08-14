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
    function matchesSpec(specs, fullName) {
      const needle = fullName.toLowerCase();
      return specs.some((s) => s.toLowerCase().includes(needle));
    }
    function parseRepo(input) {
      const s = input.trim();
      if (!s) return null;
      if (/^[\w.-]+\/[\w.-]+$/.test(s)) return s;
      const m = s.match(/github\.com[\/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?].*)?$/i);
      if (m) return `${m[1]}/${m[2]}`;
      return null;
    }
    function pageList(current, total) {
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      if (current <= 4) {
        return [1, 2, 3, 4, 5, "\u2026", total];
      }
      if (current >= total - 3) {
        return [1, "\u2026", total - 4, total - 3, total - 2, total - 1, total];
      }
      return [1, "\u2026", current - 1, current, current + 1, "\u2026", total];
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
      const [showManual, setShowManual] = (0, import_react.useState)(false);
      const [manualUrl, setManualUrl] = (0, import_react.useState)("");
      const [installedSpecs, setInstalledSpecs] = (0, import_react.useState)([]);
      const [installing, setInstalling] = (0, import_react.useState)({});
      const [installErrors, setInstallErrors] = (0, import_react.useState)({});
      const [installMeta, setInstallMeta] = (0, import_react.useState)({});
      (0, import_react.useEffect)(() => {
        let alive = true;
        let timer = null;
        setLoading(true);
        setError(null);
        const load = (refresh) => {
          const url = refresh ? "/plugin-store/catalog?refresh=1" : "/plugin-store/catalog";
          Promise.all([
            fetch(url).then((r) => r.json()),
            fetch("/plugin-store/installed").then((r) => r.json()),
            fetch("/plugin-store/install-meta").then((r) => r.json())
          ]).then(
            ([c, i, m]) => {
              if (!alive) return;
              if (!c || c.ok !== true) throw new Error(c?.error?.message || "catalog load failed");
              setCatalog(c);
              const deps = i && i.dependencies && typeof i.dependencies === "object" ? Object.values(i.dependencies) : [];
              setInstalledSpecs(deps.filter((s) => typeof s === "string"));
              setInstallMeta(m && m.meta && typeof m.meta === "object" ? m.meta : {});
              setLoading(false);
              const stillPartial = c.partial === true || typeof c.fetched === "number" && typeof c.total === "number" && c.fetched > 0 && c.fetched < c.total;
              if (stillPartial) {
                timer = setTimeout(() => load(false), 8e3);
              }
            },
            (e) => {
              if (!alive) return;
              setError(e instanceof Error ? e.message : String(e));
              setLoading(false);
            }
          );
        };
        load(refreshKey > 0);
        return () => {
          alive = false;
          if (timer) clearTimeout(timer);
        };
      }, [refreshKey]);
      const isInstalled = (entry) => installing[entry.full_name] === "installed" || matchesSpec(installedSpecs, entry.full_name);
      const hasUpdate = (entry) => {
        if (!isInstalled(entry)) return false;
        const meta = installMeta[entry.full_name];
        if (!meta || !meta.pushedAt) return false;
        return (entry.pushed_at || "") > meta.pushedAt;
      };
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
          if (category === "installed") return installing[e.full_name] === "installed" || matchesSpec(installedSpecs, e.full_name);
          if (category !== "all" && e.category !== category) return false;
          if (tag === "indexed") return e.indexed;
          if (tag !== "all" && e.primaryTag !== tag && !e.tags.includes(tag)) return false;
          return true;
        });
      }, [catalog, query, category, tag, installedSpecs, installing]);
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
      const showNotice = (type, text) => {
        setNotice({ type, text });
        setTimeout(() => setNotice(null), 6e3);
      };
      const doInstall = (fullName) => {
        setInstalling((prev) => ({ ...prev, [fullName]: "installing" }));
        setInstallErrors((prev) => {
          const next = { ...prev };
          delete next[fullName];
          return next;
        });
        return fetch("/plugin-store/install", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ full_name: fullName })
        }).then((r) => r.json()).then((res) => {
          if (res && res.ok) {
            setInstalling((prev) => ({ ...prev, [fullName]: "installed" }));
            setInstalledSpecs((prev) => [...prev, fullName]);
            setInstallMeta((prev) => {
              const entry = catalog?.entries?.find((x) => x.full_name === fullName);
              return { ...prev, [fullName]: { pushedAt: entry?.pushed_at ?? "", installedAt: Date.now() } };
            });
            showNotice("success", res.log || `${fullName} ${t("installSuccess")}`);
          } else {
            setInstalling((prev) => ({ ...prev, [fullName]: "error" }));
            const msg = res?.log || res?.error?.message || t("installFailed");
            setInstallErrors((prev) => ({ ...prev, [fullName]: msg }));
            showNotice("error", `${fullName}: ${msg}`);
          }
        }).catch((e) => {
          const msg = e instanceof Error ? e.message : String(e);
          setInstalling((prev) => ({ ...prev, [fullName]: "error" }));
          setInstallErrors((prev) => ({ ...prev, [fullName]: msg }));
          showNotice("error", `${fullName}: ${msg}`);
        });
      };
      const doUninstall = (fullName) => {
        setInstalling((prev) => ({ ...prev, [fullName]: "uninstalling" }));
        fetch("/plugin-store/uninstall", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ full_name: fullName })
        }).then((r) => r.json()).then((res) => {
          if (res && res.ok) {
            setInstalling((prev) => {
              const next = { ...prev };
              delete next[fullName];
              return next;
            });
            setInstalledSpecs((prev) => prev.filter((s) => !s.toLowerCase().includes(fullName.toLowerCase())));
            showNotice("success", res.log || t("uninstallSuccess"));
          } else {
            setInstalling((prev) => {
              const next = { ...prev };
              delete next[fullName];
              return next;
            });
            showNotice("error", res?.log || res?.error?.message || t("uninstallFailed"));
          }
        }).catch((e) => {
          setInstalling((prev) => {
            const next = { ...prev };
            delete next[fullName];
            return next;
          });
          showNotice("error", e instanceof Error ? e.message : String(e));
        });
      };
      const updatableCount = (catalog?.entries ?? []).filter((e) => isInstalled(e) && hasUpdate(e)).length;
      const updateAll = async () => {
        const targets = (catalog?.entries ?? []).filter((e) => isInstalled(e) && hasUpdate(e));
        if (targets.length === 0) {
          showNotice("success", "\u5168\u90E8\u5DF2\u662F\u6700\u65B0");
          return;
        }
        for (const e of targets) {
          await doInstall(e.full_name);
        }
        showNotice("success", `\u5DF2\u66F4\u65B0 ${targets.length} \u4E2A\u63D2\u4EF6\uFF0C\u91CD\u542F\u540E\u751F\u6548`);
      };
      const submitManual = () => {
        const fullName = parseRepo(manualUrl);
        if (!fullName) {
          showNotice("error", t("invalidUrl"));
          return;
        }
        setShowManual(false);
        setManualUrl("");
        doInstall(fullName);
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
      const partial = catalog?.partial === true;
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
              fetched > 0 && fetched < total ? ` \xB7 \u5DF2\u52A0\u8F7D ${fetched}${partial ? "\uFF08\u9650\u6D41\uFF0C\u90E8\u5206\uFF09" : ""}` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-manual", onClick: () => setShowManual(true), children: t("manualInstall") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-refresh", onClick: () => setRefreshKey((k) => k + 1), disabled: loading, children: t("refresh") })
          ] }),
          category === "installed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ps-update-all-bar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ps-update-all", onClick: updateAll, disabled: updatableCount === 0, children: [
            t("updateAll"),
            "\uFF08",
            updatableCount,
            "\uFF09"
          ] }) }) : null,
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
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "installed", children: t("installedFilter") }),
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
            const hasUpd = hasUpdate(entry);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "ps-card", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-card-top", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-badge", children: TAG_LABEL[entry.primaryTag] ?? entry.primaryTag }),
                installedNow ? hasUpd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-status-badge", "data-type": "update", children: t("hasUpdate") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ps-status-badge", "data-type": "latest", children: t("latestVersion") }) : null,
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
                    disabled: phase === "installing" || phase === "uninstalling",
                    onClick: () => installedNow && !hasUpd ? doUninstall(entry.full_name) : doInstall(entry.full_name),
                    children: phase === "installing" ? t("installing") : phase === "uninstalling" ? t("uninstalling") : hasUpd ? t("update") : installedNow ? t("uninstall") : t("install")
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-pagination-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "ps-pager ps-icon",
                  disabled: currentPage <= 1,
                  onClick: () => setPage(currentPage - 1),
                  title: t("prev"),
                  "aria-label": t("prev"),
                  children: "\u2039"
                }
              ),
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
                  className: "ps-pager ps-icon",
                  disabled: currentPage >= totalPages,
                  onClick: () => setPage(currentPage + 1),
                  title: t("next"),
                  "aria-label": t("next"),
                  children: "\u203A"
                }
              )
            ] }),
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-pager ps-icon", onClick: jumpTo, title: t("go"), "aria-label": t("go"), children: "\u21B5" })
            ] })
          ] }) : null
        ] }) : null,
        showManual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ps-modal-backdrop", onClick: () => setShowManual(false), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-modal", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t("manualInstall") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ps-modal-hint", children: t("manualHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "text",
              value: manualUrl,
              placeholder: "https://github.com/owner/repo",
              onChange: (e) => setManualUrl(e.currentTarget.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") submitManual();
              },
              autoFocus: true
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps-modal-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-install", onClick: submitManual, children: t("install") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ps-details", onClick: () => setShowManual(false), children: t("cancel") })
          ] })
        ] }) }) : null
      ] });
    }

    // src/client/store.css
    var store_default = ".ps-root {\r\n  width: 100%;\r\n  max-width: 900px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n\r\n.ps-status {\r\n  margin: 0;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 13px;\r\n  line-height: 20px;\r\n}\r\n\r\n.ps-failure {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  color: var(--dsw-alias-state-error-primary);\r\n  font-size: 13px;\r\n}\r\n.ps-failure p { margin: 0; }\r\n.ps-failure button {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  cursor: pointer;\r\n  background: transparent;\r\n  border-radius: 6px;\r\n  padding: 4px 10px;\r\n}\r\n\r\n.ps-toolbar {\r\n  display: flex;\r\n  gap: 10px;\r\n  align-items: center;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.ps-search {\r\n  flex: 1 1 240px;\r\n  display: flex;\r\n  align-items: center;\r\n  position: relative;\r\n}\r\n.ps-search input {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-1);\r\n  width: 100%;\r\n  height: 36px;\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  border-radius: 8px;\r\n  outline: none;\r\n  padding: 0 12px;\r\n  font-size: 13px;\r\n}\r\n.ps-search input:focus-visible {\r\n  border-color: var(--dsw-alias-state-business-primary);\r\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent);\r\n}\r\n\r\n.ps-select {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n.ps-select-label {\r\n  font-size: 12px;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  white-space: nowrap;\r\n}\r\n.ps-select select {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-1);\r\n  height: 36px;\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  border-radius: 8px;\r\n  padding: 0 8px;\r\n  font-size: 13px;\r\n  cursor: pointer;\r\n}\r\n\r\n.ps-heading {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  padding: 0 2px;\r\n}\r\n.ps-heading h3 {\r\n  margin: 0;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  line-height: 20px;\r\n}\r\n.ps-heading span {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-variant-numeric: tabular-nums;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n}\r\n.ps-refresh {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n}\r\n.ps-refresh:disabled {\r\n  cursor: default;\r\n  opacity: 0.6;\r\n}\r\n\r\n.ps-tags {\r\n  display: flex;\r\n  gap: 6px;\r\n  overflow-x: auto;\r\n  flex-wrap: nowrap;\r\n  padding-bottom: 4px;\r\n  scrollbar-width: thin;\r\n}\r\n.ps-tags::-webkit-scrollbar {\r\n  height: 6px;\r\n}\r\n.ps-tags::-webkit-scrollbar-thumb {\r\n  background: var(--dsw-alias-border-l2);\r\n  border-radius: 3px;\r\n}\r\n.ps-chip {\r\n  flex: 0 0 auto;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  color: var(--dsw-alias-label-secondary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n  border-radius: 999px;\r\n  padding: 3px 10px;\r\n  white-space: nowrap;\r\n}\r\n.ps-chip:hover { border-color: var(--dsw-alias-border-l1); }\r\n.ps-chip[data-active='true'] {\r\n  border-color: var(--dsw-alias-state-business-primary);\r\n  color: var(--dsw-alias-state-business-primary);\r\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);\r\n}\r\n.ps-chip-count {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  margin-left: 4px;\r\n  font-variant-numeric: tabular-nums;\r\n}\r\n\r\n.ps-cards {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  align-items: start;\r\n  gap: 10px;\r\n  margin: 0;\r\n  padding: 0;\r\n  list-style: none;\r\n}\r\n@media (max-width: 640px) {\r\n  .ps-cards { grid-template-columns: minmax(0, 1fr); }\r\n}\r\n\r\n.ps-card {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  border-radius: 10px;\r\n  padding: 12px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n  min-width: 0;\r\n}\r\n.ps-card-top {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n}\r\n.ps-badge {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  font-size: 11px;\r\n  line-height: 16px;\r\n  padding: 1px 8px;\r\n  border-radius: 999px;\r\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);\r\n  color: var(--dsw-alias-state-business-primary);\r\n  white-space: nowrap;\r\n}\r\n.ps-stars {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 12px;\r\n  font-variant-numeric: tabular-nums;\r\n  white-space: nowrap;\r\n}\r\n.ps-name {\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  line-height: 18px;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n.ps-desc {\r\n  margin: 0;\r\n  color: var(--dsw-alias-label-secondary);\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  display: -webkit-box;\r\n  -webkit-line-clamp: 2;\r\n  -webkit-box-orient: vertical;\r\n  overflow: hidden;\r\n  min-height: 36px;\r\n}\r\n.ps-meta {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 6px 12px;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 11px;\r\n  line-height: 16px;\r\n}\r\n.ps-actions {\r\n  display: flex;\r\n  gap: 8px;\r\n  margin-top: 2px;\r\n}\r\n.ps-actions a,\r\n.ps-actions button {\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n  cursor: pointer;\r\n  text-decoration: none;\r\n  display: inline-flex;\r\n  align-items: center;\r\n}\r\n.ps-details {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: transparent;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n.ps-install {\r\n  border: 1px solid transparent;\r\n  background: var(--dsw-alias-state-business-primary);\r\n  color: #fff;\r\n}\r\n.ps-install:disabled {\r\n  cursor: default;\r\n  opacity: 0.6;\r\n}\r\n.ps-install[data-state='installed'] {\r\n  background: transparent;\r\n  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 50%, transparent);\r\n  color: var(--dsw-alias-state-error-primary);\r\n}\r\n.ps-install[data-state='error'] {\r\n  background: var(--dsw-alias-state-error-primary);\r\n}\r\n.ps-install-error {\r\n  margin: 0;\r\n  color: var(--dsw-alias-state-error-primary);\r\n  font-size: 11px;\r\n  line-height: 16px;\r\n  word-break: break-all;\r\n}\r\n\r\n.ps-pagination {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  padding: 4px 2px;\r\n  flex-wrap: nowrap;\r\n}\r\n.ps-pagination-center {\r\n  flex: 1 1 auto;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 6px;\r\n  min-width: 0;\r\n}\r\n.ps-pageinfo {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 12px;\r\n  font-variant-numeric: tabular-nums;\r\n}\r\n.ps-pager {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n}\r\n.ps-pager:disabled {\r\n  cursor: default;\r\n  opacity: 0.5;\r\n}\r\n.ps-pager.ps-icon {\r\n  height: 32px;\r\n  min-width: 36px;\r\n  padding: 0 12px;\r\n  font-size: 16px;\r\n  line-height: 1;\r\n  font-weight: 600;\r\n}\r\n\r\n.ps-notice {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 10px;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 8px;\r\n  padding: 8px 12px;\r\n  font-size: 13px;\r\n  line-height: 20px;\r\n}\r\n.ps-notice[data-type='success'] {\r\n  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2ea44f) 40%, transparent);\r\n  color: var(--dsw-alias-state-success-primary, #2ea44f);\r\n}\r\n.ps-notice[data-type='error'] {\r\n  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);\r\n  color: var(--dsw-alias-state-error-primary);\r\n}\r\n.ps-notice button {\r\n  border: none;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: 16px;\r\n  line-height: 1;\r\n  cursor: pointer;\r\n  padding: 0 2px;\r\n}\r\n\r\n.ps-pages {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n}\r\n.ps-pagenum {\r\n  min-width: 30px;\r\n  height: 30px;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  color: var(--dsw-alias-label-secondary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 1;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  padding: 0 8px;\r\n}\r\n.ps-pagenum[data-active='true'] {\r\n  border-color: var(--dsw-alias-state-business-primary);\r\n  background: var(--dsw-alias-state-business-primary);\r\n  color: #fff;\r\n}\r\n.ps-ellipsis {\r\n  color: var(--dsw-alias-label-tertiary);\r\n  padding: 0 2px;\r\n}\r\n\r\n.ps-jump {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n.ps-jump input {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-1);\r\n  width: 56px;\r\n  height: 28px;\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  border-radius: 6px;\r\n  padding: 0 8px;\r\n}\r\n\r\n.ps-manual {\r\n  margin-left: auto;\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-3);\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n}\r\n.ps-manual:hover {\r\n  border-color: var(--dsw-alias-state-business-primary);\r\n  color: var(--dsw-alias-state-business-primary);\r\n}\r\n\r\n.ps-modal-backdrop {\r\n  position: fixed;\r\n  inset: 0;\r\n  background: rgba(0, 0, 0, 0.4);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  z-index: 100;\r\n}\r\n.ps-modal {\r\n  background: var(--dsw-alias-bg-layer-1);\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  border-radius: 10px;\r\n  padding: 16px;\r\n  width: min(440px, calc(100vw - 32px));\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n  color: var(--dsw-alias-label-primary);\r\n}\r\n.ps-modal h4 {\r\n  margin: 0;\r\n  font-size: 14px;\r\n  font-weight: 600;\r\n}\r\n.ps-modal-hint {\r\n  margin: 0;\r\n  color: var(--dsw-alias-label-tertiary);\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n}\r\n.ps-modal input {\r\n  border: 1px solid var(--dsw-alias-border-l2);\r\n  background: var(--dsw-alias-bg-layer-1);\r\n  height: 36px;\r\n  color: var(--dsw-alias-label-primary);\r\n  font: inherit;\r\n  border-radius: 8px;\r\n  padding: 0 12px;\r\n  font-size: 13px;\r\n}\r\n.ps-modal-actions {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  gap: 8px;\r\n}\r\n.ps-modal-actions button {\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n  cursor: pointer;\r\n  text-decoration: none;\r\n  display: inline-flex;\r\n  align-items: center;\r\n}\r\n\r\n.ps-status-badge {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  font-size: 11px;\r\n  line-height: 16px;\r\n  padding: 1px 8px;\r\n  border-radius: 999px;\r\n  white-space: nowrap;\r\n}\r\n.ps-status-badge[data-type='latest'] {\r\n  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2ea44f) 14%, transparent);\r\n  color: var(--dsw-alias-state-success-primary, #2ea44f);\r\n}\r\n.ps-status-badge[data-type='update'] {\r\n  background: color-mix(in srgb, var(--dsw-alias-state-warning-primary, #d29922) 16%, transparent);\r\n  color: var(--dsw-alias-state-warning-primary, #d29922);\r\n}\r\n\r\n.ps-update-all-bar {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n}\r\n.ps-update-all {\r\n  border: 1px solid var(--dsw-alias-state-business-primary);\r\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);\r\n  color: var(--dsw-alias-state-business-primary);\r\n  font: inherit;\r\n  font-size: 12px;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  padding: 4px 12px;\r\n}\r\n.ps-update-all:disabled {\r\n  cursor: default;\r\n  opacity: 0.5;\r\n}\r\n";

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
      close: "\u5173\u95ED",
      manualInstall: "\u624B\u52A8\u5B89\u88C5",
      manualHint: "\u7C98\u8D34 GitHub \u4ED3\u5E93\u94FE\u63A5\uFF0C\u81EA\u52A8\u8BC6\u522B\u5E76\u5B89\u88C5",
      invalidUrl: "\u65E0\u6CD5\u8BC6\u522B\u7684 GitHub \u94FE\u63A5\uFF0C\u8BF7\u8F93\u5165 owner/repo \u6216\u5B8C\u6574\u94FE\u63A5",
      installedFilter: "\u5DF2\u5B89\u88C5",
      uninstall: "\u5378\u8F7D",
      uninstalling: "\u5378\u8F7D\u4E2D\u2026",
      uninstallSuccess: "\u5378\u8F7D\u6210\u529F\uFF0C\u91CD\u542F\u540E\u751F\u6548",
      uninstallFailed: "\u5378\u8F7D\u5931\u8D25",
      cancel: "\u53D6\u6D88",
      latestVersion: "\u6700\u65B0\u7248",
      hasUpdate: "\u6709\u66F4\u65B0",
      update: "\u66F4\u65B0",
      updateAll: "\u4E00\u952E\u66F4\u65B0"
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
      close: "Close",
      manualInstall: "Install manually",
      manualHint: "Paste a GitHub repo link to install it.",
      invalidUrl: "Unrecognized GitHub link. Enter owner/repo or a full URL.",
      installedFilter: "Installed",
      uninstall: "Uninstall",
      uninstalling: "Uninstalling\u2026",
      uninstallSuccess: "Uninstalled. Restart to apply.",
      uninstallFailed: "Uninstall failed",
      cancel: "Cancel",
      latestVersion: "Latest",
      hasUpdate: "Update available",
      update: "Update",
      updateAll: "Update all"
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
