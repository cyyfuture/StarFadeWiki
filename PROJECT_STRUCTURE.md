# StarFadeWiki 项目结构书

> 最后更新：2026-07-03 v1.0

---

## 项目概述

星海舰队桌游 Wiki — 一站式查阅 36 种舰船 + 7 种舰载机 + 完整跑团规则

- **技术栈：** React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + framer-motion
- **部署：** Cloudflare Pages（`starsadewiki1`）
- **域名：** 待配置

---

## 目录结构

```
Code/
├── StarFadeWiki/                  # 当前工作目录（活性开发）
│   ├── src/
│   │   ├── index.tsx              # 入口（Provider 层级）
│   │   ├── app.tsx                # 路由配置
│   │   ├── index.css              # 全局样式入口
│   │   ├── tailwind-theme.css     # 主题色变量（深色/浅色）
│   │   ├── typography.css         # 排版样式
│   │   ├── components/            # 全局 UI 组件
│   │   │   ├── Header.tsx         # 顶部导航栏
│   │   │   ├── AppSidebar.tsx     # 侧边栏目录
│   │   │   ├── Footer.tsx         # 页脚
│   │   │   ├── StarfieldBackground.tsx  # 星空粒子背景
│   │   │   └── ui/               # shadcn/ui 组件库
│   │   ├── pages/
│   │   │   ├── WikiHomePage/      # 首页（核心页面）
│   │   │   │   ├── WikiHomePage.tsx
│   │   │   │   └── components/    # 首页专属组件
│   │   │   │       ├── HeroSection.tsx    # 英雄区
│   │   │   │       ├── ShipCard.tsx       # 舰船卡片
│   │   │   │       ├── ShipFilterBar.tsx  # 筛选工具栏
│   │   │   │       ├── ShipDetailModal.tsx # 舰船详情弹窗
│   │   │   │       ├── CompareModal.tsx   # 舰船对比弹窗
│   │   │   │       ├── SquadronSection.tsx # 舰载机区
│   │   │   │       ├── RulesSection.tsx    # 规则区
│   │   │   │       ├── TemplatesSection.tsx # 配队模板区
│   │   │   │       └── RankingsSection.tsx  # 效率排名区
│   │   │   ├── NotFoundPage/
│   │   │   └── ExamplePage/
│   │   ├── data/                  # 静态游戏数据
│   │   │   ├── ships.ts           # 36 舰船数据
│   │   │   ├── squadrons.ts       # 7 舰载机数据
│   │   │   ├── rules.ts           # 4 条战斗规则
│   │   │   ├── fleettemplates.ts  # 3 个配队模板
│   │   │   └── rankings.ts        # 3 组效率排名
│   │   ├── hooks/                 # 自定义 Hooks
│   │   │   └── use-mobile.ts
│   │   └── lib/                   # 工具函数
│   │       ├── utils.ts
│   │       └── chart-colors.ts
│   ├── public/
│   │   ├── favicon.svg           # 星舰图标
│   │   └── icons.svg
│   ├── scripts/                  # 构建/解析脚本
│   ├── .hermes/plans/            # Hermes 计划文件
│   ├── index.html
│   ├── vite.config.ts
│   ├── wrangler.jsonc            # Cloudflare Pages 配置
│   ├── tsconfig*.json
│   ├── tailwind-theme.css
│   ├── package.json
│   └── README.md
│
├── backup/                       # 历史版本归档
│   ├── 000_原始版/               # v0.0 — 初始完整版
│   ├── 001_v1.0_修复版/          # v1.0 — 当前修复版
│   ├── 002_.../                  # v2.0 — 设计迭代（TODO）
│   ├── 003_.../                  # v3.0 — 功能增强（TODO）
│   └── 004_.../                  # v4.0 — 完成态（TODO）
│
├── 外围数据/                     # 原始素材（PDF/DOCX/TXT）
├── Problem/                      # 构建日志
└── 星海舰队桌游Wiki.html         # 原始 HTML 版本
```

---

## 数据流架构

```
┌─────────┐     ┌───────────┐     ┌──────────┐
│ data/*  │────→│ pages/    │────→│ components│
│ (.ts)   │     │ (业务逻辑)│     │ (UI 渲染) │
└─────────┘     └───────────┘     └──────────┘
      │                │                │
      ▼                ▼                ▼
  静态 JSON         useState         shadcn/ui
  (不可变)          (筛选/排序)       Tailwind CSS
```

- 所有游戏数据是静态 TypeScript 常量（无 API 调用）
- 筛选/排序/对比全部前端内存计算
- 主题偏好使用 `localStorage` 持久化
- Cloudflare Pages 纯静态部署（无服务器端）

---

## 主题系统

| CSS 变量 | 用途 | 深色值 |
|----------|------|--------|
| `--background` | 页面背景 | `hsl(230 30% 6%)` |
| `--foreground` | 主文本色 | `hsl(210 20% 92%)` |
| `--card` | 卡片背景 | `hsl(232 28% 12%)` |
| `--primary` | 霓虹青主色 | `hsl(187 100% 50%)` |
| `--accent` | 暖金强调色 | `hsl(42 100% 60%)` |
| `--border` | 边框色 | `hsl(230 20% 22%)` |

> ⚠️ 浅色主题变量尚未实现（P0 待修复）

---

## 版本历史

| 版本 | 日期 | 变更摘要 | backup 位置 |
|------|------|----------|------------|
| v0.0 原始版 | 2026-06-30 | 初始完整项目（36舰船+7舰载机+规则+模板+排名） | `backup/000_原始版/` |
| v1.0 修复版 | 2026-07-03 | Header/Sidebar props 修复 + 搜索联动 + HTML/Favicon/SEO | `backup/001_v1.0_P0改进版/` |
| v2.0 设计迭代版 | 2026-07-03 | 浅色主题 + useTheme统一 + 硬编码颜色清理 + 响应式排版 + 雷达图 + 实时搜索 + 平板导航 | TODO 归档 |
| v3.0 功能增强 | TODO | 舰队构建器 + 规则速查 + 筛选增强 | `backup/003_.../` |
| v4.0 完成态 | TODO | Command Palette + 对比增强 + 智能推荐 | `backup/004_.../` |

---

## 关键决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据存储 | TypeScript 常量 | 纯静态站点，无后端 API |
| 路由 | react-router-dom + 锚点导航 | SPA 架构 + 锚点跳转混合 |
| 主题 | CSS 变量 + Tailwind v4 | 轻量级深色/浅色切换 |
| 动画 | framer-motion | 高性能声明式动画 |
| 部署 | Cloudflare Pages | 免费 + 全球 CDN |

---

*本文件随项目迭代持续更新*