
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBudget } from "@/lib/budget-store";
import { useThemeContext, visualThemes } from "@/lib/theme-provider";
import { BrandLockup, Card, RoundIcon, SectionTitle, EmptyState } from "@/components/budget-ui";
import { ChevronRight, User, Bell, Banknote, Flag, RefreshCw, RotateCcw, Globe, LogOut, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";

export default function ProfileScreen() {
  const router = useRouter();
  const { palette, colorScheme } = useThemeContext();
  const { settings, goals, recurring, setLanguage, toggleNotifications, clearLocalData, setAppearancePreferences, hydrated, t } = useBudget();
  

  const label = (en: string, fr: string) => settings.language === "fr" ? fr : en;

  if (!hydrated) return null;

  const profileName = settings.displayName || (settings.language === "fr" ? "Mon profil" : "My Profile");
  const localProfileSubtitle = settings.language === "fr" ? "Nom et photo stockés sur cet appareil" : "Name and photo stored on this device";

  const exportData = (format: 'json' | 'csv') => {
    const data = JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budgetly-export.' + format;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-3.5 pb-11">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
          {/* LEFT COLUMN */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Profile Card */}
            <SectionTitle title={label("Profile", "Profil")} />
            <button
              onClick={() => router.push('/profile-edit')}
              className="w-full flex flex-row items-center gap-4 rounded-[24px] border p-[18px] active:opacity-70 transition-opacity text-left"
              style={{ backgroundColor: palette.surface, borderColor: palette.border }}
            >
              <div className="h-[60px] w-[60px] rounded-2xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: palette.primary }}>
                {settings.profileImageUri ? (
                  <img src={settings.profileImageUri} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <User size={28} color="white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-extrabold truncate" style={{ color: palette.foreground }}>{profileName}</p>
                <p className="text-[13px] mt-1 leading-[18px]" style={{ color: palette.muted }}>{localProfileSubtitle}</p>
              </div>
              <div className="rounded-xl px-2.5 py-1.5" style={{ backgroundColor: palette.softPrimary }}>
                <span className="text-[12px] font-extrabold" style={{ color: palette.primary }}>
                  {settings.language === "fr" ? "Modifier" : "Edit"}
                </span>
              </div>
              <ChevronRight size={24} color={palette.muted} />
            </button>

            {/* Cloud Sync */}
            <SectionTitle title={label("Cloud Sync", "Synchronisation Cloud")} />
            <Card className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-3">
                <RoundIcon icon={Globe} size={36} color={palette.primary} background={palette.softPrimary} />
                <div className="flex-1">
                  <p className="text-[14px] font-bold" style={{ color: palette.foreground }}>
                    {label("Cross-device Sync", "Synchronisation")}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
                    {label("Backup your data to access it anywhere", "Sauvegardez vos données pour y accéder partout")}
                  </p>
                </div>
              </div>
              {typeof window !== 'undefined' && storage.getItem('budgetly_jwt') ? (
                <div className="flex flex-row gap-2 mt-2">
                  <div className="flex-1 py-2.5 rounded-xl border flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <span className="text-[13px] font-bold text-gray-500">{label("Logged in", "Connecté")}</span>
                  </div>
                  <button 
                    onClick={() => {
                      storage.removeItem('budgetly_jwt');
                      window.location.reload();
                    }}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold active:opacity-70 transition-opacity flex items-center justify-center gap-2" 
                    style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                  >
                    <LogOut size={16} />
                    {label("Logout", "Déconnexion")}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => router.push('/auth')} 
                  className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold active:opacity-70 transition-opacity" 
                  style={{ backgroundColor: palette.primary, color: 'white' }}
                >
                  {label("Set up Cloud Sync", "Configurer la synchronisation Cloud")}
                </button>
              )}
            </Card>

            {/* Preferences */}
            <SectionTitle title={t("preferences")} />
            <Card className="py-1.5 flex flex-col">
              
              {/* Theme */}
              <div className="p-3">
                <p className="text-[12px] font-bold mb-3" style={{ color: palette.muted }}>{label("Theme", "Thème")}</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(Object.entries(visualThemes) as [string, typeof visualThemes[keyof typeof visualThemes]][]).map(([id, theme]) => (
                    <button
                      key={id}
                      onClick={() => setAppearancePreferences({ visualTheme: id as any })}
                      className={cn("p-2 rounded-2xl border-2 text-center active:opacity-70 transition-all", settings.appearance.visualTheme === id ? "shadow-sm" : "")}
                      style={{ borderColor: settings.appearance.visualTheme === id ? palette.primary : palette.border, backgroundColor: settings.appearance.visualTheme === id ? palette.softPrimary : palette.surface }}
                    >
                      <div className="w-6 h-6 rounded-full mx-auto mb-1.5" style={{ backgroundColor: theme.primary }} />
                      <span className="text-[11px] font-bold" style={{ color: palette.foreground }}>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px mx-2.5" style={{ backgroundColor: palette.border }} />

              {/* Language */}
              <div className="p-3">
                <p className="text-[12px] font-bold mb-3" style={{ color: palette.muted }}>{t("language")}</p>
                <div className="flex flex-row gap-2">
                  {(["en", "fr"] as ('en' | 'fr')[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className="flex-1 py-2 rounded-xl border text-center active:opacity-70 transition-opacity"
                      style={{
                        backgroundColor: settings.language === lang ? palette.softPrimary : palette.background,
                        borderColor: palette.border
                      }}
                    >
                      <span className="text-[13px] font-bold" style={{ color: settings.language === lang ? palette.primary : palette.muted }}>
                        {lang === "en" ? t("english") : t("french")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px mx-2.5" style={{ backgroundColor: palette.border }} />

              {/* Notifications */}
              <div className="h-[62px] flex flex-row items-center justify-between px-3">
                <div className="flex flex-row items-center gap-2.5">
                  <RoundIcon icon={Bell} size={36} color={palette.primary} background={palette.softPrimary} />
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
              
              {/* Currency */}
              <div className="h-[62px] flex flex-row items-center justify-between px-3">
                <div className="flex flex-row items-center gap-2.5">
                  <RoundIcon icon={Banknote} size={36} color={palette.success} background={colorScheme === 'dark' ? 'rgba(16,185,129,0.15)' : '#E7F7F1'} />
                  <span className="text-[14px] font-bold" style={{ color: palette.foreground }}>{t("currency")}</span>
                </div>
                <span className="text-[13px] font-bold" style={{ color: palette.muted }}>MAD · DH</span>
              </div>
            </Card>

          </div>
          
          {/* RIGHT COLUMN */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
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
                  <RoundIcon icon={RefreshCw} size={40} color={palette.warning} background={colorScheme === 'dark' ? 'rgba(245,158,11,0.15)' : '#FFF3D8'} />
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

            {/* Data Management */}
            <SectionTitle title={label("Data Management", "Gestion des données")} />
            <Card className="flex flex-col gap-3">
              <div className="flex flex-row gap-2.5">
                <button onClick={() => exportData('json')} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold active:opacity-70 transition-opacity border flex items-center justify-center gap-1.5" style={{ backgroundColor: palette.surface, color: palette.foreground, borderColor: palette.border }}>
                  <Download size={14} /> JSON
                </button>
                <button onClick={() => exportData('csv')} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold active:opacity-70 transition-opacity border flex items-center justify-center gap-1.5" style={{ backgroundColor: palette.surface, color: palette.foreground, borderColor: palette.border }}>
                  <Download size={14} /> CSV
                </button>
              </div>
              
              <div className="h-px w-full" style={{ backgroundColor: palette.border }} />
              
              <button
                onClick={() => { if (confirm(settings.language === "fr" ? "Cette action efface les données financières enregistrées sur cet appareil." : "This erases the finance data saved on this device.")) clearLocalData(); }}
                className="flex flex-row items-center justify-center gap-2 p-2 active:opacity-70 transition-opacity"
              >
                <RotateCcw size={16} color={palette.error} />
                <span className="text-[13px] font-bold" style={{ color: palette.error }}>{t("clearLocalData")}</span>
              </button>
            </Card>

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
