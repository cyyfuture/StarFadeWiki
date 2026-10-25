import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ShipFilterState {
  types: string[];
  roles: string[];
  sortBy: string;
  keyword: string;
}

interface ShipFilterBarProps {
  /** 唯一事实源（由 WikiHomePage 持有，Header 搜索也写入同一 state） */
  value: ShipFilterState;
  onChange: (next: ShipFilterState) => void;
}

const SHIP_TYPES = ['小型', '中型', '大型', '旗舰'] as const;
const SHIP_ROLES = ['打击', '防御', '辅助', '后勤'] as const;

const SORT_OPTIONS = [
  { value: 'cost-asc', label: '造价 ↑' },
  { value: 'cost-desc', label: '造价 ↓' },
  { value: 'fp-asc', label: '常规战力 ↑' },
  { value: 'fp-desc', label: '常规战力 ↓' },
  { value: 'ratio-asc', label: '造价战力比 ↑' },
  { value: 'ratio-desc', label: '造价战力比 ↓' },
  { value: 'maintenance-asc', label: '维护成本 ↑' },
  { value: 'maintenance-desc', label: '维护成本 ↓' },
];

/** 纯受控筛选条：types/roles/sortBy/keyword 全部来自 value，本组件只保留关键词输入的 debounce 缓冲 */
export default function ShipFilterBar({ value, onChange }: ShipFilterBarProps) {
  // 关键词输入草稿：仅 debounce 缓冲，非第二事实源——提交后以 value.keyword 为准，
  // 外部改写（Header 搜索 / 重置）会同步回草稿
  const [keywordDraft, setKeywordDraft] = useState(value.keyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 外部改写关键词 → 同步草稿并取消未决 debounce，防止旧词回写覆盖
  useEffect(() => {
    setKeywordDraft(value.keyword);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [value.keyword]);

  // 本地草稿变化 → debounce 后提交到唯一事实源
  useEffect(() => {
    if (keywordDraft === value.keyword) return;
    debounceRef.current = setTimeout(() => {
      onChange({ ...value, keyword: keywordDraft });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keywordDraft, value, onChange]);

  const toggleType = (t: string) => {
    const next = value.types.includes(t)
      ? value.types.filter((v) => v !== t)
      : [...value.types, t];
    onChange({ ...value, types: next });
  };

  const toggleRole = (r: string) => {
    const next = value.roles.includes(r)
      ? value.roles.filter((v) => v !== r)
      : [...value.roles, r];
    onChange({ ...value, roles: next });
  };

  const commitKeyword = (keyword: string) => {
    setKeywordDraft(keyword);
    onChange({ ...value, keyword });
  };

  const clearAll = () => {
    setKeywordDraft('');
    onChange({ types: [], roles: [], sortBy: 'cost-asc', keyword: '' });
  };

  const hasActiveFilters =
    value.types.length > 0 || value.roles.length > 0 || value.keyword !== '';

  return (
    <div className="w-full space-y-4">
      {/* 搜索栏 — 实时过滤 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            placeholder="实时搜索舰种名称..."
            className="bg-card pl-9 pr-9 border-border/60 focus-visible:ring-primary/50"
          />
          {value.keyword && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="!absolute right-1.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
              onClick={() => commitKeyword('')}
              aria-label="清除搜索"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 筛选控件行 */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />

        {/* 类型筛选 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">类型:</span>
          {SHIP_TYPES.map((t) => (
            <Badge
              key={t}
              variant={value.types.includes(t) ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs"
              onClick={() => toggleType(t)}
            >
              {t}
            </Badge>
          ))}
        </div>

        <div className="w-px h-5 bg-border/50 shrink-0" />

        {/* 定位筛选 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">定位:</span>
          {SHIP_ROLES.map((r) => (
            <Badge
              key={r}
              variant={value.roles.includes(r) ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs"
              onClick={() => toggleRole(r)}
            >
              {r}
            </Badge>
          ))}
        </div>

        <div className="w-px h-5 bg-border/50 shrink-0" />

        {/* 排序 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">排序:</span>
          <Select
            value={value.sortBy}
            onValueChange={(v) => onChange({ ...value, sortBy: v })}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs bg-card border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 清除所有筛选 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground ml-auto"
            onClick={clearAll}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            清除筛选
          </Button>
        )}
      </div>
    </div>
  );
}
