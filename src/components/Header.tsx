import { useState, useEffect, useCallback } from 'react';
import { NavLink } from '@lark-apaas/client-toolkit-lite';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { UniversalLink } from '@lark-apaas/client-toolkit-lite';

const NAV_ITEMS = [
  { label: '首页', anchor: '#hero' },
  { label: '舰船数据', anchor: '#ships' },
  { label: '舰载机', anchor: '#squadrons' },
  { label: '战斗规则', anchor: '#rules' },
  { label: '配队模板', anchor: '#templates' },
  { label: '效率排名', anchor: '#rankings' },
] as const;

export default function Header() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = scopedStorage.getItem('__wiki_theme');
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
      scopedStorage.setItem('__wiki_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchKeyword.trim()) return;
      setSearchOpen(false);
      setSearchKeyword('');
      const shipsSection = document.getElementById('ships');
      if (shipsSection) {
        shipsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [searchKeyword],
  );

  const handleNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl border-b border-primary/15">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <UniversalLink
          to="#hero"
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <div className="size-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-[0_0_12px_rgba(0_229_255_0.3)]">
            SF
          </div>
          <span className="hidden sm:inline text-sm font-semibold tracking-wide text-foreground">
            星海舰队Wiki
          </span>
        </UniversalLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.anchor}
              to={item.anchor}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
              <Input
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索舰种…"
                className="h-9 w-36 md:w-48 bg-muted/50 border-primary/20 text-sm focus-visible:ring-primary/50"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchKeyword('');
                }}
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
            >
              <Search className="size-4" />
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 lg:hidden text-muted-foreground hover:text-foreground"
                aria-label="菜单"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card/95 backdrop-blur-xl border-l border-primary/15 pt-14">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.anchor}
                    to={item.anchor}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-primary bg-primary/10 border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-2 border-transparent'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
