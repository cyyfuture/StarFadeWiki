import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import Header from '@/components/Header';
import AppSidebar from '@/components/AppSidebar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ShipFilterBar, { type ShipFilterState } from '@/components/ShipFilterBar';
import ShipCard from '@/components/ShipCard';
import ShipDetailModal from '@/components/ShipDetailModal';
import CompareModal from '@/components/CompareModal';
import SquadronSection from '@/components/SquadronSection';
import RulesSection from '@/components/RulesSection';
import TemplatesSection from '@/components/TemplatesSection';
import RankingsSection from '@/components/RankingsSection';
import StarfieldBackground from '@/components/StarfieldBackground';

import { MOCK_SHIPS, type IShip } from '@/data/ships';

const TYPE_ORDER = ['小型', '中型', '大型', '旗舰'] as const;
const TYPE_ANCHORS: Record<string, string> = {
  '小型': 'ships-small',
  '中型': 'ships-medium',
  '大型': 'ships-large',
  '旗舰': 'ships-flagship',
};

export default function WikiHomePage() {
  // --- 筛选/排序/搜索状态 ---
  const [shipFilter, setShipFilter] = useState<ShipFilterState>({
    types: [],
    roles: [],
    sortBy: 'cost-asc',
    keyword: '',
  });

  // --- 舰船详情 ---
  const [detailShip, setDetailShip] = useState<IShip | null>(null);

  // --- 对比 ---
  const [selectedShipIds, setSelectedShipIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  // --- 侧边栏折叠 ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- 主题 ---
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('__wiki_theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('__wiki_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  // --- 筛选 + 排序 + 搜索 ---
  const filteredShips = useMemo(() => {
    let result = [...MOCK_SHIPS];

    if (shipFilter.types.length > 0) {
      const types = new Set(shipFilter.types);
      result = result.filter((s) => types.has(s.type));
    }
    if (shipFilter.roles.length > 0) {
      const roles = new Set(shipFilter.roles);
      result = result.filter((s) => roles.has(s.role));
    }
    if (shipFilter.keyword.trim()) {
      const kw = shipFilter.keyword.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.coreFeatures.toLowerCase().includes(kw) ||
          s.efficiencyPosition.toLowerCase().includes(kw),
      );
    }

    const numA = (v: number | string) => (typeof v === 'number' ? v : 0);
    result.sort((a, b) => {
      switch (shipFilter.sortBy) {
        case 'cost-asc':
          return a.cost - b.cost;
        case 'cost-desc':
          return b.cost - a.cost;
        case 'fp-asc':
          return numA(a.regularFP) - numA(b.regularFP);
        case 'fp-desc':
          return numA(b.regularFP) - numA(a.regularFP);
        case 'ratio-asc':
          return numA(a.regularCostFPRatio) - numA(b.regularCostFPRatio);
        case 'ratio-desc':
          return numA(b.regularCostFPRatio) - numA(a.regularCostFPRatio);
        case 'maintenance-asc':
          return a.monthlyMaintenance - b.monthlyMaintenance;
        case 'maintenance-desc':
          return b.monthlyMaintenance - a.monthlyMaintenance;
        default:
          return a.cost - b.cost;
      }
    });

    return result;
  }, [shipFilter]);

  // --- 舰船分组（按类型 + 锚点） ---
  const shipGroups = useMemo(() => {
    if (shipFilter.types.length > 0) {
      return [{ type: '', label: '', anchor: '', ships: filteredShips }];
    }
    return TYPE_ORDER
      .filter((t) => filteredShips.some((s) => s.type === t))
      .map((t) => ({
        type: t,
        label: t,
        anchor: TYPE_ANCHORS[t],
        ships: filteredShips.filter((s) => s.type === t),
      }));
  }, [filteredShips, shipFilter.types]);

  // --- 对比操作 ---
  const toggleShipSelection = useCallback((id: string) => {
    setSelectedShipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 5) {
          toast.warning('最多选择5艘舰船进行对比');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectedShips = useMemo(
    () => MOCK_SHIPS.filter((s) => selectedShipIds.has(s.id)),
    [selectedShipIds],
  );

  const handleOpenCompare = useCallback(() => {
    if (selectedShipIds.size < 2) {
      toast.warning('请至少选择2艘舰船进行对比');
      return;
    }
    setCompareOpen(true);
  }, [selectedShipIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedShipIds(new Set());
  }, []);

  const handleSearchFromHeader = useCallback((keyword: string) => {
    setShipFilter((prev) => ({ ...prev, keyword }));
    const shipsSection = document.getElementById('ships');
    if (shipsSection) {
      shipsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const renderShipGrid = (ships: IShip[]) => (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {ships.map((ship, i) => (
        <motion.div
          key={ship.id}
          layout
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: (i % 8) * 0.03 }}
        >
          <ShipCard
            ship={ship}
            selected={selectedShipIds.has(ship.id)}
            onToggleSelect={() => toggleShipSelection(ship.id)}
            onClickDetail={() => setDetailShip(ship)}
          />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <StarfieldBackground />

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onSearch={handleSearchFromHeader}
      />

      <div className="flex">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
          }`}
        >
          {/* Hero */}
          <section id="hero" className="w-full">
            <HeroSection />
          </section>

          {/* 舰船数据总表 */}
          <section id="ships" className="w-full py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  <span className="text-primary">◆</span>{' '}
                  全舰种数据总表
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {MOCK_SHIPS.length} 种舰船
                  </span>
                </h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  按造价从低到高排序，点击卡片查看完整数据，勾选多艘舰船进行对比
                </p>
              </motion.div>

              <ShipFilterBar onFilterChange={setShipFilter} />

              {/* 类型快捷导航 */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-5 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-muted-foreground mr-1">快速跳转:</span>
                {TYPE_ORDER.map((t) => {
                  const count = MOCK_SHIPS.filter((s) => s.type === t).length;
                  return (
                    <a
                      key={t}
                      href={`#${TYPE_ANCHORS[t]}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                    >
                      {t}舰
                      <span className="text-[10px] opacity-60">({count})</span>
                    </a>
                  );
                })}
              </motion.div>

              {/* 舰船卡片（按类型分组） */}
              {filteredShips.length > 0 ? (
                <div className="mt-6 space-y-10">
                  {shipGroups.map((group, gi) => (
                    <div key={group.type || 'all'}>
                      {group.type && (
                        <motion.div
                          id={group.anchor}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center gap-3 mb-4 pb-2 border-b border-border/30"
                        >
                          <span className="text-lg font-semibold text-foreground/90">
                            {group.type}舰船
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.ships.length} 种
                          </span>
                        </motion.div>
                      )}
                      {renderShipGrid(group.ships)}
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">未找到匹配舰船</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    尝试调整筛选条件或搜索关键词
                  </p>
                  <button
                    className="mt-4 text-sm text-primary hover:underline"
                    onClick={() => setShipFilter({ types: [], roles: [], sortBy: 'cost-asc', keyword: '' })}
                  >
                    重置所有筛选
                  </button>
                </motion.div>
              )}

              {/* 对比浮动按钮 */}
              {selectedShipIds.size >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
                >
                  <div className="flex items-center gap-3 bg-card/90 backdrop-blur-xl border border-primary/30 rounded-full px-5 py-3 shadow-lg shadow-primary/10">
                    <span className="text-sm text-muted-foreground">
                      已选 <span className="text-primary font-semibold">{selectedShipIds.size}</span> 艘
                    </span>
                    <button
                      onClick={handleOpenCompare}
                      className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      开始对比
                    </button>
                    <button
                      onClick={handleClearSelection}
                      className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      清除
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* 舰载机中队 */}
          <section id="squadrons" className="w-full py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
              <SquadronSection />
            </div>
          </section>

          {/* 跑团战斗规则 */}
          <section id="rules" className="w-full py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
              <RulesSection />
            </div>
          </section>

          {/* 三大配队模板 */}
          <section id="templates" className="w-full py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
              <TemplatesSection />
            </div>
          </section>

          {/* 效率梯队排名 */}
          <section id="rankings" className="w-full py-12 md:py-16">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
              <RankingsSection />
            </div>
          </section>

          <Footer />
        </main>
      </div>

      <ShipDetailModal
        ship={detailShip}
        open={!!detailShip}
        onOpenChange={(open) => {
          if (!open) setDetailShip(null);
        }}
      />

      <CompareModal
        ships={selectedShips}
        open={compareOpen}
        onOpenChange={(open) => {
          if (!open) setCompareOpen(false);
        }}
        onRemoveShip={toggleShipSelection}
      />
    </div>
  );
}