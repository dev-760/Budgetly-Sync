"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, Flag, Laptop, Heart, Car, Home } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

const goalIcons = [
  { id: 'flag', icon: Flag },
  { id: 'computer', icon: Laptop },
  { id: 'favorite', icon: Heart },
  { id: 'directions-car', icon: Car },
  { id: 'home', icon: Home },
];

function GoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get('whatever');
  
  const { settings, goals, addGoal, updateGoal, deleteGoal, t } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => goals.find((item) => item.id === goalId), [goals, goalId]);
  
  const [title, setTitle] = useState(existing?.title ?? "");
  const [targetAmount, setTargetAmount] = useState(existing ? String(existing.targetAmount) : "");
  const [savedAmount, setSavedAmount] = useState(existing ? String(existing.savedAmount) : "");
  const [icon, setIcon] = useState(existing?.icon ?? goalIcons[0].id);
  const [errors, setErrors] = useState<any>({});

  const save = () => {
    const target = Number(targetAmount.replace(",", "."));
    const saved = Number(savedAmount.replace(",", ".")) || 0;
    
    const newErrors: any = {};
    if (!title.trim()) newErrors.title = true;
    if (!target || target <= 0) newErrors.targetAmount = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const input = { title: title.trim(), targetAmount: target, savedAmount: saved, icon };
    if (existing) updateGoal(existing.id, input);
    else addGoal(input);
    
    router.back();
  };

  const remove = () => {
    if (existing && window.confirm(label("Delete this goal?", "Supprimer cet objectif ?"))) {
      deleteGoal(existing.id);
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background" style={{ backgroundColor: palette.background }}>
      <div className="h-[62px] flex flex-row items-center justify-between px-5 shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>
          {existing ? label("Edit goal", "Modifier l'objectif") : t("addGoal")}
        </span>
        <button onClick={save} className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.primary }}>
          <span className="text-white text-[14px] font-extrabold">{existing ? label("Save", "Enregistrer") : label("Add", "Ajouter")}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[100px] pt-4 max-w-[400px] mx-auto w-full">
        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Goal Name", "Nom de l'objectif")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border" style={{ backgroundColor: palette.surface, borderColor: errors.title ? palette.error : palette.border }}>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p: any) => ({...p, title: false})); }}
              placeholder={label("e.g. New Laptop", "ex: Nouvel ordi")}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>
        </div>

        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Target Amount", "Montant cible")}</span>
          <div className="h-[70px] rounded-2xl px-5 flex flex-row items-center justify-between border" style={{ backgroundColor: palette.surface, borderColor: errors.targetAmount ? palette.error : palette.border }}>
            <input
              type="number"
              inputMode="decimal"
              value={targetAmount}
              onChange={(e) => { setTargetAmount(e.target.value); setErrors((p: any) => ({...p, targetAmount: false})); }}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-[32px] font-extrabold text-left h-full"
              style={{ color: palette.foreground }}
            />
            <span className="font-extrabold text-[16px] ml-2" style={{ color: palette.muted }}>DH</span>
          </div>
        </div>

        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Already Saved", "Déjà économisé")}</span>
          <div className="h-[70px] rounded-2xl px-5 flex flex-row items-center justify-between border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <input
              type="number"
              inputMode="decimal"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-[32px] font-extrabold text-left h-full"
              style={{ color: palette.primary }}
            />
            <span className="font-extrabold text-[16px] ml-2" style={{ color: palette.muted }}>DH</span>
          </div>
        </div>

        {/**/}
        {existing && (
          <button onClick={remove} className="mt-4 flex flex-row items-center justify-center gap-2 h-[52px] rounded-xl border" style={{ borderColor: '#ffdad6', backgroundColor: '#fff' }}>
            <Trash2 size={18} color={palette.error} />
            <span className="text-[14px] font-bold" style={{ color: palette.error }}>{label("Delete Goal", "Supprimer l'objectif")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function GoalPage() {
  return (
    <Suspense fallback={<div />}>
      <GoalForm />
    </Suspense>
  );
}
