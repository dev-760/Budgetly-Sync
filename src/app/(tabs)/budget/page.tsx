"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, PieChart, ChevronRight, PiggyBank, Utensils, Zap, Car, Home } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { Card, EmptyState, ProgressBar, RoundIcon, SectionTitle, Button } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function BudgetPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, budgets, transactions, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const spending = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((sum, item) => ({ 
      ...sum, 
      [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount 
    }), {});

  // Function to render correct Lucide icon based on name
  const renderIcon = (name: string, props: any) => {
    switch (name) {
      case 'restaurant': return <Utensils {...props} />;
      case 'bolt': return <Zap {...props} />;
      case 'directions-car': return <Car {...props} />;
      case 'home': return <Home {...props} />;
      default: return <PieChart {...props} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-xl mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: palette.foreground }}>
            {t("budget")}
          </h1>
          <p className="text-sm mt-1" style={{ color: palette.muted }}>
            {t("monthlyPlan")}
          </p>
        </div>
        <button
          onClick={() => router.push('/budget-edit')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ backgroundColor: palette.primary }}
        >
          <Plus size={22} color="#FFFFFF" />
        </button>
      </div>

      <div 
        className="rounded-[24px] p-5 mb-6 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: '#172033' }}
      >
        <div>
          <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t("safeToSpend")}
          </p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight text-white">
            {formatMoney(finance.safeToSpend, language as any)}
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {formatMoney(finance.dailySafeToSpend, language as any)} / {isFrench ? "jour" : "day"}
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
          <Wallet size={30} color="#FFFFFF" />
        </div>
      </div>

      <SectionTitle title={t("budgetHealth")} />

      {budgets.length === 0 ? (
        <Card className="p-4 pb-4">
          <EmptyState
            icon={PieChart}
            title={isFrench ? "Ton premier budget" : "Your first budget"}
            description={isFrench ? "Choisis une catégorie puis définis sa limite mensuelle." : "Choose a category, then set its monthly limit."}
          />
          <Button
            onPress={() => router.push('/budget-edit')}
            className="w-full mt-2"
          >
            {isFrench ? "Créer un budget" : "Create budget"}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((item) => {
            const spent = spending[item.id] ?? 0;
            const ratio = item.limit ? spent / item.limit : 0;
            const over = spent > item.limit;
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(`/budget-edit?id=${item.id}`)}
                className="w-full bg-white border rounded-[22px] p-4 text-left transition-opacity hover:opacity-80"
                style={{ borderColor: palette.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${item.color}18` }}>
                      {renderIcon(item.icon, { size: 22, color: item.color })}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>
                        {categoryName(item.id)}
                      </h3>
                      <p className="text-xs mt-1 font-medium" style={{ color: palette.muted }}>
                        {formatMoney(spent, language as any)} {t("spent")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right max-w-[100px]">
                    <span 
                      className="text-xs font-extrabold block"
                      style={{ color: over ? '#ef4444' : '#10B981' }}
                    >
                      {over 
                        ? `${formatMoney(spent - item.limit, language as any)} ${t("overBudget")}`
                        : `${formatMoney(item.limit - spent, language as any)} ${t("remaining")}`
                      }
                    </span>
                  </div>
                </div>
                <ProgressBar 
                  value={ratio} 
                  color={over ? '#ef4444' : ratio > 0.82 ? '#F59E0B' : item.color} 
                />
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => router.push('/monthly-limit')}
        className="w-full flex items-center gap-3.5 p-4 rounded-[22px] mt-6 transition-opacity hover:opacity-80 text-left mx-auto max-w-sm"
        style={{ backgroundColor: '#EEF3FF' }}
      >
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <PiggyBank size={24} color="#1A56DB" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-extrabold" style={{ color: '#1A56DB' }}>
            {isFrench ? "Définir une limite globale" : "Set a spending limit"}
          </h4>
          <p className="text-[13px] mt-1 leading-tight" style={{ color: '#5478D2' }}>
            {isFrench ? "Compare tes dépenses à une cible mensuelle simple." : "Compare your expenses with one simple monthly target."}
          </p>
        </div>
        <ChevronRight size={22} color="#1A56DB" className="shrink-0" />
      </button>
    </div>
  );
}