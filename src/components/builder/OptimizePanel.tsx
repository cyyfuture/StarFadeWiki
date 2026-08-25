import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { SHIPS_DATA } from '@/data/ships';
import { useFleet } from '@/context/FleetContext';
import { optimizeFleet, type OptimizeResult } from '@/lib/fleet-math';

function fmt(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(2)}万A` : `${Math.round(n).toLocaleString()}A`;
}

/** 一键优化: 输入预算 → 贪心推荐编成（启发式，非全局最优） */
export function OptimizePanel() {
  const { budget, setBudget, commandCap, replaceAll } = useFleet();
  const [input, setInput] = useState<string>(budget !== null ? String(budget) : '5000');
  const [result, setResult] = useState<OptimizeResult | null>(null);

  const run = () => {
    const b = parseInt(input, 10);
    if (!Number.isFinite(b) || b <= 0) return;
    setBudget(b);
    setResult(optimizeFleet(SHIPS_DATA, b, commandCap));
  };

  const apply = () => {
    if (!result) return;
    replaceAll(
      result.units.map((u) => ({ shipId: u.shipId, count: u.count })),
      budget
    );
    setResult(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/40 bg-card/40 p-4">
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">一键优化配队</span>
        <span className="ml-auto text-[10px] text-muted-foreground">启发式推荐 · 非全局最优</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            inputMode="numeric"
            placeholder="输入总预算 (A)"
            aria-label="优化预算"
            className="h-9 w-full rounded-md border border-border/60 bg-background/60 px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">A</span>
        </div>
        <button
          onClick={run}
          className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
        >
          <Sparkles className="size-4" />
          生成
        </button>
      </div>

      {result && (
        <div className="space-y-2">
          {result.units.length === 0 ? (
            <p className="text-sm text-destructive">{result.warnings[0] ?? '无法生成方案'}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
                <div className="rounded border border-border/40 px-2 py-1">
                  <span className="text-muted-foreground">总造价</span>
                  <div className="font-semibold tabular-nums text-foreground">{fmt(result.totals.totalCost)}</div>
                </div>
                <div className="rounded border border-border/40 px-2 py-1">
                  <span className="text-muted-foreground">战力</span>
                  <div className="font-semibold tabular-nums text-primary">{Math.round(result.totals.totalFP)}</div>
                </div>
                <div className="rounded border border-border/40 px-2 py-1">
                  <span className="text-muted-foreground">ZC占用</span>
                  <div className="font-semibold tabular-nums text-foreground">
                    {result.totals.totalZC.toFixed(1)}/{commandCap}
                  </div>
                </div>
                <div className="rounded border border-border/40 px-2 py-1">
                  <span className="text-muted-foreground">威慑SZ</span>
                  <div className="font-semibold tabular-nums text-accent">{Math.round(result.totals.totalSZ)}</div>
                </div>
              </div>

              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border/30 p-2">
                {result.units.map((u) => {
                  const ship = SHIPS_DATA.find((s) => s.id === u.shipId);
                  return (
                    <div key={u.shipId} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{ship?.name ?? u.shipId}</span>
                      <span className="tabular-nums text-muted-foreground">
                        ×{u.count} · {fmt(u.ship.cost * u.count)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {result.warnings.map((w) => (
                <p key={w} className="text-[11px] text-accent">⚠ {w}</p>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={apply}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:brightness-110 active:scale-95"
                >
                  应用到我的舰队
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="rounded-md border border-border/60 px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  取消
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
