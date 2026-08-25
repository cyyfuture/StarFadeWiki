# 🗺️ StarFadeWiki — 遗忘恢复地图

> 最后更新: 2026-08-26 05:15 (v3.0 迭代完成) | 更新者: AI
> 项目状态: 🟢活跃 (v3.0 舰队构建器版已交付，v4.0 待启动)

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
- ✅ v0全量(36舰+7机+规则+模板+排名) → v1.0修复 → v2.0设计迭代 → **v3.0 舰队构建器版(2026-08-26)**:
  - P0修复: build.sh MSYS路径(cygpath -m + 空产物保险丝) ✅ / bundle 1684KB→585KB(-65%, SVG雷达替代echarts, 删recharts/gsap) ✅
  - 数据层: IShip 扩展 zcCost/szValue/fpNumeric/maintenanceFacility(36/36补录, 零NaN) ✅ 推导依据写入 ships.ts 注释与 scripts/backfill-ships.cjs
  - 计算内核: src/lib/fleet-math.ts (totals/capCheck/deterrence/optimize/export-import) + src/lib/rules.ts 常量单一来源 + **vitest 13测试全绿** ✅
  - 构建器UI: src/components/builder/* (ShipPicker/FleetList含ZC超限红字/OptimizePanel贪心推荐/ExportImport zod校验) + FleetContext(__wiki_fleet_v1) ✅
  - 整合: #builder 锚点(热力图与排名之间), Header/AppSidebar 导航项 ✅
  - 规则速查: RulesQuickRef 按 ? 呼出 Dialog ✅
- ⚠️ 已知坑: 项目 tsconfig strict=false → boolean判别式联合不收窄, 必须用 `'error' in r` 模式; 本机起 http.server 后须先杀进程再 build(dist 占用)
- ⬜ 待做(v4计划): Command Palette + URL分享方案(#fleet=base64) + ILP精确优化 + 对比增强
- ⬜ 卫生项(低优先): 组件归位 pages/WikiHomePage/components；MOCK_SHIPS 更名 SHIPS_DATA(对齐AGENTS.md)；RankingsSection 雷达图浏览器内最终目视确认

## 8. 恢复指令
1. `cd C:/Users/cyy/Desktop/Code/StarFadeWiki && npm run typecheck`（当前应通过）
2. 修 build.sh 的 MSYS 路径问题后验证 `npm run build` 且 `dist/output/index.html` 非空
3. 继续迭代按 `.hermes/plans/2026-07-03_v2.0_design-iteration.md` 尾部与 ITERATION_PROCESS.md 的 v3 目标执行
4. 归档规则见 ITERATION_PROCESS.md（Code/backup/ 编号制，最多5版）
