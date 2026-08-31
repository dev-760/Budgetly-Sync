"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Save, ShoppingCart, Car, Home, Laptop, Heart, GraduationCap, ShoppingBag, Receipt, MoreHorizontal } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { budgetCategoryOptions, CategoryId } from '@/lib/budget-data';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

const getLucideIcon = (id: string) => {
  switch (id) {
    case 'food': return ShoppingCart;
    case 'transport': return Car;
    case 'housing': return Home;
    case 'entertainment': return Laptop;
    case 'health': return Heart;
    case 'education': return GraduationCap;
    case 'shopping': return ShoppingBag;
    default: return MoreHorizontal;
  }
};

function BudgetEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const fromOnboarding = searchParams.get('fromOnboarding') === 'true';

  const { settings, budgets, setBudget, t, categoryName } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => budgets.find((item) => item.id === idParam), [budgets, idParam]);
  const [selectedId, setSelectedId] = useState<CategoryId>(
    existing?.id ?? (idParam as CategoryId | undefined) ?? budgetCategoryOptions[0].id
  );
  
  const chosen = useMemo(() => 
    existing ?? budgetCategoryOptions.find((item) => item.id === selectedId) ?? budgetCategoryOptions[0], 
    [existing, selectedId]
  );
  
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

  const ChosenIcon = getLucideIcon(chosen.id);

  return (
    <div className="flex flex-col h-full w-full bg-background pt-safe overflow-hidden" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="h-[62px] flex flex-row items-center justify-between px-5 shrink-0">
        <button 
          onClick={close}
          className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-65 transition-opacity"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>
          {existing ? t("setBudget") : t("budget")}
        </span>
        <button 
          onClick={save}
          className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-65 transition-opacity"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-white text-[14px] font-extrabold">
            {existing ? label("Save", "Enregistrer") : label("Set", "Définir")}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col items-center pt-8 pb-[100px] px-5 max-w-[400px] mx-auto">
          
          <div className="flex flex-col items-center">
            <div className="h-[70px] w-[70px] rounded-[25px] flex items-center justify-center bg-[#F1F5F9]">
              <ChosenIcon size={28} color={chosen.color} />
            </div>
            <span className="text-[24px] font-extrabold mt-[18px]" style={{ color: palette.foreground }}>
              {categoryName(chosen.id)}
            </span>
          </div>

          {!existing && (
            <div className="w-full flex flex-row flex-wrap gap-[10px] mt-[22px]">
              {budgetCategoryOptions.map((item) => {
                const isSelected = selectedId === item.id;
                const Icon = getLucideIcon(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className="w-[calc(33.333%-7px)] min-h-[74px] p-2.5 flex flex-col gap-1.5 rounded-2xl border-[1.5px] items-center justify-center active:opacity-65 transition-all"
                    style={{ 
                      backgroundColor: isSelected ? `${item.color}14` : palette.surface,
                      borderColor: isSelected ? item.color : palette.border 
                    }}
                  >
                    <Icon size={17} color={isSelected ? item.color : palette.muted} />
                    <span 
                      className="text-[11px] font-bold text-center truncate w-full"
                      style={{ color: isSelected ? item.color : palette.muted }}
                    >
                      {categoryName(item.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="w-full flex flex-col items-center mt-7">
            <span className="text-[15px] font-extrabold self-start ml-1" style={{ color: palette.foreground }}>
              {t("budgetLimit")}
            </span>
            <div 
              className="mt-4 w-full h-[80px] rounded-2xl px-5 flex flex-row items-center justify-between border-[1.5px] border-transparent"
              style={{ backgroundColor: palette.background }}
            >
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0"
                className="flex-1 bg-transparent border-none outline-none text-[36px] font-extrabold h-full text-left"
                style={{ color: palette.foreground }}
              />
              <span className="font-extrabold text-[18px] ml-2.5" style={{ color: palette.primary }}>
                DH
              </span>
            </div>
            {error && (
              <span className="mt-[7px] text-[12px]" style={{ color: palette.error }}>
                {error} is required.
              </span>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function BudgetEditPage() {
  return (
    <Suspense fallback={<div />}>
      <BudgetEditContent />
    </Suspense>
  );
}
