import { memo } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { ClickableCard } from '@/components/ClickableCard';
import { cn } from '@/lib/utils';
import { formatValue, maintenanceFacilityName } from '@/lib/format';
import type { IShip } from '@/data/ships';

interface ShipCardProps {
  ship: IShip;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onClickDetail: (id: string) => void;
  isExpanded?: boolean;
  onExpand?: (id: string) => void;
}

/** 舰种徽章色板：完整字面量类（Tailwind 按源码文本扫描）；text-*-300 仅深色可读，浅色主题用 light: 变体补 -700 */
const TYPE_BADGE_CLASS: Record<IShip['type'], string> = {
  '小型': 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10 light:text-cyan-700',
  '中型': 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10 light:text-emerald-700',
  '大型': 'border-amber-400/40 text-amber-300 bg-amber-400/10 light:text-amber-700',
  '旗舰': 'border-rose-400/40 text-rose-300 bg-rose-400/10 light:text-rose-700',
};

const ROLE_BADGE_CLASS: Record<IShip['role'], string> = {
  '打击': 'border-red-400/40 text-red-300 bg-red-400/10 light:text-red-700',
  '防御': 'border-blue-400/40 text-blue-300 bg-blue-400/10 light:text-blue-700',
  '辅助': 'border-purple-400/40 text-purple-300 bg-purple-400/10 light:text-purple-700',
  '后勤': 'border-teal-400/40 text-teal-300 bg-teal-400/10 light:text-teal-700',
};

function ShipCard({
  ship,
  selected,
  onToggleSelect,
  onClickDetail,
  isExpanded = false,
  onExpand,
}: ShipCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <ClickableCard
        className={cn(
          'group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300',
          'hover:border-primary/50 hover:shadow-[0_0_24px_rgba(0_230_255_0.12)]',
          selected && 'border-primary/70 shadow-[0_0_20px_rgba(0_230_255_0.18)] ring-1 ring-primary/30',
        )}
        onClick={() => onClickDetail(ship.id)}
        aria-label={`查看${ship.name}完整数据`}
      >
        {/* 顶部霓虹光条 */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="p-4">
          {/* 选择框 + 标题行 */}
          <div className="flex items-start gap-3 min-w-0">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(ship.id)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="mt-1 shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              aria-label={`选择${ship.name}进行对比`}
            />

            <div className="flex-1 min-w-0">
              {/* 舰种名称 */}
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                {ship.name}
              </h3>

              {/* 类型 + 定位 Badge */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className={cn('text-[11px] px-1.5 py-0 leading-5', TYPE_BADGE_CLASS[ship.type])}>
                  {ship.type}
                </Badge>
                <Badge variant="outline" className={cn('text-[11px] px-1.5 py-0 leading-5', ROLE_BADGE_CLASS[ship.role])}>
                  {ship.role}
                </Badge>
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 leading-5 border-muted-foreground/30 text-muted-foreground">
                  Lv.{ship.maintenanceLevel}
                </Badge>
              </div>
            </div>
          </div>

          {/* 核心数据行 */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/30">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">造价</div>
              <div className="text-sm font-bold text-amber-300 light:text-amber-700 tabular-nums mt-0.5">{ship.cost}A</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">战力</div>
              <div className="text-sm font-bold text-cyan-300 light:text-cyan-700 tabular-nums mt-0.5">{formatValue(ship.regularFP)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">性价比</div>
              <div className="text-sm font-bold text-emerald-300 light:text-emerald-700 tabular-nums mt-0.5">
                {typeof ship.regularCostFPRatio === 'number' ? formatValue(ship.regularCostFPRatio) : 'N/A'}
              </div>
            </div>
          </div>

          {/* 核心特性摘要 */}
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {ship.coreFeatures}
          </p>

          {/* 效率定位标签 */}
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-primary/70 font-medium tracking-wide">
              {ship.efficiencyPosition}
            </span>
          </div>

          {/* 展开详情 */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 pt-4 border-t border-border/40 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <DetailRow label="月维护" value={`${ship.monthlyMaintenance}A`} />
                <DetailRow label="峰值 FP" value={formatValue(ship.peakFP)} />
                <DetailRow label="谷值 FP" value={formatValue(ship.valleyFP)} />
                <DetailRow label="常规造价战力比" value={formatValue(ship.regularCostFPRatio)} />
                <DetailRow label="最高造价战力比" value={formatValue(ship.maxCostFPRatio)} />
                <DetailRow label="维护战力比" value={formatValue(ship.maintenanceFPRatio)} />
                <DetailRow label="镇守值" value={String(ship.garrison)} />
                <DetailRow label="调度值" value={String(ship.dispatch)} />
                <DetailRow label="维护等级" value={`Lv.${ship.maintenanceLevel} (${maintenanceFacilityName(ship.maintenanceLevel)})`} />
              </div>
              <div className="mt-3 p-2.5 rounded-md bg-muted/40 border border-border/30">
                <p className="text-xs text-foreground/80 leading-relaxed">{ship.coreFeatures}</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </ClickableCard>
    </motion.div>
  );
}

export default memo(ShipCard);

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right tabular-nums truncate">{value}</span>
    </div>
  );
}
