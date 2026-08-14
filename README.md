<p align="center">
  <strong>简体中文</strong>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=nodedotjs&logoColor=white">
</p>

# DSH Plugin Store · 插件商店

> 一个 DeepSeek Harness 插件：在「设置 → 插件」里新增一个**插件商店**，浏览、搜索、筛选并**一键安装** `dsh-plugin` 生态插件。
> A plugin store for DeepSeek Harness — browse, search, filter, and one-click install `dsh-plugin` ecosystem plugins right from Settings → Plugins.

**安装：**

```bash
dsh plugin --profile web add github:w769721503/dsh-plugin-store
```

安装后**重启 DSH**，打开 设置 → 插件 → 「插件商店」。

## 功能

- **联网目录**：从 GitHub `topic:dsh-plugin` 拉取插件，分页加载（最多 1000 条，GitHub 搜索上限），宿主端缓存 10 分钟。
- **卡片列表**：类型标签徽章、`作者/仓库名`、简介、Star 数、发布日期。
- **搜索**：按名称、简介、标签、作者实时过滤。
- **筛选**：
  - 功能分类（下拉框）：全部分类 / 界面增强 / 通知 / 工作流自动化 / 开发辅助 / 知识学习 / 其他工具。
  - 类型标签（单行横向滚动，带实时计数）：全部类型 / 已收录 + 18 个类型标签。
- **排序**：GitHub Stars / 最近添加 / 最近更新 / 名称。
- **一键安装**：卡片上的「安装」在宿主机执行 `pnpm add github:<owner>/<repo>`，并把声明 `dsh.bundle` 的依赖写进 profile 的 bundle 列表；成功后提示「重启后生效」。
- **查看详情**：跳转插件仓库的 GitHub 页面。

## 界面

打开 **设置 → 插件 → 插件商店**：

- 顶部一行统计：插件总数、已收录数、已加载条数。
- 工具栏：搜索框 + 分类下拉框 + 排序下拉框。
- 单行横向滚动的类型标签条（全部类型 / 已收录 / 18 个分类标签，带计数）。
- 双列卡片网格：标签徽章、名称、简介、Star 数、语言 / License / 发布日期、查看详情 + 安装按钮。
<img width="797" height="1303" alt="image" src="https://github.com/user-attachments/assets/91f0afb5-9335-4f2e-b3a0-a95db12625b3" />

## 工作原理

本插件是**双面（dual-face）** DSH bundle，由 `cordis.patch.yml` 以单行挂载：

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：注册 `/plugin-store/*` HTTP 路由——
  - `GET /plugin-store/catalog`：抓取 GitHub Search API 并归一化、分类。
  - `GET /plugin-store/installed`：读取 profile 的 `package.json`，报告已安装依赖与 bundle。
  - `POST /plugin-store/install`：执行 `pnpm add github:<owner>/<repo>` 并重排 `dsh.profile.bundles`。
- **Client 半侧**（`src/client/*` → `lib/client.js`）：注册 `settings.plugins.tab`（id=`store`），渲染商店界面，通过 `fetch` 调用 Host 路由。

包声明 `dsh.bundle.patch` + `dsh.client`，所以安装后：Host 入口由 Loader 加载，浏览器半侧由 client-modules 注入 `window.__DSH_BOOT__`。

## 配置（环境变量）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 空 | 可选 GitHub Token，提升 API 限流额度（未认证 10 次/分钟搜索）。 |
| `DSH_PLUGIN_STORE_PROFILE` | `web` | 安装目标 profile 名。 |

## 开发 / 构建

```bash
npm install   # 安装 esbuild 等构建工具
npm run build # 产出 lib/index.js（Host）+ lib/client.js（浏览器）
```

> 仓库已提交 `lib/` 构建产物，`github:owner/repo` 安装时无需构建；改动 `src/` 后需重新 `npm run build` 并提交。

## 说明与限制

- **重启生效**：安装只写入依赖与 bundle 列表，新插件需重启 DSH 才挂载。
- **topic 噪声**：`dsh-plugin` 主题下含不少非 DSH 插件仓库（设计工具、桌面客户端、skill 集等）。「已收录」标签用启发式近似「可安装的 DSH 插件」（`topics` 含 `dsh`/`deepseek-harness`，或仓库名以 `dsh-` 开头等），非权威口径。
- **可安装性**：只有声明 `dsh.bundle.patch` 的 npm 包才会成为真正的 profile bundle；其它仓库安装时会如实报错。
- **分类为启发式**：功能分类 / 类型标签由内置关键词表（`src/categories.ts`）从 topics、语言、名称、简介派生，可按需调整。

## License

[MIT](LICENSE)
