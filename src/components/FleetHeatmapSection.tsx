import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Info } from 'lucide-react';
import { FLEET_TEMPLATES_DATA, type IFleetTemplate } from '@/data/fleettemplates';
import { SHIPS_DATA } from '@/data/ships';
import { formatCost } from '@/lib/format';

// Build ship lookups from actual data
const SHIP_ROLE_MAP = new Map<string, string>();
const SHIP_TYPE_MAP = new Map<string, string>();
SHIPS_DATA.forEach((s) => {
  SHIP_ROLE_MAP.set(s.name, s.role);
  SHIP_TYPE_MAP.set(s.name, s.type);
});

const ROLES = ['打击', '防御', '辅助', '后勤'] as const;
const TYPES = ['小型', '中型', '大型', '旗舰'] as const;

/** 行首图例圆点用（完整字面量，类名均以字面量出现在源码中） */
const ROLE_COLORS: Record<string, string> = {
  '打击': 'from-red-500 to-orange-500',
  '防御': 'from-blue-500 to-cyan-500',
  '辅助': 'from-purple-500 to-violet-500',
  '后勤': 'from-emerald-500 to-teal-500',
};

/**
 * role 模式单元格渐变——按强度 5 档预写完整字面量类（下标 0 最强）。
 * 此前用正则对 ROLE_COLORS 运行时改写 alpha（如 from-red-500/80），
 * Tailwind v4 按源码文本扫描，拼接出的类从未生成，样式静默失效。
 */
const ROLE_CELL_CLASSES: Record<string, readonly string[]> = {
  '打击': [
    'bg-gradient-to-br from-red-500 to-orange-500 shadow-md',
    'bg-gradient-to-br from-red-500/80 to-orange-500/70',
    'bg-gradient-to-br from-red-500/60 to-orange-500/50',
    'bg-gradient-to-br from-red-500/40 to-orange-500/30',
    'bg-gradient-to-br from-red-500/20 to-orange-500/15',
  ],
  '防御': [
    'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md',
    'bg-gradient-to-br from-blue-500/80 to-cyan-500/70',
    'bg-gradient-to-br from-blue-500/60 to-cyan-500/50',
    'bg-gradient-to-br from-blue-500/40 to-cyan-500/30',
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/15',
  ],
  '辅助': [
    'bg-gradient-to-br from-purple-500 to-violet-500 shadow-md',
    'bg-gradient-to-br from-purple-500/80 to-violet-500/70',
    'bg-gradient-to-br from-purple-500/60 to-violet-500/50',
    'bg-gradient-to-br from-purple-500/40 to-violet-500/30',
    'bg-gradient-to-br from-purple-500/20 to-violet-500/15',
  ],
  '后勤': [
    'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md',
    'bg-gradient-to-br from-emerald-500/80 to-teal-500/70',
    'bg-gradient-to-br from-emerald-500/60 to-teal-500/50',
    'bg-gradient-to-br from-emerald-500/40 to-teal-500/30',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/15',
  ],
};

function getRoleIntensityIndex(intensity: number): number {
  if (intensity >= 0.8) return 0;
  if (intensity >= 0.6) return 1;
  if (intensity >= 0.4) return 2;
  if (intensity >= 0.2) return 3;
  return 4;
}

function getIntensityClass(count: number, maxCount: number): string {
  if (maxCount === 0) return 'bg-muted/20 opacity-30';
  const pct = count / maxCount;
  if (pct >= 0.9) return 'bg-gradient-to-br from-primary to-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]';
  if (pct >= 0.7) return 'bg-gradient-to-br from-primary/80 to-cyan-400/70 shadow-[0_0_8px_rgba(0,229,255,0.25)]';
  if (pct >= 0.5) return 'bg-gradient-to-br from-primary/60 to-cyan-400/50';
  if (pct >= 0.3) return 'bg-gradient-to-br from-primary/40 to-cyan-400/30';
  return 'bg-gradient-to-br from-primary/20 to-cyan-400/15';
}

// Build matrix: for each template, count ships by role/type using actual ship data
function buildMatrix(
  dimension: 'role' | 'type',
  categories: readonly string[],
) {
  return FLEET_TEMPLATES_DATA.map((template) => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => { counts[c] = 0; });

    template.composition.forEach((comp) => {
      const key = dimension === 'role'
        ? SHIP_ROLE_MAP.get(comp.shipName)
        : SHIP_TYPE_MAP.get(comp.shipName);
      if (key && key in counts) {
        counts[key] += comp.count;
      } else {
        // Fallback: assign to first category
        counts[categories[0]] += comp.count;
      }
    });

    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    return { template, counts, total };
  });
}

interface CellDetail {
  template: IFleetTemplate;
  category: string;
  count: number;
  dimension: string;
}

export default function FleetHeatmapSection() {
  const [viewMode, setViewMode] = useState<'role' | 'type'>('role');
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const categories = viewMode === 'role' ? ROLES : TYPES;
  const matrix = useMemo(() => buildMatrix(viewMode, categories), [viewMode]);

  const allCounts = matrix.flatMap((m) => categories.map((c) => m.counts[c]));
  const maxCount = Math.max(...allCounts, 1);

  return (
    <section id="fleet-heatmap" className="w-full py-16 md:py-20 bg-muted/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Thermometer className="size-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              配队热力图
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            舰队编成的角色与规模分布可视化 — 颜色越亮表示该维度投入越集中
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <button
            onClick={() => { setViewMode('role'); setSelectedCell(null); }}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              viewMode === 'role'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            按角色
          </button>
          <button
            onClick={() => { setViewMode('type'); setSelectedCell(null); }}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              viewMode === 'type'
                ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            按吨位
          </button>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-w-[600px]"
          >
            {/* Header Row: Template Names */}
            <div className="mb-1.5 grid grid-cols-[100px_repeat(3,1fr)] gap-1.5">
              <div className="flex items-center justify-end pr-3 text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
                {viewMode === 'role' ? '角色 \\ 配队' : '吨位 \\ 配队'}
              </div>
              {FLEET_TEMPLATES_DATA.map((t) => (
                <div key={t.id} className="rounded-lg bg-muted/30 px-3 py-2 text-center">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {formatCost(t.totalCost)}
                  </span>
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {categories.map((category, rowIdx) => {
              const rowCounts = matrix.map((m) => m.counts[category]);
              const rowMax = Math.max(...rowCounts, 1);

              return (
                <div key={category} className="mb-1.5 grid grid-cols-[100px_repeat(3,1fr)] gap-1.5">
                  {/* Row Label */}
                  <div className="flex items-center justify-end pr-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-2.5 rounded-full bg-gradient-to-br ${
                          viewMode === 'role'
                            ? ROLE_COLORS[category] || 'from-gray-500 to-gray-400'
                            : 'from-primary/60 to-cyan-400/60'
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {category}
                      </span>
                    </div>
                  </div>

                  {/* Heatmap Cells */}
                  {matrix.map((m, colIdx) => {
                    const count = m.counts[category];
                    const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                    const rowPct = rowMax > 0 ? Math.round((count / rowMax) * 100) : 0;
                    let cellClass: string;
                    if (count === 0) {
                      cellClass = 'bg-muted/10 opacity-30';
                    } else if (viewMode === 'role') {
                      const tiers = ROLE_CELL_CLASSES[category] ?? ROLE_CELL_CLASSES['打击'];
                      cellClass = tiers[getRoleIntensityIndex(count / maxCount)];
                    } else {
                      cellClass = getIntensityClass(count, maxCount);
                    }

                    return (
                      <motion.button
                        key={`${m.template.id}-${category}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: (rowIdx * 3 + colIdx) * 0.04 }}
                        className={`relative rounded-lg px-3 py-3 text-center transition-all duration-200 hover:scale-105 hover:z-10 ${cellClass}`}
                        onClick={() =>
                          setSelectedCell(
                            selectedCell?.template.id === m.template.id && selectedCell?.category === category
                              ? null
                              : { template: m.template, category, count, dimension: viewMode },
                          )
                        }
                      >
                        {count > 0 && (
                          <>
                            {/* 深色模式白字压渐变；浅色模式下低档渐变很淡，改用前景色保证可读 */}
                            <span className="font-mono text-sm font-bold tabular-nums text-white light:text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] light:drop-shadow-none">
                              {count}
                            </span>
                            <div className="mt-0.5">
                              <span className="text-[9px] font-medium text-white/60 light:text-muted-foreground">
                                {rowPct}%
                              </span>
                            </div>
                          </>
                        )}
                        {count === 0 && (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}

            {/* Total Row */}
            <div className="mt-2 grid grid-cols-[100px_repeat(3,1fr)] gap-1.5">
              <div className="flex items-center justify-end pr-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
                  合计
                </span>
              </div>
              {matrix.map((m, i) => (
                <div key={i} className="rounded-lg bg-muted/40 px-3 py-2 text-center">
                  <span className="font-mono text-sm font-bold tabular-nums text-primary">
                    {m.total}
                  </span>
                  <span className="ml-1 text-[10px] text-muted-foreground/60">艘</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span>强度：</span>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((pct) => (
              <div key={pct} className="flex items-center gap-1">
                <div
                  className={`size-3 rounded ${
                    pct === 1.0
                      ? 'bg-gradient-to-br from-primary to-cyan-400 shadow-sm'
                      : pct >= 0.8
                        ? 'bg-gradient-to-br from-primary/80 to-cyan-400/70'
                        : pct >= 0.6
                          ? 'bg-gradient-to-br from-primary/60 to-cyan-400/50'
                          : pct >= 0.4
                            ? 'bg-gradient-to-br from-primary/40 to-cyan-400/30'
                            : 'bg-gradient-to-br from-primary/20 to-cyan-400/15'
                  }`}
                />
                <span>{Math.round(pct * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Info className="size-3" />
            <span>点击方格查看详情</span>
          </div>
        </motion.div>

        {/* Selected Cell Detail */}
        <AnimatePresence>
          {selectedCell && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 overflow-hidden"
            >
              <div className="rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  {selectedCell.template.name} — {selectedCell.category}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">该维度舰船数量</span>
                    <span className="font-mono font-bold tabular-nums text-primary">
                      {selectedCell.count} 艘
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">舰队总规模</span>
                    <span className="font-mono font-bold tabular-nums text-foreground">
                      {selectedCell.template.composition.reduce((s, c) => s + c.count, 0)} 艘
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">舰队总造价</span>
                    <span className="font-mono font-bold tabular-nums text-chart-2">
                      {formatCost(selectedCell.template.totalCost)}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg bg-muted/30 px-4 py-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {selectedCell.template.tacticDescription}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}