import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords, Scale, Wrench, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_RULES, type IRule } from '@/data/rules';

const RULE_ICONS: Record<string, typeof Shield> = {
  '指挥上限机制': Swords,
  '威慑判定剧情机制': Shield,
  '克制倍率': Scale,
  '维护需求等级': Wrench,
};

const MAINTENANCE_LEVELS = [
  { level: 1, label: '前线补给站', desc: '基础维修与弹药补给', color: 'bg-chart-1' },
  { level: 2, label: '标准行星星港', desc: '中型舰船维护与改装', color: 'bg-chart-2' },
  { level: 3, label: '大型轨道船坞', desc: '大型舰船建造与深度维修', color: 'bg-chart-3' },
  { level: 4, label: '巨型旗舰船坞', desc: '旗舰级建造与终极维护', color: 'bg-chart-4' },
];

interface RulesSectionProps {
  id?: string;
}

export default function RulesSection({ id }: RulesSectionProps) {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(MOCK_RULES[0]?.id ?? null);

  const toggleRule = (ruleId: string) => {
    setExpandedRuleId(prev => (prev === ruleId ? null : ruleId));
  };

  const sortedRules = useMemo(() => MOCK_RULES, []);

  return (
    <section id={id} className="w-full py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 区块标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            <span className="text-primary">跑团战斗</span>简化规则
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            核心战斗机制速查——指挥上限、威慑判定、克制倍率、维护等级
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-5 flex justify-center"
          >
            <a
              href="/rulebook.pdf"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 text-sm font-medium"
            >
              <FileText className="size-4" />
              下载完整规则书 PDF
              <Download className="size-3.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* 规则卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sortedRules.map((rule, i) => {
            const Icon = RULE_ICONS[rule.title] || Shield;
            const isExpanded = expandedRuleId === rule.id;

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card
                  className="group cursor-pointer border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
                  onClick={() => toggleRule(rule.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base md:text-lg">{rule.title}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {rule.mechanism}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="shrink-0 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* 展开内容 */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-5 space-y-3">
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/30">
                        <p className="text-sm text-foreground/85 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                        <p className="text-xs text-primary font-mono uppercase tracking-wide mb-1">
                          示例
                        </p>
                        <p className="text-sm text-foreground/75 leading-relaxed">
                          {rule.example}
                        </p>
                      </div>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 维护等级阶梯可视化 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 shrink-0 rounded-lg bg-chart-4/15 flex items-center justify-center">
                  <Wrench className="size-5 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">维护需求等级阶梯</CardTitle>
                  <CardDescription className="text-xs">
                    从基础补给到旗舰船坞——四级维护体系
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MAINTENANCE_LEVELS.map((ml, i) => (
                  <motion.div
                    key={ml.level}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="relative flex flex-col items-center text-center p-4 rounded-xl border border-border/30 bg-muted/20"
                  >
                    {/* 等级徽章 */}
                    <div
                      className={`size-12 rounded-full ${ml.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-3`}
                      style={{
                        boxShadow: `0 0 20px var(--chart-${ml.level})`,
                      }}
                    >
                      {ml.level}
                    </div>

                    {/* 进度条 */}
                    <div className="w-full h-1.5 rounded-full bg-muted/60 mb-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${ml.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(ml.level / 4) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>

                    <span className="text-sm font-semibold text-foreground">{ml.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{ml.desc}</span>

                    {/* 连接箭头（非最后一个） */}
                    {i < MAINTENANCE_LEVELS.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                        <ChevronDown className="size-5 rotate-[-90deg]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
