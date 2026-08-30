"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { Language } from '@/lib/budget-data';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/budget-ui';

export default function OnboardingPage() {
  const router = useRouter();
  const { settings, setLanguage, updateProfile, completeOnboarding } = useBudget();
  const [step, setStep] = useState(1);
  
  const [tempLang, setTempLang] = useState<Language>(settings.language);
  const [tempName, setTempName] = useState(settings.displayName || "");

  const isFrench = tempLang === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const handleNext = () => {
    if (step === 2) {
      setLanguage(tempLang);
    }
    if (step === 3) {
      if (tempName.trim()) updateProfile({ displayName: tempName.trim() });
      completeOnboarding();
      router.replace('/');
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6">
      
      {/* Top Logo */}
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#003fb1] rounded-xl flex items-center justify-center shadow-md">
          <BrandMark fill="white" width={24} height={24} />
        </div>
        <span className="text-[20px] font-extrabold text-[#191b23] tracking-[-0.02em]">Budgetly</span>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="p-10 text-center space-y-6">
            <div className="w-24 h-24 bg-[#003fb1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} className="text-[#003fb1]" />
            </div>
            <h1 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#191b23]">
              {label("Welcome to Budgetly", "Bienvenue sur Budgetly")}
            </h1>
            <p className="text-[16px] leading-[24px] text-[#434654] max-w-sm mx-auto">
              {label("Your local-first personal finance manager. Private, fast, and completely yours.", "Votre gestionnaire de finances personnelles local. Privé, rapide et entièrement à vous.")}
            </p>
          </div>
        )}

        {/* Step 2: Language */}
        {step === 2 && (
          <div className="p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-[28px] leading-[36px] tracking-[-0.01em] font-bold text-[#191b23] mb-2">
                {label("Choose your language", "Choisissez votre langue")}
              </h2>
              <p className="text-[14px] text-[#434654]">
                {label("You can change this later in settings.", "Vous pourrez la modifier plus tard dans les paramètres.")}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {(["en", "fr"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTempLang(lang)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 relative",
                    tempLang === lang 
                      ? "border-[#003fb1] bg-[#003fb1]/5 shadow-sm" 
                      : "border-[#e5e7eb] hover:border-[#003fb1]/30"
                  )}
                >
                  <span className="text-[40px]">{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span>
                  <span className="text-[16px] font-semibold text-[#191b23]">
                    {lang === 'en' ? 'English' : 'Français'}
                  </span>
                  {tempLang === lang && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[#003fb1] rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 3 && (
          <div className="p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-[28px] leading-[36px] tracking-[-0.01em] font-bold text-[#191b23] mb-2">
                {label("What should we call you?", "Comment devons-nous vous appeler ?")}
              </h2>
              <p className="text-[14px] text-[#434654]">
                {label("Personalize your experience.", "Personnalisez votre expérience.")}
              </p>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-2">
                {label("Display Name", "Nom d'affichage")}
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder={label("Enter your name", "Entrez votre nom")}
                className="w-full px-5 py-4 rounded-xl border border-[#e5e7eb] bg-white text-[16px] text-[#191b23] outline-none focus:border-[#003fb1] focus:ring-2 focus:ring-[#003fb1]/20 transition-all font-medium placeholder:text-[#c3c5d7]"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-10 py-6 border-t border-[#e5e7eb] bg-[#f8f9ff] flex items-center justify-between">
          
          {/* Progress Dots */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  step === i ? "w-6 bg-[#003fb1]" : "w-2 bg-[#c3c5d7]"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={step === 3 && !tempName.trim()}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#003fb1] text-white rounded-lg text-[14px] font-semibold hover:bg-[#1a56db] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 
              ? label("Get Started", "Commencer") 
              : step === 3 
                ? label("Complete Setup", "Terminer la configuration")
                : label("Continue", "Continuer")
            }
            {step !== 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
