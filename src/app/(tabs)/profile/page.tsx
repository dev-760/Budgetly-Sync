"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronRight, Bell, Banknote, Flag, RefreshCw, RotateCcw } from 'lucide-react';
import { BrandLockup, Card, EmptyState, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { Language } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function ProfileScreen() {
  const { settings, goals, recurring, setLanguage, toggleNotifications, clearLocalData, t } = useBudget();
  const { palette } = useThemeContext();
  const router = useRouter();
  const profileName = settings.displayName || (settings.language === "fr" ? "Ton profil" : "Your profile");
  const localProfileSubtitle = settings.language === "fr" ? "Nom et photo enregistrés sur cet appareil" : "Name and photo stored on this device";

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-3.5 pb-7">
        {/* Header */}
        <div className="mb-[18px]">
          <h1 className="text-[28px] font-extrabold tracking-[-0.7px]" style={{ color: palette.foreground }}>{t("profile")}</h1>
          <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>{t("studentTip")}</p>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-4">
            {/* Profile Card */}
        <button
          onClick={() => router.push('/profile-edit')}
          className="w-full flex flex-row items-center gap-4 rounded-[24px] border p-[18px] mb-5 active:opacity-70 transition-opacity text-left"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <div className="h-[60px] w-[60px] rounded-[20px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: palette.primary }}>
            {settings.profileImageUri ? (
              <img src={settings.profileImageUri} alt="" className="w-full h-full object-cover rounded-[20px]" />
            ) : (
              <User size={28} color="white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-extrabold truncate" style={{ color: palette.foreground }}>{profileName}</p>
            <p className="text-[13px] mt-1 leading-[18px]" style={{ color: palette.muted }}>{localProfileSubtitle}</p>
          </div>
          <div className="rounded-xl px-2.5 py-1.5" style={{ backgroundColor: '#EEF3FF' }}>
            <span className="text-[12px] font-extrabold" style={{ color: palette.primary }}>
              {settings.language === "fr" ? "Modifier" : "Edit"}
            </span>
          </div>
          <ChevronRight size={24} color={palette.muted} />
        </button>

        
{/* Preferences */}
        <SectionTitle title={t("preferences")} action={settings.language === "fr" ? "Réglages" : "Settings"} onPress={() => router.push('/settings')} />
        <Card className="py-1.5">
          <p className="text-[12px] font-bold pt-2.5 px-2.5" style={{ color: palette.muted }}>{t("language")}</p>
          <div className="flex flex-row gap-2 p-2.5">
            {(["en", "fr"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="flex-1 py-2.5 rounded-xl border text-center active:opacity-70 transition-opacity"
                style={{
                  backgroundColor: settings.language === lang ? '#F1F5F9' : palette.background,
                  borderColor: palette.border
                }}
              >
                <span className="text-[13px] font-bold" style={{ color: settings.language === lang ? palette.primary : palette.muted }}>
                  {lang === "en" ? t("english") : t("french")}
                </span>
              </button>
            ))}
          </div>
          <div className="h-px mx-2.5" style={{ backgroundColor: palette.border }} />
          <div className="h-[62px] flex flex-row items-center justify-between px-2.5">
            <div className="flex flex-row items-center gap-2.5">
              <RoundIcon icon={Bell} size={36} color={palette.primary} background="#EAF0FF" />
              <span className="text-[14px] font-bold" style={{ color: palette.foreground }}>{t("notificationsEnabled")}</span>
            </div>
            <button
              onClick={() => toggleNotifications()}
              className="w-[51px] h-[31px] rounded-full p-[2px] transition-colors"
              style={{ backgroundColor: settings.notificationsEnabled ? palette.primary : palette.border }}
            >
              <div className={cn("w-[27px] h-[27px] rounded-full bg-white shadow-sm transition-transform", settings.notificationsEnabled ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
          <div className="h-px mx-2.5" style={{ backgroundColor: palette.border }} />
          <div className="h-[62px] flex flex-row items-center justify-between px-2.5">
            <div className="flex flex-row items-center gap-2.5">
              <RoundIcon icon={Banknote} size={36} color={palette.success} background="#E7F7F1" />
              <span className="text-[14px] font-bold" style={{ color: palette.foreground }}>{t("currency")}</span>
            </div>
            <span className="text-[13px] font-bold" style={{ color: palette.muted }}>MAD · DH</span>
          </div>
        </Card>

        
          </div>
          <div className="flex flex-col gap-4">
            {/* Goals */}
        <SectionTitle title={t("goals")} action={t("addGoal")} onPress={() => router.push('/goal')} />
        <Card className="p-0 overflow-hidden">
          {goals.length ? goals.map((goal, i) => (
            <button
              key={goal.id}
              onClick={() => router.push('/goal')}
              className={cn("w-full flex flex-row items-center gap-[11px] py-3 px-3.5 active:opacity-70 transition-opacity text-left", i !== goals.length - 1 && "border-b")}
              style={{ borderColor: palette.border }}
            >
              <RoundIcon icon={Flag} size={40} color="#7A63D2" background={palette.surface} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-extrabold truncate" style={{ color: palette.foreground }}>{goal.title}</p>
                <p className="text-[12px] mt-[3px]" style={{ color: palette.muted }}>
                  {goal.savedAmount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} / {goal.targetAmount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} DH
                </p>
              </div>
              <ChevronRight size={21} color={palette.muted} />
            </button>
          )) : (
            <EmptyState
              icon={Flag}
              title={settings.language === "fr" ? "Ton premier objectif" : "Your first goal"}
              body={settings.language === "fr" ? "Ajoute un objectif pour visualiser ta progression ici." : "Add a goal to see your progress here."}
            />
          )}
        </Card>

        
{/* Recurring Items */}
        <SectionTitle title={t("recurringItems")} />
        <Card className="p-0 overflow-hidden">
          {recurring.length ? recurring.map((item, i) => (
            <div
              key={item.id}
              className={cn("flex flex-row items-center gap-[11px] py-3 px-3.5", i !== recurring.length - 1 && "border-b")}
              style={{ borderColor: palette.border }}
            >
              <RoundIcon icon={RefreshCw} size={40} color={palette.warning} background="#FFF3D8" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-extrabold truncate" style={{ color: palette.foreground }}>{item.title}</p>
                <p className="text-[12px] mt-[3px]" style={{ color: palette.muted }}>
                  {item.amount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} DH · {t("recurring")}
                </p>
              </div>
            </div>
          )) : (
            <EmptyState
              icon={RefreshCw}
              title={settings.language === "fr" ? "Pas encore de paiement régulier" : "No recurring payments yet"}
              body={settings.language === "fr" ? "Les dépenses régulières apparaîtront ici." : "Regular expenses will appear here."}
            />
          )}
        </Card>

        
{/* Reset */}
        <button
          onClick={() => { if (confirm(settings.language === "fr" ? "Cette action efface les données financières enregistrées sur cet appareil." : "This erases the finance data saved on this device.")) clearLocalData(); }}
          className="mt-5 mx-auto flex flex-row items-center gap-1.5 p-3 active:opacity-70 transition-opacity"
        >
          <RotateCcw size={18} color={palette.error} />
          <span className="text-[13px] font-bold" style={{ color: palette.error }}>{t("clearLocalData")}</span>
        </button>

        
          </div>
        </div>
{/* Brand Footer */}
        <div className="mt-8 flex flex-col items-center pb-5">
          <BrandLockup compact />
          <a href="https://github.com/dev-760" target="_blank" rel="noopener noreferrer" className="mt-3 text-[13px] font-semibold" style={{ color: palette.muted }}>
            Developed by dev
          </a>
        </div>
      </div>
    </div>
  );
}
