"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Wallet, PiggyBank, Plus, Calendar, ArrowRightLeft, ChevronRight, Repeat } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { formatMoney } from '@/lib/budget-data';
import { FormattedDate } from '@/components/budget-ui';

export default function FinancePage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, buckets, recurring, finance, t } = useBudget();
  const language = settings.language;
  const isFrench = language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Finance Board", "Vue financière")}</h1>
            <p className="text-[14px] leading-[20px] text-[#434654]">{label("Accounts & commitments", "Comptes et engagements")}</p>
          </div>
          <button
            onClick={() => router.push('/finance-manage')}
            className="flex items-center gap-2 px-6 py-3 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
          >
            {label("Manage Finances", "Gérer les finances")}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Net Worth Hero */}
            <div className="bg-[#121c2a] rounded-xl p-8 shadow-md relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#003fb1]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold tracking-[0.05em] text-white/60 uppercase mb-2 flex items-center gap-2">
                  <Landmark size={16} className="text-[#003fb1]" />
                  {label("Net Worth", "Valeur nette")}
                </p>
                <h2 className="text-[44px] leading-[52px] tracking-[-0.02em] font-bold text-white tabular-nums">
                  {formatMoney(finance.netWorth, language as any)}
                </h2>

                <div className="flex gap-4 mt-6">
                  {buckets.map(bucket => (
                    <div key={bucket.id} className="flex-1 bg-white/10 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        {bucket.id === 'cash' ? <PiggyBank size={18} className="text-white/70" /> : <Wallet size={18} className="text-white/70" />}
                        <span className="text-[11px] font-bold tracking-[0.05em] text-white/60 uppercase">
                          {bucket.id === 'cash' ? t('cash') : t('card')}
                        </span>
                      </div>
                      <p className="text-[22px] leading-[28px] font-bold text-white tabular-nums tracking-[-0.01em]">
                        {formatMoney(bucket.balance, language as any)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recurring Income Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f8f9ff]">
                <h2 className="text-[22px] leading-[28px] tracking-[-0.01em] font-semibold text-[#191b23]">
                  {label("Recurring Payments", "Paiements récurrents")}
                </h2>
                <span className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">
                  {recurring.length} {label("items", "éléments")}
                </span>
              </div>
              {recurring.length === 0 ? (
                <div className="p-12 text-center">
                  <Repeat size={40} className="text-[#c3c5d7] mx-auto mb-3" />
                  <p className="text-[14px] text-[#434654]">{label("No recurring items yet", "Aucun élément récurrent")}</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f3f3fe] border-b border-[#e5e7eb]">
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Name", "Nom")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Next Due", "Prochaine échéance")}</th>
                      <th className="py-3 px-6 text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase text-right">{label("Amount", "Montant")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurring.map((item, i) => (
                      <tr key={item.id} className={i !== recurring.length - 1 ? "border-b border-[#e5e7eb]" : ""}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                              <Repeat size={16} className="text-[#f59e0b]" />
                            </div>
                            <span className="text-[14px] font-medium text-[#191b23]">{item.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[14px] text-[#434654]">
                          <FormattedDate date={item.nextDueDate} language={language as any} />
                        </td>
                        <td className="py-4 px-6 text-right text-[14px] font-semibold text-[#191b23] tabular-nums">
                          {formatMoney(item.amount, language as any)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 xl:col-span-4 space-y-4">

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
              <h3 className="text-[18px] font-semibold text-[#191b23] mb-4">{label("Quick Actions", "Actions rapides")}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/transaction?kind=income')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#006c49]/5 hover:bg-[#006c49]/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#006c49]/10 flex items-center justify-center">
                    <Plus size={20} className="text-[#006c49]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#191b23]">{label("Record Income", "Enregistrer un revenu")}</p>
                    <p className="text-[11px] text-[#434654]">{label("Add salary, freelance, etc.", "Salaire, freelance, etc.")}</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/income-calendar')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#003fb1]/5 hover:bg-[#003fb1]/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#003fb1]/10 flex items-center justify-center">
                    <Calendar size={20} className="text-[#003fb1]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#191b23]">{label("Plan Income", "Planifier les revenus")}</p>
                    <p className="text-[11px] text-[#434654]">{label("View income calendar", "Calendrier des revenus")}</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/finance-manage')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#ededf8] hover:bg-[#e2e1ed] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#003fb1]/10 flex items-center justify-center">
                    <ArrowRightLeft size={20} className="text-[#003fb1]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#191b23]">{label("Transfer Funds", "Transférer des fonds")}</p>
                    <p className="text-[11px] text-[#434654]">{label("Between accounts", "Entre les comptes")}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-[#f3f3fe] rounded-xl p-6 shadow-sm border border-[#e5e7eb]">
              <h3 className="text-[14px] font-semibold text-[#191b23] mb-4">{label("This Month", "Ce mois-ci")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[14px] text-[#434654]">{label("Income", "Revenus")}</span>
                  <span className="text-[14px] font-semibold text-[#006c49] tabular-nums">{formatMoney(finance.income, language as any)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-[#434654]">{label("Expenses", "Dépenses")}</span>
                  <span className="text-[14px] font-semibold text-[#ba1a1a] tabular-nums">{formatMoney(finance.expenses, language as any)}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex justify-between">
                  <span className="text-[14px] font-semibold text-[#191b23]">{label("Savings", "Épargne")}</span>
                  <span className="text-[14px] font-bold text-[#006c49] tabular-nums">{formatMoney(finance.income - finance.expenses, language as any)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}