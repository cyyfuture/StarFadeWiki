import { MAINTENANCE_FACILITIES } from '@/lib/rules';

/**
 * 展示层格式化统一出口。
 *
 * 背景：IShip 的六个 `number | string` 复合字段此前在 ShipCard / ShipDetailModal /
 * CompareModal 各写一套 formatValue（2 位 / 3 位 / locale 口径不一），
 * formatCost 两份、fmt 两份重复——展示层统一改用本文件。
 *
 * 注意：排序与计算请勿使用本文件，应使用数据侧已数值化的 `fpNumeric`
 * 或 `ships-access.ts` 的 `num()`。
 */

/**
 * 复合数值字段展示口径：
 * - 字符串原文返回（如 '自身0/全队+40%输出'、'0.023 / 0.159（等效）'）；
 * - 数字整数原样（10 → "10"）；小数固定 3 位（0.1 → "0.100"，与数据 0.100 的书写精度一致）。
 */
export function formatValue(value: number | string): string {
  if (typeof value === 'string') return value;
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

/** 造价展示：≥1 万折算为 'x.xx万 A'，否则千分位 'n A'。 */
export function formatCost(cost: number): string {
  if (cost >= 10000) return `${(cost / 10000).toFixed(2)}万 A`;
  return `${cost.toLocaleString()} A`;
}

/** 大数缩写（不带单位）：≥1 万 → 'x.xx万'，否则千分位最多 1 位小数。 */
export function fmt(n: number): string {
  return n >= 10000
    ? `${(n / 10000).toFixed(2)}万`
    : n.toLocaleString('zh-CN', { maximumFractionDigits: 1 });
}

/**
 * 维护等级 → 停靠设施名。唯一来源 `lib/rules.ts` 的 MAINTENANCE_FACILITIES。
 * （此前 ShipCard / ShipDetailModal / CompareModal / SquadronSection 四份
 * MAINTENANCE_LABELS 硬编码且互不一致——'标准星港' ≠ '标准行星星港'、CompareModal 还带罗马序号。）
 */
export function maintenanceFacilityName(level: number): string {
  return MAINTENANCE_FACILITIES.find((f) => f.level === level)?.name ?? `Lv.${level}`;
}
