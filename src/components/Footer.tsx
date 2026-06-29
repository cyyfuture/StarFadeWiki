import { NavLink } from '@lark-apaas/client-toolkit-lite';

const FOOTER_LINKS = [
  { label: '首页', to: '#hero' },
  { label: '舰船数据', to: '#ships' },
  { label: '舰载机', to: '#squadrons' },
  { label: '战斗规则', to: '#rules' },
  { label: '配队模板', to: '#templates' },
  { label: '效率排名', to: '#rankings' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/30 bg-card/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* 顶部装饰线 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
            <span className="size-1.5 rounded-full bg-secondary shadow-[0_0_6px_var(--secondary)]" />
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* 主内容区 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 左侧 Logo + 版权 */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-foreground tracking-wide">
                星海舰队 Wiki
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Star Fleet Tabletop Wiki. 仅供桌游玩家参考使用.
            </p>
          </div>

          {/* 中间导航链接 */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {FOOTER_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-xs transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* 右侧装饰文字 */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase">
              Powered by Star Fleet Command
            </span>
            <span className="size-1 rounded-full bg-primary/40" />
            <span className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase">
              v2.0
            </span>
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="flex items-center gap-3 mt-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          <div className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-secondary/60" />
            <span className="size-1 rounded-full bg-primary/60" />
            <span className="size-1 rounded-full bg-secondary/60" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
      </div>
    </footer>
  );
}
