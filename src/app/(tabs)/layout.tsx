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
      <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background overflow-hidden" style={{ backgroundColor: palette.background }}>
        
        {/* Sidebar (Desktop) */}
        <nav 
          className="hidden md:flex flex-col w-[80px] lg:w-[240px] h-full border-r shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-50 pt-8 pb-4 px-3 gap-2 flex-shrink-0"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <div className="mb-8 px-3 hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: palette.primary }}>
              <Wallet size={18} color="white" />
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: palette.foreground }}>Budgetly</h1>
          </div>
          {screens.map((screen) => {
            const isActive = pathname === screen.name || (screen.name !== '/' && pathname.startsWith(screen.name));
            const Icon = screen.icon;
            
            return (
              <Link
                key={screen.name}
                href={screen.name}
                className="flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 rounded-2xl transition-all active:scale-95"
                style={{ backgroundColor: isActive ? `${palette.primary}15` : 'transparent' }}
                title={t(screen.titleKey)}
              >
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? palette.primary : palette.muted }}
                />
                <span className="hidden lg:block font-bold text-[15px]" style={{ color: isActive ? palette.primary : palette.foreground }}>
                  {t(screen.titleKey)}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative h-full">
          <div className="w-full max-w-[1200px] mx-auto h-full relative md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Bottom Tab Bar (Mobile) */}
        <nav 
          className="md:hidden flex-shrink-0 w-full flex items-center justify-between px-2 pt-2 pb-[max(env(safe-area-inset-bottom,24px),24px)] border-t shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50"
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