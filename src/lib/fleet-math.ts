import { z } from 'zod';
import { AURA_OUTPUT_BONUS, RULE_CONSTANTS } from './rules';

/** 构建器舰队单元: 舰船 + 数量 */
export interface FleetUnitInput {
  ship: {
    readonly id: string;
    readonly name: string;
    readonly cost: number;
    readonly monthlyMaintenance: number;
    readonly fpNumeric: number;
    readonly szValue: number;
    readonly zcCost: number;
    readonly maintenanceLevel: 1 | 2 | 3 | 4;
  };
  count: number;
}

export interface FleetTotals {
  totalCost: number;
  totalMaintenance: number;
  totalFP: number;
  totalSZ: number;
  totalZC: number;
  avgMaintenanceLevel: number;
  costPerFP: number;
}

/** 汇总一支舰队的六项指标（纯函数） */
export function calcFleetTotals(units: FleetUnitInput[]): FleetTotals {
  let totalCost = 0, totalMaintenance = 0, totalFP = 0, totalSZ = 0, totalZC = 0, levelWeight = 0, shipCount = 0;
  for (const u of units) {
    if (u.count <= 0) continue;
    totalCost += u.ship.cost * u.count;
    totalMaintenance += u.ship.monthlyMaintenance * u.count;
    totalFP += u.ship.fpNumeric * u.count;
    totalSZ += u.ship.szValue * u.count;
    totalZC += u.ship.zcCost * u.count;
    levelWeight += u.ship.maintenanceLevel * u.count;
    shipCount += u.count;
  }
  return {
    totalCost,
    totalMaintenance,
    totalFP,
    totalSZ,
    totalZC,
    avgMaintenanceLevel: shipCount > 0 ? Math.round((levelWeight / shipCount) * 10) / 10 : 0,
    costPerFP: totalFP > 0 ? totalCost / totalFP : Number.NaN,
  };
}

export interface CapCheckResult {
  over: boolean;
  overBy: number;
  /** 全队输出/生存惩罚比例，如 0.1 = -10% */
  penaltyPct: number;
}

/** 指挥上限检查: 每超 1 点 ZC 全队输出/生存 -2% */
export function checkCommandCap(totalZC: number, cap: number = RULE_CONSTANTS.COMMAND_CAP_DEFAULT): CapCheckResult {
  const overBy = Math.max(0, totalZC - cap);
  return {
    over: overBy > 0,
    overBy,
    penaltyPct: overBy * RULE_CONSTANTS.OVER_CAP_PENALTY_PER_POINT,
  };
}

/**
 * 威慑判定: 总SZ = 现役SZ + 库存SZ×0.6
 * stockpileUnits 为不入队的封存舰船
 */
export function calcTotalDeterrence(activeSZ: number, stockpileSZ: number): number {
  return activeSZ + stockpileSZ * RULE_CONSTANTS.DETERRENCE_STOCKPILE_FACTOR;
}

export interface AuraAdoption {
  shipId: string;
  name: string;
  /** 全队输出加成，如 0.4 = +40% */
  bonusPct: number;
}

export interface OptimizeResult {
  units: { shipId: string; count: number; ship: FleetUnitInput['ship'] }[];
  totals: FleetTotals;
  warnings: string[];
  /** 纳入推荐的光环舰（未纳入的以 warnings 披露） */
  auraApplied: AuraAdoption[];
  /** 光环乘法总倍率，1 = 无光环 */
  auraMultiplier: number;
  /** 计入光环后的全队等效战力 = totals.totalFP × auraMultiplier */
  effectiveFP: number;
}

/** 在预算与容量内按"单位ZC战力"降序贪心装填（纯填充，不做光环判断） */
function greedyFill(
  sorted: FleetUnitInput['ship'][],
  budget: number,
  cap: number
): { picked: OptimizeResult['units']; remainBudget: number; remainZC: number } {
  let remainBudget = budget;
  let remainZC = cap;
  const picked: OptimizeResult['units'] = [];
  for (const s of sorted) {
    if (remainBudget < s.cost || remainZC <= 0) continue;
    const count = Math.min(Math.floor(remainZC / s.zcCost), Math.floor(remainBudget / s.cost));
    if (count <= 0) continue;
    picked.push({ shipId: s.id, count, ship: s });
    remainBudget -= s.cost * count;
    remainZC -= s.zcCost * count;
  }
  return { picked, remainBudget, remainZC };
}

const EMPTY_AURA = { auraApplied: [] as AuraAdoption[], auraMultiplier: 1, effectiveFP: 0 };

/**
 * 一键优化（贪心启发式 × 光环枚举）:
 * 枚举光环舰子集（数量少，≤2^k 组合，k 为输入中的光环舰数），
 * 每个子集扣除其造价/容量后对非光环舰跑一次贪心，取"等效战力 = 基础FP×光环倍率"最高者。
 * 同分时低总造价、少光环优先。仍非全局最优，UI 需明示"启发式推荐"。
 * 光环舰不参与贪心填充（避免同一舰既当光环又当填充的重复入选）。
 */
export function optimizeFleet(
  ships: FleetUnitInput['ship'][],
  budget: number,
  cap: number = RULE_CONSTANTS.COMMAND_CAP_DEFAULT
): OptimizeResult {
  const warnings: string[] = [];
  if (!(budget > 0)) {
    return { units: [], totals: calcFleetTotals([]), warnings: ['预算必须大于 0'], ...EMPTY_AURA };
  }
  // 过滤不可靠数据
  const usable = ships.filter(
    (s) => Number.isFinite(s.fpNumeric) && s.fpNumeric > 0 && s.zcCost > 0 && s.cost > 0
  );
  // 光环舰: fpNumeric 可为 0（如补给舰），但造价/ZC 必须有效
  const auraShips = ships.filter(
    (s) => AURA_OUTPUT_BONUS[s.id] !== undefined && s.zcCost > 0 && s.cost > 0
  );
  if (usable.length === 0 && auraShips.length === 0) {
    return { units: [], totals: calcFleetTotals([]), warnings: ['没有可用的有效数据舰船'], ...EMPTY_AURA };
  }

  const fillPool = usable
    .filter((s) => AURA_OUTPUT_BONUS[s.id] === undefined)
    .sort((a, b) => {
      const ea = a.fpNumeric / a.zcCost;
      const eb = b.fpNumeric / b.zcCost;
      if (eb !== ea) return eb - ea;
      return a.monthlyMaintenance - b.monthlyMaintenance;
    });

  interface Combo {
    adopted: AuraAdoption[];
    mult: number;
    picked: OptimizeResult['units'];
    /** 基础战力（未乘光环） */
    baseFP: number;
    totalCost: number;
    remainBudget: number;
    remainZC: number;
  }
  const combos: Combo[] = [];
  const k = auraShips.length;
  for (let mask = 0; mask < 1 << k; mask++) {
    const adoptedIdx: number[] = [];
    let auraCost = 0;
    let auraZC = 0;
    let mult = 1;
    for (let i = 0; i < k; i++) {
      if (mask & (1 << i)) {
        const a = auraShips[i];
        adoptedIdx.push(i);
        auraCost += a.cost;
        auraZC += a.zcCost;
        mult *= 1 + AURA_OUTPUT_BONUS[a.id];
      }
    }
    if (auraCost > budget || auraZC > cap) continue;
    const { picked, remainBudget, remainZC } = greedyFill(fillPool, budget - auraCost, cap - auraZC);
    const auraUnits = adoptedIdx.map((i) => ({ shipId: auraShips[i].id, count: 1, ship: auraShips[i] }));
    const all = [...picked, ...auraUnits];
    combos.push({
      adopted: auraUnits.map((u) => ({
        shipId: u.ship.id,
        name: u.ship.name,
        bonusPct: AURA_OUTPUT_BONUS[u.ship.id],
      })),
      mult,
      picked: all,
      baseFP: all.reduce((s, u) => s + u.ship.fpNumeric * u.count, 0),
      totalCost: all.reduce((s, u) => s + u.ship.cost * u.count, 0),
      remainBudget,
      remainZC,
    });
  }

  // mask=0（无光环）永远可行，combos 不会为空
  combos.sort(
    (a, b) =>
      b.baseFP * b.mult - a.baseFP * a.mult ||
      a.totalCost - b.totalCost ||
      a.adopted.length - b.adopted.length
  );
  const best = combos[0];
  const totals = calcFleetTotals(best.picked.map((p) => ({ ship: p.ship, count: p.count })));

  if (best.remainBudget > budget * 0.05) {
    warnings.push(`预算剩余 ${Math.round(best.remainBudget)}A 未花完——可提高大舰占比`);
  }
  if (best.remainZC >= 1) {
    warnings.push(`指挥容量剩余 ${Math.round(best.remainZC)} 点未用满`);
  }
  for (const a of auraShips) {
    if (!best.adopted.some((x) => x.shipId === a.id)) {
      warnings.push(
        `已评估未纳入：${a.name}（全队+${Math.round(AURA_OUTPUT_BONUS[a.id] * 100)}%输出）——预算/容量不足或纳入后总收益不更高`
      );
    }
  }

  return {
    units: best.picked,
    totals,
    warnings,
    auraApplied: best.adopted,
    auraMultiplier: best.mult,
    effectiveFP: totals.totalFP * best.mult,
  };
}

// ---------- 导出 / 导入 ----------

const FleetFileSchema = z.object({
  version: z.literal(1),
  name: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  commandCap: z.number().positive().optional(),
  units: z
    .array(z.object({ shipId: z.string().min(1), count: z.number().int().positive() }))
    .min(1),
});

export type FleetFile = z.infer<typeof FleetFileSchema>;

export function exportFleet(
  units: FleetUnitInput[],
  budget?: number,
  commandCap?: number,
  name?: string
): string {
  return JSON.stringify(
    {
      version: 1 as const,
      ...(name ? { name } : {}),
      ...(budget !== undefined ? { budget } : {}),
      ...(commandCap !== undefined ? { commandCap } : {}),
      units: units.filter((u) => u.count > 0).map((u) => ({ shipId: u.ship.id, count: u.count })),
    },
    null,
    2
  );
}

export type ImportResult =
  | { ok: true; fleet: FleetFile }
  | { ok: false; error: string };

export function importFleet(jsonText: string, resolveShip: (id: string) => unknown | undefined): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: '不是合法的 JSON 文本' };
  }
  const parsed = FleetFileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `方案格式不符: ${first?.path?.join('.') || 'root'} ${first?.message}` };
  }
  for (const u of parsed.data.units) {
    if (!resolveShip(u.shipId)) {
      return { ok: false, error: `包含未知舰船 ID: ${u.shipId}（可能是旧版本方案）` };
    }
  }
  return { ok: true, fleet: parsed.data };
}
