import { z } from 'zod';
import { RULE_CONSTANTS } from './rules';

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

export interface OptimizeResult {
  units: { shipId: string; count: number; ship: FleetUnitInput['ship'] }[];
  totals: FleetTotals;
  warnings: string[];
}

/**
 * 一键优化（贪心启发式）:
 * 按"单位ZC战力"(fpNumeric/zcCost)降序逐个装入，受预算与指挥上限双重约束；
 * 同分时低月维护优先。非最优解，UI 需明示"启发式推荐"。
 */
export function optimizeFleet(
  ships: FleetUnitInput['ship'][],
  budget: number,
  cap: number = RULE_CONSTANTS.COMMAND_CAP_DEFAULT
): OptimizeResult {
  const warnings: string[] = [];
  if (!(budget > 0)) {
    return { units: [], totals: calcFleetTotals([]), warnings: ['预算必须大于 0'] };
  }
  // 过滤不可靠数据
  const usable = ships.filter(
    (s) => Number.isFinite(s.fpNumeric) && s.fpNumeric > 0 && s.zcCost > 0 && s.cost > 0
  );
  if (usable.length === 0) {
    return { units: [], totals: calcFleetTotals([]), warnings: ['没有可用的有效数据舰船'] };
  }

  const sorted = [...usable].sort((a, b) => {
    const ea = a.fpNumeric / a.zcCost;
    const eb = b.fpNumeric / b.zcCost;
    if (eb !== ea) return eb - ea;
    return a.monthlyMaintenance - b.monthlyMaintenance;
  });

  let remainBudget = budget;
  let remainZC = cap;
  const picked: { shipId: string; count: number; ship: FleetUnitInput['ship'] }[] = [];

  for (const s of sorted) {
    if (remainBudget < s.cost || remainZC <= 0) continue;
    const byZC = Math.floor(remainZC / s.zcCost);
    const byBudget = Math.floor(remainBudget / s.cost);
    const count = Math.min(byZC, byBudget);
    if (count <= 0) continue;
    picked.push({ shipId: s.id, count, ship: s });
    remainBudget -= s.cost * count;
    remainZC -= s.zcCost * count;
  }

  if (remainBudget > budget * 0.05) {
    warnings.push(`预算剩余 ${Math.round(remainBudget)}A 未花完——可提高大舰占比`);
  }
  if (remainZC >= 1) {
    warnings.push(`指挥容量剩余 ${Math.round(remainZC)} 点未用满`);
  }

  return { units: picked, totals: calcFleetTotals(picked.map((p) => ({ ship: p.ship, count: p.count }))), warnings };
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
