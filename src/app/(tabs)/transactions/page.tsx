"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, ArrowDownLeft, ArrowUpRight, X, Tag } from 'lucide-react';
import { EmptyState, MoneyText, RoundIcon } from '@/components/budget-ui';
import { formatDate, TransactionKind } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { FormattedDate } from '@/components/budget-ui';
import { cn } from '@/lib/utils';

const filters: { id: "all" | TransactionKind; label: "all" | "income" | "expense" }[] = [
  { id: "all", label: "all" }, 
  { id: "expense", label: "expense" }, 
  { id: "income", label: "income" }
];

export default function TransactionsScreen() {
  const { settings, transactions, t, categoryName } = useBudget();
  const { palette } = useThemeContext();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");
  const language = settings.language;

  const filtered = useMemo(() => 
    transactions.filter((item) => 
      (filter === "all" || item.kind === filter) &&
      `${item.title} ${categoryName(item.categoryId)}`.toLowerCase().includes(query.toLowerCase())
    ), [filter, query, transactions, categoryName]
  );

  return (
    <div className="flex flex-col h-full w-full max-w-[800px] mx-auto px-5" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-end pt-3.5 mb-[18px]">
        <button 
          onClick={() => router.push('/transaction?kind=expense')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center active:opacity-70 transition-opacity"
          style={{ backgroundColor: palette.primary }}
        >
          <Plus size={22} color="white" />
        </button>
      </div>

      {/* Search */}
      <div 
        className="h-[50px] rounded-2xl border flex flex-row items-center px-3.5 gap-2"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}
      >
        <Search size={20} color={palette.muted} />
        <input
          type="text"
          placeholder={t("search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[14px] h-full"
          style={{ color: palette.foreground }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-row gap-2 mt-3.5">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className="px-4 py-2.5 rounded-full border active:opacity-70 transition-opacity"
            style={{
              backgroundColor: filter === item.id ? '#F1F5F9' : palette.surface,
              borderColor: palette.border
            }}
          >
            <span 
              className="text-[13px] font-bold"
              style={{ color: filter === item.id ? palette.primary : palette.muted }}
            >
              {t(item.label)}
            </span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto pt-3.5 pb-7">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Search}
            title={t("noTransactions")}
            body={t("noTransactionsBody")}
          />
        ) : (
          <div className="flex flex-col gap-[9px]">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/transaction?id=${item.id}`)}
                className="min-h-[70px] rounded-[20px] border px-[13px] flex flex-row items-center gap-[11px] active:opacity-70 transition-opacity text-left"
                style={{ backgroundColor: palette.surface, borderColor: palette.border }}
              >
                <RoundIcon 
                  icon={item.kind === "income" ? ArrowDownLeft : ArrowUpRight}
                  color={item.kind === "income" ? palette.success : palette.error}
                  background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate" style={{ color: palette.foreground }}>{item.title}</p>
                  <p className="text-[12px] mt-[3px]" style={{ color: palette.muted }}>
                    <FormattedDate date={item.date} language={language} /> · {categoryName(item.categoryId)}
                  </p>
                </div>
                <MoneyText amount={item.amount} language={language} type={item.kind} className="text-[14px] text-right" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
