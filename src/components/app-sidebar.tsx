'use client';

import { Home, Receipt, WalletCards, TrendingDown, UserRound, Target, Bell, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/budget', label: 'Budget', icon: WalletCards },
  { href: '/insights', label: 'Insights', icon: TrendingDown },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function AppSidebar() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="logo-crop transition-transform group-hover:rotate-[-4deg]">
          <img src="/budgetly-logo-mark.png" alt="Budgetly" />
        </span>
        <span className="text-[21px] font-bold tracking-[-.05em] text-sidebar-foreground">
          Budgetly<span className="text-[#5d91f0]">.</span>
        </span>
      </Link>
      
      <p className="mb-3 mt-14 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/45">
        Your money
      </p>
      
      <nav className="space-y-1" aria-label="Primary navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_#5d91f0]'
                  : 'text-sidebar-foreground/64 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
              {label}
              {label === 'Insights' && (
                <span className="ml-auto rounded-full bg-[#5d91f0]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a9c4ff]">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto space-y-1">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/45">
          Quick access
        </p>
        <Link
          href="/goal"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-sidebar-foreground/64 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Target size={17} />
          Goals
        </Link>
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-sidebar-foreground/64 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Bell size={17} />
          Notifications
          <span className="ml-auto size-2 rounded-full bg-[#F0A322]" />
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-sidebar-foreground/64 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings size={17} />
          Settings
        </Link>
        
        <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border pt-5">
          <span className="grid size-9 place-items-center rounded-full bg-[#dbe7ff] text-xs font-bold text-[#2859D6]">
            YA
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">Yasmine El Amrani</p>
            <p className="truncate text-[11px] text-sidebar-foreground/45">Rabat · MAD</p>
          </div>
          <Link
            href="/profile"
            className="ml-auto text-sidebar-foreground/45 transition hover:text-sidebar-foreground"
            aria-label="Open profile"
          >
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
