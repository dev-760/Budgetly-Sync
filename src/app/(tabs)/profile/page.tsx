"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronRight, Globe, Bell, Wallet, Flag, Repeat, Settings, Trash2 } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { formatMoney, Language } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, goals, recurring, setLanguage, toggleNotifications, clearLocalData, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const profileName = settings.displayName || label("Your profile", "Ton profil");

  const confirmReset = () => {
    if (window.confirm(label(
      "This erases the finance data saved on this device. Are you sure?",
      "Cette action efface les données financières enregistrées sur cet appareil. Êtes-vous sûr ?"
    ))) {
      clearLocalData();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{t("profile")}</h1>
          <p className="text-[14px] leading-[20px] text-[#434654]">{label("Manage your account and preferences", "Gérer votre compte et vos préférences")}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* Left Column */}
          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Profile Card */}
            <button
              onClick={() => router.push('/profile-edit')}
              className="w-full bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb] flex items-center gap-5 text-left hover:border-[#003fb1]/30 transition-colors group"
            >
              <div className="w-16 h-16 rounded-xl bg-[#003fb1] flex items-center justify-center shrink-0">
                {settings.profileImageUri ? (
                  <img src={settings.profileImageUri} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <User size={28} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-[18px] font-semibold text-[#191b23]">{profileName}</h2>
                <p className="text-[14px] text-[#434654] mt-1">{label("Name and photo stored locally", "Nom et photo enregistrés localement")}</p>
              </div>
              <span className="px-3 py-1.5 bg-[#ededf8] rounded-lg text-[11px] font-bold tracking-[0.05em] text-[#003fb1] uppercase">{label("Edit", "Modifier")}</span>
              <ChevronRight size={20} className="text-[#434654]" />
            </button>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center">
                <h3 className="text-[18px] font-semibold text-[#191b23]">{t("preferences")}</h3>
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.05em] text-[#003fb1] uppercase hover:text-[#1a56db] transition-colors"
                >
                  <Settings size={14} />
                  {label("All Settings", "Tous les réglages")}
                </button>
              </div>

              {/* Language */}
              <div className="p-6 border-b border-[#e5e7eb]">
                <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-3">{t("language")}</p>
                <div className="flex gap-3">
                  {(["en", "fr"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "flex-1 py-3 rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors border",
                        settings.language === lang
                          ? "bg-[#003fb1] text-white border-[#003fb1]"
                          : "bg-[#ededf8] text-[#434654] border-[#e5e7eb] hover:bg-[#e2e1ed]"
                      )}
                    >
                      {lang === "en" ? "English" : "Français"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="p-6 flex items-center justify-between border-b border-[#e5e7eb]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#003fb1]/10 flex items-center justify-center">
                    <Bell size={20} className="text-[#003fb1]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#191b23]">{t("notificationsEnabled")}</span>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    settings.notificationsEnabled ? "bg-[#003fb1]" : "bg-[#c3c5d7]"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm",
                    settings.notificationsEnabled ? "left-6" : "left-1"
                  )} />
                </button>
              </div>

              {/* Currency */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#006c49]/10 flex items-center justify-center">
                    <Wallet size={20} className="text-[#006c49]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#191b23]">{t("currency")}</span>
                </div>
                <span className="text-[13px] tracking-[0.02em] font-semibold text-[#434654]">MAD · DH</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ffdad6]">
              <h3 className="text-[14px] font-semibold text-[#ba1a1a] mb-3">{label("Danger Zone", "Zone de danger")}</h3>
              <button
                onClick={confirmReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#ffdad6] text-[#93000a] rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#ffb4ab] transition-colors"
              >
                <Trash2 size={16} />
                {t("clearLocalData")}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 xl:col-span-4 space-y-6">

            {/* Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-5 border-b border-[#e5e7eb] flex justify-between items-center">
                <h3 className="text-[18px] font-semibold text-[#191b23]">{t("goals")}</h3>
                <button
                  onClick={() => router.push('/goal')}
                  className="text-[11px] font-bold tracking-[0.05em] text-[#003fb1] uppercase hover:text-[#1a56db]"
                >
                  {t("addGoal")}
                </button>
              </div>
              {goals.length === 0 ? (
                <div className="p-8 text-center">
                  <Flag size={36} className="text-[#c3c5d7] mx-auto mb-3" />
                  <p className="text-[13px] text-[#434654]">{label("No goals yet", "Aucun objectif")}</p>
                  <button
                    onClick={() => router.push('/goal')}
                    className="mt-3 px-4 py-2 bg-[#003fb1] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold"
                  >
                    {label("Create Goal", "Créer un objectif")}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#e5e7eb]">
                  {goals.map((goal) => {
                    const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => router.push(`/goal?goalId=${goal.id}`)}
                        className="w-full p-4 text-left hover:bg-[#f3f3fe] transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#ededf8] flex items-center justify-center">
                          <Flag size={20} className="text-[#003fb1]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#191b23]">{goal.title}</p>
                          <div className="w-full bg-[#ededf8] h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full bg-[#003fb1]" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#434654]" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recurring */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-5 border-b border-[#e5e7eb]">
                <h3 className="text-[18px] font-semibold text-[#191b23]">{t("recurringItems")}</h3>
              </div>
              {recurring.length === 0 ? (
                <div className="p-8 text-center">
                  <Repeat size={36} className="text-[#c3c5d7] mx-auto mb-3" />
                  <p className="text-[13px] text-[#434654]">{label("No recurring payments", "Aucun paiement régulier")}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e5e7eb]">
                  {recurring.map((item) => (
                    <div key={item.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                        <Repeat size={20} className="text-[#f59e0b]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#191b23]">{item.title}</p>
                        <p className="text-[11px] text-[#434654] mt-0.5 tabular-nums">{formatMoney(item.amount, settings.language as any)} · {t("recurring")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Footer */}
            <div className="text-center py-4">
              <p className="text-[13px] text-[#434654]">Developed by dev</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}