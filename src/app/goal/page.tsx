"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, Home, Car, GraduationCap, Plane, Laptop, ShoppingBag, Gift, MoreHorizontal } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { cn } from '@/lib/utils';

const iconOptions = [
  { id: 'home', icon: Home },
  { id: 'car', icon: Car },
  { id: 'school', icon: GraduationCap },
  { id: 'flight', icon: Plane },
  { id: 'computer', icon: Laptop },
  { id: 'shopping-bag', icon: ShoppingBag },
  { id: 'card-giftcard', icon: Gift },
  { id: 'more-horiz', icon: MoreHorizontal },
];

const colorOptions = [
  "#003fb1", "#006c49", "#852b00", "#694100", 
  "#ba1a1a", "#7A63D2", "#0ea5e9", "#14b8a6"
];

function GoalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get('goalId');

  const { settings, goals, addGoal, updateGoal, deleteGoal, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => goals.find((item) => item.id === goalId), [goalId, goals]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [targetAmount, setTargetAmount] = useState(existing ? String(existing.targetAmount) : "");
  const [currentAmount, setCurrentAmount] = useState(existing ? String(existing.currentAmount) : "");
  const [icon, setIcon] = useState(existing?.icon ?? "flag");
  const [color, setColor] = useState(existing?.color ?? "#7A63D2");
  const [error, setError] = useState("");

  const save = () => {
    const numTarget = Number(targetAmount.replace(",", "."));
    const numCurrent = Number(currentAmount.replace(",", "."));
    
    if (!title.trim()) { setError(label("Title is required", "Le titre est requis")); return; }
    if (!numTarget || numTarget <= 0) { setError(label("Target amount is required", "L'objectif est requis")); return; }

    const input = { 
      title: title.trim(), 
      targetAmount: numTarget, 
      currentAmount: numCurrent || 0,
      icon, 
      color 
    };

    if (existing) updateGoal(existing.id, input);
    else addGoal(input);
    
    router.back();
  };

  const remove = () => {
    if (window.confirm(label("Delete this goal?", "Supprimer cet objectif ?"))) {
      deleteGoal(existing!.id);
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8f9ff]">
          <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">
            {existing ? label("Edit Goal", "Modifier l'objectif") : t("addGoal")}
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

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("title")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder={label("e.g. New Car", "ex: Nouvelle voiture")}
              className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[16px] font-medium text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all placeholder:text-[#c3c5d7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Amount */}
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("targetAmount")}</label>
              <div className="flex items-center px-4 py-3 rounded-lg border border-[#e5e7eb] focus-within:border-[#003fb1] focus-within:ring-1 focus-within:ring-[#003fb1] transition-all bg-white">
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetAmount}
                  onChange={(e) => { setTargetAmount(e.target.value); setError(""); }}
                  placeholder="0"
                  className="flex-1 text-[16px] font-semibold text-[#191b23] bg-transparent outline-none tabular-nums placeholder:text-[#c3c5d7]"
                />
                <span className="text-[14px] font-semibold text-[#434654]">DH</span>
              </div>
            </div>

            {/* Current Amount */}
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("savedAmount")}</label>
              <div className="flex items-center px-4 py-3 rounded-lg border border-[#e5e7eb] focus-within:border-[#003fb1] focus-within:ring-1 focus-within:ring-[#003fb1] transition-all bg-white">
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentAmount}
                  onChange={(e) => { setCurrentAmount(e.target.value); setError(""); }}
                  placeholder="0"
                  className="flex-1 text-[16px] font-semibold text-[#191b23] bg-transparent outline-none tabular-nums placeholder:text-[#c3c5d7]"
                />
                <span className="text-[14px] font-semibold text-[#434654]">DH</span>
              </div>
            </div>
          </div>

          {error && <p className="text-[13px] text-[#ba1a1a] font-semibold">{error}</p>}

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{t("icon")}</label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setIcon(opt.id)}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center border transition-all",
                      icon === opt.id
                        ? "bg-[#003fb1]/5 border-[#003fb1] ring-1 ring-[#003fb1] text-[#003fb1]"
                        : "bg-white border-[#e5e7eb] text-[#434654] hover:border-[#003fb1]/30"
                    )}
                  >
                    <Icon size={20} />
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
            {label("Save Goal", "Enregistrer l'objectif")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff]" />}>
      <GoalContent />
    </Suspense>
  );
}
