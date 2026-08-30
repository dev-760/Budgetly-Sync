"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Wallet, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatMoney } from "@/lib/budget-data";
import { Card, RoundIcon, EmptyState } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

const dueDay = (isoDate: string) => Number(isoDate.slice(8, 10));

function IncomeCalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomeId = searchParams.get("incomeId");
  
  const { palette } = useThemeContext();
  const { settings, recurring } = useBudget();
  
  const language = settings.language;
  const label = (en: string, fr: string) => language === "fr" ? fr : en;
  const locale = language === "fr" ? "fr-FR" : "en-US";
  
  const income = recurring.filter((item) => item.kind === "income");
  const focusedIncome = income.find((item) => item.id === incomeId);
  
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const focusDate = focusedIncome ? new Date(`${focusedIncome.nextDueDate}T12:00:00`) : new Date();
    return new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
  });
  
  const monthIncome = income.filter((item) => dueDay(item.nextDueDate) <= new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate());
  const monthTotal = monthIncome.reduce((sum, item) => sum + item.amount, 0);
  
  const weekdayNames = useMemo(() => 
    Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, index + 1))), 
    [locale]
  );
  
  const days = useMemo(() => {
    const firstWeekday = (visibleMonth.getDay() + 6) % 7;
    const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: firstWeekday + count }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);
  }, [visibleMonth]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col items-center" style={{ backgroundColor: palette.background }}>
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-sm font-bold" style={{ color: palette.foreground }}>
          {label("Income calendar", "Calendrier des revenus")}
        </h1>
        <div className="w-10 h-10" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: palette.foreground }}>
            {label("Monthly income", "Revenu mensuel")}
          </h2>
          <p className="text-sm" style={{ color: palette.muted, lineHeight: 1.5 }}>
            {label("See your salary and allowance dates at a glance.", "Visualise rapidement tes dates de salaire et d’allocation.")}
          </p>
        </div>

        <Card className="flex items-center gap-4 mt-6">
          <RoundIcon icon={Wallet} size={48} color="#10B981" background="#E7F7F1" />
          <div>
            <p className="text-xs font-bold" style={{ color: palette.muted }}>{label("Planned this month", "Prévu ce mois")}</p>
            <p className="text-3xl font-extrabold mt-1" style={{ color: palette.foreground }}>
              {formatMoney(monthTotal, language as any)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
              {monthIncome.length ? `${monthIncome.length} ${label("scheduled item", "élément programmé")}${monthIncome.length > 1 ? "s" : ""}` : label("No income planned yet", "Aucun revenu prévu")}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ChevronLeft size={20} color={palette.primary} />
            </button>
            <h3 className="text-base font-bold capitalize" style={{ color: palette.foreground }}>
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth)}
            </h3>
            <button 
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ChevronRight size={20} color={palette.primary} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdayNames.map((day, index) => (
              <div key={`${day}-${index}`} className="text-center text-[10px] font-extrabold uppercase" style={{ color: palette.muted }}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} className="h-14" />;
              
              const scheduled = monthIncome.filter((item) => dueDay(item.nextDueDate) === day);
              const total = scheduled.reduce((sum, item) => sum + item.amount, 0);
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "h-14 rounded-xl flex flex-col items-center justify-center",
                    scheduled.length > 0 ? "bg-[#F1F5F9] dark:bg-slate-800" : ""
                  )}
                >
                  <span className={cn(
                    "text-xs",
                    scheduled.length > 0 ? "font-extrabold" : "font-bold"
                  )} style={{ color: scheduled.length > 0 ? palette.primary : palette.foreground }}>
                    {day}
                  </span>
                  {scheduled.length > 0 && (
                    <span className="text-[9px] font-extrabold mt-1" style={{ color: palette.primary }}>
                      {Math.round(total)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: palette.foreground }}>
            {label("Scheduled income", "Revenus programmés")}
          </h3>
          <Card className="py-2 divide-y divide-gray-100 dark:divide-slate-800">
            {monthIncome.length ? monthIncome.sort((a, b) => dueDay(a.nextDueDate) - dueDay(b.nextDueDate)).map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-3 py-3 px-3",
                  item.id === incomeId ? "bg-[#E7F7F1] rounded-2xl mx-1" : ""
                )}
              >
                <RoundIcon icon={Wallet} size={36} color="#10B981" background="#E7F7F1" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.title}</h4>
                  <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                    {label("Every month on", "Chaque mois le")} {dueDay(item.nextDueDate)}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: "#10B981" }}>
                  {formatMoney(item.amount, language as any)}
                </span>
              </div>
            )) : (
              <EmptyState 
                icon={CalendarIcon} 
                title={label("No income scheduled", "Aucun revenu programmé")} 
                description={label("Plan your salary or allowance to place it on this calendar.", "Planifie ton salaire ou allocation pour l’ajouter à ce calendrier.")} 
              />
            )}
          </Card>
        </div>

        <button 
          onClick={() => router.push("/finance-manage?mode=income")}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 shadow-sm"
          style={{ backgroundColor: palette.primary }}
        >
          <Plus size={20} color="#FFFFFF" />
          <span className="text-sm font-bold text-white">{label("Manage monthly income", "Gérer les revenus mensuels")}</span>
        </button>
      </div>
    </div>
  );
}

export default function IncomeCalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <IncomeCalendarContent />
    </Suspense>
  );
}
