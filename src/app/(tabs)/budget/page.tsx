"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, ChevronRight, PieChart, Landmark } from 'lucide-react';
import { Card, EmptyState, ProgressBar, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function BudgetScreen() {
  const { settings, budgets, transactions, finance, t, categoryName } = useBudget();
  const { palette, colorScheme } = useThemeContext();
  const router = useRouter();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const spending = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((sum, item) => ({ ...sum, [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount }), {});

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-3.5 pb-11">
        {/* Header */}
        <div className="flex flex-row items-center justify-end mb-[18px]">
          <button 
            onClick={() => router.push('/budget-edit')}
            className="w-11 h-11 rounded-2xl flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ backgroundColor: palette.primary }}
          >
            <Plus size={22} color="white" />
          </button>
        </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
          <div className="md:col-span-7 flex flex-col gap-4">
            <SectionTitle title={t("budgetHealth")} />

        {/* Budget List */}
        {budgets.length === 0 ? (
          <Card className="pb-4">
            <EmptyState
              icon={PieChart}
              title={language === "fr" ? "Ton premier budget" : "Your first budget"}
              body={language === "fr" ? "Choisis une catégorie puis définis sa limite mensuelle." : "Choose a category, then set its monthly limit."}
            />
            <button
              onClick={() => router.push('/budget-edit')}
              className="mt-2 mx-auto h-[48px] px-6 rounded-2xl flex items-center justify-center active:opacity-70 transition-opacity"
              style={{ backgroundColor: palette.primary }}
            >
              <span className="text-white text-[14px] font-extrabold">
                {language === "fr" ? "Créer un budget" : "Create budget"}
              </span>
            </button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {budgets.map((item) => {
              const spent = spending[item.id] ?? 0;
              const ratio = item.limit ? spent / item.limit : 0;
              const over = spent > item.limit;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/budget-edit?id=${item.id}`)}
                  className="rounded-2xl border p-3.5 active:opacity-70 transition-opacity text-left"
                  style={{ backgroundColor: palette.surface, borderColor: palette.border }}
                >
                  <div className="flex flex-row justify-between items-center mb-3.5">
                    <div className="flex flex-row items-center gap-2.5 flex-1 min-w-0">
                      <RoundIcon icon={PieChart} size={42} color={item.color} background={`${item.color}18`} />
                      <div className="min-w-0">
                        <span className="block text-[15px] font-extrabold truncate" style={{ color: palette.foreground }}>{categoryName(item.id)}</span>
                        <span className="block text-[12px] mt-[3px]" style={{ color: palette.muted }}>{formatMoney(spent, language)} {t("spent")}</span>
                      </div>
                    </div>
                    <span className="block text-[12px] font-extrabold text-right max-w-[100px]" style={{ color: over ? palette.error : palette.success }}>
                      {over 
                        ? `${formatMoney(spent - item.limit, language)} ${label("over", "dépassé")}`
                        : `${formatMoney(item.limit - spent, language)} ${label("left", "restant")}`
                      }
                    </span>
                  </div>
                  <ProgressBar 
                    value={ratio} 
                    color={over ? palette.error : ratio > 0.82 ? palette.warning : item.color} 
                  />
                </button>
              );
            })}
          </div>
        )}

        
          </div>
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Summary Card */}
        <Card 
          className="flex flex-row justify-between items-center p-5" 
          style={{ backgroundColor: colorScheme === 'dark' ? palette.surface : palette.foreground, borderColor: colorScheme === 'dark' ? palette.surface : palette.foreground }}
        >
          <div>
            <p className="text-white/70 text-[13px] font-bold">{t("safeToSpend")}</p>
            <p className="text-white text-[29px] font-extrabold tracking-[-0.8px] mt-1.5">{formatMoney(finance.safeToSpend, language)}</p>
            <p className="text-white/70 text-[12px] mt-1.5">{formatMoney(finance.dailySafeToSpend, language)} / {language === "fr" ? "jour" : "day"}</p>
          </div>
          <RoundIcon icon={Wallet} size={54} color="white" background="rgba(255,255,255,0.16)" />
        </Card>

        
{/* Spending Limit Card */}
        <button
          onClick={() => router.push('/monthly-limit')}
          className="flex flex-row items-center gap-3.5 rounded-2xl p-4 mt-5 mb-5 w-full active:opacity-70 transition-opacity text-left"
          style={{ backgroundColor: palette.softPrimary }}
        >
          <RoundIcon icon={Landmark} size={42} color={palette.primary} background="white" />
          <div className="flex-1 min-w-0">
            <span className="block text-[16px] font-extrabold" style={{ color: palette.primary }}>
              {language === "fr" ? "Définir une limite globale" : "Set a spending limit"}
            </span>
            <span className="block text-[13px] mt-1 leading-[18px]" style={{ color: colorScheme === 'dark' ? '#93C5FD' : '#5478D2' }}>
              {language === "fr" ? "Compare tes dépenses à une cible mensuelle simple." : "Compare your expenses with one simple monthly target."}
            </span>
          </div>
          <ChevronRight size={22} color={palette.primary} />
        </button>

          </div>
        </div>
      </div>
    </div>
  );
}
