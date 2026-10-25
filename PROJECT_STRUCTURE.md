# StarFadeWiki 项目结构书

> 最后更新：2026-10-25 v2.0（对齐 v3.0 交付 + v4.0 起步 + 波次1修固的实际状态）

---

## 项目概述

星海舰队桌游 Wiki — 一站式查阅 36 种舰船 + 7 种舰载机 + 完整跑团规则，附舰队构建器

- **技术栈：** React 19 + TypeScript + Vite(rolldown) + Tailwind CSS v4 + shadcn/ui + framer-motion + vitest
- **部署：** Cloudflare 静态资产（`starsadewiki1`），`npm run deploy`（首次 `npx wrangler login`）
- **仓库：** github.com/cyyfuture/StarFadeWiki；tag：`v3.0`、`v4.0-start`

---

## 目录结构（实际状态）

```
StarFadeWiki/
├── src/
│   ├── index.tsx              # 入口（模板管理，勿改）
│   ├── app.tsx                # 路由 + 全局挂载（Toaster）
│   ├── index.css              # 全局样式 + 主题变量（含 light 变体）
│   ├── tailwind-theme.css     # 深浅主题色变量
│   ├── components/            # 全局组件（历史原因业务组件在此，未强制迁 pages/）
│   │   ├── Header.tsx / AppSidebar.tsx / Footer.tsx
│   │   ├── StarfieldBackground.tsx   # 全局星空（reduced-motion 降级）
│   │   ├── ShipCard / ShipDetailModal / CompareModal / ShipFilterBar
│   │   ├── SquadronSection / RulesSection / TemplatesSection / RankingsSection
│   │   ├── FleetHeatmapSection.tsx   # v2.0 配队热力图
│   │   ├── RulesQuickRef.tsx         # 规则速查（? 键 + Header 按钮，受控 Dialog）
│   │   ├── CommandPalette.tsx        # v4.0 Ctrl+K
│   │   ├── ClickableCard.tsx         # 波次1 键盘可点击容器
│   │   ├── RadarChart.tsx            # 手写 SVG 雷达（替代 echarts）
│   │   └── builder/                  # v3.0 舰队构建器
│   │       ├── FleetBuilderSection.tsx / ShipPickerPanel.tsx / FleetListPanel.tsx
│   │       ├── OptimizePanel.tsx / ExportImportButtons.tsx / share.ts(+test)
│   ├── pages/
│   │   ├── WikiHomePage/WikiHomePage.tsx   # 单页锚点编排层（唯一区块 id 输出点）
│   │   └── NotFoundPage/
│   ├── data/                  # ships(36) / squadrons(7) / rules / fleettemplates / rankings
│   ├── context/FleetContext.tsx        # 构建器状态（reducer + 持久化）
│   ├── hooks/                 # use-theme / use-mobile
│   └── lib/                   # 纯逻辑层
│       ├── fleet-math.ts(+test)        # 汇总/超限/威慑/优化(光环枚举×贪心)/导出导入
│       ├── rules.ts                    # 规则常量 + MAINTENANCE_FACILITIES + AURA_OUTPUT_BONUS
│       ├── format.ts                   # 展示格式化统一出口（波次1）
│       ├── ships-access.ts / chart-colors.ts / utils.ts
├── shared/static/             # rulebook.pdf 等
├── scripts/                   # build.sh / dev.mjs / parse-docx.cjs / parse-pdf.cjs
│   └── verify-ships.cjs       # 总册→TS 机器校验（npm run verify:data）
├── docs/                      # requirements.md / deploy.md / data-dictionary.md
├── .hermes/plans/             # 迭代计划（已入库）
├── wrangler.jsonc             # Cloudflare 配置（assets → dist/output）
└── CHANGELOG.md / RECOVERY_MAP.md / ITERATION_PROCESS.md / AGENTS.md / README.md
```

---

## 数据流架构

```
总册 DOCX/PDF ──(人工转录 2026-06-30)──> src/data/*.ts ──> 页面/构建器
     │                                        ▲
     └──(scripts/verify-ships.cjs 机器校验)────┘   npm run verify:data 36/36
```

- 游戏数据为静态 TS 常量；改数值必须过 `verify:data`
- 派生字段规则见 `docs/data-dictionary.md`（zcCost=cost/100、szValue=garrison、fpNumeric 数值化口径）
- 光环建模：`lib/rules.ts` AURA_OUTPUT_BONUS + `optimizeFleet` 子集枚举（2026-10-25）
- 排名数据（rankings.ts）为编制口径，不作派生计算输入

---

## 版本历史

| 版本 | 日期 | 变更摘要 | 标记 |
|------|------|----------|------|
| v0.0 原始版 | 2026-06-30 | 初始完整项目 | backup/000_原始版（已冷存） |
| v1.0 修复版 | 2026-07-03 | Header/Sidebar 修复 + 搜索联动 + SEO | backup/001_*（已冷存） |
| v2.0 设计迭代 | 2026-07-09 | 浅色主题 + 热力图 + 雷达图（未及时归档） | git 历史 |
| v3.0 舰队构建器 | 2026-08-26 | 构建器 + fleet-math(13测试) + bundle -65% | **tag v3.0** |
| v4.0-start | 2026-08-26 | Command Palette + 分享链接 + 命名对齐 | **tag v4.0-start** |
| 波次0/1 修固 | 2026-10-25 | 见 CHANGELOG Unreleased | git 历史 |

> 目录复制式归档（backup/）已废除：15MB 冷存后删除，改用 git tag + bundle。002 编号从未使用（历史文档笔误）。

---

## 关键决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据存储 | TypeScript 常量 + verify:data 校验器 | 纯静态站；手工转录必须机器兜底 |
| 图表 | 手写 SVG RadarChart | bundle -65%，echarts/recharts/gsap 已删 |
| 优化器 | 光环枚举 × 贪心（非 ILP） | 实测贪心与精确 DP 差距 0.00%；光环舰曾被 0 战力误除 |
| 归档 | git tag + bundle | 目录复制法冗余且漂移（backup 考古结论） |
| 部署 | wrangler 入 devDep + npm run deploy | 消除 npx 临时安装失败路径 |
