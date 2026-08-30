"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Repeat, ArrowRightLeft, CreditCard, Calendar, Trash2 } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';
import { FormattedDate } from '@/components/budget-ui';

export default function FinanceManagePage() {
  const router = useRouter();
  const { settings, recurring, buckets, upsertRecurringIncome, removeRecurringIncome, upsertTransfer, t } = useBudget();
  const language = settings.language;
  const isFrench = language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const [mode, setMode] = useState<'income'|'transfer'|'loan'|'subscription'|'lend'>('income');
  
  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromBucket, setFromBucket] = useState('cash');
  const [toBucket, setToBucket] = useState('card');
  const [error, setError] = useState('');

  const handleSave = () => {
    const numAmount = Number(amount.replace(",", "."));
    if (!numAmount || numAmount <= 0) { setError(label("Amount is required", "Le montant est requis")); return; }
    if (!title.trim() && mode !== 'transfer') { setError(label("Title is required", "Le titre est requis")); return; }

    if (mode === 'transfer') {
      if (fromBucket === toBucket) { setError(label("Cannot transfer to same account", "Impossible de transférer vers le même compte")); return; }
      upsertTransfer({ from: fromBucket as any, to: toBucket as any, amount: numAmount });
      router.back();
      return;
    }

    // For simplicity, just add as recurring for now
    upsertRecurringIncome({
      title: title.trim(),
      amount: numAmount,
      frequency: 'monthly',
      nextDueDate: date
    });
    router.back();
  };

  const modes = [
    { id: 'income', label: label('Income', 'Revenu'), icon: Calendar },
    { id: 'transfer', label: label('Transfer', 'Transfert'), icon: ArrowRightLeft },
    { id: 'loan', label: label('Loan', 'Emprunt'), icon: CreditCard },
    { id: 'subscription', label: label('Subscription', 'Abonnement'), icon: Repeat },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Manage Finances", "Gérer les finances")}</h1>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 p-1 bg-white border border-[#e5e7eb] rounded-xl shadow-sm">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-all",
                mode === m.id ? "bg-[#003fb1] text-white shadow-sm" : "text-[#434654] hover:bg-[#f3f3fe]"
              )}
            >
              <m.icon size={16} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="col-span-12 md:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 space-y-6">
              <h2 className="text-[18px] font-semibold text-[#191b23]">
                {modes.find(m => m.id === mode)?.label}
              </h2>

              {mode !== 'transfer' && (
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Title", "Titre")}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(""); }}
                    placeholder={mode === 'subscription' ? label("e.g. Netflix", "ex: Netflix") : label("Enter title", "Entrez le titre")}
                    className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{t("amount")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }}
                    placeholder="0"
                    className="flex-1 text-[28px] leading-[36px] tracking-[-0.01em] font-bold text-[#191b23] bg-transparent outline-none tabular-nums placeholder:text-[#c3c5d7]"
                  />
                  <span className="text-[18px] font-semibold text-[#434654]">DH</span>
                </div>
              </div>

              {mode === 'transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("From", "De")}</label>
                    <select
                      value={fromBucket}
                      onChange={(e) => setFromBucket(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] font-medium text-[#191b23] outline-none"
                    >
                      {buckets.map(b => <option key={b.id} value={b.id}>{b.id === 'cash' ? t('cash') : t('card')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("To", "À")}</label>
                    <select
                      value={toBucket}
                      onChange={(e) => setToBucket(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] font-medium text-[#191b23] outline-none"
                    >
                      {buckets.map(b => <option key={b.id} value={b.id}>{b.id === 'cash' ? t('cash') : t('card')}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Date", "Date")}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-white text-[14px] text-[#191b23] outline-none focus:border-[#003fb1]"
                />
              </div>

              {error && <p className="text-[13px] text-[#ba1a1a] font-semibold">{error}</p>}

              <button
                onClick={handleSave}
                className="w-full py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md"
              >
                {label("Save", "Enregistrer")}
              </button>
            </div>
          </div>

          {/* History Column */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-6 border-b border-[#e5e7eb] bg-[#f8f9ff]">
                <h2 className="text-[16px] font-semibold text-[#191b23]">{label("Current Items", "Éléments actuels")}</h2>
              </div>
              
              {recurring.length === 0 ? (
                <div className="p-8 text-center text-[#434654] text-[13px]">
                  {label("No items to display.", "Aucun élément à afficher.")}
                </div>
              ) : (
                <div className="divide-y divide-[#e5e7eb]">
                  {recurring.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[#f8f9ff] transition-colors">
                      <div>
                        <p className="text-[14px] font-semibold text-[#191b23]">{item.title}</p>
                        <p className="text-[12px] text-[#434654] mt-0.5 tabular-nums">
                          {formatMoney(item.amount, language as any)} · <FormattedDate date={item.nextDueDate} language={language as any} />
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if(window.confirm(label("Delete this item?", "Supprimer cet élément ?"))) removeRecurringIncome(item.id);
                        }}
                        className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
