"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, PieChart, Wallet, TrendingUp, User } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { OnboardingCheck } from '@/components/auth-check';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useBudget();
  const { palette } = useThemeContext();

  const screens = [
    { name: '/', titleKey: 'home', icon: Home },
    { name: '/transactions', titleKey: 'transactions', icon: List },
    { name: '/budget', titleKey: 'budget', icon: PieChart },
    { name: '/finance', titleKey: 'finance', icon: Wallet },
    { name: '/insights', titleKey: 'insights', icon: TrendingUp },
    { name: '/profile', titleKey: 'profile', icon: User },
  ] as const;

  return (
    <OnboardingCheck>
      <div className="flex flex-col h-full w-full bg-background" style={{ backgroundColor: palette.background }}>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav 
          className="flex-shrink-0 w-full flex items-center justify-between px-2 pt-2 pb-[max(env(safe-area-inset-bottom,24px),24px)] border-t shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          {screens.map((screen) => {
            const isActive = pathname === screen.name || (screen.name !== '/' && pathname.startsWith(screen.name));
            const Icon = screen.icon;
            
            return (
              <Link
                key={screen.name}
                href={screen.name}
                className="flex-1 flex flex-col items-center justify-center p-2 rounded-2xl active:scale-95 transition-transform"
              >
                <Icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? palette.primary : palette.muted }}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </OnboardingCheck>
  );
}