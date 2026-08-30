"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, CheckCircle, TrendingDown, TrendingUp, Utensils, Fuel } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function InsightsPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, transactions, finance, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 bg-[#f3f3fe] rounded-xl p-6 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Total Spent (MTD)", "Dépenses (ce mois-ci)")}</p>
            <p className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#191b23] mb-1">{formatMoney(finance.expenses, language as any)}</p>
            <div className="flex items-center gap-1 text-[#4edea3]">
              <ArrowDown size={16} />
              <span className="text-[13px] tracking-[0.02em] font-semibold">{label("12% vs last month", "-12% par rapport au mois dernier")}</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-[#f3f3fe] rounded-xl p-6 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Avg. Daily Spend", "Dépense moy. par jour")}</p>
            <p className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#191b23] mb-1">{formatMoney(Math.max(finance.expenses / new Date().getDate(), 0), language as any)}</p>
            <div className="flex items-center gap-1 text-[#ba1a1a]">
              <ArrowUp size={16} />
              <span className="text-[13px] tracking-[0.02em] font-semibold">{label("5% vs last month", "+5% par rapport au mois dernier")}</span>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-[#f3f3fe] rounded-xl p-6 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Largest Transaction", "Transaction la plus élevée")}</p>
            <p className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23] mb-1">
              {transactions.length > 0 ? formatMoney(Math.max(...transactions.filter(t => t.kind === 'expense').map(t => t.amount)), language as any) : '-'}
            </p>
            <p className="text-[14px] leading-[20px] text-[#434654] truncate">
              {transactions.filter(t => t.kind === 'expense').sort((a, b) => b.amount - a.amount)[0]?.title || '-'}
            </p>
          </div>
          
          <div className="col-span-12 lg:col-span-3 bg-[#003fb1] rounded-xl p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <p className="text-[11px] font-bold tracking-[0.05em] text-white/80 uppercase mb-2">{label("Budget Health", "Santé du Budget")}</p>
              <p className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold mb-1">{label("Good", "Bonne")}</p>
              <p className="text-[14px] leading-[20px] text-white/90">{label("On track to save this month.", "En bonne voie pour économiser ce mois-ci.")}</p>
            </div>
            <CheckCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" strokeWidth={1} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Spending by Category */}
          <div className="col-span-12 xl:col-span-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Spending by Category", "Dépenses par catégorie")}</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-[#ededf8] rounded-lg text-[11px] font-bold tracking-[0.05em] text-[#434654] hover:bg-[#e2e1ed] transition-colors">{label("This Month", "Ce Mois")}</button>
                <button className="px-3 py-1 bg-transparent rounded-lg text-[11px] font-bold tracking-[0.05em] text-[#434654] hover:bg-[#ededf8] transition-colors">{label("Last 3 Months", "3 Derniers Mois")}</button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="relative w-64 h-64 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-[#ededf8]" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="15"></circle>
                  <circle 
                    className="text-[#003fb1] transition-all duration-1000 ease-out" 
                    cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" 
                    strokeDasharray="251.2" strokeDashoffset={mounted ? "163.28" : "251.2"} 
                    strokeLinecap="round" strokeWidth="15"
                  ></circle>
                  <circle 
                    className="text-[#006c49] transition-all duration-1000 ease-out delay-100" 
                    cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" 
                    strokeDasharray="251.2" strokeDashoffset={mounted ? "188.4" : "251.2"} 
                    strokeLinecap="round" strokeWidth="15" transform="rotate(126, 50, 50)"
                  ></circle>
                  <circle 
                    className="text-[#852b00] transition-all duration-1000 ease-out delay-200" 
                    cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" 
                    strokeDasharray="251.2" strokeDashoffset={mounted ? "200.96" : "251.2"} 
                    strokeLinecap="round" strokeWidth="15" transform="rotate(216, 50, 50)"
                  ></circle>
                  <circle 
                    className="text-[#f59e0b] transition-all duration-1000 ease-out delay-300" 
                    cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" 
                    strokeDasharray="251.2" strokeDashoffset={mounted ? "200.96" : "251.2"} 
                    strokeLinecap="round" strokeWidth="15" transform="rotate(288, 50, 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Total", "Total")}</span>
                  <span className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{formatMoney(finance.expenses, language as any)}</span>
                </div>
              </div>
              
              {/* Detailed Legend */}
              <div className="flex-1 w-full space-y-4">
                <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-[#ededf8] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#003fb1]"></div>
                    <div>
                      <p className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23]">{label("Housing & Utilities", "Logement")}</p>
                      <p className="text-[14px] leading-[20px] text-[#434654]">{label("Rent, Internet, Electricity", "Loyer, Internet")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] leading-[20px] font-medium text-[#191b23] tabular-nums">{formatMoney(finance.expenses * 0.35, language as any)}</p>
                    <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654]">35.0%</p>
                  </div>
                </div>
                
                <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-[#ededf8] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#006c49]"></div>
                    <div>
                      <p className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23]">{label("Food & Dining", "Nourriture")}</p>
                      <p className="text-[14px] leading-[20px] text-[#434654]">{label("Groceries, Restaurants", "Épicerie, Restaurants")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] leading-[20px] font-medium text-[#191b23] tabular-nums">{formatMoney(finance.expenses * 0.25, language as any)}</p>
                    <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654]">25.0%</p>
                  </div>
                </div>

                <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-[#ededf8] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#852b00]"></div>
                    <div>
                      <p className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23]">{label("Transportation", "Transport")}</p>
                      <p className="text-[14px] leading-[20px] text-[#434654]">{label("Gas, Transit", "Carburant, Transport en commun")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] leading-[20px] font-medium text-[#191b23] tabular-nums">{formatMoney(finance.expenses * 0.20, language as any)}</p>
                    <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654]">20.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Changers */}
          <div className="col-span-12 xl:col-span-4 bg-white rounded-xl p-6 shadow-sm flex flex-col border border-[#e5e7eb]">
            <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23] mb-6">{label("Biggest Changes", "Plus grands changements")}</h2>
            <div className="flex-1 space-y-4">
              
              <div className="p-4 rounded-xl bg-[#f3f3fe] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23]">{label("Dining Out", "Restaurants")}</p>
                    <p className="text-[14px] leading-[20px] text-[#434654]">{label(" this month", "450 DH ce mois-ci")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] leading-[20px] font-medium text-[#ba1a1a] tabular-nums">+</p>
                  <p className="text-[11px] font-bold tracking-[0.05em] text-[#ba1a1a] flex items-center justify-end gap-1">
                    <TrendingUp size={14} /> 36%
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-[#f3f3fe] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#6cf8bb] text-[#00714d] flex items-center justify-center">
                    <Fuel size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23]">{label("Fuel", "Carburant")}</p>
                    <p className="text-[14px] leading-[20px] text-[#434654]">{label(" this month", "180 DH ce mois-ci")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] leading-[20px] font-medium text-[#006c49] tabular-nums">-</p>
                  <p className="text-[11px] font-bold tracking-[0.05em] text-[#006c49] flex items-center justify-end gap-1">
                    <TrendingDown size={14} /> 20%
                  </p>
                </div>
              </div>

            </div>
            <button className="mt-4 w-full py-3 bg-[#ededf8] hover:bg-[#e2e1ed] text-[#191b23] rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors">
              {label("View All Categories", "Toutes les catégories")}
            </button>
          </div>
        </div>

        {/* Second Row Analytics */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Spending Trend (6 Months) */}
          <div className="col-span-12 xl:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23] mb-6">{label("Spending Trend (6 Months)", "Tendance sur 6 mois")}</h2>
            
            <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none">
                <div className="w-full h-px bg-[#e5e7eb]"></div>
                <div className="w-full h-px bg-[#e5e7eb]"></div>
                <div className="w-full h-px bg-[#e5e7eb]"></div>
                <div className="w-full h-px bg-[#e5e7eb]"></div>
                <div className="w-full h-px bg-[#e5e7eb]"></div>
              </div>
              
              {/* Bars */}
              {[60, 75, 65, 90, 80, 78].map((height, i) => {
                const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
                const isCurrent = i === 5;
                return (
                  <div key={months[i]} className="relative z-10 w-full max-w-[40px] flex flex-col items-center group cursor-pointer h-full justify-end">
                    <div 
                      className={cn(
                        "w-full rounded-t-sm transition-colors", 
                        isCurrent ? "bg-[#003fb1] group-hover:bg-[#003fb1]/80" : "bg-[#003fb1]/40 group-hover:bg-[#003fb1]/60"
                      )} 
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className={cn("mt-2 text-[11px] font-bold tracking-[0.05em]", isCurrent ? "text-[#003fb1]" : "text-[#434654]")}>{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Heatmap Placeholder */}
          <div className="col-span-12 xl:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23] mb-6">{label("Daily Activity", "Activité quotidienne")}</h2>
            <div className="grid grid-cols-7 gap-2">
              {['S','M','T','W','T','F','S'].map((day, i) => (
                <div key={i} className="text-center text-[11px] font-bold tracking-[0.05em] text-[#434654]">{day}</div>
              ))}
              
              {/* Empty blocks for start of month offset */}
              <div></div><div></div><div></div>
              
              {/* Example Heatmap Cells */}
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = [20, 40, 80, 0, 20, 60, 20, 0, 10, 90, 40, 20, 30, 20, 70, 0, 10, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i];
                return (
                  <div 
                    key={i}
                    className={cn(
                      "aspect-square rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-[#003fb1]",
                      intensity === 0 ? "bg-[#ededf8]" : intensity > 0 && intensity <= 20 ? "bg-[#003fb1]/20" : intensity <= 50 ? "bg-[#003fb1]/40" : intensity <= 80 ? "bg-[#003fb1]/60" : "bg-[#003fb1]/90"
                    )}
                  />
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
