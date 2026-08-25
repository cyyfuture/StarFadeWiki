import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { SHIPS_DATA } from '@/data/ships';

const SECTIONS = [
  { label: '首页', anchor: '#hero' },
  { label: '舰船数据', anchor: '#ships' },
  { label: '舰载机', anchor: '#squadrons' },
  { label: '战斗规则', anchor: '#rules' },
  { label: '配队模板', anchor: '#templates' },
  { label: '配队热力图', anchor: '#fleet-heatmap' },
  { label: '舰队构建器', anchor: '#builder' },
  { label: '效率排名', anchor: '#rankings' },
];

/** 全局命令面板: Ctrl/Cmd+K 呼出，可搜章节与舰船并跳转 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goto = (anchor: string) => {
    setOpen(false);
    document.getElementById(anchor.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
  };

  const gotoShip = (shipId: string) => {
    setOpen(false);
    // 先滚到舰船区，再展开对应卡片（通过自定义事件解耦）
    document.getElementById('ships')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('starfade:open-ship', { detail: shipId }));
    void navigate;
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="命令面板" description="搜索章节或舰船">
      <CommandInput placeholder="输入章节或舰名…" />
      <CommandList>
        <CommandEmpty>未找到匹配项</CommandEmpty>
        <CommandGroup heading="章节">
          {SECTIONS.map((s) => (
            <CommandItem key={s.anchor} onSelect={() => goto(s.anchor)}>
              {s.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="舰船">
          {SHIPS_DATA.map((s) => (
            <CommandItem key={s.id} value={`${s.name} ${s.type} ${s.role}`} onSelect={() => gotoShip(s.id)}>
              <span>{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {s.type} · {s.cost}A
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
