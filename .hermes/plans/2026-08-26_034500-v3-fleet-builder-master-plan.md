# StarFadeWiki v3.0「舰队构建器」总纲 — 极致详细实施计划

> **For Hermes:** 按 Phase 顺序执行，每个 Task 内的 Step 逐步走。每个 Task 完成后必须验证（命令+期望输出都写明了）再进入下一个。可用 subagent-driven-development 逐 Task 派发。
>
> 编制时间: 2026-08-26 03:45 | 前置审计: RECOVERY_MAP.md (2026-08-26)
> 项目状态基线: master@bea3705，typecheck ✅，本机构建 🔴坏（Phase 0 修）

---

## 〇、总目标与验收标准

**一句话**: 把 Wiki 从"只读图鉴"升级为"可算账的决策工具"——玩家输入预算和偏好，得到一支合法（不超指挥上限）、够用（战力达标）、省钱（维护最低）的舰队方案。

**总验收标准**（全部满足才算完）:

| # | 标准 | 验证方式 |
|---|---|---|
| A1 | `npm run build` 在本机产出非空 `dist/output/index.html` | 终端实测 + `find dist/output -name "index.html" -size +1k` |
| A2 | bundle 主 chunk ≤ 800KB (minified) | build 输出日志对比当前 1,684KB |
| A3 | `npm run lint` 零 error | 实测 |
| A4 | 舰队构建器: 选船→实时合计→超限红字警告→一键优化→导出/导入 JSON 全链路可用 | 浏览器手测清单 §5.6 |
| A5 | 所有计算逻辑有单元测试且全绿 | `npx vitest run` 全部 pass |
| A6 | 移动端构建器可用（卡片式选船、抽屉编辑） | 缩窗至 375px 手测 |
| A7 | 规则速查面板可从任何区块呼出 | 手测 |

---

## 总路线图（四阶段）

```
Phase 0 修复与还债(地基)     ← 不做这个后面全是沙上建塔
   ↓
Phase 1 数据层升级(燃料)     ← 计算引擎的正确性取决于数据层
   ↓
Phase 2 舰队构建器(主体)     ← 核心交付物
   ↓
Phase 3 规则速查+打磨收尾(包装)  ← 体验层
```

依赖关系：Phase 2 的每一条计算都吃 Phase 1 的数据字段；Phase 1 的类型改动会波及全部组件，所以必须在 Phase 2 大规模写组件**之前**完成；Phase 0 的构建修复是所有本地验证的前提。

---

## Phase 0：修复与还债（预计 0.5 天）

> 目标：本机能构建出真实产物、bundle 减半、仓库卫生达标。这一阶段不写任何新功能。

### Task 0.1 修复 build.sh 的 MSYS 路径静默失败 🔴

**Objective:** 让本机 `npm run build` 真实产出 dist/output 且失败时不再吞错。

**背景（已实锤）:** scripts/build.sh 第10行 `ROOT="$(cd "$(dirname "$0")/.." && pwd)"` 在 git-bash 里返回 `/c/Users/cyy/Desktop/Code/StarFadeWiki`；第19行 `npx vite build --outDir "$ROOT/dist/client"` 把 MSYS 路径原样传给原生 Windows node.exe，vite 解析成相对路径 → 产物落在 `C:\c\Users\cyy\...\dist\client\`，后续 `rm -rf` 和合并步骤全部空转，脚本 exit 0 静默成功。

**Files:**
- Modify: `scripts/build.sh`

**Step 1: 备份现场证据**
```bash
# 确认杂散产物存在（作为修复前后对照）
ls "/c/c/Users/cyy/Desktop/Code/StarFadeWiki/dist/client/assets" | head -3
# 期望: index-*.css 等 4 个文件
```

**Step 2: 修改 build.sh 开头的 ROOT 计算**
在 `ROOT=...` 行后立即追加两行：
```bash
# Normalize MSYS path to native Windows form for child native processes (node/vite)
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ROOT="$(cygpath -m "$ROOT")" ;;
esac
```
（`cygpath -m` 输出 `C:/Users/...` 混合风格，原生程序与 bash 双向兼容）

**Step 3: 加防静默失败的保险丝**
把结尾的清理段改为：
```bash
# 清理中间产物（仅当目录真实存在且非空时才可能成功）
if [ ! -f "$OUTPUT/index.html" ]; then
  echo "FATAL: $OUTPUT/index.html missing after merge" >&2
  exit 1
fi
```
放在最终 `echo "Build complete"` 之前。

**Step 4: 验证修复**
```bash
rm -rf "/c/c" && npm run build
find dist/output -maxdepth 1 -name "index.html" -size +1k
# 期望: 打出真实路径一行; ls /c/c 报 No such file or directory
npm run typecheck
# 期望: 无输出(exit 0)
```

**Step 5: Commit**
```bash
git add scripts/build.sh && git commit -m "fix(build): normalize MSYS root path via cygpath, add output guard"
```

### Task 0.2 Bundle 减半：卸载零引用重库

**Objective:** 主 chunk 从 1684KB 压到 ≤800KB。

**已核查的事实（2026-08-26 grep 实证）:**
- `recharts`: 仅 src/components/ui/chart.tsx 引用，而 ui/chart.tsx **无任何业务组件 import**（shadcn 预装残留）
- `gsap`, `@gsap/react`: **全库零引用**
- `echarts` + `echarts-for-react`: 仅 RankingsSection.tsx 用（雷达图），**保留**

**Files:**
- Modify: `package.json`
- Delete: `src/components/ui/chart.tsx`（README 规定 ui/* 禁止修改，但删除未使用文件不违反精神；若担心，改为保留文件但从 package.json 移除 recharts 后跑 tsc 验证——若报错则该文件确实被引用，回滚此步）

**Step 1: 删除零引用文件与依赖**
```bash
git rm src/components/ui/chart.tsx
npm uninstall recharts gsap @gsap/react
```

**Step 2: 验证**
```bash
npm run typecheck          # 期望 exit 0（证明 chart.tsx 确实无人用）
npm run build              # 期望主 chunk 显著缩小; 目标≤800KB
ls -la dist/output/assets/*.js | awk '{print $5, $9}' | sort -rn | head -3
```

**Step 3: 若仍 >800KB 的后备手段**（按序尝试，做完一步测一步）
```bash
# echarts 改按需注册（RankingsSection 只用雷达图）:
# npm i echarts/core 并改 RankingsSection 为:
# import * as echarts from 'echarts/core';
# import { RadarChart } from 'echarts/charts';
# import { TooltipComponent } from 'component/tooltip'...
```

**Step 4: Commit**
```bash
git add package.json package-lock.json && git commit -m "perf: remove unused recharts/gsap, target main chunk <=800KB"
```

### Task 0.3 仓库卫生

**Objective:** 依赖归类正确、组件归位、计划文件入库。

**Files:**
- Modify: `package.json`（mammoth/pdf-parse 移 devDependencies——仅 parse-docx.cjs/parse-pdf.cjs 使用）
- Modify: `.gitignore`（追加 `.hermes/` 或决定提交 plans；**推荐提交** .hermes/plans/*.md 作为项目资产，忽略其他）
- Move: `src/components/{ShipCard,ShipFilterBar,ShipDetailModal,CompareModal,SquadronSection,RulesSection,TemplatesSection,RankingsSection,FleetHeatmapSection,HeroSection}.tsx` → `src/pages/WikiHomePage/components/`
- Modify: 受影响 import 路径（WikiHomePage.tsx 及互引组件）

**Step 1: 依赖归类**
```bash
npm uninstall mammoth pdf-parse && npm install -D mammoth pdf-parse
```

**Step 0.3a 组件归位（可选但推荐）:** 用 `git mv` 逐个移动并修正 `@/components/Xxx` → 相对路径或保持 `@/pages/WikiHomePage/components/Xxx`。移动后：
```bash
npm run lint   # 期望零 error
```
> ⚠️ 注意 AppSidebar/Header/Footer/StarfieldBackground/Layout 属全局组件，**留在 src/components/**，只移页面专属的。

**Step 2: 提交计划文档**
```bash
git add .hermes/plans/*.md RECOVERY_MAP.md && git commit -m "docs: commit iteration plans and recovery map"
```

---

## Phase 1：数据层升级（预计 1 天）

> 目标：为构建器补齐计算所需字段，统一命名，建立纯函数计算内核 + 测试。**本阶段结束时 UI 应零变化**（除 MOVED 字段渲染外）。

### Task 1.1 IShip 类型扩展 + 数据补录

**Objective:** 36 舰全部具备 ZC/SZ/FP 数值化字段，旧数据无损迁移。

**设计决策（关键）:** AGENTS.md 里 `regularFP: number | string` 这种 union 是历史妥协。构建器需要纯数值参与运算。方案：**数值放新字段，旧字符串字段原样保留**（向后兼容，UI 不炸）：

```typescript
// src/data/ships.ts 类型扩展
export interface IShip {
  // ...现有17字段不动...

  /** 战场指挥容量占用(ZC)。复合型如"20+4×中队ZC"取基础值20 */
  zcCost: number;
  /** 存在威慑(SZ)。复合型取现役部分 */
  szValue: number;
  /** 常规战力数值化。复合型如"20+80"填总和100，原始文本仍在 regularFP */
  fpNumeric: number;
  /** 维护等级对应的最小停靠设施名，冗余存储避免前端再映射 */
  maintenanceFacility: string;
}
```

**补录规则:** 对 36 舰逐一从 coreFeatures/efficiencyPosition 文本中提取数值。**凡拿不准的标 NaN 并汇总成清单人工复核**，禁止瞎编（用户铁律：严禁编造须可复核）。复合值解析规则写死在注释里：
- `"20+4支中队80"` → zcCost=20, fpNumeric=100
- 纯文本无数字 → NaN 待复核

**Files:**
- Modify: `src/data/ships.ts`（类型 + 36 条记录各加 3-4 个字段）

**Step 1: 扩展 interface**（代码如上）

**Step 2: 写一次性补录辅助脚本** `scripts/backfill-ships.cjs`：
读 ships.ts 文本，正则找缺失字段记录，输出待复核清单到 stdout。**不做自动改写**，人工逐条填。

**Step 3: 逐条补录**（预计 36 条 × 2 分钟）

**Step 4: 验证**
```bash
npm run typecheck   # 期望 exit 0
# 快速自检脚本: 断言36条都有zcCost键
node -e "const m=require('fs').readFileSync('src/data/ships.ts','utf8').match(/zcCost/g);console.log('zcCount occurrences:',m?m.length:0)"
# 期望 ≥37 (interface 1次 + 36条数据)
```

**Step 5: Commit** `feat(data): add zcCost/szValue/fpNumeric fields to all 36 ships`

### Task 1.2 数据访问层规范化

**Objective:** 消费侧不再直接吃 MOCK_SHIPS 裸数组，统一走带兜底的访问函数。

**Files:**
- Create: `src/lib/fleet-math.ts`（下一 Task 建，这里只建访问层）
- Create: `src/data/ships-access.ts`

**Step 1: 建 `src/data/ships-access.ts`**
```typescript
import { MOCK_SHIPS, type IShip } from './ships';

const byId = new Map(MOCK_SHIPS.map(s => [s.id, s]));
export const getShipById = (id: string): IShip | undefined => byId.get(id);
export const getAllShips = (): readonly IShip[] => MOCK_SHIPS;
export const SHIP_COUNT = MOCK_SHIPS.length;
// NaN 安全读取器
export const num = (v: number | string | undefined, fallback = 0): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  const p = parseFloat(String(v));
  return Number.isFinite(p) ? p : fallback;
};
```

**Step 组件渐进迁移:** 本阶段不改现有组件（YAGNI，避免大面积 diff）；新代码一律走 access 层。

### Task 1.3 计算内核 fleet-math.ts + 单元测试（TDD）⭐核心

**Objective:** 构建器的全部数学进一个纯函数模块，先写测试后写实现。

**Files:**
- Create: `src/lib/fleet-math.ts`
- Create: `src/lib/fleet-math.test.ts`
- Modify: `package.json`（devDeps: vitest）
- Modify: `tsconfig.app.json`（types 加 vitest/globals 可选）

**Step 1: 安装 vitest**
```bash
npm install -D vitest
```

引入测试基建是本计划的**唯一新增 devDep**（YAGNI：不引 testing-library，逻辑层测试足够）。

**Step 2: 先写失败测试** `src/lib/fleet-math.test.ts`：
```typescript
import { describe, it, expect } from 'vitest';
import { calcFleetTotals, checkCommandCap, optimizeFleet, exportFleet, importFleet } from './fleet-math';

const mkShip = (over: Partial<IShip> = {}): IShip => ({
  id: 't', name: 't', type: '小型', role: '打击',
  cost: 100, monthlyMaintenance: 2,
  regularFP: 10, peakFP: 15, valleyFP: 6,
  regularCostFPRatio: 0.1, maxCostFPRRatio: 0.15, maintenanceFPRatio: 5,
  efficiencyPosition: '', garrison: 4, dispatch: 10,
  maintenanceLevel: 1, coreFeatures: '', imageUrl: '',
  zcCost: 2, szValue: 5, fpNumeric: 10, maintenanceFacility: '前线补给站',
  ...over,
});
工厂默认值必须与 ships.ts 中私掠船一致，防止漂移。
```

**Step 3: 实现四个纯函数** `src/lib fleet-math.ts`：

**(1) calcFleetTotals(units)** — 输入 `{ship, count}[]`，输出：
```typescript
{
  totalCost, totalMaintenance, totalFP, totalSZ, totalZC,
  avgMaintenanceLevel: weightedAvg(maintenanceLevel, count),
  costPerFP: totalFP > 0 ? totalCost/totalFP : Infinity,
  maintenancePerFP: ...
}
```
加权平均维护等级 = Σ(level×count)/Σcount，四舍五入到 0.1。

**Task 1.3 续: (2) checkCommandCap(totalZC, cap=50)** — 返回 `{over: boolean, overBy: number, penaltyPct: number}`，penalty = overBy×2%（规则书：每超1点ZC全队输出/生存-2%）。

**(3) optimizeFleet(units, budget, cap=50)** — 贪心算法：
1. 过滤 NaN 字段的舰（不可靠数据不进优化器）
2. 按"性价比指数"排序：`fpNumeric/zcCost` 降序（每点指挥容量换多少战力）
性价比指数公式依据规则书"指挥上限是硬约束"推导，若用户另有口径以规则书原文为准。
3. 逐个加入直到 ZC 达 50 或预算耗尽；同分时低维护优先
4. 返回 `{units, totals, warnings[]}`；warnings 含"预算剩余X未花完"/"ZC未满50"

**(4) exportFleet/importFleet** — JSON 序列化 + schema 校验（手写校验即可，不引 zod——虽然 deps 里有，但 YAGNI 一层薄校验足够；若已有 zod 则直接用）**修订：deps 已有 zod@4，直接用**。

```typescript
const FleetSchema = z.object({
  version: z.literal(1),
  units: z.array(z.object({ shipId: typo... })).min(1),
  budget: z.number().optional(),
});
```
（上面 `typo` 为笔误警示示例——实际写 `shipId: z.string()`）

**Step 4: 跑测试**
```bash
npx vitest run
# 期望: 全绿。覆盖场景:
# - 空舰队 totals 归零不炸
- 复合战力舰(母舰+中队) fpNumeric 取总和口径
- 超限惩罚线性增长 (overBy=5 → penalty=10%)
- optimize 在预算 5000 下优先高性价比小型舰
- import 拒绝 version≠1 / 空 units / 未知 shipId
```

**Step 5: package.json script**
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 6: Commit** `feat(core): fleet calculation engine with unit tests (TDD)`

### Task 1.4 规则常量单一来源

**Objective:** 50 上限、2%惩罚、克制倍率等散落的魔法数字收敛到一个常量模块。

**Files:**
- Create: `src/lib/rules.ts`

**Step 1:** 把 rules.ts 数据里的机制数字提为常量：
```typescript
export const RULE_CONSTANTS = {
  COMMAND_CAP_DEFAULT: 50,
  OVER_CAP_PENALTY_PER_POINT: 0.02,
  DETERRENCE_STOCKPILE_FACTOR: 0.6,   // 库存SZ×0.6
  COUNTER_MULT: 1.5,
  COUNTERED_MULT: 0.6,
} as const;
```
fleet-math.ts 改为从此处导入。测试同步更新断言来源。

**Step 以后改规则书数值时只动这一个文件。**

---

## Phase 2：舰队构建器（预计 1.5-2 天）

> 目据交付物。UI 三件套：选船面板、舰队清单、统计栏。

### Task 2.1 状态管理 FleetContext

**Objective:** 构建器全局状态一处管理，对比弹窗等旧功能不受影响。

**Files:**
- Create: `src/context/FleetContext.tsx`

**Step 1: 实现**
```typescript
interface FleetUnit { shipId: string; count: number }
interface FleetState {
  units: FleetUnit[];
  budget: number | null;
  commandCap: number;        // 默认50，允许玩家改
  selectedForCompare: string[];  // 吸收原 __wiki_selectedShips 语义
}
```
reducer actions: ADD_UNIT / REMOVE_UNIT / SET_COUNT / CLEAR / SET_BUDGET / SET_CAP / IMPORT。
localStorage 持久化 key `__wiki_fleet_v1`（版本化 key，schema 变更时升版本号防脏数据）。
AGENTS.md 定义的 `__wiki_selectedShips` 键继续由 CompareModal 使用，不迁移（避免破坏既有行为），构建器用自己的持久化键。

**Step 2: 验证** `npm run lint && npx vitest run`

### Task 2.2 选船面板 ShipPickerPanel

**Objective:** 从 36 舰中搜索/筛选/加船入队。

**Files:**
- Create: `src/pages/WikiHomePage/components/builder/ShipPickerPanel.tsx`
- Reuse: ShipCard 的筛选交互模式（ShipFilterBar 已有 keyword/types/roles/debounce，直接复用其 state 结构与样式 token）

**功能明细:**
- 搜索框（复用 ShipFilterBar 的 debounce 模式，300ms）
- 类型/定位 chips 多选（复用现有 chips 样式）
- 每行: 舰名 + 造价/ZC/FP 三个关键数 + 「+ 加入」按钮
- 点击行展开详情（复用 ShipDetailModal 的表格渲染逻辑抽出的子组件）

**Step 1-2: 实现 + 验证**
```bash
npm run lint
# 浏览器手测: 搜索"私掠"→1结果→点加入→清单出现"私掠船×1"
```

### Task 2.3 舰队清单 FleetListPanel + 统计栏 StatsBar

**Objective:** 已选舰队编辑 + 六项指标实时合计。

**Files:**
- Create: `builder/FleetListPanel.tsx`
- 进度条复用 RankingsSection 的能量槽样式（primary青填充）

**功能明细:**
- 每行: 舰名×数量 stepper(- 数字 +)、单价小计、移除按钮
- 统计栏六指标: 总造价/总月维护/总FP/总SZ/ZC占用进度条/平均维护等级
- **超限状态**: ZC 进度条 >100% 变红 + 显示"-X% 全队输出"惩罚徽章（调 fleet-math.checkCommandCap）
- 预算模式: 输入预算后顶部显示剩余额度，接近耗尽(<10%)变金warning色

**验证:** 手测清单——加5种船→改数量→看六指标联动→把某大舰数量拉满触发超限红字→清空恢复

### Task 2.4 一键优化按钮 OptimizeButton ⭐卖点功能

**Objective:** 给预算+上限，AI 式给出推荐编成。

**Files:**
- Create: `builder/OptimizePanel.tsx`
- 依赖: fleet-math.optimizeFleet (Task 1.3)

**交互流:**
1. 用户输入预算（预填当前舰队总造价）
2. 点「生成最优配队」→ loading 态（进度条动画复用 HeroSection 的能量槽）
3. 展示结果: 推荐编成列表 + 六指标 + warnings
4. 「应用到我的舰队」一键替换 / 「取消」

**验证:** 输入 5000 预算 → 生成的编成 ZC ≤50、总造价 ≤5000、warnings 合理

### Task 2.5 导出/导入

**Objective:** 方案可保存分享。

**Files:**
- Create: builder/ExportImportButtons.tsx

**功能:**
- 导出: fleet-math.exportFleet → Blob 下载 `starfade-fleet-v1.json`；另提供「复制到剪贴板」
- 导入: 文件选择 + textarea 粘贴两种入口，importFleet 校验，非法 JSON 弹 sonner toast 报具体错误
- （可选加分项）URL hash 分享: `#fleet=<base64url>`，进页自动询问导入

**验证:** 导出→删光→导入同一文件→六指标完全一致（往返一致性）

### Task 2.6 移动端适配

**Objective:** 375px 宽度全链路可用。

**方案:** 构建器区域桌面端左右双栏（picker 左 list 右），<768px 时 tab 切换（选船/清单两个 tab）+ 统计栏吸底。复用 useIsMobile hook（src/hooks/use-mobile.ts 已存在）。

**验证:** devtools 375px 手测 §5.6 清单

### Task 2.7 构建器入口整合进主页面

**Objective:** WikiHomePage 挂载构建器 section（锚点 #builder），Topbar/AppSidebar 加导航项「舰队构建器」。

**Files:**
- Modify: `WikiHomePage.tsx`, `Header.tsx`, `AppSidebar.tsx`
- Modify: `RECOVERY_MAP.md`（结构树更新）

**布局:** 位于 配队模板(#templates) 之后、效率排名(#rankings) 之前——玩家看完模板正好上手组自己的队。

**验证:** `npm run lint && npm run build`，锚点跳转正常，滚动高亮正常（AppSidebar 有 IntersectionObserver 逻辑需同步更新章节列表）

---

## Phase 3：规则速查 + 打磨收尾（预计 0.5-1 天）

### Task 3.1 规则速查面板 RulesQuickRef

**Objective:** 任何位置按键呼出规则卡。

**Files:**
- Create: `src/components/RulesQuickRef.tsx`（Dialog 实现，基于 ui/dialog）
- 全局键盘监听 `?` 键（输入框聚焦时除外）+ Header 放大镜旁加速按钮

**内容源:** 直接渲染 MOCK_RULES 四张卡 + RULE_CONSTANTS 表格。规则书 PDF 下载链接沿用现有 `/rulebook.pdf`。

**验证:** 任意滚动位置按 `?` 呼出，Esc 关闭

### Task 3.2 性能微调

- framer-motion 大网格区（36 卡片）改 `whileInView` 惰性动画，首屏外的卡片进入视口才挂动画
- StarfieldBackground 粒子密度按 devicePixelRatio/窗口面积自适应
- 长列表若卡顿再考虑虚拟化（YAGNI 先不做）

### Task 3.3 收尾打包

- README 补「舰队构建器」章节 + 截图
- ITERATION_PROCESS.md 更新当前迭代状态表（v3.0 done，规划 v4）
- PROJECT_STRUCTURE.md 目录树更新（builder/ 子目录、lib/ 新文件）
- 版本归档: 按 ITERATION_PROCESS.md 规则复制到 Code/backup/003_v3.0_舰队构建器/
- 最终全量验证: `npm run lint && npx vitest run && npm run build` 三绿
- Commit + push origin master（push 前问用户）

---

## 附：风险登记簿

| 风险 | 可能 | 影响 | 缓解 |
|---|---|---|---|
| 36舰数值补录遇到规则书没写的复合值 | 高 | 中 | NaN 标记 + 人工复核清单，绝不编造 |
| cygpath 不存在（精简版git-bash） | 低 | 中 | fallback: `ROOT=${ROOT:/}` 改用 pwd -W；最差手动 cd 后用相对 outDir `dist/client` |
| 删 recharts 后 tsc 报错（chart.tsx 其实被引用） | 低 | 低 | 回滚单步，保留 recharts，只删 gsap（保底也省 ~400KB） |
| optimizeFleet 贪心不是真最优 | 中 | 低 | UI 明示"启发式推荐"；后续可换 ILP 但 YAGNI |
| 组件归位造成 import 地狱 | 中 | 中 | git mv 保历史；每移一个 lint 一次；出问题就停在半途（新旧位置混用不阻塞主线） |
| zod v4 API 与示例不符 | 低 | 低 | 以 node_modules/zod 实际 d.ts 为准 |

## 附：明确不做的事（YAGNI 边界）

- ❌ 不做后端/账号系统/云存档 —— 纯静态站性质决定
- ❌ 不做虚拟滚动 —— 36+7 条数据量不需要
- ❌ 不做 i18n —— 中文单语站点
- ❌ 不引 state 库(redux/zustand) —— 一个 reducer 够了
- ❌ v4 内容(Command Palette/智能推荐)不在本计划范围

## 附：执行方式建议

- 推荐 subagent-driven-development：每 Task 派一个 leaf 子代理，带完整上下文（本文件对应 Task 段落 + RECOVERY_MAP.md），完成后 spec 合规审查 + 代码质量审查双闸
- 或者主会话顺序自执行：适合 Task 0.x 这类需要谨慎操作本机环境的任务
- 每个 Phase 结束打一次 tag: `v3.0-phase0` … `v3.0-final`
