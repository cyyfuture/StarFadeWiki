import { useEffect, useRef } from 'react';
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

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let w = 0;
    let h = 0;

    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: Math.random() * 1.6 + 0.3,
        speed: Math.random() * 0.25 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const resize = () => {
      w = canvas.parentElement?.clientWidth ?? window.innerWidth;
      h = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > h + 4) {
          s.y = -4;
          s.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${s.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[rgb(10_12_28)] py-24 md:py-36"
    >
      {/* 星空粒子背景 */}
      <StarfieldCanvas />

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
        className="pointer-events-none absolute left-1/2 top-0 z-[1] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[rgb(0_200_255_/_0.06)] blur-[120px]"
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
            className="text-4xl font-bold tracking-wider md:text-6xl lg:text-7xl"
            style={{
              textShadow:
                '0 0 40px rgba(0,200,255,0.5), 0 0 80px rgba(0,200,255,0.25), 0 0 120px rgba(0,200,255,0.12)',
              color: '#e0f0ff',
            }}
          >
            星海舰队桌游
            <br />
            <span
              className="bg-gradient-to-r from-[rgb(0_220_255)] via-[rgb(100_200_255)] to-[rgb(255_200_80)] bg-clip-text text-transparent"
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
            className="mt-5 text-base tracking-[0.15em] text-[rgb(140_190_220)] md:text-lg"
          >
            36种舰船 + 7种舰载机 + 完整跑团规则
          </motion.p>

          {/* 装饰分割线 */}
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgb(0_200_255_/_0.5)]" />
            <div className="size-2 rotate-45 border border-[rgb(0_200_255_/_0.5)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgb(0_200_255_/_0.5)]" />
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
                className="group flex flex-col items-center gap-3 rounded-xl border border-[rgb(0_200_255_/_0.12)] bg-[rgb(15_18_38_/_0.75)] px-4 py-6 backdrop-blur-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-[rgb(0_200_255_/_0.08)] transition-colors group-hover:bg-[rgb(0_200_255_/_0.16)]">
                  <Icon className="size-6 text-[rgb(0_200_255)]" />
                </div>
                <span className="text-center text-xs font-medium tracking-wider text-[rgb(120_170_210)] md:text-sm">
                  {m.label}
                </span>
                <span className="text-lg font-bold tracking-[0.1em] text-[rgb(0_220_255)] md:text-xl">
                  {m.value}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 底部扫描线 */}
        <div className="mx-auto mt-14 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-[rgb(0_200_255_/_0.3)] to-transparent" />
      </div>
    </section>
  );
}
