import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Crosshair, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ISquadron, MOCK_SQUADRONS } from '@/data/squadrons';

const ROLE_ICONS: Record<string, typeof Zap> = {
  '防空制空': Shield,
  '全域制空': Crosshair,
  '反小型舰': Crosshair,
  '反大船': Zap,
  '破护盾': Zap,
  '功能辅助': Wrench,
  '特种作战': Crosshair,
};

const MAINTENANCE_LABELS: Record<number, string> = {
  1: '前线补给站',
  2: '标准行星星港',
  3: '大型轨道船坞',
};

function getRoleIcon(role: string) {
  const Icon = ROLE_ICONS[role] || Zap;
  return Icon;
}

function SquadronCard({ squadron, index }: { squadron: ISquadron; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const RoleIcon = getRoleIcon(squadron.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(0_229_255_0.12)] hover:border-primary/30">
        {/* 顶部霓虹光条 */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                {squadron.imageUrl ? (
                  <Image
                    src={squadron.imageUrl}
                    alt={squadron.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center size-full text-muted-foreground">
                    <RoleIcon className="size-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors duration-300">
                  {squadron.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-primary/80">
                    {squadron.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {MAINTENANCE_LABELS[squadron.maintenanceLevel] || `${squadron.maintenanceLevel}级维护`}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label={expanded ? '收起详情' : '展开详情'}
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* 核心数据行 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">造价</div>
              <div className="text-sm font-semibold tabular-nums text-secondary">{squadron.cost}A</div>
            </div>
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">月维护</div>
              <div className="text-sm font-semibold tabular-nums text-foreground">{squadron.monthlyMaintenance}A</div>
            </div>
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">常规战力</div>
              <div className="text-sm font-semibold tabular-nums text-primary">{squadron.regularFP}FP</div>
            </div>
            <div className="rounded-md bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">峰值</div>
              <div className="text-sm font-semibold tabular-nums text-foreground">
                {typeof squadron.peakFP === 'number' ? `${squadron.peakFP}FP` : squadron.peakFP}
              </div>
            </div>
          </div>

          {/* 克制关系可视化 */}
          <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">克制关系</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {squadron.counterRelation.split('，').map((seg, i) => {
                const isCounter = seg.includes('克制') && !seg.includes('被');
                const isCountered = seg.includes('被克制') || seg.includes('被反舰');
                const isNeutral = !isCounter && !isCountered;
                return (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
                      isCounter && 'border-success/40 bg-success/10 text-success',
                      isCountered && 'border-destructive/40 bg-destructive/10 text-destructive',
                      isNeutral && 'border-border/50 bg-muted/30 text-muted-foreground',
                    )}
                  >
                    {isCounter && <Crosshair className="size-3" />}
                    {isCountered && <Shield className="size-3" />}
                    {seg.trim()}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 展开详情 */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">核心定位</span>
                  <span className="text-foreground font-medium">{squadron.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">维护等级</span>
                  <span className="text-foreground font-medium">
                    Lv.{squadron.maintenanceLevel} · {MAINTENANCE_LABELS[squadron.maintenanceLevel] || `${squadron.maintenanceLevel}级`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">造价战力比</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {(squadron.regularFP / squadron.cost).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">维护战力比</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {(squadron.regularFP / squadron.monthlyMaintenance).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SquadronSection() {
  const [sortKey, setSortKey] = useState<'cost' | 'regularFP' | 'name'>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedSquadrons = useMemo(() => {
    const arr = [...MOCK_SQUADRONS];
    arr.sort((a, b) => {
      let va: number;
      let vb: number;
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortKey === 'cost') {
        va = a.cost;
        vb = b.cost;
      } else {
        va = typeof a.regularFP === 'number' ? a.regularFP : 0;
        vb = typeof b.regularFP === 'number' ? b.regularFP : 0;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [sortKey, sortDir]);

  const toggleSort = (key: 'cost' | 'regularFP' | 'name') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortButton = ({ label, sortKey: key }: { label: string; sortKey: 'cost' | 'regularFP' | 'name' }) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className={cn(
        'text-xs px-2.5 py-1 rounded-md border transition-colors',
        sortKey === key
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border',
      )}
    >
      {label}
      {sortKey === key && (
        <span className="ml-1 inline-block">{sortDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );

  return (
    <section id="squadrons" className="w-full py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 区块标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              舰载机中队数据
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
          <p className="text-muted-foreground text-sm md:text-base text-center">
            7种舰载机中队 · 完整数据一览 · 克制关系可视化
          </p>
        </motion.div>

        {/* 排序工具栏 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground mr-1">排序:</span>
          <SortButton label="造价" sortKey="cost" />
          <SortButton label="战力" sortKey="regularFP" />
          <SortButton label="名称" sortKey="name" />
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-12">
          {sortedSquadrons.map((sq, i) => (
            <SquadronCard key={sq.id} squadron={sq} index={i} />
          ))}
        </div>

        {/* 斑马纹数据表格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                舰载机中队数据总表
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">中队名称</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">造价(A)</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">月维护(A)</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">常规战力(FP)</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">峰值(FP)</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">核心定位</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">克制关系</TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">维护等级</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SQUADRONS.map((sq, i) => (
                      <TableRow
                        key={sq.id}
                        className={cn(
                          'border-border/20 transition-colors duration-150 hover:bg-primary/5',
                          i % 2 === 0 ? 'bg-muted/10' : 'bg-transparent',
                        )}
                      >
                        <TableCell className="font-medium text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {sq.imageUrl ? (
                              <Image
                                src={sq.imageUrl}
                                alt={sq.name}
                                className="size-7 rounded object-cover shrink-0 border border-border/30"
                              />
                            ) : (
                              <div className="size-7 rounded bg-muted/30 flex items-center justify-center shrink-0">
                                {(() => {
                                  const Icon = getRoleIcon(sq.role);
                                  return <Icon className="size-3.5 text-muted-foreground" />;
                                })()}
                              </div>
                            )}
                            <span className="group-hover:text-primary transition-colors">{sq.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums text-sm text-secondary font-semibold">{sq.cost}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums text-sm">{sq.monthlyMaintenance}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums text-sm text-primary font-semibold">{sq.regularFP}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums text-sm">
                          {typeof sq.peakFP === 'number' ? sq.peakFP : sq.peakFP}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-primary/80">
                            {sq.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[220px]">
                          <span className="block truncate text-muted-foreground">{sq.counterRelation}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-xs',
                            sq.maintenanceLevel <= 2 ? 'text-success' : 'text-warning',
                          )}>
                            <Wrench className="size-3" />
                            Lv.{sq.maintenanceLevel}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
