import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { MOCK_SHIPS } from '@/data/ships';
import { useFleet } from '@/context/FleetContext';

const TYPES = ['小型', '中型', '大型', '旗舰'] as const;

/** 选船面板: 搜索 + 类型筛选 + 一键入队 */
export function ShipPickerPanel() {
  const { units, addUnit } = useFleet();
  const [keyword, setKeyword] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());

  const inFleet = useMemo(() => new Map(units.map((u) => [u.shipId, u.count])), [units]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return MOCK_SHIPS.filter((s) => {
      if (activeTypes.size > 0 && !activeTypes.has(s.type)) return false;
      if (!kw) return true;
      return (
        s.name.toLowerCase().includes(kw) ||
        s.coreFeatures.toLowerCase().includes(kw) ||
        s.efficiencyPosition.toLowerCase().includes(kw)
      );
    });
  }, [keyword, activeTypes]);

  const toggleType = (t: string) =>
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 搜索 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索舰名 / 特性 / 定位…"
          className="h-9 w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            aria-label="清空搜索"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* 类型 chips */}
      <div className="flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              activeTypes.has(t)
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {t}舰
          </button>
        ))}
        <span className="ml-auto self-center text-xs tabular-nums text-muted-foreground">
          {filtered.length}/36
        </span>
      </div>

      {/* 舰船列表 */}
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            未探测到匹配舰船
          </div>
        )}
        {filtered.map((s) => {
          const count = inFleet.get(s.id) ?? 0;
          return (
            <div
              key={s.id}
              className={`group flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                count > 0
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/70'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                  <span className="shrink-0 rounded-sm bg-muted/60 px-1 text-[10px] text-muted-foreground">{s.type}</span>
                </div>
                <div className="mt-0.5 flex gap-3 text-[11px] tabular-nums text-muted-foreground">
                  <span>造价 {s.cost}A</span>
                  <span>ZC {s.zcCost}</span>
                  <span>FP {Number.isFinite(s.fpNumeric) ? s.fpNumeric : '辅助'}</span>
                </div>
              </div>
              {count > 0 && (
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                  ×{count}
                </span>
              )}
              <button
                onClick={() => addUnit(s.id)}
                aria-label={`添加${s.name}`}
                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <Plus className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
