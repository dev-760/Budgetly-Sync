"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, GraduationCap, RepeatIcon, PiggyBank, ArrowRight } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { BrandMark, ProgressBar } from "@/components/budget-ui";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/budget-data";

export default function OnboardingPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, setLanguage, t, completeOnboarding } = useBudget();
  
  const [step, setStep] = useState(0);
  const language = settings.language;
  
  const cards = [
    { icon: Wallet, title: t("welcome"), body: t("welcomeBody"), accent: palette.primary },
    { icon: GraduationCap, title: t("mainIncome"), body: language === "fr" ? "Bourse, allocation familiale, stage ou travail à temps partiel." : "Scholarship, family allowance, internship, or a part-time job.", accent: "#10B981" },
    { icon: RepeatIcon, title: t("recurringExpenses"), body: language === "fr" ? "Loyer, transport, internet et abonnements sont pris en compte." : "Rent, transport, internet, and subscriptions are included in your plan.", accent: "#F59E0B" },
    { icon: PiggyBank, title: t("savingsGoal"), body: language === "fr" ? "Ton premier budget et tes objectifs sont prêts à évoluer avec toi." : "Your first budget and savings goals are ready to grow with you.", accent: "#7A63D2" },
  ];
  
  const current = cards[step];
  const lastStep = step === cards.length - 1;

  const handleContinue = () => {
    if (lastStep) {
      completeOnboarding();
      router.replace("/budget-edit?fromOnboarding=1");
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/");
  };

  return (
    <div className="min-h-screen pb-10 px-6 pt-16 flex flex-col" style={{ backgroundColor: palette.background }}>
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
        {/* Top bar with language switcher */}
        <div className="flex justify-between items-center mb-8">
          <div 
            className="flex p-1 rounded-full border shadow-sm"
            style={{ backgroundColor: palette.surface, borderColor: palette.border }}
          >
            {(["en", "fr"] as Language[]).map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item)}
                className={cn(
                  "px-4 py-2 rounded-full min-w-[64px] text-sm font-bold transition-all",
                  language === item ? "shadow-sm" : ""
                )}
                style={
                  language === item 
                  ? { backgroundColor: palette.background, color: palette.primary } 
                  : { color: palette.muted }
                }
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <ProgressBar value={(step + 1) / cards.length} color={palette.primary} />

        {/* Artwork */}
        <div 
          className="relative h-64 mt-12 rounded-[44px] flex items-center justify-center overflow-hidden transition-colors"
          style={{ backgroundColor: `${current.accent}15` }}
        >
          <div 
            className="relative z-10 w-36 h-36 rounded-[42px] flex items-center justify-center shadow-lg transition-colors"
            style={{ backgroundColor: current.accent, boxShadow: `0 20px 40px ${current.accent}40` }}
          >
            {step === 0 ? (
              <BrandMark size={116} radius={28} />
            ) : (
              <current.icon size={62} color="#FFFFFF" />
            )}
          </div>
          <div 
            className="absolute rounded-full opacity-25 w-8 h-8 top-12 right-12 transition-colors"
            style={{ backgroundColor: current.accent }}
          />
          <div 
            className="absolute rounded-full opacity-25 w-5 h-5 bottom-12 left-14 transition-colors"
            style={{ backgroundColor: current.accent }}
          />
        </div>

        {/* Content */}
        <div className="mt-10 flex-1">
          <p className="text-sm font-extrabold tracking-wider uppercase mb-3" style={{ color: palette.primary }}>
            {t("studentTip")}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4" style={{ color: palette.foreground }}>
            {current.title}
          </h1>
          <p className="text-lg leading-relaxed pr-4" style={{ color: palette.muted }}>
            {current.body}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            {cards.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === step ? "w-5" : "w-1.5"
                )}
                style={{ backgroundColor: idx === step ? palette.primary : palette.border }}
              />
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: palette.primary, boxShadow: `0 10px 25px ${palette.primary}40` }}
          >
            <span className="text-lg font-extrabold text-white">
              {lastStep ? t("finish") : t("continue")}
            </span>
            <ArrowRight size={20} color="#FFFFFF" />
          </button>

          {!lastStep && (
            <button 
              onClick={handleSkip}
              className="mt-4 py-4 px-8 text-base font-bold transition-opacity hover:opacity-80"
              style={{ color: palette.muted }}
            >
              {t("skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
