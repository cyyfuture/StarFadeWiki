import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords, Zap, ChevronRight, Anchor } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_FLEET_TEMPLATES, type IFleetTemplate } from '@/data/fleettemplates';

const TEMPLATE_ICONS: Record<string, typeof Shield> = {
  '威慑种田舰队': Shield,
  '均衡备战舰队': Swords,
  '决战精锐舰队': Zap,
};

const TEMPLATE_GRADIENTS: Record<string, string> = {
  '威慑种田舰队': 'from-cyan-500/20 via-cyan-500/5 to-transparent',
  '均衡备战舰队': 'from-amber-500/20 via-amber-500/5 to-transparent',
  '决战精锐舰队': 'from-violet-500/20 via-violet-500/5 to-transparent',
};

const TEMPLATE_BORDER_COLORS: Record<string, string> = {
  '威慑种田舰队': 'border-cyan-500/30 hover:border-cyan-400/60',
  '均衡备战舰队': 'border-amber-500/30 hover:border-amber-400/60',
  '决战精锐舰队': 'border-violet-500/30 hover:border-violet-400/60',
};

const TEMPLATE_GLOW_COLORS: Record<string, string> = {
  '威慑种田舰队': 'shadow-cyan-500/15',
  '均衡备战舰队': 'shadow-amber-500/15',
  '决战精锐舰队': 'shadow-violet-500/15',
};

function formatCost(cost: number): string {
  if (cost >= 10000) {
    return `${(cost / 10000).toFixed(2)}万 A`;
  }
  return `${cost.toLocaleString()} A`;
}

export default function TemplatesSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const maxCost = Math.max(...MOCK_FLEET_TEMPLATES.map((t) => t.totalCost));

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="templates" className="w-full py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            标准配队模板
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            三种经典舰队编成方案，覆盖威慑种田、均衡备战与终局决战三大战术场景
          </p>
        </motion.div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MOCK_FLEET_TEMPLATES.map((template, i) => {
            const Icon = TEMPLATE_ICONS[template.name] || Anchor;
            const gradient = TEMPLATE_GRADIENTS[template.name] || 'from-primary/20 via-primary/5 to-transparent';
            const borderColor = TEMPLATE_BORDER_COLORS[template.name] || 'border-primary/30 hover:border-primary/60';
            const glowColor = TEMPLATE_GLOW_COLORS[template.name] || 'shadow-primary/15';
            const costRatio = (template.totalCost / maxCost) * 100;
            const isExpanded = expandedId === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <Card
                  className={`group relative overflow-hidden border bg-card/60 backdrop-blur-sm transition-all duration-300 cursor-pointer ${borderColor} hover:shadow-lg hover:${glowColor}`}
                  onClick={() => toggleExpand(template.id)}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Template Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    {/* Cost Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge
                        variant="outline"
                        className="bg-card/80 backdrop-blur-sm border-primary/30 text-primary font-mono text-sm px-3 py-1"
                      >
                        {formatCost(template.totalCost)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="relative pb-2">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {template.composition.length} 种舰型 · {template.composition.reduce((sum, c) => sum + c.count, 0)} 艘
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    {/* Cost Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">造价占比</span>
                        <span className="font-mono text-foreground tabular-nums">
                          {costRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${
                            template.name === '威慑种田舰队'
                              ? 'from-cyan-500 to-cyan-400'
                              : template.name === '均衡备战舰队'
                                ? 'from-amber-500 to-amber-400'
                                : 'from-violet-500 to-violet-400'
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${costRatio}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>

                    {/* Tactic Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {template.tacticDescription}
                    </p>

                    {/* Composition List - always visible summary */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                        舰队组成
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {template.composition.slice(0, isExpanded ? template.composition.length : 4).map((comp) => (
                          <Badge
                            key={comp.shipName}
                            variant="secondary"
                            className="text-xs font-mono bg-muted/60 border-border/40"
                          >
                            {comp.shipName} ×{comp.count}
                          </Badge>
                        ))}
                        {!isExpanded && template.composition.length > 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-dashed border-muted-foreground/40 text-muted-foreground"
                          >
                            +{template.composition.length - 4} 种
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex items-center justify-center pt-1">
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </motion.div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 pt-2 border-t border-border/40"
                      >
                        {/* Full composition table */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                            完整编成明细
                          </p>
                          <div className="rounded-lg border border-border/40 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-muted/40">
                                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                    舰种
                                  </th>
                                  <th className="text-center px-3 py-2 font-medium text-muted-foreground w-16">
                                    数量
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {template.composition.map((comp, idx) => (
                                  <tr
                                    key={comp.shipName}
                                    className={`${
                                      idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'
                                    } hover:bg-muted/40 transition-colors`}
                                  >
                                    <td className="px-3 py-2 text-foreground font-medium">
                                      {comp.shipName}
                                    </td>
                                    <td className="px-3 py-2 text-center font-mono text-primary tabular-nums">
                                      ×{comp.count}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-muted/30 border-t border-border/40">
                                  <td className="px-3 py-2 font-semibold text-foreground">
                                    合计
                                  </td>
                                  <td className="px-3 py-2 text-center font-mono font-semibold text-primary tabular-nums">
                                    {template.composition.reduce((sum, c) => sum + c.count, 0)} 艘
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* Total cost breakdown */}
                        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                          <span className="text-sm text-muted-foreground">舰队总造价</span>
                          <span className="text-lg font-bold font-mono text-primary tabular-nums">
                            {formatCost(template.totalCost)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
