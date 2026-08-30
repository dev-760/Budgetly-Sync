"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Tag, X, Receipt, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { Card, EmptyState, MoneyText, RoundIcon, FormattedDate } from '@/components/budget-ui';
import { TransactionKind, CategoryId } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const filters: { id: "all" | TransactionKind; label: "all" | "income" | "expense" }[] = [
  { id: "all", label: "all" },
  { id: "expense", label: "expense" },
  { id: "income", label: "income" }
];

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryId | null;
  
  const { palette } = useThemeContext();
  const { settings, transactions, t, categoryName } = useBudget();
  const language = settings.language;
  
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchFilter = filter === "all" || item.kind === filter;
      const matchCategory = !categoryParam || item.categoryId === categoryParam;
      const searchString = `${item.title} ${categoryName(item.categoryId)}`.toLowerCase();
      const matchQuery = searchString.includes(query.toLowerCase());
      return matchFilter && matchCategory && matchQuery;
    });
  }, [categoryParam, categoryName, filter, query, transactions]);

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    router.replace(`/transactions?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-xl mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: palette.foreground }}>
            {t("transactions")}
          </h1>
          <p className="text-sm mt-1" style={{ color: palette.muted }}>
            {t("thisMonth")}
          </p>
        </div>
        <button
          onClick={() => router.push('/transaction?kind=expense')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ backgroundColor: palette.primary }}
        >
          <Plus size={22} color="#FFFFFF" />
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex items-center h-12 rounded-2xl bg-white border px-4 gap-3" style={{ borderColor: palette.border }}>
          <Search size={20} color={palette.muted} />
          <input
            type="text"
            placeholder={t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-full bg-transparent outline-none text-sm font-medium"
            style={{ color: palette.foreground }}
          />
        </div>

        <div className="flex gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "px-4 py-2 rounded-full border text-sm font-bold transition-colors"
              )}
              style={{
                backgroundColor: filter === item.id ? palette.surface : "#FFFFFF",
                borderColor: filter === item.id ? palette.border : palette.border,
                color: filter === item.id ? palette.primary : palette.muted
              }}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        {categoryParam && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <Label size={15} color={palette.primary} />
            <span className="text-xs font-extrabold" style={{ color: palette.primary }}>
              {categoryName(categoryParam)}
            </span>
            <button onClick={clearCategory} className="p-1 hover:opacity-70">
              <X size={17} color={palette.primary} />
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t("noTransactions")}
          description={t("noTransactionsBody")}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/transaction?id=${item.id}`)}
              className="w-full min-h-[70px] flex items-center gap-3 p-3 rounded-[20px] bg-white border transition-opacity hover:opacity-80 text-left"
              style={{ borderColor: palette.border }}
            >
              <RoundIcon 
                icon={item.kind === "income" ? ArrowDownLeft : ArrowUpRight} 
                size={38} 
                color={item.kind === "income" ? "#10B981" : "#ef4444"} 
                background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"} 
              />
              <div className="flex-1">
                <h3 className="text-[15px] font-bold" style={{ color: palette.foreground }}>
                  {item.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>
                  <FormattedDate date={item.date} language={language} /> · {categoryName(item.categoryId)}
                </p>
              </div>
              <MoneyText 
                amount={item.amount} 
                language={language} 
                type={item.kind} 
                className="text-sm font-bold text-right" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <TransactionsContent />
    </Suspense>
  );
}