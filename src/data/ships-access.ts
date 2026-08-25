import { SHIPS_DATA, type IShip } from '@/data/ships';

const byId = new Map(SHIPS_DATA.map((s) => [s.id, s]));
const byName = new Map(SHIPS_DATA.map((s) => [s.name, s]));

export const getShipById = (id: string): IShip | undefined => byId.get(id);
export const getShipByName = (name: string): IShip | undefined => byName.get(name);
export const getAllShips = (): readonly IShip[] => SHIPS_DATA;
export const SHIP_COUNT = SHIPS_DATA.length;

/** NaN/undefined 安全数值读取 */
export function num(v: number | string | undefined | null, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (v === undefined || v === null || v === '') return fallback;
  const p = parseFloat(String(v));
  return Number.isFinite(p) ? p : fallback;
}
