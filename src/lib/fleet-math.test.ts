import { describe, it, expect } from 'vitest';
import {
  calcFleetTotals,
  calcTotalDeterrence,
  checkCommandCap,
  optimizeFleet,
  exportFleet,
  importFleet,
  type FleetUnitInput,
} from './fleet-math';
import type { IShip } from '@/data/ships';

/** 工厂: 字段对齐 ships.ts 私掠船，防数据漂移 */
function mkShip(over: Partial<IShip> = {}): IShip {
  return {
    id: 't1',
    name: '测试舰',
    type: '小型',
    role: '打击',
    cost: 100,
    monthlyMaintenance: 2,
    regularFP: 10,
    peakFP: 15,
    valleyFP: 6,
    regularCostFPRatio: 0.1,
    maxCostFPRatio: 0.15,
    maintenanceFPRatio: 5.0,
    efficiencyPosition: '',
    garrison: 4,
    dispatch: 10,
    maintenanceLevel: 1,
    coreFeatures: '',
    imageUrl: '',
    zcCost: 1,
    szValue: 4,
    fpNumeric: 10,
    maintenanceFacility: '前线补给站',
    ...over,
  };
}

const U = (ship: IShip, count = 1): FleetUnitInput => ({ ship, count });

describe('calcFleetTotals', () => {
  it('空舰队返回零值且不炸', () => {
    const t = calcFleetTotals([]);
    expect(t.totalCost).toBe(0);
    expect(t.totalFP).toBe(0);
    expect(t.avgMaintenanceLevel).toBe(0);
    expect(Number.isFinite(t.costPerFP)).toBe(false); // 空舰队 costPerFP = NaN
  });

  it('线性字段正确累加', () => {
    const a = mkShip({ cost: 100, monthlyMaintenance: 2, fpNumeric: 10, szValue: 4, zcCost: 1 });
    const b = mkShip({ cost: 300, monthlyMaintenance: 4, fpNumeric: 20, szValue: 9, zcCost: 3 });
    const t = calcFleetTotals([U(a, 2), U(b, 1)]);
    expect(t.totalCost).toBe(500);
    expect(t.totalMaintenance).toBe(8);
    expect(t.totalFP).toBe(40);
    expect(t.totalSZ).toBe(17);
    expect(t.totalZC).toBe(5);
  });

  it('加权平均维护等级', () => {
    const lv1 = mkShip({ maintenanceLevel: 1 });
    const lv3 = mkShip({ maintenanceLevel: 3 });
    const t = calcFleetTotals([U(lv1, 1), U(lv3, 3)]);
    expect(t.avgMaintenanceLevel).toBe(2.5); // (1+9)/4
  });

  it('costPerFP 在 FP>0 时为造价除以战力', () => {
    const s = mkShip({ cost: 200, fpNumeric: 50 });
    expect(calcFleetTotals([U(s)]).costPerFP).toBeCloseTo(4);
  });
});

describe('checkCommandCap', () => {
  it('未超限', () => {
    const r = checkCommandCap(30, 50);
    expect(r.over).toBe(false);
    expect(r.penaltyPct).toBe(0);
  });

  it('恰好等于上限不惩罚', () => {
    expect(checkCommandCap(50, 50).over).toBe(false);
  });

  it('超限惩罚线性增长: 超过5点 → -10%', () => {
    const r = checkCommandCap(55, 50);
    expect(r.over).toBe(true);
    expect(r.overBy).toBe(5);
    expect(r.penaltyPct).toBeCloseTo(0.10);
  });
});

describe('optimizeFleet', () => {
  const missile = mkShip({ id: 'a', name: '导弹巡游舰', cost: 180, fpNumeric: 25, zcCost: 1.8, monthlyMaintenance: 3.5, garrison: 8, szValue: 8, maintenanceLevel: 1 });
  const battleship = mkShip({ id: 'b', name: '战列舰要塞', cost: 4800, fpNumeric: 150, zcCost: 48, monthlyMaintenance: 160, garrison: 10, szValue: 10, maintenanceLevel: 3 });
  const patrol = mkShip({ id: 'c', name: '轻巡洋舰', cost: 700, fpNumeric: 60, zcCost: 7, monthlyMaintenance: 14, garrison: 7, szValue: 7, maintenanceLevel: 2 });
  // NaN 数据舰不应进入优化结果
  const broken = mkShip({ id: 'x', name: '坏数据舰', fpNumeric: NaN, cost: 10, zcCost: 0.1 });

  it('预算内优先高性价比舰', () => {
    const r = optimizeFleet([missile, battleship, patrol], 5000, 50);
    const cost = r.units.reduce((s, u) => s + u.ship.cost * u.count, 0);
    expect(cost).toBeLessThanOrEqual(5000);
    const zc = r.units.reduce((s, u) => s + u.ship.zcCost * u.count, 0);
    expect(zc).toBeLessThanOrEqual(50);
    // 导弹巡游舰单位ZC输出最高，必须大量入选
    const missileCount = r.units.find((u) => u.ship.id === 'a')?.count ?? 0;
    expect(missileCount).toBeGreaterThanOrEqual(20);
  });

  it('ZC 硬上限不可突破（战列48ZC后只剩2空间）', () => {
    const r = optimizeFleet([battleship, missile], 20000, 50);
    const zc = r.units.reduce((s, u) => s + u.ship.zcCost * u.count, 0);
    expect(zc).toBeLessThanOrEqual(50 + 1e-9);
  });

  it('过滤 NaN 战力舰船', () => {
    const r = optimizeFleet([broken, missile], 3000, 50);
    expect(r.units.every((u) => u.ship.id !== 'x')).toBe(true);
  });

  it('预算为 0 返回空舰队并给警告', () => {
    const r = optimizeFleet([missile], 0, 50);
    expect(r.units.length).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe('calcTotalDeterrence', () => {
  it('总威慑 = 现役SZ + 库存SZ×0.6', () => {
    expect(calcTotalDeterrence(50, 10)).toBeCloseTo(56);
  });

  it('无库存时等于现役SZ', () => {
    expect(calcTotalDeterrence(50, 0)).toBeCloseTo(50);
  });
});

describe('optimizeFleet 光环建模', () => {
  const missile = mkShip({ id: 'a', name: '导弹巡游舰', cost: 180, fpNumeric: 25, zcCost: 1.8, monthlyMaintenance: 3.5 });
  // 对齐 ships.ts 真实光环舰: id=6 补给舰(自身0/全队+40%输出), id=26 督导舰(30自身/全队+25%输出)
  const supply = mkShip({ id: '6', name: '补给舰', role: '后勤', cost: 200, monthlyMaintenance: 3, regularFP: '自身0/全队+40%输出', fpNumeric: 0, zcCost: 2, peakFP: '指数上涨' });
  const supervisor = mkShip({ id: '26', name: '督导舰', role: '辅助', cost: 2500, monthlyMaintenance: 85, regularFP: '30（自身）/全队+25%输出', fpNumeric: 30, zcCost: 25, maintenanceLevel: 4 });

  it('预算充足时纳入补给舰并按 ×1.4 折算等效战力', () => {
    const r = optimizeFleet([missile, supply], 10000, 50);
    const base = r.totals.totalFP;
    expect(r.units.some((u) => u.shipId === '6')).toBe(true);
    expect(r.auraApplied.map((a) => a.shipId)).toContain('6');
    expect(r.auraMultiplier).toBeCloseTo(1.4);
    expect(r.effectiveFP).toBeCloseTo(base * 1.4);
  });

  it('预算装不下光环舰时回退无光环并披露未纳入', () => {
    const r = optimizeFleet([missile, supply], 150, 50);
    expect(r.units.every((u) => u.shipId !== '6')).toBe(true);
    expect(r.auraMultiplier).toBe(1);
    expect(r.warnings.some((w) => w.includes('补给舰'))).toBe(true);
  });

  it('督导舰自身30FP计入基础战力，光环作用于全队', () => {
    // 大容量场景: 基础FP足够大时，督导舰 25ZC 换 +25% 全队输出才优于换导弹填充
    const r = optimizeFleet([missile, supervisor], 500000, 200);
    const supervisorUnit = r.units.find((u) => u.shipId === '26');
    expect(supervisorUnit).toBeDefined();
    expect(supervisorUnit?.count).toBe(1); // 光环舰不作为填充重复入选
    expect(r.auraMultiplier).toBeCloseTo(1.25);
    expect(r.effectiveFP).toBeCloseTo(r.totals.totalFP * 1.25);
    expect(r.totals.totalFP).toBeGreaterThanOrEqual(30); // 自身FP在基础值中
  });

  it('两艘光环舰按乘法复合 ×1.75', () => {
    const r = optimizeFleet([missile, supply, supervisor], 500000, 200);
    expect(r.auraMultiplier).toBeCloseTo(1.4 * 1.25);
    expect(r.effectiveFP).toBeCloseTo(r.totals.totalFP * 1.75);
  });

  it('光环收益低于填充舰时正确拒绝（督导舰在小容量下被导弹压制）', () => {
    const r = optimizeFleet([missile, supervisor], 50000, 50);
    expect(r.auraMultiplier).toBe(1);
    expect(r.warnings.some((w) => w.includes('督导舰'))).toBe(true);
  });

  it('输入不含光环舰时行为与旧版一致（倍率1）', () => {
    const r = optimizeFleet([missile], 5000, 50);
    expect(r.auraMultiplier).toBe(1);
    expect(r.auraApplied).toHaveLength(0);
    expect(r.effectiveFP).toBeCloseTo(r.totals.totalFP);
  });
});

describe('export/import 往返一致性', () => {
  const missile = mkShip({ id: 'a', name: '导弹巡游舰' });
  const patrol = mkShip({ id: 'c', name: '轻巡洋舰' });

  it('导出→导入得到相同 units 与预算', () => {
    const units: FleetUnitInput[] = [U(missile, 20), U(patrol, 5)];
    const json = exportFleet(units, 5000);
    const parsed = importFleet(json, (id) => (id === 'a' ? missile : id === 'c' ? patrol : undefined));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.fleet.units).toEqual([
        { shipId: 'a', count: 20 },
        { shipId: 'c', count: 5 },
      ]);
      expect(parsed.fleet.budget).toBe(5000);
    }
  });

  it('拒绝 version 不符 / 空 units / 未知 shipId', () => {
    const good = JSON.parse(exportFleet([U(missile)], undefined));
    expect(importFleet(JSON.stringify({ ...good, version: 99 }), () => undefined).ok).toBe(false);
    expect(importFleet(JSON.stringify({ ...good, units: [] }), () => undefined).ok).toBe(false);
    expect(importFleet(JSON.stringify(good), () => undefined).ok).toBe(false); // 解析器返回 undefined
    expect(importFleet('not json at all', () => undefined).ok).toBe(false);
  });
});
