"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, CalendarRange, Flag, ChevronRight, Lightbulb } from 'lucide-react';
import { Card, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthTotal = (transactions: { kind: "income" | "expense"; amount: number; date: string }[], year: number, month: number, kind: "income" | "expense") =>
  transactions.filter((item) => { const d = new Date(item.date); return d.getFullYear()===year && d.getMonth()===month && item.kind===kind; }).reduce((sum, item) => sum + item.amount, 0);
const percentChange = (current: number, previous: number) => previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

export default function InsightsScreen() {
  const { settings, transactions, goals, categoryName, finance } = useBudget();
  const { palette } = useThemeContext();
  const router = useRouter();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const now = new Date();

  const thisMonth = transactions.filter((item) => { const d = new Date(item.date); return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth(); });
  const income = thisMonth.filter((item) => item.kind==="income").reduce((sum, item) => sum + item.amount, 0);
  const spending = thisMonth.filter((item) => item.kind==="expense").reduce((sum, item) => sum + item.amount, 0);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevIncome = monthTotal(transactions, prevDate.getFullYear(), prevDate.getMonth(), "income");
  const prevSpending = monthTotal(transactions, prevDate.getFullYear(), prevDate.getMonth(), "expense");
  const prevNet = prevIncome - prevSpending;
  const net = income - spending;
  const totalFlow = income + spending;
  const incomeShare = totalFlow > 0 ? Math.round((income / totalFlow) * 100) : 50;

  const categoryTotals = thisMonth.filter((item) => item.kind==="expense").reduce<Record<string, number>>((sum, item) => ({ ...sum, [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount }), {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const categoryMax = Math.max(...categories.map(([, amount]) => amount), 1);
  const accentColors = [palette.primary, palette.success, palette.warning, "#7A63D2"];

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i)));
    const nextDate = new Date(date); nextDate.setDate(date.getDate() + 1);
    const amount = transactions.filter((item) => item.kind==="expense" && new Date(item.date) >= date && new Date(item.date) < nextDate).reduce((sum, item) => sum + item.amount, 0);
    const day = new Intl.DateTimeFormat(isFrench ? "fr-MA" : "en-US", { weekday: "narrow" }).format(date);
    return { amount, day };
  });
  const weeklyMax = Math.max(...weekly.map((item) => item.amount), 1);
  const top = categories[0];

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto max-w-[800px] mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-3.5 pb-7">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h1 className="text-[27px] font-extrabold tracking-[-0.8px]" style={{ color: palette.foreground }}>{label("Monthly dashboard", "Tableau mensuel")}</h1>
            <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>{label("Your money story, based on this device.", "Ton aperçu, basé sur cet appareil.")}</p>
          </div>
          <div className="flex flex-row items-center gap-1.5 rounded-xl px-2.5 py-[7px]" style={{ backgroundColor: "#EAF0FF" }}>
            <CalendarRange size={16} color={palette.primary} />
            <span className="text-[11px] font-bold" style={{ color: palette.primary }}>{label("This month", "Ce mois-ci")}</span>
          </div>
        </div>

        <Card className="mt-[18px] p-5" style={{ backgroundColor: palette.foreground, borderColor: palette.foreground, borderRadius: 23 }}>
          <div className="flex flex-row justify-between">
            <div>
              <p className="text-[#BFD0FF] text-[12px] font-bold">{label("Monthly balance", "Solde mensuel")}</p>
              <p className={`text-[34px] leading-[42px] font-extrabold mt-2 tabular-nums ${net >= 0 ? "text-white" : "text-[#FFD8D8]"}`}>
                {formatMoney(Math.abs(net), language)}
              </p>
              <p className="text-[#DCE6FF] text-[12px] mt-1.5">
                {net >= 0 ? label("You earned more than you spent.", "Tu as gagné plus que tu as dépensé.") : label("Spending is above income this month.", "Les dépenses dépassent les revenus ce mois-ci.")}
              </p>
            </div>
            <div className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center bg-white/[0.14]">
              {net >= 0 ? <TrendingUp size={26} color="white" /> : <TrendingDown size={26} color="white" />}
            </div>
          </div>
          <div className="mt-[18px] pt-3.5 border-t border-white/20 flex flex-row justify-between">
            <span className="text-[#BFD0FF] text-[12px] font-bold">{label("Safe to spend", "Reste à dépenser")}</span>
            <span className="text-white text-[13px] font-extrabold">{formatMoney(finance.safeToSpend, language)}</span>
          </div>
        </Card>

        <SectionTitle title={label("Income & spending", "Revenus et dépenses")} />
        <Card className="flex flex-row items-center gap-4 p-4">
          <div className="relative w-[108px] h-[108px]">
            <svg width="108" height="108" viewBox="0 0 108 108">
              <circle cx="54" cy="54" r="43" stroke="#FDEBDC" strokeWidth="13" fill="transparent" />
              <circle cx="54" cy="54" r="43" stroke={palette.success} strokeWidth="13" fill="transparent" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 43 * incomeShare / 100} ${2 * Math.PI * 43}`}
                transform="rotate(-90 54 54)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: palette.muted }}>{label("Inflow", "Entrées")}</span>
              <span className="text-[19px] font-extrabold mt-0.5" style={{ color: palette.foreground }}>{incomeShare}%</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            <LegendRow color={palette.success} label={label("Income", "Revenus") } value={formatMoney(income, language)} muted={palette.muted} fg={palette.foreground} />
            <LegendRow color={palette.error} label={label("Spending", "Dépenses") } value={formatMoney(spending, language)} muted={palette.muted} fg={palette.foreground} />
            <div className="pt-2.5 mt-0.5 border-t flex flex-row justify-between" style={{ borderColor: palette.border }}>
              <span className="text-[12px] font-bold" style={{ color: palette.muted }}>{label("Net", "Net")}</span>
              <span className="text-[12px] font-extrabold" style={{ color: net >= 0 ? palette.success : palette.error }}>
                {net >= 0 ? "+" : "-" }{formatMoney(Math.abs(net), language)}
              </span>
            </div>
          </div>
        </Card>

        <SectionTitle title={label("Compared with last month", "Comparé au mois dernier")} />
        <Card className="p-4">
          {prevIncome || prevSpending ? (
            <div className="flex flex-row justify-between gap-2">
              <CompareMetric label={label("Income", "Revenus")} value={formatMoney(income, language)} change={percentChange(income, prevIncome)} positive fg={palette.foreground} muted={palette.muted} success={palette.success} error={palette.error} />
              <CompareMetric label={label("Spending", "Dépenses")} value={formatMoney(spending, language)} change={percentChange(spending, prevSpending)} positive={false} fg={palette.foreground} muted={palette.muted} success={palette.success} error={palette.error} />
              <CompareMetric label={label("Net", "Net")} value={formatMoney(Math.abs(net), language)} change={percentChange(net, prevNet)} positive={net >= prevNet} fg={palette.foreground} muted={palette.muted} success={palette.success} error={palette.error} />
            </div>
          ) : (
            <p className="text-[13px] leading-[18px] text-center py-3.5" style={{ color: palette.muted }}>
              {label("Add entries next month to unlock your month-to-month comparison.", "Ajoute des opérations le mois prochain pour débloquer la comparaison mensuelle.")}
            </p>
          )}
        </Card>

        <SectionTitle title={label("Last 7 days", "7 derniers jours")} />
        <Card>
          <div className="flex flex-row justify-between mb-2">
            <span className="text-[12px] font-bold" style={{ color: palette.muted }}>{label("Daily spending", "Dépenses quotidiennes")}</span>
            <span className="text-[12px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(weekly.reduce((s, i) => s + i.amount, 0), language)}</span>
          </div>
          <div className="h-[142px] flex flex-row items-end justify-between px-[3px]">
            {weekly.map((item, i) => (
              <div key={`${item.day}-${i}`} className="flex flex-col items-center gap-[7px] w-7">
                <div className="w-[18px] rounded-full" style={{ height: Math.max(item.amount ? 12 : 4, 104 * (item.amount / weeklyMax)), backgroundColor: i === 6 ? palette.primary : "#BFD0FF" }} />
                <span className="text-[10px] font-extrabold" style={{ color: palette.muted }}>{item.day}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: palette.muted }}>{label("The latest day is highlighted in blue.", "Le dernier jour est en bleu.")}</p>
        </Card>

        <SectionTitle title={label("Where your money went", "Répartition des dépenses")} />
        <Card>
          {categories.length ? categories.map(([id, amount], i) => (
            <button key={id} onClick={() => router.push(`/transactions?category=${id}`)} className="w-full mb-4 last:mb-0 active:opacity-70 transition-opacity text-left">
              <div className="flex flex-row items-center gap-[7px]">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: accentColors[i] }} />
                <span className="flex-1 text-[13px] font-bold" style={{ color: palette.foreground }}>{categoryName(id as any)}</span>
                <ChevronRight size={16} color={palette.muted} />
              </div>
              <span className="text-[12px] font-extrabold" style={{ color: palette.muted }}>{formatMoney(amount, language)}</span>
              <div className="h-[7px] rounded-[5px] mt-2 overflow-hidden" style={{ backgroundColor: "#EEF1F7" }}>
                <div className="h-full rounded-[5px]" style={{ width: `${Math.max(5, (amount / categoryMax) * 100)}%`, backgroundColor: accentColors[i] }} />
              </div>
            </button>
          )) : (
            <p className="text-[13px] leading-[18px] text-center py-3.5" style={{ color: palette.muted }}>
              {label("Add an expense to see your category mix.", "Ajoute une dépense pour voir la répartition.")}
            </p>
          )}
        </Card>

        {top && (
          <Card className="mt-3.5 flex flex-row items-center gap-3">
            <RoundIcon icon={Lightbulb} size={40} color={palette.warning} background="#FFF3D8" />
            <div className="flex-1">
              <p className="text-[12px] font-bold" style={{ color: palette.muted }}>{label("Top spending category", "Catégorie principale")}</p>
              <p className="text-[15px] font-extrabold mt-[3px]" style={{ color: palette.foreground }}>{categoryName(top[0] as any)} · {formatMoney(top[1], language)}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, muted, fg }: { color: string; label: string; value: string; muted: string; fg: string }) {
  return (
    <div className="flex flex-row items-center gap-[7px]">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 text-[12px] font-bold" style={{ color: muted }}>{label}</span>
      <span className="text-[12px] font-extrabold" style={{ color: fg }}>{value}</span>
    </div>
  );
}

function CompareMetric({ label, value, change, positive, fg, muted, success, error }: { label: string; value: string; change: number | null; positive: boolean; fg: string; muted: string; success: string; error: string }) {
  const color = change === null ? muted : positive ? success : error;
  const prefix = change === null ? "" : change > 0 ? "+" : "";
  return (
    <div className="flex-1">
      <p className="text-[10px] font-bold" style={{ color: muted }}>{label}</p>
      <p className="text-[13px] font-extrabold mt-1.5" style={{ color: fg }}>{value}</p>
      <p className="text-[11px] font-extrabold mt-1" style={{ color }}>{change === null ? "—" : `${prefix}${change}%`}</p>
    </div>
  );
}
