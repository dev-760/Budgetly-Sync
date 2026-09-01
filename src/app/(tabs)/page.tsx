"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Wallet, CalendarRange, ArrowDown, ArrowUp, Receipt, PieChart } from 'lucide-react';
import { BrandLockup, Card, EmptyState, MoneyText, ProgressBar, RoundIcon, SectionTitle, FinanceBoardStrip } from '@/components/budget-ui';
import { formatDate, formatMoney } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { FormattedDate } from '@/components/budget-ui';

export default function HomePage() {
  const router = useRouter();
  const { settings, transactions, budgets, recurring, buckets, notifications, finance, t, categoryName } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";

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
    <div className="flex-1 w-full h-full pb-32 md:pb-0 flex flex-col">
      {/* Header - Mobile Only */}
      <div className="md:hidden flex flex-row items-center justify-between mb-5 px-5 pt-4">
        <button className="text-left active:opacity-70 transition-opacity" onClick={() => router.push("/cigarette-tracker")}>
          <BrandLockup compact />
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>{t("goodMorning")}</p>
        </button>

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

      {/* Content - Mobile First */}
      <div className="flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 md:gap-6">

          {/* Primary Column */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Safe to Spend Card */}
            <div
              className="rounded-[24px] p-5.5 shadow-lg overflow-hidden relative"
              style={{ 
                backgroundColor: palette.primary, 
                boxShadow: `0 10px 20px ${palette.primary}40`
              }}
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
            <div className="flex flex-row gap-3">
              <Card className="flex-1 min-h-[132px] p-4 flex flex-col justify-between">
                <div>
                  <RoundIcon icon={Wallet} size={34} color={palette.primary} background="#EAF0FF" />
                  <p className="mt-3 text-[12px] font-semibold" style={{ color: palette.muted }}>{t("availableBalance")}</p>
                </div>
                <MoneyText amount={finance.availableBalance} language={language} className="mt-1.5 text-[18px]" />
              </Card>
              <Card className="flex-1 min-h-[132px] p-4 flex flex-col justify-between">
                <RoundIcon icon={CalendarRange} size={34} color={palette.success} background="#E7F7F1" />
                <p className="mt-3 text-[12px] font-semibold" style={{ color: palette.muted }}>{t("thisMonth")}</p>
                <p className="mt-2 font-bold text-[12px] leading-[17px]">
                  <span style={{ color: palette.success }}>{formatMoney(finance.income, language)}</span> · <span style={{ color: palette.error }}>{formatMoney(finance.expenses, language)}</span>
                </p>
              </Card>
            </div>

            {/* Add Expense Button */}
            <button
              onClick={() => router.push('/transaction?kind=expense')}
              className="w-full h-[52px] rounded-2xl flex flex-row items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: palette.primary, boxShadow: `0 10px 15px -3px ${palette.primary}40` }}
            >
              <span className="text-white text-[24px] font-extrabold leading-none">+</span>
              <span className="text-white text-[14px] font-extrabold">{t("addExpense")}</span>
            </button>

            {/* Finance Board Strip */}
            <FinanceBoardStrip
              netWorth={finance.netWorth}
              buckets={buckets}
              language={language}
              t={(key: string) => t(key as any)}
              onPress={() => router.push('/finance')}
            />

            {/* Recent Transactions */}
            <SectionTitle title={t("recentTransactions")} action={t("viewAll")} onPress={() => router.push('/transactions')} />
            <Card className="p-0 overflow-hidden">
              {recent.length ? (
                <div className="flex flex-col">
                  {recent.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/transaction?id=${item.id}`)}
                      className={cn(
                        "flex flex-row items-center py-3.5 px-4 active:opacity-65 transition-opacity text-left",
                        index !== recent.length - 1 && "border-b"
                      )}
                      style={{ borderColor: palette.border, minHeight: 70 }}
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
                  title={isFrench ? "Prêt à commencer" : "Ready when you are"}
                  body={isFrench ? "Ajoute un revenu ou une dépense pour voir ton activité." : "Add income or an expense to see your activity."}
                />
              )}
            </Card>
          </div>

          {/* Secondary Column - Desktop Only */}
          <div className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col gap-4">

            {/* Budget Health */}
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
                  <p className="text-[13px] font-bold text-right" style={{ color: palette.success }}>
                    {formatMoney(Math.max(foodBudget.limit - foodSpend, 0), language)}<br />{t("remaining")}
                  </p>
                </div>
                <ProgressBar 
                  value={foodSpend / foodBudget.limit} 
                  color={foodSpend / foodBudget.limit > 0.85 ? palette.warning : foodBudget.color} 
                />
              </Card>
            ) : (
              <button
                onClick={() => router.push('/budget-edit')}
                className="w-full active:opacity-65 transition-opacity"
              >
                <Card className="flex flex-col items-center justify-center p-0 overflow-hidden">
                  <EmptyState
                    icon={PieChart}
                    title={isFrench ? "Crée ton premier budget" : "Create your first budget"}
                    body={isFrench ? "Ajoute une limite de catégorie pour suivre tes dépenses." : "Add a category limit to track your spending."}
                  />
                  <div className="flex flex-row items-center gap-2 mb-6 px-4 py-2 rounded-xl justify-center w-full" style={{ backgroundColor: '#EEF3FF' }}>
                    <span className="text-[12px] font-extrabold" style={{ color: palette.primary }}>{isFrench ? "Créer le budget" : "Create budget"}</span>
                    <ArrowDown size={16} color={palette.primary} style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </Card>
              </button>
            )}

            {/* Upcoming */}
            <SectionTitle title={t("upcoming")} />
            <Card className="p-0 overflow-hidden">
              {upcoming.length ? (
                <div className="flex flex-col">
                  {upcoming.map((item, index) => (
                    <div key={item.id} className={cn("flex flex-row items-center py-3.5 px-4", index !== upcoming.length - 1 && "border-b")} style={{ borderColor: palette.border, minHeight: 70 }}>
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
                  title={isFrench ? "Aucun paiement à venir" : "No upcoming payments"}
                  body={isFrench ? "Les dépenses récurrentes apparaîtront ici." : "Recurring expenses will appear here."}
                />
              )}
            </Card>
          </div>

          {/* Mobile Budget Health & Upcoming */}
          <div className="md:hidden flex flex-col gap-4">
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
                  <p className="text-[13px] font-bold text-right" style={{ color: palette.success }}>
                    {formatMoney(Math.max(foodBudget.limit - foodSpend, 0), language)}<br />{t("remaining")}
                  </p>
                </div>
                <ProgressBar 
                  value={foodSpend / foodBudget.limit} 
                  color={foodSpend / foodBudget.limit > 0.85 ? palette.warning : foodBudget.color} 
                />
              </Card>
            ) : (
              <button
                onClick={() => router.push('/budget-edit')}
                className="w-full active:opacity-65 transition-opacity"
              >
                <Card className="flex flex-col items-center justify-center p-0 overflow-hidden">
                  <EmptyState
                    icon={PieChart}
                    title={isFrench ? "Crée ton premier budget" : "Create your first budget"}
                    body={isFrench ? "Ajoute une limite de catégorie pour suivre tes dépenses." : "Add a category limit to track your spending."}
                  />
                  <div className="flex flex-row items-center gap-2 mb-6 px-4 py-2 rounded-xl justify-center w-full" style={{ backgroundColor: '#EEF3FF' }}>
                    <span className="text-[12px] font-extrabold" style={{ color: palette.primary }}>{isFrench ? "Créer le budget" : "Create budget"}</span>
                    <ArrowDown size={16} color={palette.primary} style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </Card>
              </button>
            )}

            <SectionTitle title={t("upcoming")} />
            <Card className="p-0 overflow-hidden">
              {upcoming.length ? (
                <div className="flex flex-col">
                  {upcoming.map((item, index) => (
                    <div key={item.id} className={cn("flex flex-row items-center py-3.5 px-4", index !== upcoming.length - 1 && "border-b")} style={{ borderColor: palette.border, minHeight: 70 }}>
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
                  title={isFrench ? "Aucun paiement à venir" : "No upcoming payments"}
                  body={isFrench ? "Les dépenses récurrentes apparaîtront ici." : "Recurring expenses will appear here."}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
