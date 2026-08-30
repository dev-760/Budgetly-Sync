"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function MonthlyLimitPage() {
  const router = useRouter();
  const { settings, finance, setMonthlySpendingLimit, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const currentLimit = settings.monthlySpendingLimit || 0;
  const [limit, setLimitAmount] = useState(currentLimit ? String(currentLimit) : "");
  const [error, setError] = useState("");

  const save = () => {
    const numLimit = Number(limit.replace(",", "."));
    if (!numLimit || numLimit <= 0) { setError(label("Amount is required", "Le montant est requis")); return; }
    
    setMonthlySpendingLimit(numLimit);
    router.back();
  };

  const clear = () => {
    setMonthlySpendingLimit(0);
    router.back();
  };

  const spent = finance.expenses;
  const ratio = currentLimit > 0 ? spent / currentLimit : 0;
  const percentage = Math.min(ratio * 100, 100);
  const over = spent > currentLimit;

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Global Spending Limit", "Limite de dépense globale")}</h1>
        </div>

        {/* Current Progress (if limit exists) */}
        {currentLimit > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[14px] font-semibold text-[#191b23]">{label("Current Progress", "Progression actuelle")}</p>
                <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] mt-1 tabular-nums uppercase">
                  {formatMoney(spent, settings.language as any)} {t("spent")}
                </p>
              </div>
              <p className={cn(
                "text-[13px] tracking-[0.02em] font-semibold tabular-nums",
                over ? "text-[#ba1a1a]" : "text-[#006c49]"
              )}>
                {over
                  ? `${formatMoney(spent - currentLimit, settings.language as any)} ${t("overBudget")}`
                  : `${formatMoney(currentLimit - spent, settings.language as any)} ${t("remaining")}`
                }
              </p>
            </div>
            <div className="w-full bg-[#ededf8] h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: over ? '#ba1a1a' : ratio > 0.82 ? '#f59e0b' : '#003fb1'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#003fb1]/10 rounded-full flex items-center justify-center">
              <Target size={20} className="text-[#003fb1]" />
            </div>
            <p className="text-[14px] text-[#434654] flex-1">
              {label("Set a single monthly target for all your expenses.", "Définissez un objectif mensuel unique pour toutes vos dépenses.")}
            </p>
          </div>

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

          <div className="pt-4 flex gap-3">
            <button
              onClick={save}
              className="flex-1 py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
            >
              {label("Save Limit", "Enregistrer la limite")}
            </button>
            {currentLimit > 0 && (
              <button
                onClick={clear}
                className="px-6 py-3.5 bg-[#ffdad6] text-[#93000a] rounded-lg text-[14px] font-semibold hover:bg-[#ffb4ab] transition-colors"
              >
                {label("Remove", "Supprimer")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
