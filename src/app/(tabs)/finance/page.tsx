"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Repeat, Wallet, Calendar as CalendarIcon, RepeatIcon, Receipt, Landmark, ArrowRightLeft, EyeOff, ChevronRight } from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatMoney } from "@/lib/budget-data";
import { BrandLockup, Card, RoundIcon, SectionTitle, EmptyState } from "@/components/budget-ui";

export default function FinanceTabPage() {
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
    <div className="min-h-screen pb-24 px-5 pt-4 max-w-xl mx-auto" style={{ backgroundColor: palette.background }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: palette.foreground }}>
            {label("Finance board", "Vue financière")}
          </h1>
          <p className="text-sm mt-1 leading-relaxed max-w-[330px]" style={{ color: palette.muted }}>
            {label("Everything you own, owe, and plan — kept on this device.", "Ce que tu possèdes, dois et prévois — conservé sur cet appareil.")}
          </p>
        </div>
        <BrandLockup compact />
      </div>

      <div className="space-y-6">
        {/* Net Worth */}
        <div className="p-[22px] rounded-[24px] shadow-lg" style={{ backgroundColor: "#172033" }}>
          <p className="text-[13px] font-bold mb-2 text-[#BFD0FF]">{label("Net worth", "Patrimoine net")}</p>
          <h2 className="text-[34px] font-extrabold tabular-nums mb-3 text-white leading-tight">
            {formatMoney(finance.netWorth, settings.language as any)}
          </h2>
          <p className="text-xs text-[#BFD0FF]">{label("Buckets + receivables − liabilities", "Comptes + créances − dettes")}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/transaction?kind=income")}
            className="flex-1 h-[52px] rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: palette.primary }}
          >
            <PlusCircle size={20} color="#FFFFFF" />
            <span className="text-[13px] font-extrabold text-white">{label("Record income", "Ajouter un revenu")}</span>
          </button>
          <button
            onClick={() => router.push("/finance-manage?mode=income")}
            className="flex-1 h-[52px] rounded-2xl flex items-center justify-center gap-2 border shadow-sm transition-opacity hover:opacity-90 bg-[#EEF3FF]"
            style={{ borderColor: palette.border }}
          >
            <Repeat size={20} color={palette.primary} />
            <span className="text-[13px] font-extrabold" style={{ color: palette.primary }}>{label("Plan income", "Planifier le revenu")}</span>
          </button>
        </div>

        {/* Monthly Income */}
        <section>
          <SectionTitle 
            title={label("Monthly income", "Revenu mensuel")} 
            action={label("Calendar", "Calendrier")} 
            onPress={() => router.push("/income-calendar")} 
          />
          <Card className="py-1 divide-y divide-gray-100 dark:divide-slate-800">
            {recurringIncome.length ? recurringIncome.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 px-3">
                <RoundIcon icon={Wallet} size={38} color="#10B981" background="#E7F7F1" />
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold" style={{ color: palette.foreground }}>{item.title}</h4>
                  <p className="text-xs mt-1" style={{ color: palette.muted }}>
                    {label("Next payday", "Prochain versement")} · {item.nextDueDate}
                  </p>
                </div>
                <span className="text-[15px] font-extrabold" style={{ color: "#10B981" }}>
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
            className="w-full bg-white dark:bg-slate-900 border rounded-[22px] p-4 flex items-center gap-3 transition-opacity hover:opacity-80 shadow-sm"
            style={{ borderColor: palette.border }}
          >
            <RoundIcon icon={EyeOff} size={42} color={palette.primary} background={`${palette.primary}15`} />
            <div className="flex-1 text-left">
              <h4 className="text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Cigarettes of the month", "Cigarettes du mois")}</h4>
              <p className="text-xs mt-1" style={{ color: palette.muted }}>
                {cigarettes.monthlyLimit === undefined ? label("No monthly limit set", "Aucune limite mensuelle") : `${label("Limit", "Limite")} · ${formatMoney(cigarettes.monthlyLimit ?? 0, settings.language as any)}`}
              </p>
            </div>
            <span className="text-[15px] font-extrabold mr-1" style={{ color: palette.foreground }}>
              {formatMoney(cigaretteSpent, settings.language as any)}
            </span>
            <ChevronRight size={22} color={palette.primary} />
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
                <Card key={bucket.id} className="p-[15px]">
                  <RoundIcon 
                    icon={Icon} 
                    size={38} 
                    color={bucket.color} 
                    background={bucket.id === "cash" ? "#E7F7F1" : "#EAF0FF"} 
                  />
                  <h4 className="text-[13px] font-bold mt-3" style={{ color: palette.muted }}>{bucket.name}</h4>
                  <p className="text-[19px] font-extrabold mt-1 tabular-nums" style={{ color: palette.foreground }}>
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
          <Card className="py-1 divide-y divide-gray-100 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3 px-3">
              <RoundIcon icon={RepeatIcon} size={36} color="#F59E0B" background="#F6F8FC" />
              <span className="flex-1 text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Subscriptions", "Abonnements")}</span>
              <span className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(finance.subscriptionTotal, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-3">
              <RoundIcon icon={CalendarIcon} size={36} color="#EF4444" background="#F6F8FC" />
              <span className="flex-1 text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Upcoming expenses", "Dépenses à venir")}</span>
              <span className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(finance.upcomingTotal, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-3">
              <RoundIcon icon={Receipt} size={36} color="#0F172A" background="#F6F8FC" />
              <span className="flex-1 text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Liabilities", "Dettes")}</span>
              <span className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(finance.liabilities, settings.language as any)}</span>
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
          <Card className="py-1 divide-y divide-gray-100 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3 px-3">
              <RoundIcon icon={Landmark} size={36} color="#10B981" background="#F6F8FC" />
              <span className="flex-1 text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Loans receivable", "Prêts à recevoir")}</span>
              <span className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(finance.loansReceivable, settings.language as any)}</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-3">
              <RoundIcon icon={ArrowRightLeft} size={36} color={palette.primary} background="#F6F8FC" />
              <span className="flex-1 text-[15px] font-bold" style={{ color: palette.foreground }}>{label("Lent to others", "Prêté à d’autres")}</span>
              <span className="text-[15px] font-extrabold" style={{ color: palette.foreground }}>{formatMoney(finance.lentOutstanding, settings.language as any)}</span>
            </div>
          </Card>
        </section>

        <p className="text-xs text-center mt-6" style={{ color: palette.muted, lineHeight: 1.5 }}>
          {label("Private by default: this board is stored locally on your device.", "Privé par défaut : cette vue est conservée localement sur ton appareil.")}
        </p>
      </div>
    </div>
  );
}