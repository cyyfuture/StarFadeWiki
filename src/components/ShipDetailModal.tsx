import { memo } from 'react';
import { X, Shield, Swords, Anchor, Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Image } from '@/components/ui/image';
import type { IShip } from '@/data/ships';

interface ShipDetailModalProps {
  ship: IShip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICON: Record<IShip['type'], typeof Swords> = {
  '小型': Swords,
  '中型': Anchor,
  '大型': Shield,
  '旗舰': Wrench,
};

const TYPE_BADGE_VARIANT: Record<IShip['type'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  '小型': 'secondary',
  '中型': 'default',
  '大型': 'destructive',
  '旗舰': 'outline',
};

const ROLE_BADGE_VARIANT: Record<IShip['role'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  '打击': 'destructive',
  '防御': 'default',
  '辅助': 'secondary',
  '后勤': 'outline',
};

const MAINTENANCE_LABELS: Record<number, string> = {
  1: '前线补给站',
  2: '标准行星星港',
  3: '大型轨道船坞',
  4: '巨型旗舰船坞',
};

function formatValue(v: number | string): string {
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toString() : v.toFixed(3);
  }
  return v;
}

export default memo(function ShipDetailModal({ ship, open, onOpenChange }: ShipDetailModalProps) {
  if (!ship) return null;

  const TypeIcon = TYPE_ICON[ship.type] || Swords;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20 shadow-[0_0_40px_rgba(0_229_255_0.08)]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <TypeIcon className="size-6 text-primary" />
            <DialogTitle className="text-xl font-bold tracking-wide text-foreground">
              {ship.name}
            </DialogTitle>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={TYPE_BADGE_VARIANT[ship.type]} className="text-xs">
                {ship.type}
              </Badge>
              <Badge variant={ROLE_BADGE_VARIANT[ship.role]} className="text-xs">
                {ship.role}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* 舰船图片 */}
        {ship.imageUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/30">
            <Image
              src={ship.imageUrl}
              alt={ship.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg border border-border/30 bg-muted/30 flex items-center justify-center">
            <TypeIcon className="size-12 text-muted-foreground/30" />
          </div>
        )}

        {/* 核心特性 */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
          <p className="text-sm text-foreground/80 leading-relaxed">{ship.coreFeatures}</p>
          <p className="text-xs text-primary mt-2 font-medium">{ship.efficiencyPosition}</p>
        </div>

        <Separator className="bg-border/50" />

        {/* 完整数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <TableRow label="造价" value={`${formatValue(ship.cost)} A`} />
              <TableRow label="月维护" value={`${formatValue(ship.monthlyMaintenance)} A`} />
              <TableRow label="常规战力 (FP)" value={formatValue(ship.regularFP)} highlight />
              <TableRow label="峰值 (FP)" value={formatValue(ship.peakFP)} />
              <TableRow label="谷值 (FP)" value={formatValue(ship.valleyFP)} />
              <TableRow label="常规造价战力比" value={formatValue(ship.regularCostFPRatio)} />
              <TableRow label="最高造价战力比" value={formatValue(ship.maxCostFPRatio)} />
              <TableRow label="维护战力比" value={formatValue(ship.maintenanceFPRatio)} />
              <TableRow
                label="镇守 / 调度"
                value={`${ship.garrison} / ${ship.dispatch}`}
              />
              <TableRow
                label="维护等级"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                      Lv.{ship.maintenanceLevel}
                    </span>
                    <span className="text-muted-foreground">
                      {MAINTENANCE_LABELS[ship.maintenanceLevel] || '未知'}
                    </span>
                  </span>
                }
              />
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
});

function TableRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <tr className="border-b border-border/20 last:border-b-0 hover:bg-primary/5 transition-colors">
      <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap font-medium">{label}</td>
      <td className={`py-2.5 ${highlight ? 'text-primary font-semibold' : 'text-foreground'}`}>
        {value}
      </td>
    </tr>
  );
}
