'use client';

import { Home, Receipt, WalletCards, TrendingDown, UserRound, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/budget', label: 'Budget', icon: WalletCards },
  { href: '/insights', label: 'Insights', icon: TrendingDown },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

interface MobileNavProps {
  onAdd?: () => void;
}

export function MobileNav({ onAdd }: MobileNavProps) {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={onAdd}
        className="fixed bottom-[82px] right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 md:hidden"
      >
        <Plus size={17} strokeWidth={2.5} />
        Add expense
      </button>
      
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex h-[74px] items-center justify-around border-t border-border/80 bg-card/95 px-1 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[57px] flex-col items-center gap-1 py-2 text-[10px] font-bold transition ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`grid size-8 place-items-center rounded-xl transition ${
                  active ? 'bg-secondary' : ''
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
