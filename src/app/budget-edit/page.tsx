"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Tag } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { budgetCategoryOptions, CategoryId } from "@/lib/budget-data";
import { cn } from "@/lib/utils";
import { defaultIcons } from "@/components/budget-ui";

function BudgetEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const fromOnboarding = searchParams.get("fromOnboarding");
  
  const { palette } = useThemeContext();
  const { budgets, setBudget, t, categoryName, settings } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const existing = useMemo(() => budgets.find((item) => item.id === id), [budgets, id]);
  const [selectedId, setSelectedId] = useState<CategoryId>(existing?.id ?? (id as CategoryId | undefined) ?? budgetCategoryOptions[0].id);
  const chosen = useMemo(() => existing ?? budgetCategoryOptions.find((item) => item.id === selectedId) ?? budgetCategoryOptions[0], [existing, selectedId]);
  
  const [amount, setAmount] = useState(existing ? String(existing.limit) : "");
  const [error, setError] = useState("");

  const close = () => {
    if (fromOnboarding) router.replace("/budget");
    else router.back();
  };

  const save = () => {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) { 
      setError(t("amount")); 
      return; 
    }
    setBudget(chosen.id, value);
    if (fromOnboarding) router.replace("/budget");
    else router.back();
  };
  
  const ChosenIcon = defaultIcons[chosen.id] || Tag;

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col items-center" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <button 
          onClick={close}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {existing ? t("setBudget") : (t("budget") as string)}
        </h1>
        <button 
          onClick={save}
          className="h-10 px-4 flex items-center justify-center rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: palette.primary, color: "#FFFFFF" }}
        >
          <span className="text-sm font-bold">{existing ? label("Save", "Enregistrer") : label("Set", "Définir")}</span>
        </button>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center flex-1">
        {/* Selected Category Badge */}
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${chosen.color}15` }}
        >
          <ChosenIcon size={32} color={chosen.color} />
        </div>
        <h2 className="text-2xl font-bold mt-4 mb-6" style={{ color: palette.foreground }}>
          {categoryName(chosen.id)}
        </h2>

        {/* Category Picker (only if new) */}
        {!existing && (
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            {budgetCategoryOptions.map((item) => {
              const Icon = defaultIcons[item.id] || Tag;
              const isActive = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all"
                  )}
                  style={{ 
                    borderColor: isActive ? item.color : palette.border,
                    backgroundColor: isActive ? `${item.color}15` : palette.surface
                  }}
                >
                  <Icon size={20} color={isActive ? item.color : palette.muted} />
                  <span 
                    className="text-[11px] font-bold truncate w-full px-2"
                    style={{ color: isActive ? item.color : palette.muted }}
                  >
                    {categoryName(item.id)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Amount Input */}
        <div className="w-full mt-4">
          <label className="block text-sm font-bold mb-2 ml-1" style={{ color: palette.foreground }}>
            {t("budgetLimit")}
          </label>
          <div 
            className="h-24 rounded-3xl bg-white border-2 px-6 flex items-center justify-between shadow-sm transition-colors"
            style={{ borderColor: error ? '#ef4444' : palette.border }}
          >
            <input 
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0"
              className="flex-1 text-4xl font-bold bg-transparent outline-none tabular-nums"
              style={{ color: palette.foreground }}
            />
            <span className="text-xl font-bold ml-2" style={{ color: palette.primary }}>DH</span>
          </div>
          {error && <p className="text-red-500 text-sm font-semibold mt-2 ml-2">{error} is required.</p>}
        </div>
      </div>
    </div>
  );
}

export default function BudgetEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <BudgetEditForm />
    </Suspense>
  );
}
