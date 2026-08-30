"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';
import { Card, SectionTitle, RoundIcon, EmptyState, BrandLockup } from '@/components/budget-ui';
import { User, ChevronRight, Settings, Flag, RepeatIcon, Trash2, LogOut, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/budget-data';

export default function ProfilePage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, goals, recurring, setLanguage, clearLocalData, t } = useBudget();

  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const profileName = settings.displayName || (isFrench ? "Ton profil" : "Your profile");
  const localProfileSubtitle = isFrench ? "Nom et photo enregistrés sur cet appareil" : "Name and photo stored on this device";

  const confirmReset = () => {
    if (window.confirm(isFrench ? "Cette action efface les données financières enregistrées sur cet appareil." : "This erases the finance data saved on this device.")) {
      clearLocalData();
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('budgetly_jwt');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-lg mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: palette.foreground }}>
            {t("profile")}
          </h1>
          <p className="text-sm mt-1" style={{ color: palette.muted }}>
            {t("studentTip")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <button 
          onClick={() => router.push("/profile-edit")}
          className="w-full bg-white dark:bg-slate-900 border rounded-3xl p-5 flex items-center gap-4 transition-opacity hover:opacity-80 text-left"
          style={{ borderColor: palette.border }}
        >
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center overflow-hidden bg-blue-600">
            {settings.profileImageUri ? (
              <img src={settings.profileImageUri} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={32} color="#FFFFFF" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: palette.foreground }}>{profileName}</h2>
            <p className="text-[13px] mt-1" style={{ color: palette.muted, lineHeight: 1.4 }}>{localProfileSubtitle}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold dark:bg-blue-900/30">
            {isFrench ? "Modifier" : "Edit"}
          </div>
          <ChevronRight size={24} color={palette.muted} />
        </button>

        <section>
          <SectionTitle 
            title={t("preferences")} 
            action={isFrench ? "Réglages" : "Settings"} 
            onPress={() => router.push("/settings")} 
          />
          <Card className="p-2">
            <div className="px-3 pt-2 pb-1">
              <span className="text-xs font-bold" style={{ color: palette.muted }}>{t("language")}</span>
            </div>
            <div className="flex gap-2 p-3">
              {(["en", "fr"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "flex-1 py-3 rounded-xl border text-sm font-bold transition-colors"
                  )}
                  style={{
                    backgroundColor: settings.language === lang ? palette.surface : "transparent",
                    borderColor: settings.language === lang ? palette.border : "transparent",
                    color: settings.language === lang ? palette.primary : palette.muted
                  }}
                >
                  {lang === "en" ? t("english") : t("french")}
                </button>
              ))}
            </div>
            
            <div className="h-px mx-3" style={{ backgroundColor: palette.border }} />
            
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center justify-between w-full p-3 transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <RoundIcon icon={Settings} size={36} color="#10B981" background="#E7F7F1" />
                <span className="text-sm font-bold" style={{ color: palette.foreground }}>{isFrench ? "Plus de réglages" : "More settings"}</span>
              </div>
              <ChevronRight size={24} color={palette.muted} />
            </button>
          </Card>
        </section>

        <section>
          <SectionTitle title="Cloud Sync" />
          <Card className="p-2">
            <button
              onClick={() => router.push("/auth")}
              className="flex items-center justify-between w-full p-3 transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <RoundIcon icon={Link2} size={36} color="#10B981" background="#E7F7F1" />
                <div className="text-left">
                  <span className="text-sm font-bold block" style={{ color: palette.foreground }}>Backup & Sync</span>
                  <span className="text-xs mt-1 block" style={{ color: palette.muted }}>Use across devices with Passkey</span>
                </div>
              </div>
              <ChevronRight size={24} color={palette.muted} />
            </button>
          </Card>
        </section>

        <section>
          <SectionTitle 
            title={t("goals")} 
            action={t("addGoal")} 
            onPress={() => router.push("/goal")} 
          />
          <Card className="divide-y divide-gray-100 dark:divide-slate-800 py-1">
            {goals.length ? goals.map((goal) => (
              <button 
                key={goal.id} 
                onClick={() => router.push("/goal")}
                className="w-full flex items-center gap-3 py-3 px-4 text-left transition-opacity hover:opacity-80"
              >
                <RoundIcon icon={Flag} size={40} color="#7A63D2" background="#EEEAFE" />
                <div className="flex-1">
                  <span className="text-sm font-bold block" style={{ color: palette.foreground }}>{goal.title}</span>
                  <span className="text-xs mt-1 block" style={{ color: palette.muted }}>
                    {goal.savedAmount.toLocaleString(isFrench ? "fr-MA" : "en-US")} / {goal.targetAmount.toLocaleString(isFrench ? "fr-MA" : "en-US")} DH
                  </span>
                </div>
                <ChevronRight size={20} color={palette.muted} />
              </button>
            )) : (
              <EmptyState 
                icon={Flag} 
                title={isFrench ? "Ton premier objectif" : "Your first goal"} 
                description={isFrench ? "Ajoute un objectif pour visualiser ta progression ici." : "Add a goal to see your progress here."} 
              />
            )}
          </Card>
        </section>

        <section>
          <SectionTitle title={t("recurringItems")} />
          <Card className="divide-y divide-gray-100 dark:divide-slate-800 py-1">
            {recurring.length ? recurring.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 px-4">
                <RoundIcon icon={RepeatIcon} size={40} color="#F59E0B" background="#FFF3D8" />
                <div className="flex-1">
                  <span className="text-sm font-bold block" style={{ color: palette.foreground }}>{item.title}</span>
                  <span className="text-xs mt-1 block" style={{ color: palette.muted }}>
                    {item.amount.toLocaleString(isFrench ? "fr-MA" : "en-US")} DH · {t("recurring")}
                  </span>
                </div>
              </div>
            )) : (
              <EmptyState 
                icon={RepeatIcon} 
                title={isFrench ? "Pas encore de paiement régulier" : "No recurring payments yet"} 
                description={isFrench ? "Les dépenses régulières apparaîtront ici." : "Regular expenses will appear here."} 
              />
            )}
          </Card>
        </section>

        <div className="pt-4 flex flex-col items-center gap-6">
          <button
            onClick={confirmReset}
            className="flex items-center gap-2 py-2 px-4 transition-opacity hover:opacity-80"
          >
            <Trash2 size={18} color="#ef4444" />
            <span className="text-[13px] font-bold text-red-500">{t("clearLocalData")}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 transition-opacity hover:opacity-80"
          >
            <LogOut size={18} color={palette.muted} />
            <span className="text-[13px] font-bold" style={{ color: palette.muted }}>Logout</span>
          </button>
        </div>

        <div className="pt-8 pb-4 flex flex-col items-center gap-3">
          <BrandLockup compact />
          <a 
            href="https://github.com/dev-760"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-bold transition-opacity hover:opacity-80"
            style={{ color: palette.muted }}
          >
            Developed by dev
          </a>
        </div>
      </div>
    </div>
  );
}