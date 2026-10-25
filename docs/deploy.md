# 构建与部署手册

> 2026-10-25 起 wrangler 已入 devDependencies，`npx` 临时安装这条历史失败路径已消除。

## 构建

```bash
npm run build        # = bash scripts/build.sh
```

- 产物：`dist/output/`（单目录，index.html + assets/ + 静态资源 + capabilities）
- **Git Bash 可直接跑**：脚本内已设置 `MSYS_NO_PATHCONV=1` 与 `MSYS2_ENV_CONV_EXCL='*'`，`/` 开头的变量（如 `ASSETS_CDN_PATH=/`）不会被改写成 Git 安装根路径
- 内置三重守卫（任一触发即 FATAL 退出）：
  1. `dist/output/index.html` 必须存在且非空
  2. index.html 不得含 `Program Files`（MSYS 污染特征）
  3. index.html 引用的每个 `assets/*` 文件必须真实存在

## 部署（Cloudflare）

```bash
npx wrangler login   # 仅首次：浏览器 OAuth 交互登录（agent 无法代登）
npm run deploy       # = npm run build && wrangler deploy
```

- 配置：`wrangler.jsonc`（Workers 静态资产模式，`assets.directory = dist/output`，SPA fallback）
- 部署后冒烟：打开站点确认首页渲染、`Ctrl+K` 命令面板、构建器优化可用
- 历史坑位（已修，供考古）：
  - 2026-06-29 失败：npx 临时装 wrangler → 触发 vite setup 崩溃 → 已由本地 devDep 根治
  - 2026-08-26 起 Git Bash 构建产出被 MSYS 路径污染（`/Program Files/Git/assets/*`）→ 已由环境变量根治 + 守卫拦截

## 环境变量（平台注入，通常无需手动设）

| 变量 | 作用 |
|------|------|
| `MIAODA_APP_ID` | 客户端 base path（`/app/<appId>`） |
| `MIAODA_RESOURCE_CDN_PREFIX` | assets CDN 前缀（默认 `/`） |
| `MIAODA_STATIC_CDN_PREFIX` | 静态资源 CDN 前缀 |
