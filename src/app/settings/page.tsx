"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Globe, Bell, Download, Trash2, Shield } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext, visualThemes } from '@/lib/theme-provider';
import { Language } from '@/lib/budget-data';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, setLanguage, setVisualTheme, toggleNotifications, clearLocalData, t } = useBudget();
  const isFrench = settings.language === 'fr';
  const label = (en: string, fr: string) => isFrench ? fr : en;

  const confirmReset = () => {
    if (window.confirm(label(
      "This will erase all your local data. This cannot be undone. Continue?",
      "Cela effacera toutes vos données locales. Cette action est irréversible. Continuer ?"
    ))) {
      clearLocalData();
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    // Simple export placeholder
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
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[#ededf8] transition-colors">
            <ArrowLeft size={20} className="text-[#434654]" />
          </button>
          <h1 className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#191b23]">{label("Settings", "Réglages")}</h1>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb] flex items-center gap-3">
            <Palette size={20} className="text-[#003fb1]" />
            <h2 className="text-[18px] font-semibold text-[#191b23]">{label("Appearance", "Apparence")}</h2>
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold tracking-[0.05em] text-[#434654] uppercase mb-4">{label("Theme", "Thème")}</p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(visualThemes) as [string, typeof visualThemes[keyof typeof visualThemes]][]).map(([id, theme]) => (
                <button
                  key={id}
                  onClick={() => setVisualTheme(id as any)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    settings.visualTheme === id
                      ? "border-[#003fb1] bg-[#003fb1]/5 shadow-sm"
                      : "border-[#e5e7eb] hover:border-[#003fb1]/30"
                  )}
                >
                  <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: theme.primary }}></div>
                  <p className="text-[13px] font-semibold text-[#191b23]">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb] flex items-center gap-3">
            <Globe size={20} className="text-[#003fb1]" />
            <h2 className="text-[18px] font-semibold text-[#191b23]">{t("language")}</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-3">
              {(["en", "fr"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-[14px] font-semibold transition-colors border",
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
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#003fb1]" />
              <h2 className="text-[18px] font-semibold text-[#191b23]">{t("notificationsEnabled")}</h2>
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
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#e5e7eb] flex items-center gap-3">
            <Download size={20} className="text-[#003fb1]" />
            <h2 className="text-[18px] font-semibold text-[#191b23]">{label("Data Export", "Export des données")}</h2>
          </div>
          <div className="p-6 flex gap-3">
            <button
              onClick={() => exportData('json')}
              className="flex-1 py-3 bg-[#ededf8] hover:bg-[#e2e1ed] text-[#191b23] rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors"
            >
              {label("Export JSON", "Exporter JSON")}
            </button>
            <button
              onClick={() => exportData('csv')}
              className="flex-1 py-3 bg-[#ededf8] hover:bg-[#e2e1ed] text-[#191b23] rounded-lg text-[13px] tracking-[0.02em] font-semibold transition-colors"
            >
              {label("Export CSV", "Exporter CSV")}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-[#ffdad6] overflow-hidden">
          <div className="p-6 border-b border-[#ffdad6] flex items-center gap-3">
            <Shield size={20} className="text-[#ba1a1a]" />
            <h2 className="text-[18px] font-semibold text-[#ba1a1a]">{label("Danger Zone", "Zone de danger")}</h2>
          </div>
          <div className="p-6">
            <p className="text-[14px] text-[#434654] mb-4">
              {label("This action will permanently erase all your local financial data.", "Cette action effacera définitivement toutes vos données financières locales.")}
            </p>
            <button
              onClick={confirmReset}
              className="flex items-center gap-2 px-5 py-3 bg-[#ba1a1a] text-white rounded-lg text-[13px] tracking-[0.02em] font-semibold hover:bg-[#93000a] transition-colors"
            >
              <Trash2 size={16} />
              {t("clearLocalData")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
