# dsh-plugin-store

DeepSeek Harness（DSH）插件商店：在 **设置 → 插件** 里新增一个「插件商店」标签页，从 GitHub `topic:dsh-plugin` 生态获取插件，以卡片列表展示，支持搜索、分类/标签筛选、排序，并可**一键安装**到本机 DSH。

## 功能

- **卡片列表**：分类标签徽章、`作者/仓库名`、简介、Star 数、发布日期。
- **搜索**：按名称、简介、标签、作者实时过滤。
- **筛选**：功能分类（全部分类 / 界面增强 / 通知 / 工作流自动化 / 开发辅助 / 知识学习 / 其他工具）与类型标签（全部类型 / 已收录 + 18 个类型标签，带实时计数）。
- **排序**：GitHub Stars / 最近添加 / 最近更新 / 名称。
- **一键安装**：卡片上的「安装」按钮在宿主机执行 `pnpm add github:<作者>/<仓库>` 并把声明 `dsh.bundle` 的依赖写进 profile 的 bundle 列表；安装成功后提示「重启后生效」。
- **查看详情**：打开插件仓库的 GitHub 页面。

## 安装本插件

```bash
# 通过 GitHub 仓库（git 依赖）
dsh plugin --profile web add github:w769721503/dsh-plugin-store

# 或先发布到 npm 后
dsh plugin --profile web add dsh-plugin-store
```

安装后**重启 DSH**，然后打开 设置 → 插件 → 「插件商店」。

## 开发 / 构建

```bash
npm install   # 安装 esbuild 等构建工具
npm run build # 产出 lib/index.js（Host 半侧）+ lib/client.js（浏览器半侧）
```

> 通过 `github:owner/repo`（git 依赖）安装时，pnpm 会运行 `prepare` 脚本自动构建。若希望安装时不构建，可把 `lib/` 目录一并提交到仓库。

## 架构

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：注册 `/plugin-store/*` HTTP 路由——
  - `GET /plugin-store/catalog`：抓取并缓存 GitHub Search API（`topic:dsh-plugin`），归一化并分类。
  - `GET /plugin-store/installed`：读取 profile 的 `package.json`，报告已安装依赖与 bundle。
  - `POST /plugin-store/install`：执行 `pnpm add github:<owner>/<repo>` 并重排 `dsh.profile.bundles`。
- **Client 半侧**（`src/client/*` → `lib/client.js`）：注册 `settings.plugins.tab`（id=`store`），渲染商店界面，直接 `fetch` Host 路由。

插件通过 `cordis.patch.yml` 以**双面（dual-face）单行**挂载：同一包的 Host 入口由 Loader 加载，`dsh.client` 声明让 client-modules 把 `lib/client.js` 注入 `window.__DSH_BOOT__`。

## 配置（环境变量）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 空 | 可选 GitHub Token，提升 API 限流额度（未认证 60 次/小时）。 |
| `DSH_PLUGIN_STORE_PROFILE` | `web` | 安装目标 profile 名。 |

## 说明与限制

- **重启生效**：安装只写入依赖与 bundle 列表，新插件需重启 DSH 才挂载。
- **topic 噪声**：`dsh-plugin` 主题下含不少非 DSH 插件仓库（设计工具、桌面客户端、skill 集等）。「已收录」标签用启发式近似「可安装的 DSH 插件」（`topics` 含 `dsh`/`deepseek-harness`，或仓库名以 `dsh-` 开头等），非权威口径。
- **可安装性**：只有声明 `dsh.bundle.patch` 的 npm 包才会成为真正的 profile bundle；其它仓库安装时会如实报错。
- **分类为启发式**：功能分类 / 类型标签由内置关键词表（`src/categories.ts`）从 topics、语言、名称、简介派生，可按需调整。
- **GitHub 限流**：目录在 Host 侧缓存 10 分钟；搜索结果最多拉取 1000 条（GitHub 上限）。
