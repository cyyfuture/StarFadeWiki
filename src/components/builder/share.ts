import { useEffect } from 'react';
import { toast } from 'sonner';
import { SHIPS_DATA } from '@/data/ships';
import { useFleet } from '@/context/FleetContext';
import { importFleet } from '@/lib/fleet-math';

/**
 * URL 分享方案: #fleet=<base64url(JSON)>
 * 进页检测到合法 fleet hash → 询问导入；导入后清掉 hash 防刷新重复询问。
 * base64url 编码规避 hash 中 +/= 的 URL 语义问题。
 */
function toBase64Url(json: string): string {
  const b64 = btoa(encodeURIComponent(json));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string | null {
  try {
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(atob(b64));
  } catch {
    return null;
  }
}

export function buildShareUrl(units: { shipId: string; count: number }[], budget: number | null): string {
  const payload = {
    version: 1 as const,
    ...(budget !== null ? { budget } : {}),
    units,
  };
  const base = `${location.origin}${location.pathname}`;
  return `${base}#fleet=${toBase64Url(JSON.stringify(payload))}`;
}

/** 挂载一次: 解析 hash 并询问导入 */
export function useFleetShareListener() {
  const { replaceAll, commandCap } = useFleet();

  useEffect(() => {
    const m = location.hash.match(/^#fleet=(.+)$/);
    if (!m) return;
    const json = fromBase64Url(m[1]);
    if (!json) {
      toast.error('分享链接格式无效');
      return;
    }
    const r = importFleet(json, (id) => SHIPS_DATA.find((s) => s.id === id));
    if ('error' in r) {
      toast.error(`分享方案无法导入: ${r.error}`);
      return;
    }
    replaceAll(r.fleet.units, r.fleet.budget ?? null, r.fleet.commandCap ?? commandCap);
    toast.success(`已从链接导入 ${r.fleet.units.length} 种舰型，正在跳转构建器…`);
    history.replaceState(null, '', location.pathname); // 清 hash 防刷新重复导入
    setTimeout(() => document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' }), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { toBase64Url, fromBase64Url };
