import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, TrendingUp } from 'lucide-react';
import { MOCK_RANKINGS, type IRankingCategory } from '@/data/rankings';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '存在舰队威慑效率': Trophy,
  '战场打击力效率': Zap,
  '长期运营性价比': TrendingUp,
};

const CATEGORY_COLORS: Record<string, { bar: string; glow: string }> = {
  '存在舰队威慑效率': { bar: 'bg-primary', glow: 'shadow-primary/40' },
  '战场打击力效率': { bar: 'bg-chart-2', glow: 'shadow-chart-2/40' },
  '长期运营性价比': { bar: 'bg-secondary', glow: 'shadow-secondary/40' },
};

const RANK_BADGES: Record<number, string> = {
  1: 'bg-primary text-primary-foreground',
  2: 'bg-chart-2/80 text-white',
  3: 'bg-chart-3/80 text-white',
  4: 'bg-muted-foreground/50 text-foreground',
  5: 'bg-muted-foreground/30 text-foreground',
};

function RankingCard({ category }: { category: IRankingCategory }) {
  const Icon = CATEGORY_ICONS[category.category] || Trophy;
  const colors = CATEGORY_COLORS[category.category] || { bar: 'bg-primary', glow: 'shadow-primary/40' };
  const maxValue = category.items[0]?.efficiencyValue ?? 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm"
    >
      {/* 顶部发光条 */}
      <div className={`h-1 w-full ${colors.bar} rounded-t-xl`} />

      <div className="p-5 md:p-6">
        {/* 标题行 */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${colors.bar} ${colors.glow} shadow-lg`}>
            <Icon className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground md:text-base">
              {category.category}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>

        {/* 排名列表 */}
        <div className="space-y-3">
          {category.items.map((item, index) => {
            const percentage = Math.round((item.efficiencyValue / maxValue) * 100);
            const badgeClass = RANK_BADGES[item.rank] || 'bg-muted text-muted-foreground';

            return (
              <motion.div
                key={item.shipName}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3"
              >
                {/* 排名徽章 */}
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${badgeClass}`}
                >
                  {item.rank}
                </span>

                {/* 舰船名称 */}
                <span className="w-28 shrink-0 truncate text-sm font-medium text-foreground">
                  {item.shipName}
                </span>

                {/* 进度条 */}
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    className={`h-full rounded-full ${colors.bar} ${colors.glow}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    style={{ boxShadow: `0 0 8px currentColor` }}
                  />
                </div>

                {/* 效率值 */}
                <span className="w-10 shrink-0 text-right text-xs font-mono tabular-nums text-muted-foreground">
                  {item.efficiencyValue}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function RankingsSection() {
  return (
    <section id="rankings" className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* 区块标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            核心效率梯队排名
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            基于威慑力、打击力与运营性价比的多维度效率评估
          </p>
        </motion.div>

        {/* 三列排名卡片 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_RANKINGS.map((category) => (
            <RankingCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
