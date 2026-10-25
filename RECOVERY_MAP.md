# 🗺️ StarFadeWiki — 遗忘恢复地图

> 最后更新: 2026-10-25 (波次0应急止损+深度研究10报告) | 更新者: AI
> 项目状态: 🟢活跃 (v3.0 舰队构建器版已交付，v4.0 启动中；改进总纲见 `E:\Code\深度研究与改进-计划总纲-20261023.md`)

## 1. 项目身份
- **目录**: E:\Code\StarFadeWiki（⚠️ 2026-xx 已从 Desktop 迁至 E 盘，旧路径作废）
- **IDEA**: 星海舰队桌游Wiki — 一站式查阅36舰船+7舰载机+跑团规则的静态站点
- **类型**: 纯前端静态数据站（无后端、无API）
- **技术栈**: React 19 + TypeScript + Vite(rolldown) + Tailwind v4 + shadcn/ui + framer-motion；模板为飞书 miaoda/lark-apaas 脚手架
- **Git**: 有 → github.com/cyyfuture/StarFadeWiki，master 与 origin 同步（2026-10-25 波次0已清偿 10 个积压提交），tag: v3.0 / v4.0-start
- **部署**: Cloudflare Workers 静态资产（项目名 starsadewiki1，wrangler.jsonc）；wrangler@4.152 已入 devDependencies，部署命令 `npm run deploy`，**首次需交互式 `wrangler login`**
- **创建日期**: 2026-06-30（首日完成 v0 全量）

## 2. 依赖清单
### Node 包（node_modules 存在 ✅）
- 运行时核心: react19 / tailwind4 / shadcn全家族 / framer-motion / lucide-react / sonner(toast)
- 图表: 自写 SVG RadarChart（echarts/recharts/gsap 已在 v3.0 移除，勿再加回）
- 脚本用 devDependencies: mammoth、pdf-parse（parse-docx.cjs / parse-pdf.cjs / verify-ships.cjs 用）、wrangler（部署）
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
- ⬜ 待做(v4计划): ~~Command Palette~~✅ ~~URL分享方案~~✅ ~~数据命名对齐~~✅ ~~ILP精确优化~~❌已裁定取消(总纲:实测贪心与精确DP差距0.00%,改光环枚举+WebWorker粒化DP,光环枚举已于2026-10-25落地)；余项: 对比增强 + Cloudflare部署验证(待 wrangler login) + WebWorker粒化DP(可选)
- ⚠️ push 边界(2026-10-25 已解除): 当前环境 `git push origin master` 可直接执行；tag 用 `git push origin <tag>`
- ⬜ 卫生项(低优先): 组件归位 pages/WikiHomePage/components；RankingsSection 雷达图浏览器内最终目视确认

## 8. 恢复指令
1. `cd /e/Code/StarFadeWiki && npm run typecheck`（当前应通过）+ `npm test`（全绿）
2. `npm run build`（Git Bash 可直接跑：MSYS 路径转换已根治+产物守卫已加固），验证 `dist/output/index.html` 无污染、assets 齐全
3. 迭代方向以 `E:\Code\深度研究与改进-计划总纲-20261023.md` 波次表与 ITERATION_PROCESS.md 为准
4. 归档规则: 已废除"目录复制式归档"（backup/ 已冷存），改用 git tag + `git bundle`
