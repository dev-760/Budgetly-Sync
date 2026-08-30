"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, PieChart, Wallet, TrendingUp, User } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { OnboardingCheck } from '@/components/auth-check';
import { BrandLockup } from '@/components/budget-ui';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useBudget();
  const { palette } = useThemeContext();

  const tabs = [
    { name: '/', label: t('home'), icon: Home },
    { name: '/transactions', label: t('transactions'), icon: List },
    { name: '/budget', label: t('budget'), icon: PieChart },
    { name: '/finance', label: t('finance'), icon: Wallet },
    { name: '/insights', label: t('insights'), icon: TrendingUp },
    { name: '/profile', label: t('profile'), icon: User },
  ];

  return (
    <OnboardingCheck>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
        <aside 
          className="hidden md:flex flex-col w-64 border-r py-8 px-5 shrink-0"
          style={{ 
            backgroundColor: palette.surface,
            borderColor: palette.border 
          }}
        >
          <div className="mb-10 pl-2">
            <BrandLockup compact />
          </div>
          
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.name || (tab.name !== '/' && pathname.startsWith(tab.name));
              const Icon = tab.icon;
              
              return (
                <Link
                  key={tab.name}
                  href={tab.name}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  style={{
                    backgroundColor: isActive ? palette.primary + '15' : 'transparent',
                  }}
                >
                  <Icon 
                    size={22} 
                    color={isActive ? palette.primary : palette.foreground}
                  />
                  <span 
                    className={cn("text-sm", isActive ? "font-extrabold" : "font-semibold")}
                    style={{ 
                      color: isActive ? palette.primary : palette.foreground 
                    }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          {/* Mobile Bottom Nav (visible on mobile, hidden on md+) */}
          <nav 
            className="md:hidden border-t flex justify-around items-center py-2 px-4 shrink-0"
            style={{ 
              backgroundColor: palette.surface,
              borderColor: palette.border 
            }}
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.name || (tab.name !== '/' && pathname.startsWith(tab.name));
              const Icon = tab.icon;
              
              return (
                <Link
                  key={tab.name}
                  href={tab.name}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                  )}
                  style={{
                    backgroundColor: isActive ? palette.primary + '15' : 'transparent',
                  }}
                >
                  <Icon 
                    size={20} 
                    color={isActive ? palette.primary : palette.foreground}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: isActive ? palette.primary : palette.foreground 
                    }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </OnboardingCheck>
  );
}