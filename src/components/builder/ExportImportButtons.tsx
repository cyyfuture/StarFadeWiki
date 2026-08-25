import { useRef, useState } from 'react';
import { ClipboardPaste, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_SHIPS } from '@/data/ships';
import { useFleet, resolveUnits } from '@/context/FleetContext';
import { exportFleet, importFleet } from '@/lib/fleet-math';

/** 导出/导入舰队方案（JSON 文件 + 剪贴板） */
export function ExportImportButtons() {
  const { units, budget, commandCap, replaceAll } = useFleet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const hasUnits = units.length > 0;

  const doExport = () => {
    if (!hasUnits) {
      toast.error('舰队为空，没有可导出的内容');
      return;
    }
    const resolved = resolveUnits(units, MOCK_SHIPS);
    const json = exportFleet(resolved, budget ?? undefined, commandCap);
    try {
      navigator.clipboard.writeText(json);
      toast.success('方案 JSON 已复制到剪贴板');
    } catch {
      // 剪贴板不可用时降级为文件下载
    }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'starfade-fleet-v1.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = (text: string) => {
    const r = importFleet(text, (id) => MOCK_SHIPS.find((s) => s.id === id));
    if ('error' in r) {
      toast.error(r.error);
      return;
    }
    replaceAll(r.fleet.units, r.fleet.budget ?? null, r.fleet.commandCap ?? commandCap);
    toast.success(`已导入 ${r.fleet.units.length} 种舰型`);
    setShowPaste(false);
    setPasteText('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={doExport}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Download className="size-3.5" />
          导出方案
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Upload className="size-3.5" />
          导入文件
        </button>
        <button
          onClick={() => setShowPaste((v) => !v)}
          aria-label="粘贴导入"
          className="flex items-center justify-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ClipboardPaste className="size-3.5" />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          applyImport(await f.text());
          e.target.value = ''; // 允许重复选同一文件
        }}
      />

      {showPaste && (
        <div className="space-y-2 rounded-md border border-border/50 p-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder='粘贴方案 JSON…'
            className="w-full rounded border border-border/60 bg-background/60 p-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowPaste(false)} className="text-xs text-muted-foreground hover:text-foreground">
              取消
            </button>
            <button
              onClick={() => applyImport(pasteText)}
              disabled={!pasteText.trim()}
              className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              导入
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
