import { useMemo } from 'react';
import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react';
import { SHIPS_DATA } from '@/data/ships';
import { useFleet, resolveUnits } from '@/context/FleetContext';
import { calcFleetTotals, checkCommandCap } from '@/lib/fleet-math';
import { fmt } from '@/lib/format';

/** 舰队清单 + 六指标统计栏（含超限红字警告） */
export function FleetListPanel() {
  const { units, setCount, removeUnit, clear, budget, commandCap } = useFleet();

  const resolved = useMemo(() => resolveUnits(units, SHIPS_DATA), [units]);
  const totals = useMemo(() => calcFleetTotals(resolved), [resolved]);
  const cap = useMemo(() => checkCommandCap(totals.totalZC, commandCap), [totals.totalZC, commandCap]);

  const budgetRemain = budget !== null ? budget - totals.totalCost : null;
  const zcPct = Math.min(100, (totals.totalZC / commandCap) * 100);

  const stats: { label: string; value: string; warn?: boolean }[] = [
    { label: '总造价', value: `${fmt(totals.totalCost)}A` },
    {
      label: '月维护',
      value: `${fmt(totals.totalMaintenance)}A`,
      warn: budgetRemain !== null && budgetRemain < 0,
    },
    { label: '总战力FP', value: fmt(totals.totalFP) },
    { label: '威慑SZ', value: fmt(totals.totalSZ) },
    { label: '均维护等级', value: `Lv.${totals.avgMaintenanceLevel}` },
    { label: '造价战力比', value: Number.isFinite(totals.costPerFP) ? totals.costPerFP.toFixed(2) : '—' },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 六指标统计栏 */}
      <div className="grid grid-cols-3 gap-1.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-md border px-2 py-1.5 ${
              s.warn ? 'border-destructive/50 bg-destructive/10' : 'border-border/40 bg-card/40'
            }`}
          >
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className={`truncate text-sm font-semibold tabular-nums ${s.warn ? 'text-destructive' : 'text-foreground'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ZC 能量槽 */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            指挥容量占用
            <span className="tabular-nums">
              {totals.totalZC.toFixed(1)} / {commandCap}
            </span>
          </span>
          {cap.over && (
            <span className="flex items-center gap-1 font-semibold text-destructive">
              <AlertTriangle className="size-3.5" />
              超限 {cap.overBy} 点 · 全队输出/生存 -{Math.round(cap.penaltyPct * 100)}%
            </span>
          )}
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              cap.over ? 'bg-destructive shadow-[0_0_8px] shadow-destructive/50' : 'bg-primary shadow-[0_0_8px] shadow-primary/40'
            }`}
            style={{ width: `${zcPct}%`, boxShadow: '0 0 8px currentColor' }}
          />
          {/* 预算耗尽时预算线提示 */}
          {budgetRemain !== null && budgetRemain < 0 && (
            <div className="absolute inset-y-0 right-0 w-1 animate-pulse bg-accent" title="预算已超支" />
          )}
        </div>
      </div>

      {/* 清单 */}
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {units.length === 0 && (
          <div className="rounded-md border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            舰队为空——从左侧选择舰船加入
          </div>
        )}
        {resolved.map(({ ship, count }) => (
          <div key={ship.id} className="flex items-center gap-2 rounded-md border border-border/40 bg-card/40 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{ship.name}</div>
              <div className="text-[11px] tabular-nums text-muted-foreground">
                小计 {(ship.cost * count).toLocaleString()}A · ZC {(ship.zcCost * count).toFixed(1)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setCount(ship.id, count - 1)}
                aria-label={`减少${ship.name}`}
                className="flex size-6 items-center justify-center rounded border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                <Minus className="size-3.5" />
              </button>
              <input
                value={count}
                onChange={(e) => setCount(ship.id, parseInt(e.target.value, 10) || 0)}
                aria-label={`${ship.name}数量`}
                className="h-6 w-10 rounded border border-border/60 bg-background/60 text-center text-xs tabular-nums text-foreground focus:border-primary/50 focus:outline-none"
              />
              <button
                onClick={() => setCount(ship.id, count + 1)}
                aria-label={`增加${ship.name}`}
                className="flex size-6 items-center justify-center rounded border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <button
              onClick={() => removeUnit(ship.id)}
              aria-label={`移除${ship.name}`}
              className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {units.length > 0 && (
        <button
          onClick={clear}
          className="self-end text-xs text-muted-underline text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
        >
          清空舰队
        </button>
      )}
    </div>
  );
}
