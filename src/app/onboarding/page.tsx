"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, GraduationCap, CalendarRange, PiggyBank, ArrowRight } from 'lucide-react';
import { BrandMark, ProgressBar } from '@/components/budget-ui';
import { Language } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function OnboardingScreen() {
  const { settings, setLanguage, t, completeOnboarding } = useBudget();
  const { palette } = useThemeContext();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const language = settings.language;

  const cards = [
    { icon: Wallet, title: t("welcome"), body: t("welcomeBody"), accent: palette.primary },
    { icon: GraduationCap, title: t("mainIncome"), body: language === "fr" ? "Bourse, allocation familiale, stage ou travail à temps partiel." : "Scholarship, family allowance, internship, or a part-time job.", accent: palette.success },
    { icon: CalendarRange, title: t("recurringExpenses"), body: language === "fr" ? "Loyer, transport, internet et abonnements sont pris en compte." : "Rent, transport, internet, and subscriptions are included in your plan.", accent: palette.warning },
    { icon: PiggyBank, title: t("savingsGoal"), body: language === "fr" ? "Ton premier budget et tes objectifs sont prêts à évoluer avec toi." : "Your first budget and savings goals are ready to grow with you.", accent: "#7A63D2" },
  ];
  const current = cards[step];
  const lastStep = step === cards.length - 1;
  const Icon = current.icon;

  const handleContinue = () => {
    if (lastStep) {
      completeOnboarding();
      router.replace('/budget-edit?fromOnboarding=true');
    } else setStep((v) => v + 1);
  };

  return (
    <div className="flex flex-col h-full w-full px-6 pt-16 pb-8" style={{ backgroundColor: palette.background }}>
      {/* Language Switch */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row rounded-3xl p-1 gap-1 border" style={{ backgroundColor: '#F3F4F6', borderColor: palette.border }}>
          {(["en", "fr"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn("px-4 py-2 rounded-2xl text-[13px] font-bold active:opacity-70 transition-all", language === lang ? "bg-white shadow-sm" : "")}
              style={{ color: language === lang ? palette.primary : palette.muted }}
            >
              {lang === "en" ? "EN" : "FR"}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-8 mb-6">
        <ProgressBar value={(step + 1) / cards.length} color={palette.primary} />
      </div>

      {/* Artwork */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center" style={{ backgroundColor: current.accent + '15' }}>
          <div className="w-[140px] h-[140px] rounded-[28px] flex items-center justify-center" style={{ backgroundColor: current.accent }}>
            {step === 0 ? <BrandMark size={116} radius={28} /> : <Icon size={62} color="white" />}
          </div>
          <div className="absolute w-3 h-3 rounded-full top-4 right-8" style={{ backgroundColor: current.accent, opacity: 0.6 }} />
          <div className="absolute w-2 h-2 rounded-full bottom-6 left-5" style={{ backgroundColor: current.accent, opacity: 0.4 }} />
        </div>

        {/* Content */}
        <div className="mt-8 text-center px-2">
          <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: palette.muted }}>{t("studentTip")}</p>
          <h1 className="text-[28px] font-extrabold tracking-[-0.8px] mt-3" style={{ color: palette.foreground }}>{current.title}</h1>
          <p className="text-[15px] leading-[22px] mt-3 max-w-[300px] mx-auto" style={{ color: palette.muted }}>{current.body}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center mt-auto pt-4">
        <div className="flex flex-row gap-2 mb-6">
          {cards.map((_, i) => (
            <div key={i} className={cn("rounded-full transition-all", i === step ? "w-6 h-2" : "w-2 h-2")} style={{ backgroundColor: i === step ? palette.primary : palette.border }} />
          ))}
        </div>
        <button
          onClick={handleContinue}
          className="w-full h-[54px] rounded-2xl flex flex-row items-center justify-center gap-2 active:opacity-70 transition-opacity shadow-lg"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-white text-[15px] font-extrabold">{lastStep ? t("finish") : t("continue")}</span>
          <ArrowRight size={20} color="white" />
        </button>
        {!lastStep && (
          <button
            onClick={() => { completeOnboarding(); router.replace('/'); }}
            className="mt-4 py-2 active:opacity-70 transition-opacity"
          >
            <span className="text-[14px] font-bold" style={{ color: palette.muted }}>{t("skip")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
