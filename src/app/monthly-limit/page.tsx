"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Info } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatMoney } from "@/lib/budget-data";
import { Card, Button } from "@/components/budget-ui";

export default function MonthlyLimitPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, finance, setMonthlySpendingLimit } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const [value, setValue] = useState(settings.monthlySpendingLimit ? String(settings.monthlySpendingLimit) : "");

  const save = () => {
    const amount = Number(value.replace(",", "."));
    if (!setMonthlySpendingLimit(amount)) {
      alert(label("Enter a valid monthly limit.", "Saisis une limite mensuelle valide.")); 
      return;
    }
    router.back();
  };

  const clear = () => { 
    setMonthlySpendingLimit(undefined); 
    router.back(); 
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col items-center" style={{ backgroundColor: palette.background }}>
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {label("Spending limit", "Limite de dépenses")}
        </h1>
        <button 
          onClick={save}
          className="h-10 px-4 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-sm font-bold text-white">{label("Save", "Enregistrer")}</span>
        </button>
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: palette.foreground }}>
          {label("Monthly spending limit", "Limite mensuelle")}
        </h2>
        <p className="text-sm mb-8" style={{ color: palette.muted, lineHeight: 1.5 }}>
          {label("Set one total limit to compare against your monthly expenses.", "Définis une limite totale à comparer à tes dépenses mensuelles.")}
        </p>

        <Card className="p-5">
          <label className="block text-sm font-bold mb-3" style={{ color: palette.foreground }}>
            {label("Your limit", "Ta limite")}
          </label>
          <div 
            className="h-20 rounded-2xl bg-white border-2 px-5 flex items-center shadow-sm transition-colors mb-4"
            style={{ borderColor: palette.border }}
          >
            <input 
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              autoFocus
              className="flex-1 h-full text-4xl font-bold bg-transparent outline-none tabular-nums"
              style={{ color: palette.foreground }}
            />
            <span className="text-xl font-bold ml-2" style={{ color: palette.primary }}>DH</span>
          </div>

          <div 
            className="flex gap-3 p-4 rounded-2xl mb-2"
            style={{ backgroundColor: `${palette.primary}10` }}
          >
            <Info size={20} color={palette.primary} className="shrink-0" />
            <p className="text-xs" style={{ color: palette.muted, lineHeight: 1.5 }}>
              {label(
                `This month’s recorded spending is ${formatMoney(finance.expenses, settings.language as any)}.`, 
                `Les dépenses enregistrées ce mois-ci sont de ${formatMoney(finance.expenses, settings.language as any)}.`
              )}
            </p>
          </div>

          {settings.monthlySpendingLimit && (
            <button 
              onClick={clear}
              className="w-full py-4 mt-2 text-sm font-bold transition-opacity hover:opacity-80"
              style={{ color: "#ef4444" }}
            >
              {label("Remove limit", "Supprimer la limite")}
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
