"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, ArrowDownLeft } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';
import { FormattedDate } from '@/components/budget-ui';

export default function IncomeCalendarPage() {
  const router = useRouter();
  const { settings, transactions, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const incomeTransactions = useMemo(() => {
    return transactions
      .filter(t => t.kind === 'income')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Income Calendar", "Calendrier des revenus")}</h1>
        </div>

        {/* Summary Card */}
        <div className="bg-[#003fb1] rounded-xl p-6 shadow-md text-white flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.05em] text-white/70 uppercase mb-2">{label("Total Income Recorded", "Total des revenus enregistrés")}</p>
            <p className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold tabular-nums">
              {formatMoney(totalIncome, settings.language as any)}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <CalendarIcon size={32} className="text-white" />
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-5 border-b border-[#e5e7eb] bg-[#f8f9ff]">
            <h2 className="text-[16px] font-semibold text-[#191b23]">{label("Income History", "Historique des revenus")}</h2>
          </div>
          
          {incomeTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon size={40} className="text-[#c3c5d7] mx-auto mb-3" />
              <p className="text-[14px] text-[#434654]">{label("No income recorded yet.", "Aucun revenu enregistré.")}</p>
              <button
                onClick={() => router.push('/transaction?kind=income')}
                className="mt-4 px-6 py-2.5 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#1a56db] transition-colors"
              >
                {label("Record Income", "Enregistrer un revenu")}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {incomeTransactions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/transaction?id=${item.id}`)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-[#f8f9ff] transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E7F7F1] flex items-center justify-center shrink-0">
                    <ArrowDownLeft size={24} className="text-[#006c49]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-[#191b23]">{item.title}</p>
                    <p className="text-[12px] text-[#434654] mt-1">
                      <FormattedDate date={item.date} language={settings.language as any} />
                    </p>
                  </div>
                  <p className="text-[16px] font-bold text-[#006c49] tabular-nums">
                    +{formatMoney(item.amount, settings.language as any)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
