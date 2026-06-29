import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  anchor: string;
  children?: NavSection[];
}

const NAV_SECTIONS: NavSection[] = [
  { label: '首页', anchor: '#hero' },
  {
    label: '舰船数据总表',
    anchor: '#ships',
    children: [
      { label: '小型舰船', anchor: '#ships-small' },
      { label: '中型舰船', anchor: '#ships-medium' },
      { label: '大型舰船', anchor: '#ships-large' },
      { label: '旗舰', anchor: '#ships-flagship' },
    ],
  },
  { label: '舰载机中队', anchor: '#squadrons' },
  { label: '跑团战斗规则', anchor: '#rules' },
  { label: '标准配队模板', anchor: '#templates' },
  { label: '效率梯队排名', anchor: '#rankings' },
];

function useActiveAnchor(): string {
  const [active, setActive] = useState('#hero');
  const location = useLocation();

  useEffect(() => {
    const anchors = NAV_SECTIONS.flatMap((s) => [s.anchor, ...(s.children?.map((c) => c.anchor) ?? [])]);
    const els = anchors.map((a) => document.getElementById(a.replace('#', ''))).filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const id = `#${visible[0].target.id}`;
          setActive(id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  return active;
}

interface NavItemProps {
  section: NavSection;
  activeAnchor: string;
  depth?: number;
  collapsed: boolean;
  onNavigate?: () => void;
}

function NavItem({ section, activeAnchor, depth = 0, collapsed, onNavigate }: NavItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = section.children && section.children.length > 0;
  const isActive = activeAnchor === section.anchor;
  const childActive = hasChildren && section.children!.some((c) => activeAnchor === c.anchor);

  useEffect(() => {
    if (childActive) setExpanded(true);
  }, [childActive]);

  if (collapsed) {
    return (
      <div className="relative flex justify-center py-1">
        <NavLink
          to={section.anchor}
          onClick={onNavigate}
          className={({ isActive: linkActive }) =>
            cn(
              'flex items-center justify-center size-9 rounded-lg transition-colors duration-200',
              linkActive || isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )
          }
        >
          <div className="size-1.5 rounded-full bg-current" />
        </NavLink>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <NavLink
          to={section.anchor}
          onClick={onNavigate}
          className={({ isActive: linkActive }) =>
            cn(
              'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              linkActive || isActive
                ? 'bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_rgba(0_229_255_0.25)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
              depth > 0 && 'pl-8 text-xs',
            )
          }
        >
          {depth === 0 && (
            <span
              className={cn(
                'size-1.5 rounded-full shrink-0',
                isActive ? 'bg-primary shadow-[0_0_6px_rgba(0_229_255_0.6)]' : 'bg-muted-foreground/40',
              )}
            />
          )}
          <span className="truncate">{section.label}</span>
        </NavLink>
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? '折叠' : '展开'}
          >
            <ChevronDown className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')} />
          </Button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-4 border-l border-border/50 pl-2 py-1 space-y-0.5">
              {section.children!.map((child) => (
                <NavItem
                  key={child.anchor}
                  section={child}
                  activeAnchor={activeAnchor}
                  depth={depth + 1}
                  collapsed={false}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeAnchor = useActiveAnchor();
  const sidebarRef = useRef<HTMLElement>(null);

  // Close mobile sidebar on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  const handleNavigate = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <nav className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-4 border-b border-border/40',
          collapsed && 'justify-center px-2',
        )}
      >
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <div className="size-7 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <div className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0_229_255_0.6)]" />
            </div>
            <span className="text-sm font-semibold text-foreground truncate">目录导航</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          <ChevronRight className={cn('size-4 transition-transform duration-300', !collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_SECTIONS.map((section) => (
          <NavItem
            key={section.anchor}
            section={section}
            activeAnchor={activeAnchor}
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-border/40 space-y-2">
          <a
            href="/rulebook.pdf"
            download
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <FileText className="size-3.5" />
            <span>完整规则书 PDF</span>
            <Download className="size-3 ml-auto" />
          </a>
          <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
            星海舰队 Wiki · v1.0
          </p>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden size-9 rounded-lg bg-card/80 backdrop-blur-md border border-border/40 text-foreground hover:bg-card"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="打开目录"
      >
        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-card/95 backdrop-blur-xl border-r border-border/40 shadow-2xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop fixed sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'hidden lg:flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] bg-card/80 backdrop-blur-xl border-r border-border/40 z-30 transition-all duration-300',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
