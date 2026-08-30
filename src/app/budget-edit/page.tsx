"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, ShoppingCart, Car, Home, Laptop, Heart, GraduationCap, ShoppingBag, Receipt, MoreHorizontal } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { categoryIds } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  food: ShoppingCart, transport: Car, housing: Home, entertainment: Laptop,
  health: Heart, education: GraduationCap, shopping: ShoppingBag, other: MoreHorizontal
};

const colorOptions = [
  "#003fb1", "#006c49", "#852b00", "#694100", 
  "#ba1a1a", "#7A63D2", "#0ea5e9", "#14b8a6"
];

function BudgetEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const { settings, budgets, setBudget, removeBudget, t, categoryName } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => budgets.find((item) => item.id === idParam), [idParam, budgets]);

  const [categoryId, setCategoryId] = useState(existing?.id ?? "food");
  const [limit, setLimitAmount] = useState(existing ? String(existing.limit) : "");
  const [color, setColor] = useState(existing?.color ?? "#003fb1");
  const [error, setError] = useState("");

  const save = () => {
    const numLimit = Number(limit.replace(",", "."));
    if (!numLimit || numLimit <= 0) { setError(label("Limit amount is required", "La limite est requise")); return; }

    setBudget({
      id: categoryId,
      limit: numLimit,
      color,
      icon: categoryId
    });
    
    router.back();
  };

  const remove = () => {
    if (window.confirm(label("Delete this budget?", "Supprimer ce budget ?"))) {
      removeBudget(existing!.id);
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8f9ff]">
          <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">
            {existing ? label("Edit Budget", "Modifier le budget") : label("Set Budget", "Définir un budget")}
          </h2>
          <div className="flex items-center gap-2">
            {existing && (
              <button onClick={remove} className="p-2 rounded-lg hover:bg-[#ffdad6] transition-colors">
                <Trash2 size={20} className="text-[#ba1a1a]" />
              </button>
            )}
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
              <X size={20} className="text-[#434654]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Limit Amount */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("monthlyLimit")}</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={limit}
                onChange={(e) => { setLimitAmount(e.target.value); setError(""); }}
                placeholder="0"
                className="flex-1 text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#191b23] bg-transparent outline-none tabular-nums placeholder:text-[#c3c5d7]"
                autoFocus
              />
              <span className="text-[22px] font-semibold text-[#434654]">DH</span>
            </div>
            {error && <p className="text-[13px] text-[#ba1a1a] font-semibold mt-2">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{label("Category", "Catégorie")}</label>
            <div className="grid grid-cols-4 gap-2">
              {categoryIds.map((id) => {
                const Icon = iconMap[id] || Receipt;
                // If not editing this specific budget, disable it if a budget already exists for it
                const isTaken = !existing && budgets.some(b => b.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => !isTaken && setCategoryId(id)}
                    disabled={isTaken}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center",
                      categoryId === id
                        ? "bg-[#003fb1]/5 border-[#003fb1] ring-1 ring-[#003fb1]"
                        : isTaken 
                          ? "bg-[#f8f9ff] border-[#e5e7eb] opacity-50 cursor-not-allowed"
                          : "bg-white border-[#e5e7eb] hover:border-[#003fb1]/30"
                    )}
                  >
                    <Icon size={20} className={categoryId === id ? "text-[#003fb1]" : "text-[#434654]"} />
                    <span className={cn(
                      "text-[11px] font-semibold",
                      categoryId === id ? "text-[#003fb1]" : "text-[#434654]"
                    )}>
                      {categoryName(id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{t("color")}</label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform",
                    color === c ? "ring-2 ring-offset-2 ring-[#003fb1] scale-110" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={save}
            className="w-full mt-4 py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            {existing ? label("Update Budget", "Mettre à jour le budget") : label("Save Budget", "Enregistrer le budget")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff]" />}>
      <BudgetEditContent />
    </Suspense>
  );
}
