<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=nodedotjs&logoColor=white">
</p>

# DSH Plugin Store

> A DeepSeek Harness plugin that adds a **plugin store** to Settings → Plugins — browse, search, filter, and **one-click install / update / uninstall** `dsh-plugin` ecosystem plugins.

**Install:**

```bash
dsh plugin --profile web add github:w769721503/dsh-plugin-store
```

Restart DSH, then open Settings → Plugins → "Plugin store".

## Features

- **Live catalog + progressive loading**: pulls plugins from the GitHub `topic:dsh-plugin`. Since the Search API caps a single query at 1000 results, this plugin **shards by star ranges** and merges them, loading the whole topic (currently ~1800+ repos). The first 300 load instantly, the rest fill in the background and are persisted to a 30-minute disk cache.
- **Card list**: category badge, `owner/repo`, description, stars, publish date.
- **Search**: live filter by name, description, tag, author.
- **Filter**:
  - Functional category (dropdown): All / **Installed** / UI enhancement / Notifications / Workflow automation / Developer tools / Knowledge & learning / Other.
  - Type tags (single horizontally-scrollable row with live counts): All / Indexed + 18 type tags.
- **Sort**: GitHub Stars / Recently added / Recently updated / Name.
- **Pagination**: 10 / 30 / 50 per page (default 10), fixed 7 page-number slots (no layout shift) + a jump-to-page input.
- **One-click install**: the card "Install" button runs `pnpm add` and adds the `dsh.bundle` dependency to the profile bundle list.
- **Manual install**: a "Manual install" button opens a dialog where you paste an **install command or package spec** (`dsh plugin add github:owner/repo`, `@scope/pkg`, `github:owner/repo#subdir`, …).
- **Uninstall**: installed plugins show an "Uninstall" button that removes them locally (edits package.json, drops the bundle and directory — no pnpm/network, returns instantly).
- **Update detection**: installed plugins at the latest version show a green "Latest" badge; outdated ones show an "Update available" badge + "Update" button; the Installed page has an "Update all" button.
- **View details**: opens the repo's GitHub page.
- Install / uninstall / update **success or failure is reported in a top banner**.

## Screenshots

Open Settings → Plugins → "Plugin store":

- Header: total / indexed / loaded counts, plus "Update all" (Installed page only), "Manual install", "Refresh".
- Toolbar: search box + category dropdown + sort dropdown.
- A single horizontally-scrollable tag row (All / Indexed / 18 tags, with counts).
- A two-column card grid: badge, latest/update status, name, description, stars, language / license / date, details + install/update/uninstall buttons.
- A bottom pagination bar: page size, fixed page numbers, prev/next, jump input.

<img width="797" height="1303" alt="screenshot" src="https://github.com/user-attachments/assets/91f0afb5-9335-4f2e-b3a0-a95db12625b3" />

## How it works

This plugin is a **dual-face** DSH bundle, mounted by `cordis.patch.yml` in a single row:

- **Host half** (`src/index.ts` → `lib/index.js`) registers `/plugin-store/*` HTTP routes —
  - `GET /plugin-store/catalog`: fetches the GitHub Search API (star-sharded, with rate-limit retry), normalizes/classifies, returns progressively, and caches to disk.
  - `GET /plugin-store/installed`: reads the profile `package.json` and reports installed dependencies and bundles.
  - `GET /plugin-store/install-meta`: returns install timestamps (used for update detection).
  - `POST /plugin-store/install`: pre-checks `dsh.bundle` → `pnpm add <spec>` → reconciles `dsh.profile.bundles` → records the install time.
  - `POST /plugin-store/uninstall`: removes the dependency, bundle, and directory locally, and records the uninstall.
- **Client half** (`src/client/*` → `lib/client.js`) registers `settings.plugins.tab` (id=`store`), renders the UI, and calls the Host routes via `fetch`.

The package declares `dsh.bundle.patch` + `dsh.client`, so after install the Host entry is loaded by the Loader and the browser half is injected into `window.__DSH_BOOT__` by client-modules.

## Configuration (environment variables)

| Variable | Default | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | empty | Optional GitHub token to raise the API rate limit (unauthenticated search is 10 req/min; authenticated is 30 req/min). Recommended for faster full loads. |
| `DSH_PLUGIN_STORE_PROFILE` | `web` | Target profile name for installs. |

## Development / build

```bash
npm install   # install esbuild and other build tools
npm run build # produce lib/index.js (Host) + lib/client.js (browser)
```

> The repo commits the `lib/` build output, so `github:owner/repo` installs need no build; after changing `src/`, re-run `npm run build` and commit.

## Notes & limitations

- **Restart required**: install/uninstall/update only writes dependencies and the bundle list; a DSH restart is needed to apply.
- **Rate limits**: a full fetch is ~22 search requests (spaced + retried); without `GITHUB_TOKEN` the background fill is slower (~2 min, labeled "partial"), and ~45 s with a token.
- **Update detection uses `pushed_at`**: it compares the repo's latest push time (from the catalog) with the push time recorded at install; it follows the 30-minute catalog cache.
- **Topic noise**: the `dsh-plugin` topic contains many non-plugin repos (design tools, desktop clients, skill collections, skin monorepos). The "Indexed" tag is a heuristic for "installable DSH plugin", not authoritative.
- **Installability**: only npm packages declaring `dsh.bundle.patch` become real profile bundles; collection repos (e.g. skin libraries) need `github:owner/repo#subdir` to install a specific subpackage.
- **Heuristic categories**: functional categories / type tags are derived by a built-in keyword table (`src/categories.ts`) from topics, language, name, and description; tune as needed.

## License

[MIT](LICENSE)
