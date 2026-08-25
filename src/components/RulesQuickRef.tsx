import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';
import { MOCK_RULES } from '@/data/rules';
import { MAINTENANCE_FACILITIES, RULE_CONSTANTS } from '@/lib/rules';

/** 全局规则速查: 任意位置按 ? 呼出（输入框聚焦时除外），Esc 关闭 */
export function RulesQuickRef() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;
      // 主键盘 ? (Shift+/) 与数字小键盘均可能触发; e.key === '?' 已覆盖 Shift+/
      if (e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border/60 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="size-5 text-primary" />
            跑团战斗规则速查
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            四条核心机制 + 关键数值。随时按 <kbd className="rounded border border-border bg-muted px-1 text-xs">?</kbd> 再次呼出
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {MOCK_RULES.map((r) => (
            <div key={r.id} className="rounded-md border border-border/50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{r.title}</span>
                <code className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{r.mechanism}</code>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>
              <p className="mt-1.5 border-l-2 border-accent/40 pl-2 text-xs italic text-accent/90">{r.example}</p>
            </div>
          ))}

          <div className="rounded-md border border-border/50 p-3">
            <div className="mb-2 text-sm font-semibold text-foreground">关键数值表</div>
            <table className="w-full text-xs tabular-nums">
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-1 pr-2 text-muted-foreground">战场指挥上限（默认）</td>
                  <td className="py-1 text-right font-mono text-foreground">{RULE_CONSTANTS.COMMAND_CAP_DEFAULT}</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1 pr-2 text-muted-foreground">每超1点ZC惩罚</td>
                  <td className="py-1 text-right font-mono text-destructive">
                    -{RULE_CONSTANTS.OVER_CAP_PENALTY_PER_POINT * 100}% 输出/生存
                  </td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1 pr-2 text-muted-foreground">库存威慑折算</td>
                  <td className="py-1 text-right font-mono text-accent">×{RULE_CONSTANTS.DETERRENCE_STOCKPILE_FACTOR}</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1 pr-2 text-muted-foreground">克制 / 被克倍率</td>
                  <td className="py-1 text-right font-mono text-foreground">
                    ×{RULE_CONSTANTS.COUNTER_MULT} / ×{RULE_CONSTANTS.COUNTERED_MULT}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 align-top text-muted-foreground">维护等级阶梯</td>
                  <td className="py-1 text-right font-mono text-foreground">
                    {MAINTENANCE_FACILITIES.map((f) => `${f.level}.${f.name.slice(0, 4)}`).join(' → ')}
                  </td>
                </tr>
              </tbody>
            </table>
            <a
              href="/rulebook.pdf"
              download
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              下载完整规则书 PDF ↓
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
