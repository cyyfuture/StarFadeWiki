import { useState, useMemo } from 'react';
import { X, Zap, Shield, Wrench, Anchor, ArrowUpDown, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IShip } from '@/data/ships';

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ships: IShip[];
  onRemoveShip: (shipId: string) => void;
}

const TYPE_COLORS: Record<IShip['type'], string> = {
  '小型': 'border-cyan-400/60 bg-cyan-500/10 text-cyan-300',
  '中型': 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300',
  '大型': 'border-amber-400/60 bg-amber-500/10 text-amber-300',
  '旗舰': 'border-rose-400/60 bg-rose-500/10 text-rose-300',
};

const ROLE_COLORS: Record<IShip['role'], string> = {
  '打击': 'border-red-400/60 bg-red-500/10 text-red-300',
  '防御': 'border-blue-400/60 bg-blue-500/10 text-blue-300',
  '辅助': 'border-purple-400/60 bg-purple-500/10 text-purple-300',
  '后勤': 'border-teal-400/60 bg-teal-500/10 text-teal-300',
};

const MAINTENANCE_LABELS: Record<number, string> = {
  1: 'Ⅰ 前线补给站',
  2: 'Ⅱ 标准行星星港',
  3: 'Ⅲ 大型轨道船坞',
  4: 'Ⅳ 巨型旗舰船坞',
};

function formatValue(v: number | string): string {
  if (typeof v === 'number') return v.toLocaleString();
  return v;
}

function isNumeric(v: number | string): v is number {
  return typeof v === 'number';
}

function getMaxNumeric(ships: IShip[], key: keyof IShip): number {
  let max = 0;
  for (const s of ships) {
    const v = s[key];
    if (isNumeric(v) && v > max) max = v;
  }
  return max;
}

function BarCell({ value, max, unit = '', colorClass = 'bg-primary' }: { value: number; max: number; unit?: string; colorClass?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-16 text-right shrink-0">
        {value.toLocaleString()}{unit}
      </span>
    </div>
  );
}

export default function CompareModal({ open, onOpenChange, ships, onRemoveShip }: CompareModalProps) {
  const [sortKey, setSortKey] = useState<keyof IShip>('cost');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedShips = useMemo(() => {
    return [...ships].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const na = isNumeric(va) ? va : 0;
      const nb = isNumeric(vb) ? vb : 0;
      return sortAsc ? na - nb : nb - na;
    });
  }, [ships, sortKey, sortAsc]);

  const maxCost = getMaxNumeric(ships, 'cost');
  const maxMaintenance = getMaxNumeric(ships, 'monthlyMaintenance');
  const maxGarrison = getMaxNumeric(ships, 'garrison');
  const maxDispatch = getMaxNumeric(ships, 'dispatch');

  const toggleSort = (key: keyof IShip) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortButton = ({ label, field }: { label: string; field: keyof IShip }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
    >
      {label}
      {sortKey === field && (
        <ArrowUpDown className={`size-3 transition-transform ${sortAsc ? '' : 'rotate-180'}`} />
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1200px] h-[85vh] flex flex-col p-0 gap-0 bg-card border-border/40">
        <DialogHeader className="px-6 py-4 border-b border-border/30 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              舰船数据对比
              <Badge variant="secondary" className="ml-1 text-xs">{ships.length} 艘</Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* 对比表格 */}
            <div className="overflow-x-auto rounded-lg border border-border/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="sticky left-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                      数据维度
                    </th>
                    {sortedShips.map((ship) => (
                      <th key={ship.id} className="px-4 py-3 text-center font-medium whitespace-nowrap min-w-[160px]">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-foreground">{ship.name}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveShip(ship.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`移除 ${ship.name}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {/* 类型 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <Zap className="size-3.5 inline mr-1.5 text-primary" />
                      舰种类型
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center">
                        <Badge variant="outline" className={TYPE_COLORS[ship.type]}>{ship.type}</Badge>
                      </td>
                    ))}
                  </tr>

                  {/* 定位 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <Shield className="size-3.5 inline mr-1.5 text-secondary" />
                      战术定位
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center">
                        <Badge variant="outline" className={ROLE_COLORS[ship.role]}>{ship.role}</Badge>
                      </td>
                    ))}
                  </tr>

                  {/* 造价 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <SortButton label="造价 (A)" field="cost" />
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5">
                        <BarCell value={ship.cost} max={maxCost} unit="A" colorClass="bg-amber-400" />
                      </td>
                    ))}
                  </tr>

                  {/* 月维护 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <SortButton label="月维护 (A)" field="monthlyMaintenance" />
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5">
                        <BarCell value={ship.monthlyMaintenance} max={maxMaintenance} unit="A" colorClass="bg-rose-400" />
                      </td>
                    ))}
                  </tr>

                  {/* 常规战力 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <Zap className="size-3.5 inline mr-1.5 text-cyan-400" />
                      常规战力 (FP)
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center tabular-nums font-mono text-sm">
                        {formatValue(ship.regularFP)}
                      </td>
                    ))}
                  </tr>

                  {/* 峰值 / 谷值 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      峰值 / 谷值 (FP)
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center tabular-nums font-mono text-sm">
                        <span className="text-emerald-400">{formatValue(ship.peakFP)}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-rose-400">{formatValue(ship.valleyFP)}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 常规造价战力比 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      常规造价战力比
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center tabular-nums font-mono text-sm">
                        {formatValue(ship.regularCostFPRatio)}
                      </td>
                    ))}
                  </tr>

                  {/* 最高造价战力比 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      最高造价战力比
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center tabular-nums font-mono text-sm">
                        {formatValue(ship.maxCostFPRatio)}
                      </td>
                    ))}
                  </tr>

                  {/* 维护战力比 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      维护战力比
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center tabular-nums font-mono text-sm">
                        {formatValue(ship.maintenanceFPRatio)}
                      </td>
                    ))}
                  </tr>

                  {/* 镇守 / 调度 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <Anchor className="size-3.5 inline mr-1.5 text-blue-400" />
                      镇守 / 调度
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5">
                        <div className="flex gap-2 justify-center">
                          <BarCell value={ship.garrison} max={maxGarrison} colorClass="bg-blue-400" />
                          <BarCell value={ship.dispatch} max={maxDispatch} colorClass="bg-purple-400" />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 维护等级 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      <Wrench className="size-3.5 inline mr-1.5 text-amber-400" />
                      维护等级
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center">
                        <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-300 text-xs">
                          {MAINTENANCE_LABELS[ship.maintenanceLevel]}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* 核心效率定位 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      核心效率定位
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-center text-xs leading-relaxed max-w-[200px]">
                        {ship.efficiencyPosition}
                      </td>
                    ))}
                  </tr>

                  {/* 核心特性 */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                      核心特性
                    </td>
                    {sortedShips.map((ship) => (
                      <td key={ship.id} className="px-4 py-2.5 text-xs leading-relaxed text-muted-foreground max-w-[220px]">
                        {ship.coreFeatures}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {ships.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Layers className="size-12 mb-3 opacity-30" />
                <p className="text-sm">请从舰船列表中选择 2-5 艘舰船进行对比</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
