import { motion } from 'framer-motion';

/**
 * 轻量 SVG 雷达图 —— 替代 echarts 全量引入（原 ReactECharts 仅用于此一个雷达视图，
 * 拖累主 chunk 约 1MB）。仅支持单数据序列，满足效率排名 TOP5 展示需求。
 */
export interface RadarDatum {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDatum[];
  /** 各轴最大值（取排名首位效率值） */
  max: number;
  color?: string;
  height?: number;
}

const SIZE = 320;
const CX = SIZE / 2;
const CY = 138;
const RADIUS = 92;

function polar(angleDeg: number, radiusRatio: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + Math.cos(rad) * RADIUS * radiusRatio,
    y: CY + Math.sin(rad) * RADIUS * radiusRatio,
  };
}

export function RadarChart({ data, max, color = '#00e5ff', height = 260 }: RadarChartProps) {
  const n = data.length;
  if (n < 3) return null;

  const step = 360 / n;
  const safeMax = max > 0 ? max : 1;
  // 数据多边形顶点（值按比例缩放，上限钳制到 1）
  const valuePoints = data
    .map((d, i) => {
      const ratio = Math.min(Math.max(d.value / safeMax, 0), 1);
      const p = polar(i * step, ratio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
  // 同心网格（4 圈）
  const rings = [0.25, 0.5, 0.75, 1].map((r) =>
    Array.from({ length: n }, (_, i) => {
      const p = polar(i * step, r);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ')
  );
  // 轴线端点
  const spokes = Array.from({ length: n }, (_, i) => {
    const p = polar(i * step, 1);
    return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={`${color}44`} strokeWidth={1} />;
  });
  // 轴标签（根据角度决定锚点，避免出界）
  const labels = data.map((d, i) => {
    const p = polar(i * step, 1.24);
    const cosX = Math.cos(((i * step - 90) * Math.PI) / 180);
    const anchor = cosX > 0.3 ? 'start' : cosX < -0.3 ? 'end' : 'middle';
    return (
      <text
        key={d.label}
        x={p.x}
        y={p.y}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontSize={10}
        fill="#8b95a8"
        className="select-none"
      >
        {d.label}
      </text>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${height}`}
      style={{ height }}
      className="w-full"
      role="img"
      aria-label="效率雷达图"
    >
      {/* 网格 */}
      {rings.map((pts, i) => (
        <polygon key={`ring-${i}`} points={pts} fill="none" stroke={`${color}33`} strokeWidth={i === n - 1 ? 1 : 0.6} />
      ))}
      {spokes}
      {/* 数据面 */}
      <motion.polygon
        points={valuePoints}
        fill={`${color}26`}
        stroke={color}
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />
      {/* 数据点 */}
      {data.map((d, i) => {
        const ratio = Math.min(Math.max(d.value / safeMax, 0), 1);
        const p = polar(i * step, ratio);
        return <circle key={`dot-${d.label}`} cx={p.x} cy={p.y} r={3} fill={color} />;
      })}
      {labels}
    </svg>
  );
}
