"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Tag, X, Receipt, ShoppingCart, Car, Home, Laptop, Heart, GraduationCap, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { FormattedDate } from '@/components/budget-ui';
import { formatMoney, TransactionKind, CategoryId } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

const filters: { id: "all" | TransactionKind; labelEn: string; labelFr: string }[] = [
  { id: "all", labelEn: "All", labelFr: "Tout" },
  { id: "expense", labelEn: "Expenses", labelFr: "Dépenses" },
  { id: "income", labelEn: "Income", labelFr: "Revenus" }
];

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'food': return ShoppingCart;
    case 'transport': return Car;
    case 'housing': return Home;
    case 'entertainment': return Laptop;
    case 'health': return Heart;
    case 'education': return GraduationCap;
    case 'shopping': return ShoppingBag;
    default: return Receipt;
  }
};

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryId | null;

  const { palette } = useThemeContext();
  const { settings, transactions, t, categoryName } = useBudget();
  const language = settings.language;
  const isFrench = language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

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

  const totalExpenses = filtered.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = filtered.filter(t => t.kind === 'income').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{t("transactions")}</h1>
            <p className="text-[14px] leading-[20px] text-[#434654]">{label("All your financial activity", "Toute votre activité financière")}</p>
          </div>
          <button
            onClick={() => router.push('/transaction?kind=expense')}
            className="flex items-center gap-2 px-6 py-3 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            <Plus size={20} />
            {label("New Transaction", "Nouvelle transaction")}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 bg-[#f3f3fe] rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-1">{label("Total Transactions", "Nombre de transactions")}</p>
            <p className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{filtered.length}</p>
          </div>
          <div className="col-span-4 bg-[#f3f3fe] rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-1">{label("Total Expenses", "Total dépenses")}</p>
            <p className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#ba1a1a] tabular-nums">{formatMoney(totalExpenses, language as any)}</p>
          </div>
          <div className="col-span-4 bg-[#f3f3fe] rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-1">{label("Total Income", "Total revenus")}</p>
            <p className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#006c49] tabular-nums">{formatMoney(totalIncome, language as any)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center h-11 bg-white rounded-lg border border-[#e5e7eb] px-4 gap-3 shadow-sm">
            <Search size={18} className="text-[#434654]" />
            <input
              type="text"
              placeholder={label("Search transactions...", "Rechercher...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-full bg-transparent outline-none text-[14px] text-[#191b23] placeholder:text-[#737686]"
            />
          </div>

          <div className="flex gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors",
                  filter === item.id
                    ? "bg-[#003fb1] text-white shadow-sm"
                    : "bg-[#ededf8] text-[#434654] hover:bg-[#e2e1ed]"
                )}
              >
                {isFrench ? item.labelFr : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        {categoryParam && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ededf8]">
            <Tag size={14} className="text-[#003fb1]" />
            <span className="text-[11px] font-bold tracking-[0.05em] text-[#003fb1]">{categoryName(categoryParam)}</span>
            <button onClick={clearCategory} className="p-0.5 hover:opacity-70">
              <X size={14} className="text-[#003fb1]" />
            </button>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Receipt size={48} className="text-[#c3c5d7] mx-auto mb-4" />
              <h3 className="text-[18px] font-semibold text-[#191b23] mb-2">{t("noTransactions")}</h3>
              <p className="text-[14px] text-[#434654]">{t("noTransactionsBody")}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3fe] border-b border-[#e5e7eb]">
                  <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Date", "Date")}</th>
                  <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Description", "Description")}</th>
                  <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Category", "Catégorie")}</th>
                  <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Method", "Méthode")}</th>
                  <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase text-right">{label("Amount", "Montant")}</th>
                </tr>
              </thead>
              <tbody className="text-[14px] font-medium text-[#191b23]">
                {filtered.map((item, index) => {
                  const Icon = getCategoryIcon(item.categoryId);
                  const isIncome = item.kind === 'income';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/transaction?id=${item.id}`)}
                      className={cn(
                        "hover:bg-[#003fb1]/5 transition-colors cursor-pointer h-[56px]",
                        index !== filtered.length - 1 ? "border-b border-[#e5e7eb]" : ""
                      )}
                    >
                      <td className="py-3 px-6 text-[#434654] whitespace-nowrap">
                        <FormattedDate date={item.date} language={language as any} />
                      </td>
                      <td className="py-3 px-6 font-medium whitespace-nowrap">{item.title}</td>
                      <td className="py-3 px-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
                          isIncome ? "bg-[#006c49]/10 text-[#006c49]" : "bg-[#ededf8] text-[#434654]"
                        )}>
                          <Icon size={14} />
                          {categoryName(item.categoryId)}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-[#434654] capitalize whitespace-nowrap">{item.paymentMethod || 'cash'}</td>
                      <td className={cn(
                        "py-3 px-6 text-right font-semibold whitespace-nowrap tabular-nums",
                        isIncome ? "text-[#006c49]" : "text-[#121c2a]"
                      )}>
                        {isIncome ? '+' : '-'}{formatMoney(item.amount, language as any)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff]" />}>
      <TransactionsContent />
    </Suspense>
  );
}