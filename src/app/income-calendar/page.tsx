"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, CalendarDays } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

export default function IncomeCalendarScreen() {
  const router = useRouter();
  const { settings, recurring, t } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const recurringIncome = recurring.filter((item) => item.kind === "income");

  return (
    <div className="flex flex-col h-full w-full px-5" style={{ backgroundColor: palette.background }}>
      <div className="h-[62px] flex flex-row items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>{label("Income Calendar", "Calendrier des revenus")}</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-8">
        <div className="h-[70px] w-[70px] rounded-[25px] flex items-center justify-center mb-[18px]" style={{ backgroundColor: '#E7F7F1' }}>
          <CalendarDays size={32} color={palette.success} />
        </div>
        <p className="text-[24px] font-extrabold text-center px-4" style={{ color: palette.foreground }}>
          {label("Your Paydays", "Vos jours de paie")}
        </p>
        
        <div className="w-full max-w-[400px] mt-8 flex flex-col gap-3">
          {recurringIncome.length === 0 ? (
            <p className="text-[14px] text-center" style={{ color: palette.muted }}>
              {label("No income scheduled.", "Aucun revenu planifié.")}
            </p>
          ) : (
            recurringIncome.map(item => (
              <div key={item.id} className="p-4 rounded-2xl border flex flex-row justify-between items-center" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
                <div>
                  <p className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{item.title}</p>
                  <p className="text-[13px] mt-1" style={{ color: palette.muted }}>{item.nextDueDate}</p>
                </div>
                <p className="text-[16px] font-extrabold" style={{ color: palette.success }}>{item.amount} DH</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
