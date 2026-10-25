import { motion } from 'framer-motion';
import {
  Shield,
  Boxes,
  Zap,
  Swords,
  Anchor,
  Crosshair,
} from 'lucide-react';

const METRICS = [
  { icon: Shield, label: '战区指挥容量', value: 'ZC' },
  { icon: Boxes, label: '全域舰船库存', value: 'INV' },
  { icon: Zap, label: '星际全域震慑度', value: 'SZ' },
  { icon: Swords, label: '精锐军团编制', value: 'ELT' },
  { icon: Anchor, label: '持续远洋后勤', value: 'LOG' },
  { icon: Crosshair, label: '星际战略特种打击', value: 'STK' },
];

export default function HeroSection() {
  return (
    // 星空由全局 StarfieldBackground（fixed 画布）透出：不再维护局部第二份星空实现，
    // 因此根节点不做不透明底色。区块锚点 id="hero" 由 WikiHomePage 编排层输出。
    <section className="relative w-full overflow-hidden py-24 md:py-36">
      {/* 网格线装饰 */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* 顶部光晕 */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-[1] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1
            className="text-4xl font-bold tracking-wider text-foreground md:text-6xl lg:text-7xl"
            style={{
              textShadow:
                '0 0 40px rgba(0,200,255,0.5), 0 0 80px rgba(0,200,255,0.25), 0 0 120px rgba(0,200,255,0.12)',
            }}
          >
            星海舰队桌游
            <br />
            <span
              className="bg-gradient-to-r from-primary via-blue-300 to-accent bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 0 18px rgba(0,200,255,0.55))',
              }}
            >
              数据总册
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-base tracking-[0.15em] text-muted-foreground md:text-lg"
          >
            36种舰船 + 7种舰载机 + 完整跑团规则
          </motion.p>

          {/* 装饰分割线 */}
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <div className="size-2 rotate-45 border border-primary/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </motion.div>

        {/* 六大核心指标 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.45 + i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 0 28px rgba(0,200,255,0.25)',
                  borderColor: 'rgba(0,200,255,0.5)',
                  transition: { duration: 0.2 },
                }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-primary/15 bg-card/75 px-4 py-6 backdrop-blur-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="size-6 text-primary" />
                </div>
                <span className="text-center text-xs font-medium tracking-wider text-muted-foreground md:text-sm">
                  {m.label}
                </span>
                <span className="text-lg font-bold tracking-[0.1em] text-primary md:text-xl">
                  {m.value}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 底部扫描线 */}
        <div className="mx-auto mt-14 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </section>
  );
}
