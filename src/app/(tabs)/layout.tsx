"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, Wallet, GraduationCap, Settings, Search, Bell, User } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { OnboardingCheck } from '@/components/auth-check';
import { BrandLockup } from '@/components/budget-ui';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, settings } = useBudget();
  const { palette } = useThemeContext();
  const isFrench = settings.language === 'fr';

  const navLinks = [
    { name: '/', label: isFrench ? 'Tableau de bord' : 'Dashboard', icon: LayoutDashboard },
    { name: '/insights', label: isFrench ? 'Analytique' : 'Analytics', icon: BarChart2 },
    { name: '/transactions', label: isFrench ? 'Budget' : 'Budgeting', icon: Wallet },
    { name: '/scholarship', label: isFrench ? 'Bourse' : 'Scholarship', icon: GraduationCap },
  ];

  return (
    <OnboardingCheck>
      <div className="flex w-full min-h-screen bg-background">
        
        {/* Fixed Desktop Sidebar */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-[#f3f3fe] z-50 border-r border-[#e5e7eb]">
          <div className="flex items-center gap-3 px-8 h-20 mb-4">
            <BrandLockup compact />
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            {navLinks.map((tab) => {
              const isActive = pathname === tab.name || (tab.name !== '/' && pathname.startsWith(tab.name));
              const Icon = tab.icon;
              
              return (
                <Link
                  key={tab.name}
                  href={tab.name}
                  className={cn(
                    "group flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-[#1a56db] text-[#d4dcff] shadow-sm" 
                      : "text-[#434654] hover:bg-[#ededf8] hover:text-[#191b23]"
                  )}
                >
                  <Icon 
                    size={20} 
                    className={cn("mr-3 transition-transform group-hover:scale-110", isActive ? "text-[#d4dcff]" : "text-[#434654]")}
                  />
                  <span className={cn("text-[13px] tracking-[0.02em]", isActive ? "font-semibold" : "font-semibold")}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-[#c3c5d7]/30">
              <Link
                href="/settings"
                className="group flex items-center px-4 py-3 rounded-xl text-[#434654] hover:bg-[#ededf8] hover:text-[#191b23] transition-all duration-200"
              >
                <Settings size={20} className="mr-3 transition-transform group-hover:scale-110" />
                <span className="text-[13px] font-semibold tracking-[0.02em]">Settings</span>
              </Link>
            </div>
          </nav>
          
          <div className="px-8 pb-8">
            <div className="p-4 rounded-xl text-white shadow-lg" style={{ backgroundColor: palette.primary, boxShadow: `0 10px 15px -3px ${palette.primary}33` }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.05em] mb-1 opacity-80">Current Plan</p>
              <p className="text-[16px] font-semibold leading-tight mb-3">Premium Pro</p>
              <button className="w-full py-2 bg-white rounded-lg text-[13px] font-semibold transition-colors hover:bg-opacity-90" style={{ color: palette.primary }}>
                Upgrade
              </button>
            </div>
          </div>
        </aside>

        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-0 left-[280px] right-0 h-20 bg-white/80 backdrop-blur-xl z-40 items-center justify-between px-10 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#434654] group-focus-within:text-[#003fb1] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search transactions, reports..." 
                className="w-full pl-12 pr-4 py-2.5 bg-[#f3f3fe] rounded-full border border-transparent focus:border-[#003fb1] focus:bg-white outline-none text-[14px] text-[#191b23] transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#434654] hover:bg-[#ededf8] rounded-full transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-[#c3c5d7]/30"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#191b23]">Alex Thompson</p>
                <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654]">Personal Account</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:ring-4 transition-all shadow-sm" style={{ backgroundColor: palette.primary, '--tw-ring-color': palette.primary + '1a' } as any}>
                <User size={20} color="white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-[280px] md:pt-20">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center py-2 px-4 z-50 bg-white border-[#e5e7eb]">
            {navLinks.map((tab) => {
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
                  style={{ backgroundColor: isActive ? palette.primary + '15' : 'transparent' }}
                >
                  <Icon size={20} color={isActive ? palette.primary : palette.foreground} />
                  <span className="text-[10px] font-medium" style={{ color: isActive ? palette.primary : palette.foreground }}>
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