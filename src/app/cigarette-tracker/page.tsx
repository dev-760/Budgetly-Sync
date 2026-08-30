"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flame, TrendingDown, RefreshCcw } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { formatMoney } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function CigaretteTrackerPage() {
  const router = useRouter();
  const { settings, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  // Local storage for private tracker data
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [pricePerPack, setPricePerPack] = useState<string>('40'); // default 40 DH
  const [cigarettesPerPack, setCigarettesPerPack] = useState<string>('20'); // default 20
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem('budgetly_cig_count');
    const savedPrice = localStorage.getItem('budgetly_cig_price');
    const savedPack = localStorage.getItem('budgetly_cig_pack');
    if (savedCount) setDailyCount(Number(savedCount));
    if (savedPrice) setPricePerPack(savedPrice);
    if (savedPack) setCigarettesPerPack(savedPack);
    setMounted(true);
  }, []);

  const updateCount = (newCount: number) => {
    const val = Math.max(0, newCount);
    setDailyCount(val);
    localStorage.setItem('budgetly_cig_count', String(val));
  };

  const updateSettings = (price: string, pack: string) => {
    setPricePerPack(price);
    setCigarettesPerPack(pack);
    localStorage.setItem('budgetly_cig_price', price);
    localStorage.setItem('budgetly_cig_pack', pack);
  };

  if (!mounted) return null;

  const costPerCig = Number(pricePerPack) / Number(cigarettesPerPack);
  const dailyCost = dailyCount * costPerCig;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Cigarette Tracker", "Suivi Cigarettes")}</h1>
        </div>

        {/* Hero Counter */}
        <div className="bg-[#121c2a] rounded-xl p-8 shadow-md relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ba1a1a]/20 via-[#121c2a] to-[#121c2a]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <Flame size={48} className="text-[#ffb4ab] mb-4" />
            <p className="text-[14px] text-white/70 mb-2">{label("Smoked Today", "Fumées aujourd'hui")}</p>
            <div className="flex items-center gap-6 mb-6">
              <button 
                onClick={() => updateCount(dailyCount - 1)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-bold flex items-center justify-center transition-colors"
              >-</button>
              <span className="text-[64px] leading-[72px] tracking-[-0.02em] font-bold text-white tabular-nums w-24">
                {dailyCount}
              </span>
              <button 
                onClick={() => updateCount(dailyCount + 1)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-bold flex items-center justify-center transition-colors"
              >+</button>
            </div>
            <p className="text-[14px] text-white/90">
              {label("Daily Cost:", "Coût quotidien :")} <strong className="tabular-nums">{formatMoney(dailyCost, settings.language as any)}</strong>
            </p>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e5e7eb]">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCcw size={16} className="text-[#003fb1]" />
              <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Monthly Impact", "Impact mensuel")}</p>
            </div>
            <p className="text-[24px] font-bold text-[#ba1a1a] tabular-nums">{formatMoney(monthlyCost, settings.language as any)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e5e7eb]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-[#003fb1]" />
              <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase">{label("Yearly Impact", "Impact annuel")}</p>
            </div>
            <p className="text-[24px] font-bold text-[#ba1a1a] tabular-nums">{formatMoney(yearlyCost, settings.language as any)}</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 space-y-4">
          <h2 className="text-[18px] font-semibold text-[#191b23]">{label("Tracker Settings", "Paramètres du suivi")}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Price per pack", "Prix par paquet")}</label>
              <div className="flex items-center px-4 py-3 rounded-lg border border-[#e5e7eb] focus-within:border-[#003fb1] focus-within:ring-1 focus-within:ring-[#003fb1] transition-all">
                <input
                  type="text"
                  inputMode="numeric"
                  value={pricePerPack}
                  onChange={(e) => updateSettings(e.target.value, cigarettesPerPack)}
                  className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-[#191b23] tabular-nums"
                />
                <span className="text-[14px] text-[#434654]">DH</span>
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">{label("Cigs per pack", "Cigarettes/paquet")}</label>
              <input
                type="text"
                inputMode="numeric"
                value={cigarettesPerPack}
                onChange={(e) => updateSettings(pricePerPack, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] bg-transparent outline-none text-[14px] font-semibold text-[#191b23] focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1] transition-all tabular-nums"
              />
            </div>
          </div>
          <p className="text-[13px] text-[#737686]">
            {label("Data is stored locally on this device.", "Les données sont stockées localement sur cet appareil.")}
          </p>
        </div>
      </div>
    </div>
  );
}
