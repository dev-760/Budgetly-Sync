"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Trash2, ShoppingCart, Car, Home, Laptop, Heart, GraduationCap, ShoppingBag, Receipt, Briefcase, Gift, Banknote, MoreHorizontal } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { categoryIds, incomeCategoryIds, TransactionKind } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  food: ShoppingCart, transport: Car, housing: Home, entertainment: Laptop,
  health: Heart, education: GraduationCap, shopping: ShoppingBag, other: MoreHorizontal,
  scholarship: GraduationCap, salary: Briefcase, freelance: Banknote, gift: Gift,
};

function TransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const kindParam = searchParams.get('kind') as TransactionKind | null;

  const { palette } = useThemeContext();
  const { settings, transactions, addTransaction, updateTransaction, deleteTransaction, t, categoryName } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const existing = useMemo(() => transactions.find((item) => item.id === idParam), [idParam, transactions]);

  const [kind, setKind] = useState<TransactionKind>(existing?.kind ?? kindParam ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? (kind === "income" ? "scholarship" : "food"));
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod ?? "cash");
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState("");

  const categories = kind === "income" ? incomeCategoryIds : categoryIds;

  const toggleKind = (next: TransactionKind) => {
    setKind(next);
    setCategoryId(next === "income" ? "scholarship" : "food");
  };

  const save = () => {
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) { setError(label("Amount is required", "Le montant est requis")); return; }
    const title = existing?.title.trim() || categoryName(categoryId);
    const input = { kind, amount: numericAmount, categoryId, title, date, paymentMethod, note: note.trim() || undefined };
    if (existing) updateTransaction(existing.id, input);
    else addTransaction(input);
    router.back();
  };

  const remove = () => {
    if (window.confirm(label("Delete this transaction?", "Supprimer cette transaction ?"))) {
      deleteTransaction(existing!.id);
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8f9ff]">
          <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">
            {existing ? t("edit") : kind === "income" ? t("addIncome") : t("addExpense")}
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

          {/* Kind Toggle */}
          <div className="flex gap-2 p-1 bg-[#ededf8] rounded-lg">
            {(["expense", "income"] as TransactionKind[]).map((k) => (
              <button
                key={k}
                onClick={() => toggleKind(k)}
                className={cn(
                  "flex-1 py-2.5 rounded-md text-[13px] tracking-[0.02em] font-semibold transition-all",
                  kind === k ? "bg-white text-[#191b23] shadow-sm" : "text-[#434654] hover:text-[#191b23]"
                )}
              >
                {k === "expense" ? t("expense") : t("income")}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("amount")}</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0"
                className="flex-1 text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#191b23] bg-transparent outline-none tabular-nums placeholder:text-[#c3c5d7]"
              />
              <span className="text-[22px] font-semibold text-[#434654]">DH</span>
            </div>
            {error && <p className="text-[13px] text-[#ba1a1a] font-semibold mt-2">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{label("Category", "Catégorie")}</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((id) => {
                const Icon = iconMap[id] || Receipt;
                return (
                  <button
                    key={id}
                    onClick={() => setCategoryId(id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center",
                      categoryId === id
                        ? "bg-[#003fb1]/5 border-[#003fb1] ring-1 ring-[#003fb1]"
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

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{label("Payment Method", "Méthode de paiement")}</label>
            <div className="flex gap-2">
              {["cash", "card"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors border",
                    paymentMethod === method
                      ? "bg-[#003fb1] text-white border-[#003fb1]"
                      : "bg-[#ededf8] text-[#434654] border-[#e5e7eb] hover:bg-[#e2e1ed]"
                  )}
                >
                  {method === "cash" ? t("cash") : t("card")}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Date", "Date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Note (optional)", "Note (facultatif)")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={label("Add a note...", "Ajouter une note...")}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all resize-none placeholder:text-[#c3c5d7]"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={save}
            className="w-full py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            {existing ? label("Update Transaction", "Mettre à jour") : label("Save Transaction", "Enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff]" />}>
      <TransactionContent />
    </Suspense>
  );
}
