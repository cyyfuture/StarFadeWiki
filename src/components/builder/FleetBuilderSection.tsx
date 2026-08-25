import { useState } from 'react';
import { ListPlus, Rocket } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFleetShareListener } from './share';
import { ShipPickerPanel } from './ShipPickerPanel';
import { FleetListPanel } from './FleetListPanel';
import { OptimizePanel } from './OptimizePanel';
import { ExportImportButtons } from './ExportImportButtons';

type MobileTab = 'pick' | 'fleet';

/** 舰队构建器主容器: 桌面双栏 / 移动端 tab 切换 */
export function FleetBuilderSection() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<MobileTab>('pick');
  useFleetShareListener();

  const picker = <ShipPickerPanel />;
  const list = <FleetListPanel />;

  return (
    <div className="space-y-4">
      {/* 顶部: 预算 + 优化 + 导出导入 */}
      <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <OptimizePanel />
        <div className="flex flex-col justify-center">
          <ExportImportButtons />
        </div>
      </div>

      {isMobile ? (
        <>
          {/* 移动端 tab 切换 */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/50 bg-card/40 p-1">
            {(
              [
                { id: 'pick', label: '选择舰船', icon: Rocket },
                { id: 'fleet', label: '我的舰队', icon: ListPlus },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-selected={tab === id}
                role="tab"
                className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm transition-colors ${
                  tab === id ? 'bg-primary/15 font-medium text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
          <div className="h-[70vh] rounded-lg border border-border/40 bg-card/20 p-3">
            {tab === 'pick' ? picker : list}
          </div>
        </>
      ) : (
        /* 桌面双栏 */
        <div className="grid h-[560px] grid-cols-2 gap-4">
          <section
            aria-label="选择舰船"
            className="flex min-h-0 flex-col rounded-lg border border-border/40 bg-card/20 p-4"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Rocket className="size-4 text-primary" />
              选择舰船
            </h3>
            <div className="min-h-0 flex-1">{picker}</div>
          </section>
          <section
            aria-label="我的舰队"
            className="flex min-h-0 flex-col rounded-lg border border-border/40 bg-card/20 p-4"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListPlus className="size-4 text-accent" />
              我的舰队
            </h3>
            <div className="min-h-0 flex-1">{list}</div>
          </section>
        </div>
      )}
    </div>
  );
}
