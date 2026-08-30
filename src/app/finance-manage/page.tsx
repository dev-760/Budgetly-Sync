"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, CalendarRange, Wallet, Repeat, RefreshCw } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

function FinanceManageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'income' | 'subscription' | 'loan' | 'transfer' ?? 'income';
  const id = searchParams.get('id');
  
  const { settings, recurring, subscriptions, loans, upsertRecurringIncome, removeRecurringIncome, upsertSubscription, removeSubscription, upsertLoan, removeLoan, t } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => {
    if (mode === 'income') return recurring.find(i => i.id === id);
    if (mode === 'subscription') return subscriptions.find(i => i.id === id);
    if (mode === 'loan') return loans.find(i => i.id === id);
    return undefined;
  }, [mode, id, recurring, subscriptions, loans]);
  
  const [title, setTitle] = useState((existing as any)?.title || (existing as any)?.name || "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [nextDueDate, setNextDueDate] = useState((existing as any)?.nextDueDate || (existing as any)?.dueDate || new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<any>({});

  const titles = {
    income: label("Plan Income", "Planifier revenu"),
    subscription: label("Add Subscription", "Ajouter abonnement"),
    loan: label("Add Loan", "Ajouter prêt"),
    transfer: label("Add Bucket", "Ajouter compte")
  };

  const save = () => {
    const value = Number(amount.replace(",", "."));
    const newErrors: any = {};
    if (!title.trim()) newErrors.title = true;
    if (!value || value <= 0) newErrors.amount = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (mode === 'income') {
      upsertRecurringIncome({ title: title.trim(), amount: value, frequency: 'monthly', nextDueDate, id: existing?.id });
    } else if (mode === 'subscription') {
      upsertSubscription({ name: title.trim(), amount: value, frequency: 'monthly', nextDueDate, active: true, id: existing?.id });
    } else if (mode === 'loan') {
      upsertLoan({ name: title.trim(), amount: value, dueDate: nextDueDate, active: true, id: existing?.id });
    }
    
    router.back();
  };

  const remove = () => {
    if (existing && window.confirm(label("Delete this item?", "Supprimer cet élément ?"))) {
      if (mode === 'income') removeRecurringIncome(existing.id);
      else if (mode === 'subscription') removeSubscription(existing.id);
      else if (mode === 'loan') removeLoan(existing.id);
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
          {existing ? label("Edit", "Modifier") : titles[mode]}
        </span>
        <button onClick={save} className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.primary }}>
          <span className="text-white text-[14px] font-extrabold">{existing ? label("Save", "Enregistrer") : label("Add", "Ajouter")}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[100px] pt-4 max-w-[400px] mx-auto w-full">
        {/* Title */}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Title", "Titre")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border" style={{ backgroundColor: palette.surface, borderColor: errors.title ? palette.error : palette.border }}>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p: any) => ({...p, title: false})); }}
              placeholder={label("e.g. Salary", "ex: Salaire")}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Amount", "Montant")}</span>
          <div className="h-[70px] rounded-2xl px-5 flex flex-row items-center justify-between border" style={{ backgroundColor: palette.surface, borderColor: errors.amount ? palette.error : palette.border }}>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors((p: any) => ({...p, amount: false})); }}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-[32px] font-extrabold text-left h-full"
              style={{ color: mode === 'income' ? palette.success : palette.foreground }}
            />
            <span className="font-extrabold text-[16px] ml-2" style={{ color: palette.muted }}>DH</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Date", "Date")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>
        </div>

        {/* Delete */}
        {existing && (
          <button onClick={remove} className="mt-4 flex flex-row items-center justify-center gap-2 h-[52px] rounded-xl border" style={{ borderColor: '#ffdad6', backgroundColor: '#fff' }}>
            <Trash2 size={18} color={palette.error} />
            <span className="text-[14px] font-bold" style={{ color: palette.error }}>{label("Delete Item", "Supprimer l'élément")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function FinanceManagePage() {
  return (
    <Suspense fallback={<div />}>
      <FinanceManageForm />
    </Suspense>
  );
}
