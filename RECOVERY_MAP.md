# 🗺️ StarFadeWiki — 遗忘恢复地图

> 最后更新: 2026-08-26 | 更新者: AI (全面审计)
> 项目状态: 🟡暂停 (最后提交 2026-07-20，已搁置约 5 周)

## 1. 项目身份
- **目录**: C:\Users\cyy\Desktop\Code\StarFadeWiki
- **IDEA**: 星海舰队桌游Wiki — 一站式查阅36舰船+7舰载机+跑团规则的静态站点
- **类型**: 纯前端静态数据站（无后端、无API）
- **技术栈**: React 19 + TypeScript + Vite(rolldown) + Tailwind v4 + shadcn/ui + framer-motion；模板为飞书 miaoda/lark-apaas 脚手架
- **Git**: 有 → github.com/cyyfuture/StarFadeWiki（经 ghproxy.net 镜像），12 commits，master 与 origin 同步
- **部署**: Cloudflare Pages（项目名 starsadewiki1），wrangler.jsonc 已配
- **创建日期**: 2026-06-30（首日完成 v0 全量）

## 2. 依赖清单
### Node 包（node_modules 存在 ✅）
- 运行时核心: react19 / tailwind4 / shadcn全家族 / framer-motion / gsap / echarts+recharts（双图表库并存）/ lucide-react
- 仅脚本用但混入 dependencies: mammoth、pdf-parse（parse-docx.cjs / parse-pdf.cjs 用）
### 外部 API
- 无（纯静态 mock 数据）
### 数据源
- src/data/*.ts 五个常量文件：ships(36艘✅已核对)、squadrons(7✅)、rules、fleettemplates、rankings

## 3. Skill 关联
| Skill 名 | 用途 | 备注 |
|---|---|---|
| popular-web-designs | 迭代灵感参考 | ITERATION_PROCESS.md 引用 |
| plan / systematic-debugging | 计划与排障 | 流程文档引用 |

## 4. Cron 关联
| Job | 说明 |
|---|---|
| 无 | 本项目无 cron |

## 5. 会话索引
| Session | 日期 | 内容 |
|---|---|---|
| （07-09 委派会话） | 2026-07 | bea3705 "委派收尾" 提及的子代理工作 |
> 注: session_search 未检索到本项目专属会话记录（可能已被清理或在其他 profile）

## 6. 文件结构（关键）
```
src/
├── components/          # 16个业务组件（⚠️未按README放pages下）
│   ├── FleetHeatmapSection.tsx  # v2.0新增 配队热力图(344行)
│   ├── Header/AppSidebar/CompareModal/ShipCard...
├── data/                # 静态数据层（ships.ts 750行=36舰全量）
├── hooks/use-theme.ts   # v2.0新增 深浅主题(localStorage __wiki_theme)
├── pages/WikiHomePage/WikiHomePage.tsx  # 单页锚点主页面(394行)
scripts/
├── build.sh             # ⚠️见断层#1
├── parse-docx.cjs / parse-pdf.cjs  # 规则书解析一次性脚本
public/rulebook.pdf      # 规则书下载(612KB)
.hermes/plans/           # ⚠️未提交(untracked)：3份迭代计划
```
外围: ../backup/{000_原始版,001_v1.0_P0改进版,001_v1.0_修复版}、../外围数据/(PDF/DOCX原始素材)、Problem/(构建日志)

## 7. 当前进度
- ✅ 已完成: v0全量(36舰+7机+规则+模板+排名) → v1.0修复(props/搜索联动/SEO/favicon) → v2.0设计迭代(浅色主题/useTheme/热力图/进度条/响应式)；typecheck 当前通过 ✅
- ❌ 断层1: **本机构建坏** — build.sh 把 MSYS 风格 `/c/...` 路径传给原生 vite，产物落去杂散目录 `C:\c\Users\...\dist\client`，`dist/output` 为**空**但 exit 0（静默失败）。远程 Linux CI 构建大概率正常（7月曾部署成功）。修法：build.sh 内用 cygpath -m 或让 vite 相对 outDir。
- ❌ 断层2: bundle 1.68MB(gzip 546KB) 单 chunk——echarts+recharts 双图表库、gsap+framer-motion 双动画库并存，需裁一个
- ⬜ 待做(v3计划): 舰队构建器 + 规则速查 + 筛选增强
- ⬜ 待做(v4计划): Command Palette + 对比增强 + 智能推荐
- ⬜ 卫生项: .hermes/plans 未提交；mammoth/pdf-parse 应移 devDependencies；组件归位 pages/WikiHomePage/components；MOCK_SHIPS 更名 SHIPS_DATA(对齐AGENTS.md)

## 8. 恢复指令
1. `cd C:/Users/cyy/Desktop/Code/StarFadeWiki && npm run typecheck`（当前应通过）
2. 修 build.sh 的 MSYS 路径问题后验证 `npm run build` 且 `dist/output/index.html` 非空
3. 继续迭代按 `.hermes/plans/2026-07-03_v2.0_design-iteration.md` 尾部与 ITERATION_PROCESS.md 的 v3 目标执行
4. 归档规则见 ITERATION_PROCESS.md（Code/backup/ 编号制，最多5版）
