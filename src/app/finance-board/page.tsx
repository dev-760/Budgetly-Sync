"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, PlusCircle, Repeat, Wallet, Calendar as CalendarIcon, RepeatIcon, Receipt, Landmark, ArrowRightLeft, EyeOff, ChevronRight } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatMoney } from "@/lib/budget-data";
import { BrandLockup, Card, RoundIcon, SectionTitle, EmptyState } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

export default function FinanceBoardPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const { settings, recurring, buckets, finance } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const recurringIncome = recurring.filter((item) => item.kind === "income");
  const cigarettes = settings.cigaretteTracker ?? { entries: [] };
  const cigaretteMonth = new Date().toISOString().slice(0, 7);
  const cigaretteSpent = cigarettes.entries.filter((entry) => entry.date.slice(0, 7) === cigaretteMonth).reduce((sum, entry) => sum + entry.amount, 0);

  const getBucketIcon = (id: string) => {
    switch (id) {
      case "cash": return Wallet;
      default: return Landmark;
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 flex flex-col items-center" style={{ backgroundColor: palette.background }}>
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <BrandLockup compact />
        <div className="w-10 h-10" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: palette.foreground }}>
            {label("Finance board", "Vue financière")}
          </h1>
          <p className="text-sm leading-relaxed max-w-[330px]" style={{ color: palette.muted }}>
            {label("Everything you own, owe, and plan — kept on this device.", "Ce que tu possèdes, dois et prévois — conservé sur cet appareil.")}
          </p>
        </div>

        {/* Net Worth */}
        <div className="p-6 rounded-3xl" style={{ backgroundColor: "#0F172A" }}>
          <p className="text-sm font-bold mb-2" style={{ color: "#BFD0FF" }}>{label("Net worth", "Patrimoine net")}</p>
          <h2 className="text-4xl font-extrabold tabular-nums mb-3" style={{ color: "#FFFFFF" }}>
            {formatMoney(finance.netWorth, settings.language as any)}
          </h2>
          <p className="text-xs" style={{ color: "#BFD0FF" }}>{label("Buckets + receivables − liabilities", "Comptes + créances − dettes")}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/transaction?kind=income")}
            className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: palette.primary }}
          >
            <PlusCircle size={20} color="#FFFFFF" />
            <span className="text-sm font-bold text-white">{label("Record income", "Ajouter un revenu")}</span>
          </button>
          <button
            onClick={() => router.push("/finance-manage?mode=income")}
            className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 border shadow-sm transition-opacity hover:opacity-90 bg-[#EEF3FF]"
            style={{ borderColor: palette.primaryLight }}
          >
            <Repeat size={20} color={palette.primary} />
            <span className="text-sm font-bold" style={{ color: palette.primary }}>{label("Plan income", "Planifier le revenu")}</span>
          </button>
        </div>

        {/* Monthly Income */}
        <section>
          <SectionTitle 
            title={label("Monthly income", "Revenu mensuel")} 
            action={label("Calendar", "Calendrier")} 
            onPress={() => router.push("/income-calendar")} 
          />
          <Card className="py-2 divide-y divide-gray-100 dark:divide-slate-800">
            {recurringIncome.length ? recurringIncome.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <RoundIcon icon={Wallet} size={36} color="#10B981" background="#E7F7F1" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.title}</h4>
                  <p className="text-xs mt-1" style={{ color: palette.muted }}>
                    {label("Next payday", "Prochain versement")} · {item.nextDueDate}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: "#10B981" }}>
                  {formatMoney(item.amount, settings.language as any)}
                </span>
              </div>
            )) : (
              <EmptyState 
                icon={Wallet} 
                title={label("Plan your monthly income", "Planifie ton revenu mensuel")} 
                description={label("Add your salary or allowance and its next payday.", "Ajoute ton salaire ou allocation et son prochain versement.")} 
              />
            )}
          </Card>
        </section>

        {/* Private Tracker */}
        <section>
          <SectionTitle 
            title={label("Private monthly tracker", "Suivi mensuel privé")} 
            action={label("Open", "Ouvrir")} 
            onPress={() => router.push("/cigarette-tracker")} 
          />
          <button 
            onClick={() => router.push("/cigarette-tracker")}
            className="w-full bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center gap-3 transition-opacity hover:opacity-80"
            style={{ borderColor: palette.border }}
          >
            <RoundIcon icon={EyeOff} size={40} color={palette.primary} background={`${palette.primary}15`} />
            <div className="flex-1 text-left">
              <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{label("Cigarettes of the month", "Cigarettes du mois")}</h4>
              <p className="text-xs mt-1" style={{ color: palette.muted }}>
                {cigarettes.monthlyLimit === undefined ? label("No monthly limit set", "Aucune limite mensuelle") : `${label("Limit", "Limite")} · ${formatMoney(cigarettes.monthlyLimit ?? 0, settings.language as any)}`}
              </p>
            </div>
            <span className="text-sm font-bold mr-1" style={{ color: palette.foreground }}>
              {formatMoney(cigaretteSpent, settings.language as any)}
            </span>
            <ChevronRight size={20} color={palette.primary} />
          </button>
        </section>

        {/* Buckets */}
        <section>
          <SectionTitle 
            title={label("Buckets", "Comptes")} 
            action={label("Manage", "Gérer")} 
            onPress={() => router.push("/finance-manage?mode=transfer")} 
          />
          <div className="grid grid-cols-2 gap-3">
            {buckets.map((bucket) => {
              const Icon = getBucketIcon(bucket.id);
              return (
                <Card key={bucket.id} className="p-4">
                  <RoundIcon 
                    icon={Icon} 
                    size={40} 
                    color={bucket.color} 
                    background={bucket.id === "cash" ? "#E7F7F1" : "#EAF0FF"} 
                  />
                  <h4 className="text-xs font-bold mt-3" style={{ color: palette.muted }}>{bucket.name}</h4>
                  <p className="text-base font-bold mt-1 tabular-nums" style={{ color: palette.foreground }}>
                    {formatMoney(bucket.balance, settings.language as any)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Commitments */}
        <section>
          <SectionTitle 
            title={label("Commitments", "Engagements")} 
            action={label("Manage", "Gérer")} 
            onPress={() => router.push("/finance-manage?mode=subscription")} 
          />
          <Card className="py-2 divide-y divide-gray-100 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3">
              <RoundIcon icon={RepeatIcon} size={36} color="#F59E0B" background="#F6F8FC" />
              <span className="flex-1 text-sm font-bold" style={{ color: palette.foreground }}>{label("Subscriptions", "Abonnements")}</span>
              <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(finance.subscriptionTotal, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <RoundIcon icon={CalendarIcon} size={36} color="#EF4444" background="#F6F8FC" />
              <span className="flex-1 text-sm font-bold" style={{ color: palette.foreground }}>{label("Upcoming expenses", "Dépenses à venir")}</span>
              <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(finance.upcomingTotal, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <RoundIcon icon={Receipt} size={36} color="#0F172A" background="#F6F8FC" />
              <span className="flex-1 text-sm font-bold" style={{ color: palette.foreground }}>{label("Liabilities", "Dettes")}</span>
              <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(finance.liabilities, settings.language as any)}</span>
            </div>
          </Card>
        </section>

        {/* Money out and back */}
        <section>
          <SectionTitle 
            title={label("Money out and back", "Argent prêté et à recevoir")} 
            action={label("Manage", "Gérer")} 
            onPress={() => router.push("/finance-manage?mode=loan")} 
          />
          <Card className="py-2 divide-y divide-gray-100 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3">
              <RoundIcon icon={Landmark} size={36} color="#10B981" background="#F6F8FC" />
              <span className="flex-1 text-sm font-bold" style={{ color: palette.foreground }}>{label("Loans receivable", "Prêts à recevoir")}</span>
              <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(finance.loansReceivable, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <RoundIcon icon={ArrowRightLeft} size={36} color={palette.primary} background="#F6F8FC" />
              <span className="flex-1 text-sm font-bold" style={{ color: palette.foreground }}>{label("Lent to others", "Prêté à d’autres")}</span>
              <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(finance.lentOutstanding, settings.language as any)}</span>
            </div>
          </Card>
        </section>

        <p className="text-[11px] text-center mt-6" style={{ color: palette.muted, lineHeight: 1.5 }}>
          {label("Private by default: this board is stored locally on your device.", "Privé par défaut : cette vue est conservée localement sur ton appareil.")}
        </p>
      </div>
    </div>
  );
}
