import { useState, useCallback, type FormEvent } from 'react';
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
  onFilterChange: (filters: ShipFilterState) => void;
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

export default function ShipFilterBar({ onFilterChange }: ShipFilterBarProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('cost-asc');
  const [keyword, setKeyword] = useState('');

  const emit = useCallback(
    (overrides: Partial<ShipFilterState>) => {
      const next: ShipFilterState = { types, roles, sortBy, keyword, ...overrides };
      onFilterChange(next);
    },
    [types, roles, sortBy, keyword, onFilterChange],
  );

  const toggleType = (t: string) => {
    const next = types.includes(t) ? types.filter((v) => v !== t) : [...types, t];
    setTypes(next);
    emit({ types: next });
  };

  const toggleRole = (r: string) => {
    const next = roles.includes(r) ? roles.filter((v) => v !== r) : [...roles, r];
    setRoles(next);
    emit({ roles: next });
  };

  const handleSortChange = (v: string) => {
    setSortBy(v);
    emit({ sortBy: v });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    emit({ keyword });
  };

  const clearAll = () => {
    setTypes([]);
    setRoles([]);
    setSortBy('cost-asc');
    setKeyword('');
    emit({ types: [], roles: [], sortBy: 'cost-asc', keyword: '' });
  };

  const hasActiveFilters = types.length > 0 || roles.length > 0 || keyword !== '';

  return (
    <div className="w-full space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索舰种名称..."
            className="bg-card pl-9 pr-9 border-border/60 focus-visible:ring-primary/50"
          />
          {keyword && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="!absolute right-1.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                setKeyword('');
                emit({ keyword: '' });
              }}
              aria-label="清除搜索"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="submit" variant="secondary" size="sm" className="shrink-0">
          搜索
        </Button>
      </form>

      {/* 筛选控件行 */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />

        {/* 类型筛选 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">类型:</span>
          {SHIP_TYPES.map((t) => (
            <Badge
              key={t}
              variant={types.includes(t) ? 'default' : 'outline'}
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
              variant={roles.includes(r) ? 'default' : 'outline'}
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
          <Select value={sortBy} onValueChange={handleSortChange}>
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
