"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, EyeOff, TrendingUp } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { Card, RoundIcon, MoneyText, Button, Input } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

const monthKey = (date: string) => date.slice(0, 7);

export default function CigaretteTrackerPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, setCigaretteMonthlyLimit, addCigaretteSpend } = useBudget();
  
  const language = settings.language;
  const label = (en: string, fr: string) => language === "fr" ? fr : en;
  
  const tracker = settings.cigaretteTracker ?? { entries: [] };
  const [limit, setLimit] = useState(tracker.monthlyLimit ? String(tracker.monthlyLimit) : "");
  const [spend, setSpend] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const monthSpend = useMemo(() => 
    tracker.entries
      .filter((entry) => monthKey(entry.date) === monthKey(new Date().toISOString()))
      .reduce((sum, entry) => sum + entry.amount, 0), 
    [tracker.entries]
  );
  
  const remaining = tracker.monthlyLimit === undefined ? undefined : Math.max(tracker.monthlyLimit - monthSpend, 0);
  
  const trendMonths = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const total = tracker.entries.filter((entry) => monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.amount, 0);
      return { key, label: d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short" }).replace(".", ""), total };
    });
  }, [language, tracker.entries]);
  
  const trendMax = Math.max(...trendMonths.map((month) => month.total), 1);
  const trendTotal = trendMonths.reduce((sum, month) => sum + month.total, 0);

  const saveLimit = () => {
    const value = limit.trim() ? Number(limit.replace(",", ".")) : undefined;
    setCigaretteMonthlyLimit(value);
    alert(label("Monthly limit saved", "Limite mensuelle enregistrée"));
  };
  
  const addSpend = () => {
    if (!addCigaretteSpend(Number(spend.replace(",", ".")), date)) {
      alert("Invalid amount");
      return;
    }
    setSpend("");
    alert(label("Monthly spending updated", "Dépenses mensuelles mises à jour"));
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col items-center" style={{ backgroundColor: palette.background }}>
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-sm font-bold" style={{ color: palette.foreground }}>
          {label("Private tracker", "Suivi privé")}
        </h1>
        <div className="w-10 h-10" />
      </div>

      <div className="w-full max-w-lg space-y-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: palette.foreground }}>
            {label("Cigarettes of the month", "Cigarettes du mois")}
          </h2>
          <p className="text-sm" style={{ color: palette.muted, lineHeight: 1.5 }}>
            {label("A private monthly total stored only on this device.", "Un total mensuel privé stocké uniquement sur cet appareil.")}
          </p>
        </div>

        <Card className="flex items-center gap-4 mt-6">
          <RoundIcon icon={EyeOff} size={48} color={palette.primary} background={`${palette.primary}15`} />
          <div>
            <p className="text-xs font-bold" style={{ color: palette.muted }}>{label("This month", "Ce mois-ci")}</p>
            <MoneyText amount={monthSpend} language={language as any} className="text-3xl font-extrabold mt-1 inline-block" />
            <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
              {remaining === undefined ? label("Set a limit when you want one.", "Définis une limite si tu le souhaites.") : `${label("Remaining", "Restant")} · ${remaining.toFixed(2)} DH`}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold" style={{ color: palette.foreground }}>{label("Spending trend", "Tendance des dépenses")}</h3>
              <p className="text-xs mt-1" style={{ color: palette.muted }}>{label("Last 6 months", "6 derniers mois")} · {trendTotal.toFixed(2)} DH</p>
            </div>
            <RoundIcon icon={TrendingUp} size={40} color={palette.primary} background={`${palette.primary}15`} />
          </div>

          <div className="flex items-end justify-between gap-2 h-32 mt-4">
            {trendMonths.map(month => (
              <div key={month.key} className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full h-20 flex flex-col items-center justify-end mb-2">
                  <div 
                    className="w-full max-w-[24px] rounded-t-md transition-all"
                    style={{ 
                      backgroundColor: palette.primary,
                      height: month.total > 0 ? `${Math.max(10, (month.total / trendMax) * 100)}%` : '4px' 
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase" style={{ color: palette.muted }}>{month.label}</span>
                <span className="text-[9px] font-bold mt-1" style={{ color: palette.foreground }}>
                  {month.total > 0 ? Math.round(month.total) : "–"}
                </span>
              </div>
            ))}
          </div>

          {trendTotal === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: palette.muted }}>
              {label("Add spending to reveal your monthly pattern.", "Ajoute des dépenses pour voir ta tendance mensuelle.")}
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-bold mb-4" style={{ color: palette.foreground }}>{label("Monthly limit", "Limite mensuelle")}</h3>
          <div 
            className="h-16 rounded-2xl bg-white border-2 px-5 flex items-center justify-between shadow-sm transition-colors mb-4"
            style={{ borderColor: palette.border }}
          >
            <input 
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0"
              className="flex-1 text-2xl font-bold bg-transparent outline-none tabular-nums"
              style={{ color: palette.foreground }}
            />
            <span className="text-sm font-bold ml-2" style={{ color: palette.primary }}>DH</span>
          </div>
          <Button variant="secondary" onPress={saveLimit} className="w-full">
            {label("Save limit", "Enregistrer la limite")}
          </Button>
        </Card>

        <Card>
          <h3 className="font-bold mb-4" style={{ color: palette.foreground }}>{label("Add spending", "Ajouter une dépense")}</h3>
          <div 
            className="h-16 rounded-2xl bg-white border-2 px-5 flex items-center justify-between shadow-sm transition-colors mb-4"
            style={{ borderColor: palette.border }}
          >
            <input 
              type="number"
              value={spend}
              onChange={(e) => setSpend(e.target.value)}
              placeholder="0"
              className="flex-1 text-2xl font-bold bg-transparent outline-none tabular-nums"
              style={{ color: palette.foreground }}
            />
            <span className="text-sm font-bold ml-2" style={{ color: palette.primary }}>DH</span>
          </div>
          
          <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>{label("Date", "Date")}</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-14 rounded-xl px-4 border outline-none font-medium transition-colors mb-4"
            style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.foreground }}
          />

          <Button onPress={addSpend} className="w-full">
            {label("Add to this month", "Ajouter au mois")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
