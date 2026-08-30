"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  X, Trash2, Check, Tag, Home, Car, Utensils, Smartphone, Heart, Smile, BookOpen, Gift, Map, Target, Briefcase, GraduationCap
} from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { cn } from "@/lib/utils";
import { TransactionKind, categoryIds, incomeCategoryIds } from "@/lib/budget-data";
import { Input } from "@/components/budget-ui";

const defaultIcons: Record<string, any> = {
  "food": Utensils,
  "housing": Home,
  "transportation": Car,
  "utilities": Smartphone,
  "health": Heart,
  "entertainment": Smile,
  "education": BookOpen,
  "personal": Smile,
  "shopping": Tag,
  "gifts": Gift,
  "travel": Map,
  "other": Target,
  "scholarship": GraduationCap,
  "salary": Briefcase,
  "freelance": Briefcase,
  "allowance": Gift
};

function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const kindParam = searchParams.get("kind") as TransactionKind | null;
  
  const { palette } = useThemeContext();
  const { settings, transactions, addTransaction, updateTransaction, deleteTransaction, t, categoryName, expenseCategories } = useBudget();
  
  const existing = useMemo(() => transactions.find((item) => item.id === id), [id, transactions]);
  
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("food");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Initialize state once after mount to avoid hydration mismatch
  useEffect(() => {
    setKind(existing?.kind ?? kindParam ?? "expense");
    setAmount(existing ? String(existing.amount) : "");
    setCategoryId(existing?.categoryId ?? (existing?.kind === "income" || kindParam === "income" ? "scholarship" : "food"));
    setDate(existing?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
    setPaymentMethod(existing?.paymentMethod ?? "cash");
    setNote(existing?.note ?? "");
  }, [existing, kindParam]);

  const categories = kind === "income" 
    ? incomeCategoryIds 
    : [...categoryIds, ...expenseCategories.filter((item) => !categoryIds.includes(item.id as typeof categoryIds[number])).map((item) => item.id)];

  const save = () => {
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) { 
      setError(t("amount")); 
      return; 
    }
    const title = existing?.title.trim() || categoryName(categoryId);
    const input = { kind, amount: numericAmount, categoryId, title, date, paymentMethod, note: note.trim() || undefined, isRecurring: existing?.isRecurring };
    
    if (existing) updateTransaction(existing.id, input); 
    else addTransaction(input);
    
    router.back();
  };

  const remove = () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      if (existing) deleteTransaction(existing.id);
      router.back();
    }
  };

  const getIcon = (catId: string) => {
    const custom = settings.customExpenseCategories.find(c => c.id === catId);
    if (custom) return Tag; // Fallback for custom since we don't store Lucide components
    return defaultIcons[catId] || Tag;
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {existing ? t("edit") : kind === "income" ? t("addIncome") : t("addExpense")}
        </h1>
        {existing ? (
          <button 
            onClick={remove}
            className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
            style={{ borderColor: palette.border }}
          >
            <Trash2 size={20} color="#ef4444" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        {/* Amount */}
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>{t("amount")}</label>
          <div 
            className="h-20 rounded-2xl bg-white border-2 px-5 flex items-center justify-between shadow-sm"
            style={{ borderColor: palette.primaryLight }}
          >
            <input 
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0"
              className="flex-1 text-3xl font-bold bg-transparent outline-none tabular-nums"
              style={{ color: palette.foreground }}
            />
            <span className="text-lg font-bold" style={{ color: palette.primary }}>DH</span>
          </div>
          {error && <p className="text-red-500 text-xs font-semibold mt-2">{error} is required.</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>
            {kind === "income" ? t("source") : t("category")}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((item) => {
              const Icon = getIcon(item);
              const isActive = categoryId === item;
              return (
                <button
                  key={item}
                  onClick={() => setCategoryId(item)}
                  className={cn(
                    "h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                    isActive ? "border-blue-600 bg-blue-50/50" : "bg-white border-gray-100 dark:bg-slate-800 dark:border-slate-700"
                  )}
                  style={isActive ? { borderColor: palette.primary, backgroundColor: `${palette.primary}10` } : undefined}
                >
                  <Icon size={20} color={isActive ? palette.primary : palette.muted} />
                  <span 
                    className="text-xs font-bold truncate w-full px-2"
                    style={{ color: isActive ? palette.primary : palette.muted }}
                  >
                    {categoryName(item)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>{t("date")}</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-14 rounded-xl px-4 border outline-none font-medium transition-colors"
            style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.foreground }}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>{t("paymentMethod")}</label>
          <div className="flex gap-2">
            {(["cash", "card", "transfer"] as const).map(item => (
              <button
                key={item}
                onClick={() => setPaymentMethod(item)}
                className="flex-1 h-14 rounded-xl border font-bold text-sm transition-all"
                style={{ 
                  backgroundColor: paymentMethod === item ? `${palette.primary}10` : palette.surface,
                  borderColor: paymentMethod === item ? palette.primary : palette.border,
                  color: paymentMethod === item ? palette.primary : palette.muted
                }}
              >
                {t(item as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: palette.foreground }}>{t("optionalNote")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="..."
            className="w-full h-24 rounded-xl p-4 border outline-none font-medium transition-colors resize-none"
            style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.foreground }}
          />
        </div>

        {/* Save */}
        <button
          onClick={save}
          className="w-full h-14 rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-4"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-white font-bold text-base">
            {kind === "income" ? t("saveIncome") : t("saveExpense")}
          </span>
          <Check size={20} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <TransactionForm />
    </Suspense>
  );
}
