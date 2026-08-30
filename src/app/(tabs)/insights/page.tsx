"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarMonth, TrendingUp, TrendingDown, Flag, ChevronRight, PieChart } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { Card, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const donutRadius = 43;
const donutLength = 2 * Math.PI * donutRadius;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthTotal = (transactions: { kind: "income" | "expense"; amount: number; date: string }[], year: number, month: number, kind: "income" | "expense") => transactions.filter((item) => {
  const date = new Date(item.date);
  return date.getFullYear() === year && date.getMonth() === month && item.kind === kind;
}).reduce((sum, item) => sum + item.amount, 0);

const percentChange = (current: number, previous: number) => previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-bold text-slate-500 flex-1">{label}</span>
      <span className="text-xs font-extrabold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function CompareMetric({ label, value, change, positive }: { label: string; value: string; change: number | null; positive: boolean }) {
  const color = change === null ? '#64748b' : positive ? '#10B981' : '#ef4444';
  const prefix = change === null ? "" : change > 0 ? "+" : "";
  return (
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
      <p className="text-[13px] font-extrabold mt-1 text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] font-extrabold mt-1" style={{ color }}>
        {change === null ? "—" : `${prefix}${change}%`}
      </p>
    </div>
  );
}

export default function InsightsPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, transactions, goals, categoryName, finance } = useBudget();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const now = new Date();
  const thisMonth = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  
  const income = thisMonth.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const spending = thisMonth.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousIncome = monthTotal(transactions, previousMonthDate.getFullYear(), previousMonthDate.getMonth(), "income");
  const previousSpending = monthTotal(transactions, previousMonthDate.getFullYear(), previousMonthDate.getMonth(), "expense");
  const previousNet = previousIncome - previousSpending;
  
  const totalFlow = income + spending;
  const incomeShare = totalFlow > 0 ? income / totalFlow : 0.5;
  
  const categoryTotals = thisMonth.filter((item) => item.kind === "expense").reduce<Record<string, number>>((sum, item) => ({ ...sum, [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount }), {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const categoryMax = Math.max(...categories.map(([, amount]) => amount), 1);
  
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index)));
    const nextDate = new Date(date); nextDate.setDate(date.getDate() + 1);
    const amount = transactions.filter((item) => item.kind === "expense" && new Date(item.date) >= date && new Date(item.date) < nextDate).reduce((sum, item) => sum + item.amount, 0);
    const day = new Intl.DateTimeFormat(isFrench ? "fr-MA" : "en-US", { weekday: "narrow" }).format(date);
    return { amount, day };
  });
  const weeklyMax = Math.max(...weekly.map((item) => item.amount), 1);
  const net = income - spending;
  const top = categories[0];

  return (
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-xl mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-[-0.8px]" style={{ color: palette.foreground }}>
            {label("Monthly dashboard", "Tableau mensuel")}
          </h1>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>
            {label("Your money story, based on this device.", "Ton aperçu, basé sur cet appareil.")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
          <CalendarMonth size={16} color="#1A56DB" />
          <span className="text-[11px] font-bold text-blue-600">{label("This month", "Ce mois-ci")}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-[23px] p-5 mb-5" style={{ backgroundColor: '#172033' }}>
        <div className="flex justify-between">
          <div>
            <p className="text-xs font-bold text-[#BFD0FF]">{label("Monthly balance", "Solde mensuel")}</p>
            <p className="text-[34px] font-extrabold mt-2 tabular-nums leading-[42px]" style={{ color: net >= 0 ? "#FFFFFF" : "#FFD8D8" }}>
              {formatMoney(Math.abs(net), language as any)}
            </p>
            <p className="text-xs mt-1.5 text-[#DCE6FF]">
              {net >= 0 ? label("You earned more than you spent.", "Tu as gagné plus que tu as dépensé.") : label("Spending is above income this month.", "Les dépenses dépassent les revenus ce mois-ci.")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 shrink-0">
            {net >= 0 ? <TrendingUp size={26} color="#FFFFFF" /> : <TrendingDown size={26} color="#FFFFFF" />}
          </div>
        </div>
        <div className="mt-[18px] pt-3.5 border-t border-white/20 flex justify-between">
          <p className="text-xs font-bold text-[#BFD0FF]">{label("Safe to spend", "Reste à dépenser")}</p>
          <p className="text-[13px] font-extrabold text-white">{formatMoney(finance.safeToSpend, language as any)}</p>
        </div>
      </div>

      {/* Flow Card */}
      <SectionTitle title={label("Income & spending", "Revenus et dépenses")} />
      <Card className="flex items-center gap-4 p-4 mb-5">
        <div className="relative w-[108px] h-[108px] flex items-center justify-center shrink-0">
          <svg width={108} height={108} viewBox="0 0 108 108">
            <circle cx="54" cy="54" r={donutRadius} stroke="#FDEBEC" strokeWidth="13" fill="transparent" />
            <circle 
              cx="54" cy="54" r={donutRadius} 
              stroke="#10B981" strokeWidth="13" fill="transparent" 
              strokeLinecap="round" 
              strokeDasharray={`${donutLength * incomeShare} ${donutLength}`} 
              className="-rotate-90 origin-center"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500">{label("Inflow", "Entrées")}</span>
            <span className="text-[19px] font-extrabold mt-0.5 text-slate-900 dark:text-white">
              {Math.round(incomeShare * 100)}%
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Legend color="#10B981" label={label("Income", "Revenus")} value={formatMoney(income, language as any)} />
          <Legend color="#ef4444" label={label("Spending", "Dépenses")} value={formatMoney(spending, language as any)} />
          <div className="pt-2 mt-0.5 border-t flex justify-between" style={{ borderColor: palette.border }}>
            <span className="text-xs font-bold text-slate-500">{label("Net", "Net")}</span>
            <span className="text-xs font-extrabold" style={{ color: net >= 0 ? '#10B981' : '#ef4444' }}>
              {net >= 0 ? "+" : "−"}{formatMoney(Math.abs(net), language as any)}
            </span>
          </div>
        </div>
      </Card>

      {/* Compare Card */}
      <SectionTitle title={label("Compared with last month", "Comparé au mois dernier")} />
      <Card className="p-4 mb-5">
        {previousIncome || previousSpending ? (
          <div className="flex justify-between gap-2">
            <CompareMetric label={label("Income", "Revenus")} value={formatMoney(income, language as any)} change={percentChange(income, previousIncome)} positive />
            <CompareMetric label={label("Spending", "Dépenses")} value={formatMoney(spending, language as any)} change={percentChange(spending, previousSpending)} positive={false} />
            <CompareMetric label={label("Net", "Net")} value={formatMoney(Math.abs(net), language as any)} change={percentChange(net, previousNet)} positive={net >= previousNet} />
          </div>
        ) : (
          <p className="text-[13px] leading-[18px] text-center py-3.5 text-slate-500">
            {label("Add entries next month to unlock your month-to-month comparison.", "Ajoute des opérations le mois prochain pour débloquer la comparaison mensuelle.")}
          </p>
        )}
      </Card>

      {/* Bar Chart */}
      <SectionTitle title={label("Last 7 days", "7 derniers jours")} />
      <Card className="p-4 mb-5">
        <div className="flex justify-between mb-2">
          <p className="text-xs font-bold text-slate-500">{label("Daily spending", "Dépenses quotidiennes")}</p>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
            {formatMoney(weekly.reduce((sum, item) => sum + item.amount, 0), language as any)}
          </p>
        </div>
        <div className="h-[142px] flex items-end justify-between px-1">
          {weekly.map((item, index) => (
            <div key={`${item.day}-${index}`} className="flex flex-col items-center gap-2 w-7">
              <div 
                className="w-[18px] rounded-full transition-all"
                style={{ 
                  height: Math.max(item.amount ? 12 : 4, 104 * (item.amount / weeklyMax)), 
                  backgroundColor: index === 6 ? '#1A56DB' : '#BFD0FF' 
                }} 
              />
              <span className="text-[10px] font-extrabold text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-3 text-slate-500">
          {label("The latest day is highlighted in blue.", "Le dernier jour est en bleu.")}
        </p>
      </Card>

      {/* Goals */}
      <SectionTitle 
        title={label("Savings goal progress", "Progression des objectifs")} 
        action={label("Manage", "Gérer")} 
        onPress={() => router.push("/goal")} 
      />
      <Card className="p-2 mb-5">
        {goals.length ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {goals.slice(0, 4).map((goal, index) => {
              const percent = Math.min(100, Math.round((goal.savedAmount / Math.max(goal.targetAmount, 1)) * 100));
              const accent = ["#7A63D2", "#1A56DB", "#10B981", "#F59E0B"][index];
              return (
                <button
                  key={goal.id}
                  onClick={() => router.push(`/goal?goalId=${goal.id}`)}
                  className="w-full text-left py-3 px-2 transition-opacity hover:opacity-70"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 pr-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      <span className="text-[13px] font-extrabold text-slate-900 dark:text-white truncate">{goal.title}</span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600 shrink-0">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(percent ? 5 : 0, percent)}%`, backgroundColor: accent }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-500">
                      {formatMoney(goal.savedAmount, language as any)} / {formatMoney(goal.targetAmount, language as any)}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600">{label("Open", "Ouvrir")} ›</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1.5 px-2">
            <RoundIcon icon={Flag} size={36} color="#7A63D2" background="#EEEAFE" />
            <div>
              <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                {label("Your next milestone starts here", "Ton prochain objectif commence ici")}
              </p>
              <p className="text-[11px] leading-4 mt-1 text-slate-500">
                {label("Add a goal to track each contribution visually.", "Ajoute un objectif pour suivre chaque contribution visuellement.")}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Where your money went */}
      <SectionTitle title={label("Where your money went", "Répartition des dépenses")} />
      <Card className="p-2">
        {categories.length ? (
          <div className="p-2">
            {categories.map(([id, amount], index) => (
              <button
                key={id}
                onClick={() => router.push(`/transactions?category=${id}`)}
                className="w-full text-left mb-4 block transition-opacity hover:opacity-70"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: ["#1A56DB", "#10B981", "#F59E0B", "#7A63D2"][index] }} />
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {categoryName(id as any)}
                    </span>
                    <ChevronRight size={16} color={palette.muted} />
                  </div>
                  <span className="text-xs font-extrabold text-slate-500">
                    {formatMoney(amount, language as any)}
                  </span>
                </div>
                <div className="h-[7px] rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${Math.max(5, (amount / categoryMax) * 100)}%`, 
                      backgroundColor: ["#1A56DB", "#10B981", "#F59E0B", "#7A63D2"][index] 
                    }} 
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[13px] leading-[18px] text-center py-3.5 text-slate-500">
            {label("Add an expense to see your category mix.", "Ajoute une dépense pour voir la répartition.")}
          </p>
        )}
      </Card>

      {top && (
        <Card className="mt-3.5 flex items-center gap-3 p-3">
          <RoundIcon icon={PieChart} size={40} color="#F59E0B" background="#FFF3D8" />
          <div>
            <p className="text-xs font-bold text-slate-500">{label("Top spending category", "Catégorie principale")}</p>
            <p className="text-[15px] font-extrabold mt-1 text-slate-900 dark:text-white">
              {categoryName(top[0] as any)} · {formatMoney(top[1], language as any)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}