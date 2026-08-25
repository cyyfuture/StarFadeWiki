import { MOCK_SHIPS, type IShip } from '@/data/ships';

const byId = new Map(MOCK_SHIPS.map((s) => [s.id, s]));
const byName = new Map(MOCK_SHIPS.map((s) => [s.name, s]));

export const getShipById = (id: string): IShip | undefined => byId.get(id);
export const getShipByName = (name: string): IShip | undefined => byName.get(name);
export const getAllShips = (): readonly IShip[] => MOCK_SHIPS;
export const SHIP_COUNT = MOCK_SHIPS.length;

/** NaN/undefined 安全数值读取 */
export function num(v: number | string | undefined | null, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (v === undefined || v === null || v === '') return fallback;
  const p = parseFloat(String(v));
  return Number.isFinite(p) ? p : fallback;
}
