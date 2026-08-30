"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRightLeft, Landmark, ArrowUpRight, Lightbulb, Receipt, ShoppingCart, Car, Laptop } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';
import { FormattedDate } from '@/components/budget-ui';

export default function HomePage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, transactions, budgets, recurring, buckets, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const recent = transactions.slice(0, 5);
  const spendingByCategory = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((result, item) => ({ 
      ...result, 
      [item.categoryId]: (result[item.categoryId] ?? 0) + item.amount 
    }), {});
  
  const topBudgets = budgets.slice(0, 3);
  
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'food': return ShoppingCart;
      case 'transport': return Car;
      case 'housing': return Landmark;
      case 'entertainment': return Laptop;
      default: return Receipt;
    }
  };

  return (
    <div className="flex flex-col w-full px-10 py-8 gap-8">
      {/* Top Actions */}
      <div className="flex justify-between items-center bg-[#f3f3fe] rounded-xl p-4 shadow-sm border border-[#e5e7eb]">
        <div className="flex flex-col">
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Dashboard", "Tableau de bord")}</h1>
          <p className="text-[14px] leading-[20px] text-[#434654]">{label("Overview of your financial activity", "Aperçu de votre activité financière")}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/finance')}
            className="flex items-center gap-2 px-6 py-3 bg-[#ededf8] rounded-lg border border-[#e5e7eb] hover:border-[#003fb1] transition-colors text-[#191b23] text-[13px] tracking-[0.02em] font-semibold shadow-sm"
          >
            <ArrowRightLeft size={20} />
            {label("Transfer Funds", "Transférer des fonds")}
          </button>
          <button 
            onClick={() => router.push('/transaction?kind=expense')}
            className="flex items-center gap-2 px-6 py-3 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#b5c4ff] hover:text-[#00174d] transition-colors shadow-md"
          >
            <Plus size={20} />
            {label("Add Expense", "Ajouter une dépense")}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
          
          {/* Weekly Spending Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Weekly Spending Trend", "Tendance Hebdomadaire")}</h2>
              <select className="bg-[#ededf8] px-4 py-2 rounded-lg text-[11px] font-bold tracking-[0.05em] text-[#434654] border-none outline-none appearance-none pr-8">
                <option>{label("Last 7 Days", "Les 7 derniers jours")}</option>
                <option>{label("Last 30 Days", "Les 30 derniers jours")}</option>
                <option>{label("This Year", "Cette année")}</option>
              </select>
            </div>
            
            {/* Chart Visualization Placeholder */}
            <div className="relative w-full h-[320px] bg-[#f3f3fe] rounded-lg p-4 flex items-end justify-between border border-[#e5e7eb] overflow-hidden group">
              <div className="absolute inset-0 flex flex-col justify-between py-4 z-0 pointer-events-none opacity-20">
                <div className="w-full border-t border-[#737686]"></div>
                <div className="w-full border-t border-[#737686]"></div>
                <div className="w-full border-t border-[#737686]"></div>
                <div className="w-full border-t border-[#737686]"></div>
                <div className="w-full border-t border-[#737686]"></div>
              </div>
              
              <div className="relative z-10 w-12 bg-[#003fb1]/20 rounded-t-md hover:bg-[#003fb1]/40 transition-colors cursor-pointer" style={{ height: '40%' }}></div>
              <div className="relative z-10 w-12 bg-[#003fb1]/20 rounded-t-md hover:bg-[#003fb1]/40 transition-colors cursor-pointer" style={{ height: '65%' }}></div>
              <div className="relative z-10 w-12 bg-[#003fb1] rounded-t-md hover:bg-[#b5c4ff] transition-colors cursor-pointer shadow-[0_0_12px_rgba(26,86,219,0.3)]" style={{ height: '85%' }}></div>
              <div className="relative z-10 w-12 bg-[#003fb1]/20 rounded-t-md hover:bg-[#003fb1]/40 transition-colors cursor-pointer" style={{ height: '30%' }}></div>
              <div className="relative z-10 w-12 bg-[#003fb1]/20 rounded-t-md hover:bg-[#003fb1]/40 transition-colors cursor-pointer" style={{ height: '50%' }}></div>
              <div className="relative z-10 w-12 bg-[#006c49] rounded-t-md hover:bg-[#6ffbbe] transition-colors cursor-pointer shadow-[0_0_12px_rgba(0,113,77,0.3)]" style={{ height: '25%' }}></div>
              <div className="relative z-10 w-12 bg-[#003fb1]/20 rounded-t-md hover:bg-[#003fb1]/40 transition-colors cursor-pointer" style={{ height: '70%' }}></div>
              
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-6 pt-2 z-10 border-t border-[#e5e7eb] bg-[#f3f3fe]/80 backdrop-blur-sm">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <span key={day} className="text-[10px] font-medium text-[#434654]">{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f8f9ff]">
              <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Recent Activity", "Activité Récente")}</h2>
              <button 
                onClick={() => router.push('/transactions')}
                className="text-[11px] font-bold tracking-[0.05em] text-[#003fb1] hover:text-[#b5c4ff] uppercase transition-colors"
              >
                {label("View All", "Voir tout")}
              </button>
            </div>
            
            <div className="w-full overflow-x-auto">
              {recent.length === 0 ? (
                <div className="p-8 text-center text-[#434654]">{label("No transactions yet.", "Aucune transaction pour le moment.")}</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f3fe] border-b border-[#e5e7eb]">
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Date", "Date")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Description", "Description")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Category", "Catégorie")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase text-right">{label("Amount", "Montant")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase text-center">{label("Status", "Statut")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] font-medium text-[#191b23]">
                    {recent.map((item, index) => {
                      const Icon = getCategoryIcon(item.categoryId);
                      const isIncome = item.kind === 'income';
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => router.push(`/transaction?id=${item.id}`)}
                          className={cn(
                            "hover:bg-[#003fb1]/5 transition-colors group cursor-pointer h-[56px]",
                            index !== recent.length - 1 ? "border-b border-[#e5e7eb]" : ""
                          )}
                        >
                          <td className="py-3 px-6 text-[#434654] group-hover:text-[#003fb1] transition-colors whitespace-nowrap">
                            <FormattedDate date={item.date} language={language as any} />
                          </td>
                          <td className="py-3 px-6 font-medium whitespace-nowrap">{item.title}</td>
                          <td className="py-3 px-6">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
                              isIncome ? "bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20" : "bg-[#ededf8] text-[#434654]"
                            )}>
                              <Icon size={14} />
                              {categoryName(item.categoryId)}
                            </span>
                          </td>
                          <td className={cn(
                            "py-3 px-6 text-right font-semibold whitespace-nowrap",
                            isIncome ? "text-[#006c49]" : "text-[#121c2a]"
                          )}>
                            {isIncome ? '+' : '-'}{formatMoney(item.amount, language as any)}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className={cn(
                              "inline-block w-2 h-2 rounded-full",
                              isIncome ? "bg-[#006c49] shadow-[0_0_4px_#006c49]" : "bg-[#c3c5d7]"
                            )}></span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          
          {/* Total Balance Card */}
          <div className="bg-[#121c2a] rounded-xl p-6 shadow-sm border border-[#e5e7eb] relative overflow-hidden flex flex-col justify-between h-[200px]">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#003fb1]/20 rounded-full blur-2xl z-0 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase flex items-center gap-2">
                <Landmark size={16} className="text-[#003fb1]" />
                {label("Available Balance", "Solde Disponible")}
              </p>
              <h3 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-white mt-2 tabular-nums">
                {formatMoney(finance.netWorth, language as any)}
              </h3>
              <p className="text-[14px] font-medium text-[#006c49] flex items-center gap-1 mt-1">
                <ArrowUpRight size={16} />
                {label("+2.4% vs last month", "+2.4% ce mois-ci")}
              </p>
            </div>
            <div className="relative z-10 w-full bg-[#f3f3fe] h-1.5 rounded-full overflow-hidden mt-4 border border-[#e5e7eb]">
              <div className="bg-[#003fb1] h-full rounded-full shadow-[0_0_8px_#1a56db]" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] leading-tight font-semibold text-[#191b23]">{label("Monthly Budget", "Budget Mensuel")}</h3>
              <span className="text-[11px] font-bold tracking-[0.05em] text-[#434654] px-2 py-1 bg-[#ededf8] rounded uppercase">
                {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            
            <div className="flex items-end gap-2 mb-6">
              <span className="text-[32px] leading-none font-semibold text-[#121c2a] tabular-nums">
                {formatMoney(
                  topBudgets.reduce((acc, b) => acc + (spendingByCategory[b.id] ?? 0), 0), 
                  language as any
                )}
              </span>
              <span className="text-[14px] font-medium text-[#434654] mb-1 tabular-nums">
                / {formatMoney(topBudgets.reduce((acc, b) => acc + b.limit, 0), language as any)}
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {topBudgets.length === 0 ? (
                <div className="text-center text-[#434654] text-[13px]">{label("No budgets created.", "Aucun budget créé.")}</div>
              ) : topBudgets.map((budget, index) => {
                const spent = spendingByCategory[budget.id] ?? 0;
                const percentage = Math.min((spent / budget.limit) * 100, 100);
                const isWarning = percentage > 85;
                const color = isWarning ? '#f59e0b' : budget.color;
                
                return (
                  <div key={budget.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold tracking-[0.05em]">
                      <span className="text-[#191b23]">{categoryName(budget.id)}</span>
                      <span className="text-[#434654] tabular-nums">{formatMoney(spent, language as any)} / {formatMoney(budget.limit, language as any)}</span>
                    </div>
                    <div className="w-full bg-[#ededf8] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all" 
                        style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: isWarning ? `0 0 6px ${color}` : 'none' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Insights */}
          <div 
            onClick={() => router.push('/insights')}
            className="bg-[#f8f9ff] rounded-xl p-6 shadow-sm border border-[#e5e7eb] flex flex-col relative overflow-hidden group hover:border-[#003fb1]/30 transition-colors cursor-pointer"
          >
            <div className="absolute right-0 top-0 w-2 h-full bg-[#f59e0b]"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0 border border-[#f59e0b]/20">
                <Lightbulb className="text-[#f59e0b]" size={20} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[13px] tracking-[0.02em] font-semibold text-[#191b23] mb-1">{label("Unusual Spending Alert", "Alerte de Dépense Inhabituelle")}</h4>
                <p className="text-[13px] text-[#434654] leading-relaxed">
                  {label(
                    "Your spending is slightly higher than your usual monthly average. Consider reviewing recent transactions.",
                    "Vos dépenses sont légèrement supérieures à votre moyenne. Pensez à vérifier vos transactions."
                  )}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}