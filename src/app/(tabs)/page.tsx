"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Wallet, CalendarRange, ArrowDown, ArrowUp, Flag, Receipt, PieChart } from 'lucide-react';
import { BrandLockup, Card, EmptyState, MoneyText, ProgressBar, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { formatDate, formatMoney } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { FormattedDate } from '@/components/budget-ui';

export default function HomePage() {
  const router = useRouter();
  const { settings, transactions, budgets, recurring, buckets, notifications, finance, t, categoryName } = useBudget();
  const { palette, colorScheme } = useThemeContext();
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
    <div className="flex-1 w-full pb-10 px-5 pt-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mb-5">
        <div className="md:hidden">
          <BrandLockup compact />
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>{t("goodMorning")}</p>
        </div>
        
        <button 
          onClick={() => router.push("/notifications")}
          className="relative w-[42px] h-[42px] rounded-2xl flex items-center justify-center border active:scale-95 transition-transform"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <Bell size={22} color={palette.foreground} />
          {hasUnreadNotifications && (
            <div className="absolute right-2.5 top-2.5 w-2 h-2 rounded-full border-[1.5px] border-white" style={{ backgroundColor: palette.error }} />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
        <div className="md:col-span-7 flex flex-col gap-0">
          
      {/* Safe to Spend Card */}
      <div 
        className="rounded-[24px] p-5.5 mb-4 shadow-lg overflow-hidden relative"
        style={{ backgroundColor: palette.primary, boxShadow: `0 10px 15px -3px ${palette.primary}40` }}
      >
        <div className="flex flex-row justify-between relative z-10">
          <div>
            <p className="text-[#DDE6FF] text-[13px] font-bold">{t("safeToSpend")}</p>
            <p className="text-[#CCD9FF] text-[12px] mt-1.5 max-w-[215px] leading-snug">{t("spendToday")}</p>
          </div>
          <div className="w-[42px] h-[42px] rounded-[15px] flex items-center justify-center bg-white/15">
            <Wallet size={24} color="white" />
          </div>
        </div>
        <p className="text-white mt-6 text-[42px] leading-[48px] tracking-[-1.5px] font-extrabold tabular-nums relative z-10">
          {formatMoney(finance.safeToSpend, language)}
        </p>
        <div className="mt-4 self-start inline-flex flex-row items-center gap-1.5 bg-white/15 px-2.5 py-2 rounded-xl relative z-10">
          <CalendarRange size={15} color="white" />
          <p className="text-white text-[13px] font-bold">
            {formatMoney(finance.dailySafeToSpend, language)} / {language === "fr" ? "jour" : "day"}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-row gap-3 mt-3.5">
        <Card className="flex-1 min-h-[132px] p-[15px] flex flex-col justify-between">
          <div>
            <RoundIcon icon={Wallet} size={34} color={palette.primary} background={palette.softPrimary} />
            <p className="mt-3.5 text-[12px] font-semibold" style={{ color: palette.muted }}>{t("availableBalance")}</p>
          </div>
          <MoneyText amount={finance.availableBalance} language={language} className="mt-1.5 text-[18px]" />
        </Card>
        <Card className="flex-1 min-h-[132px] p-[15px] flex flex-col justify-between">
          <div>
            <RoundIcon icon={CalendarRange} size={34} color={palette.success} background="#E7F7F1" />
            <p className="mt-3.5 text-[12px] font-semibold" style={{ color: palette.muted }}>{t("thisMonth")}</p>
          </div>
          <p className="mt-2 font-bold text-[12px] leading-[17px]">
            <span style={{ color: palette.success }}>{formatMoney(finance.income, language)}</span> · <span style={{ color: palette.error }}>{formatMoney(finance.expenses, language)}</span>
          </p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="mt-2">
        <SectionTitle title={t("recentTransactions")} action={t("viewAll")} onPress={() => router.push('/transactions')} />
        <Card className="p-0 overflow-hidden">
          {recent.length ? (
            <div className="flex flex-col">
              {recent.map((item, index) => (
                <button 
                  key={item.id}
                  onClick={() => router.push(`/transaction?id=${item.id}`)}
                  className={cn(
                    "flex flex-row items-center py-[14px] px-0 mx-[14px] active:opacity-65 transition-opacity text-left",
                    index !== recent.length - 1 && "border-b border-[#e5e7eb]"
                  )}
                >
                  <RoundIcon 
                    icon={item.kind === "income" ? ArrowDown : ArrowUp} 
                    size={38} 
                    color={item.kind === "income" ? palette.success : palette.error} 
                    background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"} 
                  />
                  <div className="flex-1 ml-3">
                    <p className="text-[15px] font-bold" style={{ color: palette.foreground }}>{item.title}</p>
                    <p className="text-[13px] mt-1" style={{ color: palette.muted }}>
                      <FormattedDate date={item.date} language={language} /> · {categoryName(item.categoryId)}
                    </p>
                  </div>
                  <MoneyText amount={item.amount} language={language} type={item.kind} className="text-[15px]" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Receipt} 
              title={language === "fr" ? "Prêt à commencer" : "Ready when you are"} 
              body={language === "fr" ? "Ajoute un revenu ou une dépense pour voir ton activité." : "Add income or an expense to see your activity."} 
            />
          )}
        </Card>
      </div>

              </div>

        <div className="md:col-span-5 flex flex-col gap-0">

      {/* Add Expense Button */}
      <div className="flex justify-center w-full mt-4">
        <button 
          onClick={() => router.push('/transaction?kind=expense')}
          className="w-full max-w-[300px] h-[52px] rounded-2xl flex flex-row items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: palette.primary, boxShadow: `0 10px 15px -3px ${palette.primary}40` }}
        >
          <span className="text-white text-[14px] font-extrabold">{t("addExpense")}</span>
        </button>
      </div>

      {/* Finance Board Strip */}
      <div className="mt-4">
        <button 
          onClick={() => router.push('/finance')}
          className="w-full rounded-2xl p-5 active:opacity-65 transition-opacity text-left shadow-sm"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`  }}
        >
          <div className="flex flex-row justify-between items-start mb-4">
            <div>
              <p className="text-[16px] font-bold" style={{ color: palette.foreground }}>
                {language === "fr" ? "Vue financière" : "Finance board"}
              </p>
              <p className="text-[13px] mt-1" style={{ color: palette.muted }}>
                {language === "fr" ? "Comptes et engagements" : "Accounts & commitments"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: palette.muted }}>
                {language === "fr" ? "Valeur nette" : "Net worth"}
              </p>
              <p className="text-[16px] font-extrabold tabular-nums" style={{ color: palette.primary }}>
                {formatMoney(finance.netWorth, language)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-row gap-2 mt-4">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="flex-1 flex flex-row items-center gap-2 p-2.5 rounded-2xl" style={{ backgroundColor: palette.background }}>
                <RoundIcon 
                  icon={Wallet} 
                  size={30} 
                  color={bucket.color} 
                  background={bucket.id === "cash" ? "rgba(22, 167, 123, 0.15)" : "rgba(26, 86, 219, 0.15)"} 
                />
                <div>
                  <p className="text-[11px] font-bold uppercase" style={{ color: palette.muted }}>
                    {bucket.id === "cash" ? t("cash") : t("card")}
                  </p>
                  <p className="text-[13px] font-extrabold tabular-nums" style={{ color: palette.foreground }}>
                    {formatMoney(bucket.balance, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Budget Health */}
      <div className="mt-2">
        <SectionTitle title={t("budgetHealth")} />
        {foodBudget ? (
          <Card>
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="flex flex-row items-center gap-3">
                <RoundIcon icon={PieChart} size={38} color={foodBudget.color} background="#E7F7F1" />
                <div>
                  <p className="text-[15px] font-bold" style={{ color: palette.foreground }}>{categoryName(foodBudget.id)}</p>
                  <p className="text-[13px] mt-1" style={{ color: palette.muted }}>{formatMoney(foodSpend, language)} {t("spent")}</p>
                </div>
              </div>
              <p className="text-[13px] font-bold text-right" style={{ color: palette.muted }}>
                {formatMoney(Math.max(foodBudget.limit - foodSpend, 0), language)}<br/>{t("remaining")}
              </p>
            </div>
            <ProgressBar value={foodSpend / foodBudget.limit} color={foodSpend / foodBudget.limit > 0.85 ? palette.warning : foodBudget.color} />
          </Card>
        ) : (
          <button 
            onClick={() => router.push('/budget-edit')}
            className="w-full active:opacity-65 transition-opacity"
          >
            <Card className="flex flex-col items-center justify-center p-0">
              <EmptyState 
                icon={PieChart} 
                title={language === "fr" ? "Crée ton premier budget" : "Create your first budget"} 
                body={language === "fr" ? "Ajoute une limite de catégorie pour suivre tes dépenses." : "Add a category limit to track your spending."} 
              />
              <div className="flex flex-row items-center gap-2 mb-6 bg-[#EEF3FF] px-4 py-2 rounded-xl">
                <span className="text-[12px] font-extrabold" style={{ color: palette.primary }}>{language === "fr" ? "Créer le budget" : "Create budget"}</span>
              </div>
            </Card>
          </button>
        )}
      </div>

      {/* Upcoming */}
      <div className="mt-2">
        <SectionTitle title={t("upcoming")} />
        <Card className="p-0 overflow-hidden">
          {upcoming.length ? (
            <div className="flex flex-col">
              {upcoming.map((item, index) => (
                <div key={item.id} className={cn("flex flex-row items-center py-[14px] px-0 mx-[14px]", index !== upcoming.length - 1 && "border-b border-[#e5e7eb]")}>
                  <RoundIcon icon={CalendarRange} size={38} color={palette.warning} background="#FFF3D8" />
                  <div className="flex-1 ml-3">
                    <p className="text-[15px] font-bold" style={{ color: palette.foreground }}>{item.title}</p>
                    <p className="text-[13px] mt-1" style={{ color: palette.muted }}>
                      <FormattedDate date={item.nextDueDate} language={language} />
                    </p>
                  </div>
                  <MoneyText amount={item.amount} language={language} className="text-[15px]" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={CalendarRange} 
              title={language === "fr" ? "Aucun paiement à venir" : "No upcoming payments"} 
              body={language === "fr" ? "Les dépenses récurrentes apparaîtront ici." : "Recurring expenses will appear here."} 
            />
          )}
        </Card>
      </div>
        </div>
      </div>
      
    </div>
  );
}
