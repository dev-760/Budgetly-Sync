"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Landmark } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

export default function MonthlyLimitScreen() {
  const router = useRouter();
  const { settings, setMonthlySpendingLimit, t } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const [amount, setAmount] = useState(settings.monthlySpendingLimit ? String(settings.monthlySpendingLimit) : "");
  const [error, setError] = useState("");

  const save = () => {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) {
      setMonthlySpendingLimit(undefined);
    } else {
      setMonthlySpendingLimit(value);
    }
    router.back();
  };

  return (
    <div className="flex flex-col h-full w-full px-5" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="h-[62px] flex flex-row items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>{label("Monthly Limit", "Limite mensuelle")}</span>
        <button onClick={save} className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.primary }}>
          <span className="text-white text-[14px] font-extrabold">{label("Save", "Enregistrer")}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center pt-8">
        <div className="h-[70px] w-[70px] rounded-[25px] flex items-center justify-center mb-[18px]" style={{ backgroundColor: '#F1F5F9' }}>
          <Landmark size={32} color={palette.primary} />
        </div>
        <p className="text-[24px] font-extrabold text-center px-4" style={{ color: palette.foreground }}>
          {label("Set a global limit", "Définir une limite globale")}
        </p>
        <p className="text-[14px] text-center mt-3 mb-8 px-4" style={{ color: palette.muted }}>
          {label("Track your overall spending against a single monthly target.", "Suis tes dépenses totales par rapport à une cible mensuelle unique.")}
        </p>

        <div className="w-full max-w-[400px]">
          <span className="text-[13px] font-extrabold ml-1 mb-2 block" style={{ color: palette.foreground }}>{label("Monthly Target", "Cible mensuelle")}</span>
          <div className="h-[80px] rounded-2xl px-5 flex flex-row items-center justify-between border-[1.5px] border-transparent" style={{ backgroundColor: palette.surface }}>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-[36px] font-extrabold text-left h-full"
              style={{ color: palette.foreground }}
            />
            <span className="font-extrabold text-[18px] ml-2" style={{ color: palette.primary }}>DH</span>
          </div>
          <p className="text-[12px] font-bold mt-3 text-center" style={{ color: palette.muted }}>
            {label("Leave empty to remove the limit.", "Laisse vide pour supprimer la limite.")}
          </p>
        </div>
      </div>
    </div>
  );
}
