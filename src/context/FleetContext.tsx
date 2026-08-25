import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { RULE_CONSTANTS } from '@/lib/rules';
import type { FleetUnitInput } from '@/lib/fleet-math';

const STORAGE_KEY = '__wiki_fleet_v1'; // 版本化 key: schema 变更时换 v2 防脏数据

export interface FleetUnit {
  shipId: string;
  count: number;
}

interface FleetState {
  units: FleetUnit[];
  budget: number | null;
  commandCap: number;
  fleetName: string;
}

type FleetAction =
  | { type: 'ADD_UNIT'; shipId: string }
  | { type: 'REMOVE_UNIT'; shipId: string }
  | { type: 'SET_COUNT'; shipId: string; count: number }
  | { type: 'CLEAR' }
  | { type: 'SET_BUDGET'; budget: number | null }
  | { type: 'SET_CAP'; cap: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'REPLACE_ALL'; units: FleetUnit[]; budget?: number | null; commandCap?: number }
  | { type: 'HYDRATE'; state: FleetState };

const DEFAULT_STATE: FleetState = {
  units: [],
  budget: null,
  commandCap: RULE_CONSTANTS.COMMAND_CAP_DEFAULT,
  fleetName: '',
};

function reducer(state: FleetState, action: FleetAction): FleetState {
  switch (action.type) {
    case 'ADD_UNIT': {
      const exists = state.units.find((u) => u.shipId === action.shipId);
      return exists
        ? { ...state, units: state.units.map((u) => (u.shipId === action.shipId ? { ...u, count: u.count + 1 } : u)) }
        : { ...state, units: [...state.units, { shipId: action.shipId, count: 1 }] };
    }
    case 'REMOVE_UNIT':
      return { ...state, units: state.units.filter((u) => u.shipId !== action.shipId) };
    case 'SET_COUNT': {
      if (action.count <= 0) return { ...state, units: state.units.filter((u) => u.shipId !== action.shipId) };
      return { ...state, units: state.units.map((u) => (u.shipId === action.shipId ? { ...u, count: action.count } : u)) };
    }
    case 'CLEAR':
      return { ...state, units: [] };
    case 'SET_BUDGET':
      return { ...state, budget: action.budget !== null && !Number.isFinite(action.budget) ? null : action.budget };
    case 'SET_CAP':
      return { ...state, commandCap: Math.max(1, Math.round(action.cap) || RULE_CONSTANTS.COMMAND_CAP_DEFAULT) };
    case 'SET_NAME':
      return { ...state, fleetName: action.name.slice(0, 40) };
    case 'REPLACE_ALL':
      return {
        ...state,
        units: action.units,
        budget: action.budget !== undefined ? action.budget : state.budget,
        commandCap: action.commandCap !== undefined ? action.commandCap : state.commandCap,
      };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

function loadInitial(): FleetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.units) &&
      parsed.units.every(
        (u: unknown) =>
          typeof u === 'object' && u !== null && typeof (u as FleetUnit).shipId === 'string' && typeof (u as FleetUnit).count === 'number'
      )
    ) {
      return {
        units: parsed.units,
        budget: typeof parsed.budget === 'number' ? parsed.budget : null,
        commandCap: typeof parsed.commandCap === 'number' ? parsed.commandCap : RULE_CONSTANTS.COMMAND_CAP_DEFAULT,
        fleetName: typeof parsed.fleetName === 'string' ? parsed.fleetName : '',
      };
    }
  } catch {
    // localStorage 不可用或数据损坏 → 默认值
  }
  return DEFAULT_STATE;
}

interface FleetContextValue extends FleetState {
  addUnit: (shipId: string) => void;
  removeUnit: (shipId: string) => void;
  setCount: (shipId: string, count: number) => void;
  clear: () => void;
  setBudget: (budget: number | null) => void;
  setCommandCap: (cap: number) => void;
  setFleetName: (name: string) => void;
  replaceAll: (units: FleetUnit[], budget?: number | null, commandCap?: number) => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 忽略持久化失败
    }
  }, [state]);

  const value = useMemo<FleetContextValue>(
    () => ({
      ...state,
      addUnit: (shipId) => dispatch({ type: 'ADD_UNIT', shipId }),
      removeUnit: (shipId) => dispatch({ type: 'REMOVE_UNIT', shipId }),
      setCount: (shipId, count) => dispatch({ type: 'SET_COUNT', shipId, count }),
      clear: () => dispatch({ type: 'CLEAR' }),
      setBudget: (budget) => dispatch({ type: 'SET_BUDGET', budget }),
      setCommandCap: (cap) => dispatch({ type: 'SET_CAP', cap }),
      setFleetName: (name) => dispatch({ type: 'SET_NAME', name }),
      replaceAll: (units, budget, commandCap) => dispatch({ type: 'REPLACE_ALL', units, budget, commandCap }),
    }),
    [state]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
}

/** 便捷工具: 把 state.units 解析为带舰船数据的输入（过滤已失效 id） */
export function resolveUnits(units: FleetUnit[], allShips: readonly { id: string }[]): FleetUnitInput[] {
  const map = new Map(allShips.map((s) => [s.id, s]));
  const out: FleetUnitInput[] = [];
  for (const u of units) {
    const ship = map.get(u.shipId);
    if (ship && u.count > 0) out.push({ ship: ship as FleetUnitInput['ship'], count: u.count });
  }
  return out;
}
