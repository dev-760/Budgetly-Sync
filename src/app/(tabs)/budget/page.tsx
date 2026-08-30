"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, PieChart, Wallet, ShoppingCart, Car, Home, Laptop, Heart, GraduationCap, ShoppingBag, Receipt, ChevronRight, Target } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'food': return ShoppingCart;
    case 'transport': return Car;
    case 'housing': return Home;
    case 'entertainment': return Laptop;
    case 'health': return Heart;
    case 'education': return GraduationCap;
    case 'shopping': return ShoppingBag;
    default: return Receipt;
  }
};

export default function BudgetPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, budgets, transactions, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const spending = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((sum, item) => ({
      ...sum,
      [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount
    }), {});

  const totalBudgetLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.id] ?? 0), 0);

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{t("budget")}</h1>
            <p className="text-[14px] leading-[20px] text-[#434654]">{label("Monthly spending plan", "Plan de dépenses mensuel")}</p>
          </div>
          <button
            onClick={() => router.push('/budget-edit')}
            className="flex items-center gap-2 px-6 py-3 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            <Plus size={20} />
            {label("Add Budget", "Ajouter un budget")}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Safe to Spend Hero */}
            <div className="bg-[#121c2a] rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#003fb1]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.05em] text-white/60 uppercase mb-2">{t("safeToSpend")}</p>
                  <h2 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-white tabular-nums">
                    {formatMoney(finance.safeToSpend, language as any)}
                  </h2>
                  <p className="text-[14px] text-white/70 mt-2">
                    {formatMoney(finance.dailySafeToSpend, language as any)} / {isFrench ? "jour" : "day"}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Wallet size={28} className="text-white" />
                </div>
              </div>
            </div>

            {/* Budget Cards */}
            {budgets.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-[#e5e7eb] text-center">
                <PieChart size={48} className="text-[#c3c5d7] mx-auto mb-4" />
                <h3 className="text-[18px] font-semibold text-[#191b23] mb-2">
                  {isFrench ? "Ton premier budget" : "Your first budget"}
                </h3>
                <p className="text-[14px] text-[#434654] mb-6">
                  {isFrench ? "Choisis une catégorie puis définis sa limite mensuelle." : "Choose a category, then set its monthly limit."}
                </p>
                <button
                  onClick={() => router.push('/budget-edit')}
                  className="px-6 py-3 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#1a56db] transition-colors"
                >
                  {isFrench ? "Créer un budget" : "Create budget"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((item) => {
                  const spent = spending[item.id] ?? 0;
                  const ratio = item.limit ? spent / item.limit : 0;
                  const over = spent > item.limit;
                  const percentage = Math.min(ratio * 100, 100);
                  const barColor = over ? '#ba1a1a' : ratio > 0.82 ? '#f59e0b' : item.color;
                  const Icon = getCategoryIcon(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/budget-edit?id=${item.id}`)}
                      className="w-full bg-white rounded-xl p-5 shadow-sm border border-[#e5e7eb] text-left hover:border-[#003fb1]/30 transition-colors group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}18` }}
                          >
                            <Icon size={20} style={{ color: item.color }} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#191b23]">{categoryName(item.id)}</p>
                            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] mt-0.5 tabular-nums">
                              {formatMoney(spent, language as any)} {t("spent")}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-[13px] tracking-[0.02em] font-semibold tabular-nums",
                          over ? "text-[#ba1a1a]" : "text-[#006c49]"
                        )}>
                          {over
                            ? `${formatMoney(spent - item.limit, language as any)} ${t("overBudget")}`
                            : `${formatMoney(item.limit - spent, language as any)} ${t("remaining")}`
                          }
                        </p>
                      </div>
                      <div className="w-full bg-[#ededf8] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                            boxShadow: over ? `0 0 8px ${barColor}` : 'none'
                          }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-12 xl:col-span-4 space-y-6">

            {/* Budget Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
              <h3 className="text-[18px] font-semibold text-[#191b23] mb-4">{label("Budget Summary", "Résumé du budget")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#434654]">{label("Total Budget", "Budget total")}</span>
                  <span className="text-[14px] font-semibold text-[#191b23] tabular-nums">{formatMoney(totalBudgetLimit, language as any)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#434654]">{label("Total Spent", "Total dépensé")}</span>
                  <span className="text-[14px] font-semibold text-[#ba1a1a] tabular-nums">{formatMoney(totalSpent, language as any)}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-semibold text-[#191b23]">{label("Remaining", "Restant")}</span>
                  <span className="text-[14px] font-bold text-[#006c49] tabular-nums">{formatMoney(Math.max(totalBudgetLimit - totalSpent, 0), language as any)}</span>
                </div>
              </div>
            </div>

            {/* Set Spending Limit Card */}
            <button
              onClick={() => router.push('/monthly-limit')}
              className="w-full bg-[#f3f3fe] rounded-xl p-5 shadow-sm border border-[#e5e7eb] text-left hover:border-[#003fb1]/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#003fb1]/10 flex items-center justify-center">
                  <Target size={24} className="text-[#003fb1]" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#191b23]">
                    {isFrench ? "Définir une limite globale" : "Set a spending limit"}
                  </p>
                  <p className="text-[13px] text-[#434654] mt-1">
                    {isFrench ? "Compare tes dépenses à une cible." : "Compare expenses with a target."}
                  </p>
                </div>
                <ChevronRight size={20} className="text-[#003fb1]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}