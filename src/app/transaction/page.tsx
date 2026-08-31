"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, Tag, Calendar, Banknote, CreditCard, Repeat, ArrowRightLeft } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { categoryIds } from '@/lib/budget-data';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const kindParam = searchParams.get('kind');
  
  const { settings, transactions, addTransaction, updateTransaction, deleteTransaction, t, categoryName } = useBudget();
  const { palette } = useThemeContext();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => transactions.find((item) => item.id === id), [transactions, id]);
  const [kind, setKind] = useState<"income" | "expense">(existing?.kind ?? (kindParam as "income" | "expense") ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categoryIds[0]);
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod ?? "card");
  
  const [errors, setErrors] = useState<{ amount?: string; title?: string }>({});

  const save = () => {
    const value = Number(amount.replace(",", "."));
    const newErrors: any = {};
    if (!value || value <= 0) newErrors.amount = t("amount");
    if (!title.trim()) newErrors.title = label("Title is required", "Titre requis");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const input = { kind, amount: value, title: title.trim(), categoryId: categoryId as any, paymentMethod: paymentMethod as "cash" | "card", date: new Date().toISOString() };
    if (existing) updateTransaction(existing.id, input);
    else addTransaction(input);
    
    router.back();
  };

  const remove = () => {
    if (existing && window.confirm(label("Delete this transaction?", "Supprimer cette transaction ?"))) {
      deleteTransaction(existing.id);
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[600px] mx-auto bg-background shadow-2xl lg:border-x" style={{ backgroundColor: palette.background }}>
      {/**/}
      <div className="h-[62px] flex flex-row items-center justify-between px-5 shrink-0">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <X size={22} color={palette.foreground} />
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: palette.foreground }}>
          {existing ? label("Edit transaction", "Modifier") : kind === "income" ? label("Add income", "Ajouter revenu") : label("Add expense", "Ajouter dépense")}
        </span>
        <button onClick={save} className="h-10 px-4 rounded-[14px] flex items-center justify-center active:opacity-70" style={{ backgroundColor: palette.primary }}>
          <span className="text-white text-[14px] font-extrabold">{existing ? label("Save", "Enregistrer") : label("Add", "Ajouter")}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[100px]">
        {/* Toggle removed as requested */}

        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{t("amount")}</span>
          <div className="h-[70px] rounded-2xl px-5 flex flex-row items-center justify-between border" style={{ backgroundColor: palette.surface, borderColor: errors.amount ? palette.error : palette.border }}>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({...prev, amount: undefined})); }}
              placeholder="0"
              className="flex-1 bg-transparent border-none outline-none text-[32px] font-extrabold text-left h-full"
              style={{ color: kind === "income" ? palette.success : palette.foreground }}
            />
            <span className="font-extrabold text-[16px] ml-2" style={{ color: palette.muted }}>DH</span>
          </div>
          {errors.amount && <span className="text-[11px] font-bold mt-1 ml-1" style={{ color: palette.error }}>{errors.amount}</span>}
        </div>

        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Title", "Titre")}</span>
          <div className="h-[52px] rounded-xl px-4 flex flex-row items-center border" style={{ backgroundColor: palette.surface, borderColor: errors.title ? palette.error : palette.border }}>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({...prev, title: undefined})); }}
              placeholder={label("e.g. Groceries", "ex: Courses")}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold h-full"
              style={{ color: palette.foreground }}
            />
          </div>
          {errors.title && <span className="text-[11px] font-bold mt-1 ml-1" style={{ color: palette.error }}>{errors.title}</span>}
        </div>

        {/**/}
        {kind === "expense" && (
          <div className="flex flex-col mb-5">
            <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Category", "Catégorie")}</span>
            <div className="flex flex-row flex-wrap gap-2">
              {categoryIds.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryId(cat)}
                  className={cn("px-4 py-2 rounded-xl border text-[12px] font-bold active:opacity-70", categoryId === cat ? "bg-[#003fb1] text-white border-transparent" : "")}
                  style={categoryId !== cat ? { backgroundColor: palette.surface, borderColor: palette.border, color: palette.muted } : {}}
                >
                  {categoryName(cat)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/**/}
        <div className="flex flex-col mb-5">
          <span className="text-[13px] font-extrabold ml-1 mb-2" style={{ color: palette.foreground }}>{label("Payment Method", "Moyen de paiement")}</span>
          <div className="flex flex-row gap-2">
            {[
              { id: "cash", icon: Banknote, label: t("cash") },
              { id: "card", icon: CreditCard, label: t("card") },
              { id: "transfer", icon: ArrowRightLeft, label: label("Transfer", "Virement") }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={cn("flex-1 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 active:opacity-65 transition-opacity", paymentMethod === method.id && "bg-[#E7F7F1] border-transparent shadow-sm")}
                style={paymentMethod !== method.id ? { backgroundColor: palette.surface, borderColor: palette.border } : {}}
              >
                <method.icon size={16} color={paymentMethod === method.id ? palette.primary : palette.muted} />
                <span className="text-[11px] font-bold" style={{ color: paymentMethod === method.id ? palette.primary : palette.muted }}>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/**/}
        {existing && (
          <button onClick={remove} className="mt-4 flex flex-row items-center justify-center gap-2 h-[52px] rounded-xl border" style={{ borderColor: '#ffdad6', backgroundColor: '#fff' }}>
            <Trash2 size={18} color={palette.error} />
            <span className="text-[14px] font-bold" style={{ color: palette.error }}>{label("Delete Transaction", "Supprimer la transaction")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<div />}>
      <TransactionForm />
    </Suspense>
  );
}
