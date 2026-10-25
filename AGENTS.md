# 项目技术规范（AGENTS.md）

> 全局路径索引: `E:\Project\AI_Database\LongBase\全局路径索引.md`（装到哪/依赖在哪/数据在哪，先读它）
> 需求与 UI 设计指南已迁至 [docs/requirements.md](docs/requirements.md)；项目门面见 [README.md](README.md)

## 技术栈

- 前端: React 19 + TypeScript
- 样式: Tailwind CSS v4
- UI 组件: shadcn/ui `import { Button } from "@/components/ui/button";`
- 图标: lucide-react `import { SearchIcon } from "lucide-react";`
- 图表: 自写 SVG（`RadarChart.tsx`，勿再引入 echarts/recharts/gsap）
- 动画: framer-motion `import { motion } from "framer-motion";`
- 路由: react-router-dom `import { Link, useNavigate } from "react-router-dom";`
- 提示: sonner（`<Toaster />` 已挂载于 `src/app.tsx` 根，toast 直接可用）

---

## 常用命令

| 用途 | 命令 |
|------|------|
| 开发 | `npm run dev` |
| 构建 | `npm run build`（Git Bash 可直接跑，MSYS 已根治） |
| 类型检查 | `npm run typecheck` |
| 测试 | `npm test` |
| 数据校验（总册→TS） | `npm run verify:data` |
| 部署 | `npm run deploy`（首次需先 `npx wrangler login`） |

---

## 目录结构

```
src/
├── index.tsx            # 入口（勿修改）
├── app.tsx              # 路由配置（仅在 <Routes> 内增删 <Route>；全局挂载如 Toaster 也可在此）
├── index.css            # 全局样式 + 主题变量
├── components/          # 全局 UI 组件（Header/AppSidebar/builder/ 等）
│   └── ui/              # shadcn/ui 内置组件（勿修改）
├── pages/               # 页面模块（每个页面一个目录）
├── data/                # 静态游戏数据（ships/squadrons/rules/fleettemplates/rankings）
├── hooks/               # 自定义 Hooks
└── lib/                 # 纯逻辑层（fleet-math/rules 常量/format/utils）
shared/
└── static/              # 静态资源（data/images）
scripts/                 # 构建/解析/校验脚本（.cjs）
docs/                    # 需求、部署、数据词典
```

---

## 禁止修改的文件

| 文件 | 原因 |
|------|------|
| `src/index.tsx` | Provider 层级 + 样式引入，由模板管理 |
| `src/components/ui/*` | shadcn/ui 内置组件，版本锁定 |

---

## 文件放置规则

| 内容类型 | 放置位置 |
|---------|---------|
| 新页面 | `src/pages/<PageName>/PageName.tsx` |
| 页面专属组件 | `src/pages/<PageName>/components/` |
| 自定义 Hooks | `src/hooks/` |
| 工具函数/纯逻辑 | `src/lib/` |
| 静态数据文件 | `src/data/`（TS 常量，改数值须过 `npm run verify:data`） |
| 静态图片 | `shared/static/images/` |

---

## 导入路径

```typescript
// @/ 别名 → src/
import { cn } from "@/lib/utils";

// @shared/ 别名 → shared/
import heroImage from "@shared/static/images/hero.png";
```

---

## 路由配置

- 新增页面需在 `src/app.tsx` 的 `<Routes>` 内注册 `<Route>`
- `BrowserRouter` 已在 `index.tsx` 中配置，`app.tsx` 中**禁止**再包裹 Router

---

## 主题变量

主题色定义在 `src/index.css` 与 `src/tailwind-theme.css`，通过 `:root` CSS 变量 + `@theme inline` 注册到 Tailwind。

| 用途 | Tailwind 类 | CSS 变量 |
|------|------------|----------|
| 页面背景 | `bg-background` | `--background` |
| 主文本 | `text-foreground` | `--foreground` |
| 卡片背景 | `bg-card` | `--card` |
| 次要文本 | `text-muted-foreground` | `--muted-foreground` |
| 主色 | `bg-primary` / `text-primary` | `--primary` |
| 强调色 | `bg-accent` | `--accent` |
| 边框 | `border-border` | `--border` |
| 危险色 | `text-destructive` | `--destructive` |

HSL 格式使用**空格分隔**：`--primary: hsl(150 60% 40%);`

浅色主题: 变量在 `.light`/`[data-theme="light"]` 下覆写；组件内禁止硬编码亮色文字（用语义 token）。
