"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Globe, Bell, Download, Trash2, Shield } from 'lucide-react';
import { Card, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext, visualThemes } from '@/lib/theme-provider';
import { Language } from '@/lib/budget-data';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, setLanguage, setAppearancePreferences, toggleNotifications, clearLocalData, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const confirmReset = () => {
    if (window.confirm(label("This will erase all your local data. This cannot be undone. Continue?", "Cela effacera toutes vos données locales. Cette action est irréversible. Continuer ?"))) {
      clearLocalData();
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgetly-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-0 pb-7">
        {/* Header */}
        <div className="h-[62px] flex flex-row items-center gap-3 shrink-0">
          <button onClick={() => router.back()} className="h-10 w-10 rounded-2xl border flex items-center justify-center active:opacity-70 transition-opacity" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <ArrowLeft size={22} color={palette.foreground} />
          </button>
          <h1 className="text-[17px] font-extrabold" style={{ color: palette.foreground }}>{label("Settings", "Réglages")}</h1>
        </div>

        {/* Appearance */}
        <SectionTitle title={label("Appearance", "Apparence")} />
        <Card>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-3" style={{ color: palette.muted }}>{label("Theme", "Thème")}</p>
          <div className="grid grid-cols-3 gap-2.5">
            {(Object.entries(visualThemes) as [string, typeof visualThemes[keyof typeof visualThemes]][]).map(([id, theme]) => (
              <button
                key={id}
                onClick={() => setAppearancePreferences({ visualTheme: id as any })}
                className={cn("p-3 rounded-2xl border-2 text-center active:opacity-70 transition-all", settings.appearance.visualTheme === id ? "shadow-sm" : "")}
                style={{ borderColor: settings.appearance.visualTheme === id ? palette.primary : palette.border, backgroundColor: settings.appearance.visualTheme === id ? palette.primary + '08' : palette.surface }}
              >
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: theme.primary }} />
                <span className="text-[12px] font-bold" style={{ color: palette.foreground }}>{theme.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Language */}
        <SectionTitle title={t("language")} />
        <Card>
          <div className="flex flex-row gap-2">
            {(["en", "fr"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="flex-1 py-2.5 rounded-xl border text-center active:opacity-70 transition-all"
                style={{ backgroundColor: settings.language === lang ? '#F1F5F9' : palette.background, borderColor: palette.border }}
              >
                <span className="text-[13px] font-bold" style={{ color: settings.language === lang ? palette.primary : palette.muted }}>
                  {lang === "en" ? "English" : "Français"}
                </span>
              </button>
            ))}
          </div>
        </Card>

        
        {/* Cloud Sync */}
        <SectionTitle title={label("Cloud Sync", "Synchronisation Cloud")} />
        <Card className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-3">
            <RoundIcon icon={Globe} size={36} color={palette.primary} background="#EAF0FF" />
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
              <div className="flex-1 py-2.5 rounded-xl border flex items-center justify-center bg-gray-50">
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

        {/* Notifications */}
        <SectionTitle title={t("notificationsEnabled")} />
        <Card className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2.5">
            <RoundIcon icon={Bell} size={36} color={palette.primary} background="#EAF0FF" />
            <span className="text-[14px] font-bold" style={{ color: palette.foreground }}>{label("Push Notifications", "Notifications push")}</span>
          </div>
          <button
            onClick={toggleNotifications}
            className="w-[51px] h-[31px] rounded-full p-[2px] transition-colors"
            style={{ backgroundColor: settings.notificationsEnabled ? palette.primary : palette.border }}
          >
            <div className={cn("w-[27px] h-[27px] rounded-full bg-white shadow-sm transition-transform", settings.notificationsEnabled ? "translate-x-5" : "translate-x-0")} />
          </button>
        </Card>

        {/* Data Export */}
        <SectionTitle title={label("Data Export", "Export des données")} />
        <Card className="flex flex-row gap-2.5">
          <button onClick={() => exportData('json')} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold active:opacity-70 transition-opacity" style={{ backgroundColor: '#F1F5F9', color: palette.foreground }}>
            {label("Export JSON", "Exporter JSON")}
          </button>
          <button onClick={() => exportData('csv')} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold active:opacity-70 transition-opacity" style={{ backgroundColor: '#F1F5F9', color: palette.foreground }}>
            {label("Export CSV", "Exporter CSV")}
          </button>
        </Card>

        {/* Danger Zone */}
        <SectionTitle title={label("Danger Zone", "Zone de danger")} />
        <Card style={{ borderColor: '#ffdad6' }}>
          <p className="text-[13px] leading-[18px] mb-3" style={{ color: palette.muted }}>
            {label("This action will permanently erase all your local financial data.", "Cette action effacera définitivement toutes vos données financières locales.")}
          </p>
          <button
            onClick={confirmReset}
            className="flex flex-row items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-extrabold active:opacity-70 transition-opacity"
            style={{ backgroundColor: palette.error }}
          >
            <Trash2 size={16} />
            {t("clearLocalData")}
          </button>
        </Card>
      </div>
    </div>
  );
}
