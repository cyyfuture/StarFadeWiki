# 数据词典

> 数据唯一事实源: `src/data/ships.ts` 等五个常量文件；原始出处为《星海舰队桌游·全舰船_舰载机_规则数据总册》（DOCX/PDF，2026-06-30 转录入库）。
> 一致性校验: `npm run verify:data`（总册 ↔ ships.ts 逐字段机器比对）。

## IShip（36 艘）

### 原始字段（总册直录）

| 字段 | 类型 | 口径 |
|------|------|------|
| `id` | string | 舰船编号（'1'~'36'，字符串） |
| `name` | string | 舰种名 |
| `type` | `'小型'\|'中型'\|'大型'\|'旗舰'` | 舰型分级 |
| `role` | `'打击'\|'防御'\|'辅助'\|'后勤'` | 战术定位（编制列：总册无此原生分类，建站时人工裁定） |
| `cost` | number | 造价（A，金币单位） |
| `monthlyMaintenance` | number | 月维护（A） |
| `regularFP` | number \| string | 常规战力原文；载机复合（如"20+4支中队80"）与光环描述（如"自身0/全队+40%输出"）保留原文 |
| `peakFP` / `valleyFP` | number \| string | 峰值/谷值战力原文 |
| `regularCostFPRatio` / `maxCostFPRatio` / `maintenanceFPRatio` | number \| string | 三类战力比原文（可为复合字符串） |
| `efficiencyPosition` | string | 核心效率定位（一句话） |
| `garrison` / `dispatch` | number | 镇守值 / 调度值 |
| `maintenanceLevel` | `1\|2\|3\|4` | 维护等级：1 前线补给站 → 4 巨型旗舰船坞 |
| `coreFeatures` | string | 核心特性描述 |

### 派生字段（v3.0 补录，运行时勿重复推导）

| 字段 | 规则 | 依据 |
|------|------|------|
| `zcCost` | `cost / 100` | 战场指挥容量占用；全量 36 舰数值自洽 |
| `szValue` | `= garrison` | 存在威慑；库存舰 SZ×0.6 为编队级效应，运行时用 `calcTotalDeterrence` |
| `fpNumeric` | 常规战力数值化：直录数值取原值；载机复合取总和（含中队）；纯光环舰取自身值（补给舰=0） | 光环全队加成不入 `fpNumeric`，由 `lib/rules.ts` 的 `AURA_OUTPUT_BONUS` 单独建模 |
| `maintenanceFacility` | 维护等级对应设施名（来源 `lib/rules.ts` 的 `MAINTENANCE_FACILITIES`） | 消费端应以 rules.ts 映射为准，此字段仅为冗余落库（清理中） |

### 光环建模（2026-10-25）

- 光环清单: `src/lib/rules.ts` → `AURA_OUTPUT_BONUS`（`'6'` 补给舰 +40% 输出、`'26'` 督导舰 +25% 输出）
- 多光环叠加: 乘法复合（规则书未定义加法叠算，取保守乘法）
- 一键优化: `optimizeFleet` 枚举光环子集 × 贪心填充，返回 `effectiveFP = 基础FP × 光环倍率`

### 效率排名（rankings.ts）⚠️

`efficiencyValue` 为**编制值**（2026-06 建站时人工给出），非由舰船数据直接推导；实测复核发现"精确复现 TOP5"的原始声明不成立（折跃舰 fp/zc 实排第 8）。引用排名数据时须注明编制口径。

## ISquadron（7 舰载机）

`id/name/cost/monthlyMaintenance/regularFP/peakFP/role/counterRelation/maintenanceLevel(1|2|3)` —— 全部总册直录，无派生字段。

## 运行时计算规则（src/lib/fleet-math.ts）

| 函数 | 公式 |
|------|------|
| `calcFleetTotals` | 六项指标线性累加；`avgMaintenanceLevel` 按舰数加权（保留 1 位小数）；`costPerFP = totalCost/totalFP` |
| `checkCommandCap` | 超限 `overBy = max(0, totalZC - cap)`；每超 1 点全队输出/生存 -2%（`OVER_CAP_PENALTY_PER_POINT`） |
| `calcTotalDeterrence` | `现役SZ + 库存SZ × 0.6`（`DETERRENCE_STOCKPILE_FACTOR`） |
| `optimizeFleet` | 光环子集枚举 × 单位ZC战力降序贪心；约束: 预算 + 指挥容量 |

规则常量唯一来源: `src/lib/rules.ts`（改规则书数值只动该文件）。
