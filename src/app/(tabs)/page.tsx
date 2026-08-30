"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Wallet, CalendarMonth, Plus, ArrowUpRight, ArrowDownLeft, Receipt, PiggyBank, RepeatIcon, PieChart, ArrowRight } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { BrandLockup, Card, EmptyState, MoneyText, ProgressBar, RoundIcon, SectionTitle, FormattedDate } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, transactions, budgets, recurring, buckets, notifications, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const recent = transactions.slice(0, 3);
  const upcoming = recurring.slice(0, 2);
  const spendingByCategory = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((result, item) => ({ 
      ...result, 
      [item.categoryId]: (result[item.categoryId] ?? 0) + item.amount 
    }), {});
  
  const foodBudget = budgets[0];
  const foodSpend = foodBudget ? spendingByCategory[foodBudget.id] ?? 0 : 0;
  const hasUnreadNotifications = notifications.some((item) => !item.isRead);

  return (
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-5xl mx-auto" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <BrandLockup compact />
          <p className="text-[13px] mt-1.5" style={{ color: palette.muted }}>
            {t("goodMorning")}
          </p>
        </div>
        <button
          onClick={() => router.push('/notifications')}
          className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Bell size={23} color={palette.foreground} />
          {hasUnreadNotifications && (
            <div 
              className="absolute top-2 right-2.5 w-2 h-2 rounded-full border-[1.5px]"
              style={{ backgroundColor: palette.error, borderColor: palette.surface }}
            />
          )}
        </button>
      </div>

      {/* Safe to Spend Hero */}
      <div 
        className="rounded-[24px] p-[22px] mb-4 overflow-hidden relative"
        style={{ 
          backgroundColor: palette.primary, 
          boxShadow: `0 16px 32px -8px ${palette.primary}80` 
        }}
      >
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[13px] font-bold text-[#DDE6FF]">{t("safeToSpend")}</p>
            <p className="text-xs mt-1 leading-[17px] max-w-[215px] text-[#CCD9FF]">{t("spendToday")}</p>
          </div>
          <div className="w-11 h-11 rounded-[15px] flex items-center justify-center bg-white/20">
            <PiggyBank size={24} color="#FFFFFF" />
          </div>
        </div>
        
        <p className="text-[42px] leading-[48px] font-extrabold tracking-[-1.5px] tabular-nums mt-6 text-white">
          {formatMoney(finance.safeToSpend, language as any)}
        </p>
        
        <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-2 rounded-xl">
          <CalendarMonth size={15} color="#FFFFFF" />
          <span className="text-[13px] font-bold text-white">
            {formatMoney(finance.dailySafeToSpend, language as any)} / {isFrench ? "jour" : "day"}
          </span>
        </div>
      </div>

      <div className="md:flex md:gap-6 md:items-start">
        <div className="md:flex-[7]">
          {/* Metrics Row */}
          <div className="flex gap-3 mt-3.5 mb-4">
            <Card className="flex-1 p-[15px] min-h-[132px]">
              <RoundIcon icon={Wallet} size={34} color={palette.primary} background="#EAF0FF" />
              <p className="text-xs font-semibold mt-3 mb-1" style={{ color: palette.muted }}>{t("availableBalance")}</p>
              <MoneyText amount={finance.availableBalance} language={language as any} className="text-lg font-bold" />
            </Card>
            
            <Card className="flex-1 p-[15px] min-h-[132px]">
              <RoundIcon icon={CalendarMonth} size={34} color="#10B981" background="#E7F7F1" />
              <p className="text-xs font-semibold mt-3 mb-1" style={{ color: palette.muted }}>{t("thisMonth")}</p>
              <p className="text-xs font-bold mt-2 leading-[17px]">
                <span style={{ color: '#10B981' }}>{formatMoney(finance.income, language as any)}</span>
                {" · "}
                <span style={{ color: '#ef4444' }}>{formatMoney(finance.expenses, language as any)}</span>
              </p>
            </Card>
          </div>

          {/* Add Expense Button */}
          <div className="w-full flex justify-center mb-4">
            <button
              onClick={() => router.push('/transaction?kind=expense')}
              className="w-full md:max-w-[300px] h-[52px] rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: palette.primary, 
                boxShadow: `0 10px 25px -5px ${palette.primary}60` 
              }}
            >
              <span className="text-sm font-extrabold text-white">{t("addExpense")}</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <SectionTitle 
            title={t("recentTransactions")} 
            action={t("viewAll")}
            onPress={() => router.push('/transactions')}
          />
          <Card className="py-1">
            {recent.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={isFrench ? "Prêt à commencer" : "Ready when you are"}
                description={isFrench ? "Ajoute un revenu ou une dépense pour voir ton activité." : "Add income or an expense to see your activity."}
              />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800 px-2">
                {recent.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => router.push(`/transaction?id=${item.id}`)}
                    className="w-full flex items-center gap-3 py-3.5 px-2 text-left transition-opacity hover:opacity-70"
                  >
                    <RoundIcon 
                      icon={item.kind === "income" ? ArrowDownLeft : ArrowUpRight} 
                      size={38} 
                      color={item.kind === "income" ? "#10B981" : "#ef4444"} 
                      background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"} 
                    />
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold" style={{ color: palette.foreground }}>{item.title}</h3>
                      <p className="text-xs mt-1" style={{ color: palette.muted }}>
                        <FormattedDate date={item.date} language={language as any} /> · {categoryName(item.categoryId)}
                      </p>
                    </div>
                    <MoneyText 
                      amount={item.amount} 
                      language={language as any}
                      type={item.kind}
                      className="text-sm font-bold text-right"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Finance Board Shortcut Strip */}
          <button
            onClick={() => router.push('/finance')}
            className="w-full mt-4 rounded-[24px] p-[22px] text-left transition-all hover:scale-[0.98] block relative overflow-hidden"
            style={{ 
              backgroundColor: '#172033',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
            }}
          >
            <div className="flex justify-between items-center mb-3.5 relative z-10">
              <div>
                <h3 className="text-[17px] font-extrabold text-white">{isFrench ? "Vue financière" : "Finance board"}</h3>
                <p className="text-[13px] mt-1 text-[#8B94A7]">{isFrench ? "Comptes et engagements" : "Accounts & commitments"}</p>
              </div>
              <div className="bg-white/10 px-3.5 py-2.5 rounded-xl text-right">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">{isFrench ? "Valeur nette" : "Net worth"}</p>
                <p className="text-[19px] font-extrabold text-white mt-1 tabular-nums">
                  {formatMoney(finance.netWorth, language as any)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3.5 mt-4">
              {buckets.map((bucket) => (
                <div key={bucket.id} className="flex-1 flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                  <RoundIcon 
                    icon={Wallet} 
                    size={30} 
                    color={bucket.color} 
                    background={bucket.id === "cash" ? "rgba(22, 167, 123, 0.15)" : "rgba(26, 86, 219, 0.15)"} 
                  />
                  <div>
                    <p className="text-[13px] font-bold text-[#DDE6FF]">{bucket.id === "cash" ? t("cash") : t("card")}</p>
                    <p className="text-[15px] font-extrabold text-white mt-0.5">{formatMoney(bucket.balance, language as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </button>
        </div>

        <div className="md:flex-[5] mt-6 md:mt-0">
          {/* Budget Health */}
          <SectionTitle title={t("budgetHealth")} />
          {foodBudget ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5 flex-1">
                  <RoundIcon icon={PieChart} size={38} color={foodBudget.color} background="#E7F7F1" />
                  <div>
                    <p className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{categoryName(foodBudget.id)}</p>
                    <p className="text-xs mt-0.5" style={{ color: palette.muted }}>{formatMoney(foodSpend, language as any)} {t("spent")}</p>
                  </div>
                </div>
                <p className="text-xs font-extrabold text-right max-w-[95px]" style={{ color: '#10B981' }}>
                  {formatMoney(Math.max(foodBudget.limit - foodSpend, 0), language as any)} {t("remaining")}
                </p>
              </div>
              <ProgressBar 
                value={foodSpend / foodBudget.limit} 
                color={foodSpend / foodBudget.limit > 0.85 ? '#F59E0B' : foodBudget.color} 
              />
            </Card>
          ) : (
            <button 
              onClick={() => router.push('/budget-edit')}
              className="w-full text-left rounded-[22px] overflow-hidden transition-opacity hover:opacity-80"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <EmptyState 
                icon={PieChart} 
                title={isFrench ? "Crée ton premier budget" : "Create your first budget"} 
                description={isFrench ? "Ajoute une limite de catégorie pour suivre tes dépenses." : "Add a category limit to track your spending."} 
              />
              <div className="mx-4 mb-4 h-11 rounded-2xl flex items-center justify-center gap-2" style={{ backgroundColor: '#1A56DB' }}>
                <span className="text-sm font-extrabold text-white">{isFrench ? "Créer le budget" : "Create budget"}</span>
                <ArrowRight size={16} color="#FFFFFF" />
              </div>
            </button>
          )}

          {/* Upcoming */}
          <SectionTitle title={t("upcoming")} />
          <Card className="py-1">
            {upcoming.length ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-800 px-2">
                {upcoming.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3.5 px-2">
                    <RoundIcon icon={RepeatIcon} size={38} color="#F59E0B" background="#FFF3D8" />
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold" style={{ color: palette.foreground }}>{item.title}</h3>
                      <p className="text-xs mt-1" style={{ color: palette.muted }}>
                        <FormattedDate date={item.nextDueDate} language={language as any} />
                      </p>
                    </div>
                    <MoneyText 
                      amount={item.amount} 
                      language={language as any}
                      className="text-sm font-bold text-right"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={CalendarMonth} 
                title={isFrench ? "Aucun paiement à venir" : "No upcoming payments"} 
                description={isFrench ? "Les dépenses récurrentes apparaîtront ici." : "Recurring expenses will appear here."} 
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}