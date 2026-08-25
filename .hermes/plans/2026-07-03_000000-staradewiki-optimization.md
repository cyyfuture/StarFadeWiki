# StarFadeWiki 系统化检查与优化计划

> **For Hermes:** 按 Task 顺序逐一执行，每完成一个 Task 验证后再进入下一个。

**目标：** 系统性审查 StarFadeWiki 项目代码质量、修复发现的 bug、补充缺失功能、优化可维护性

**当前状态：** 功能已完成（36舰船+7舰载机+规则+模板+排名+筛选+对比），但存在若干代码质量和结构问题

**技术栈：** React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + framer-motion + Cloudflare Pages

---

## 检查发现的主要问题

### 严重问题 🚨
1. **Header 组件 Props 不匹配** — WikiHomePage.tsx 向 `<Header>` 传 theme/onToggleTheme/onSearch，但 Header.tsx 自己管理内部 state
2. **AppSidebar 组件 Props 不匹配** — WikiHomePage.tsx 向 `<AppSidebar>` 传 collapsed/onToggle，但 AppSidebar.tsx 自己管理内部 state
3. **搜索联动不完整** — 头部搜索框提交后只滚动到 #ships，没有把关键词传入筛选栏

### 次要问题 ⚠️
4. `<html lang="en">` 应改为 `zh-CN`
5. **Favicon** 指向飞书 CDN（模板残留）
6. 所有 ship.imageUrl 为空或引用不存在路径
7. **Layout.tsx** 只是空壳 `<Outlet />`
8. **README.md** 规范说业务组件应放 pages/下，但都在 components/
9. **无任何测试**

### 增强建议 💡
10. SEO meta 标签（description, OG）
11. 搜索关键词传递到筛选栏

---

## 任务列表

### Task 1: 修复 Header props 不匹配

**Objective:** 统一 Header 的 props 接口

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/pages/WikiHomePage/WikiHomePage.tsx`

**方案：** 让 Header 接受外部 props（theme, onToggleTheme, onSearch），无外部 props 时用内部 state 向后兼容。

**验证：** `npx tsc --noEmit` + 主题切换/搜索正常工作

### Task 2: 修复 AppSidebar props 不匹配

**Objective:** 统一 AppSidebar 的 props 接口

**Files:**
- Modify: `src/components/AppSidebar.tsx`
- Modify: `src/pages/WikiHomePage/WikiHomePage.tsx`

**方案：** 同上，外部受控 + 内部 fallback。

**验证：** `npx tsc --noEmit` + 侧边栏折叠正常工作

### Task 3: 修复 Header 搜索 → ShipFilterBar 联动

**Objective:** 头部搜索框触发筛选栏过滤

**Files:**
- Modify: `src/pages/WikiHomePage/WikiHomePage.tsx`

**方案：** onSearch 回调更新 shipFilter.keyword，自动滚动到 #ships

**验证：** header 搜索"私掠船"→ 仅显示私掠船卡片

### Task 4: HTML/Favicon 修复

**Objective:** 修正语言、图标、SEO

**Files:**
- Modify: `index.html`
- Modify: `public/favicon.svg`

**方案：** lang=zh-CN，替换星舰主题 favicon，添加 meta description + OG tags

**验证：** `npm run build` 成功

---

## 风险评估

| 风险 | 可能性 | 影响 | 缓解 |
|------|--------|------|------|
| Props 改后功能异常 | 中 | 中 | 向后兼容 fallback |
| 构建 CI 问题 | 低 | 中 | 每次 Task 验证 build |
| 需要 Cloudflare token 才能部署 | 中 | 低 | 先验证构建，部署需用户确认 |

**建议：** 先修 Task 1-4（严重问题），这些是 bug 级别的修复。Task 5-7 是结构优化和测试，可选。