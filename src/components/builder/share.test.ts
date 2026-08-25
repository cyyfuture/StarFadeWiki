import { describe, it, expect } from 'vitest';
import { toBase64Url, fromBase64Url } from './share';

describe('fleet share codec', () => {
  it('base64url 往返一致（含中文）', () => {
    const json = JSON.stringify({ version: 1, units: [{ shipId: '1', count: 20 }], note: '私掠船海' });
    const round = fromBase64Url(toBase64Url(json));
    expect(round).toBe(json);
  });

  it('输出不含 + / = 等 URL 敏感字符', () => {
    const out = toBase64Url(JSON.stringify({ a: '??##中文++//' }));
    expect(out).not.toMatch(/[+/=]/);
  });

  it('非法输入返回 null 不抛异常', () => {
    expect(fromBase64Url('!!!not-base64!!!')).toBeNull();
  });
});
