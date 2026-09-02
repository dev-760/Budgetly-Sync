'use client';

import { useState } from 'react';
import { CalendarDays, Bell, ChevronRight, Plus, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopbarProps {
  onAdd?: () => void;
}

export function Topbar({ onAdd }: TopbarProps) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [month, setMonth] = useState('May 2024');
  const pathname = usePathname();
  
  const title = pathname === '/' 
    ? 'Home' 
    : pathname.slice(1).split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-border/75 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <button
          className="grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground md:hidden">
            Good morning, Yasmine
          </p>
          <h1 className="text-[22px] font-bold tracking-[-.035em] text-foreground sm:text-[25px]">
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setMonthOpen((open) => !open)}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground shadow-sm transition hover:border-primary/40"
          >
            <CalendarDays size={15} className="text-primary" />
            <span className="hidden sm:inline">{month}</span>
            <span className="sm:hidden">May</span>
            <ChevronRight
              size={14}
              className={`text-muted-foreground transition ${monthOpen ? 'rotate-90' : ''}`}
            />
          </button>
          {monthOpen && (
            <div className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-border bg-card p-1.5 shadow-xl">
              {['May 2024', 'April 2024', 'March 2024'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMonth(item);
                    setMonthOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition hover:bg-secondary ${
                    month === item ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Link
          href="/notifications"
          className="relative grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#F0A322]" />
        </Link>
        
        <button
          onClick={onAdd}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}
