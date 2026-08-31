"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, CalendarRange, Wallet, RefreshCw, CalendarDays, Receipt, Landmark, ArrowLeftRight, ChevronRight, Banknote, Lock } from 'lucide-react';
import { Card, EmptyState, RoundIcon, SectionTitle } from '@/components/budget-ui';
import { formatMoney } from '@/lib/budget-data';
import { useBudget } from '@/lib/budget-store';
import { useThemeContext } from '@/lib/theme-provider';

export default function FinanceScreen() {
  const { settings, recurring, buckets, finance } = useBudget();
  const { palette, colorScheme } = useThemeContext();
  const router = useRouter();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const recurringIncome = recurring.filter((item) => item.kind === "income");

  return (
    <div className="flex flex-col h-full w-full px-5 overflow-y-auto" style={{ backgroundColor: palette.background }}>
      <div className="pt-6 pb-10">
        

                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Net Worth Card */}
        <div className="mt-5 rounded-2xl p-5" style={{ backgroundColor: colorScheme === 'dark' ? palette.surface : palette.foreground }}>
          <p className="text-white/70 text-[13px] font-bold">{label("Net worth", "Patrimoine net")}</p>
          <p className="text-white text-[36px] font-extrabold tracking-[-1px] mt-2 tabular-nums">{formatMoney(finance.netWorth, settings.language)}</p>
          <p className="text-white/50 text-[12px] mt-2">{label("Buckets + receivables − liabilities", "Comptes + créances − dettes")}</p>
        </div>

        
{/* Buckets */}
        <SectionTitle title={label("Buckets", "Comptes")} action={label("Manage", "Gérer")} onPress={() => router.push('/finance-manage?mode=transfer')} />
        <div className="grid grid-cols-2 gap-3">
          {buckets.map((bucket) => (
            <Card key={bucket.id} className="p-3.5 flex flex-col gap-2.5">
              <RoundIcon icon={Wallet} size={35} color={bucket.color} background={bucket.id === "cash" ? "#E7F7F1" : "#EAF0FF"} />
              <p className="text-[12px] font-bold" style={{ color: palette.muted }}>{bucket.name}</p>
              <p className="text-[17px] font-extrabold tabular-nums" style={{ color: palette.foreground }}>
                {formatMoney(bucket.balance, settings.language)}
              </p>
            </Card>
          ))}
        </div>

        
          </div>
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Quick Actions */}
        <div className="flex flex-row gap-2.5 mt-4">
          <button 
            onClick={() => router.push('/transaction?kind=income')}
            className="flex-1 h-[44px] rounded-2xl flex flex-row items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
            style={{ backgroundColor: palette.primary }}
          >
            <PlusCircle size={19} color="white" />
            <span className="text-white text-[13px] font-extrabold">{label("Record income", "Ajouter un revenu")}</span>
          </button>
          <button 
            onClick={() => router.push('/finance-manage?mode=income')}
            className="flex-1 h-[44px] rounded-2xl border flex flex-row items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
            style={{ backgroundColor: palette.surface, borderColor: palette.border }}
          >
            <CalendarRange size={19} color={palette.primary} />
            <span className="text-[13px] font-extrabold" style={{ color: palette.primary }}>{label("Plan income", "Planifier le revenu")}</span>
          </button>
        </div>

        
{/* Monthly Income */}
        <SectionTitle title={label("Monthly income", "Revenu mensuel")} action={label("Calendar", "Calendrier")} onPress={() => router.push('/income-calendar')} />
        <Card className="p-0 overflow-hidden">
          {recurringIncome.length ? (
            <div className="flex flex-col">
              {recurringIncome.map((item) => (
                <div key={item.id} className="flex flex-row items-center gap-3 px-3.5 py-3 border-b last:border-b-0" style={{ borderColor: palette.border }}>
                  <RoundIcon icon={Banknote} size={36} color={palette.success} background="#E7F7F1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold truncate" style={{ color: palette.foreground }}>{item.title}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
                      {label("Next payday", "Prochain versement")} · {item.nextDueDate}
                    </p>
                  </div>
                  <span className="text-[14px] font-extrabold tabular-nums" style={{ color: palette.success }}>
                    {formatMoney(item.amount, settings.language)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Banknote}
              title={label("Plan your monthly income", "Planifie ton revenu mensuel")}
              body={label("Add your salary or allowance and its next payday.", "Ajoute ton salaire ou allocation et son prochain versement.")}
            />
          )}
        </Card>

        
{/* Commitments */}
        <SectionTitle title={label("Commitments", "Engagements")} action={label("Manage", "Gérer")} onPress={() => router.push('/finance-manage?mode=subscription')} />
        <Card className="p-0 overflow-hidden">
          <LineItem icon={RefreshCw} color={palette.warning} title={label("Subscriptions", "Abonnements")} value={formatMoney(finance.subscriptionTotal, settings.language)} borderColor={palette.border} />
          <LineItem icon={CalendarDays} color={palette.error} title={label("Upcoming expenses", "Dépenses à venir")} value={formatMoney(finance.upcomingTotal, settings.language)} borderColor={palette.border} />
          <LineItem icon={Receipt} color={palette.foreground} title={label("Liabilities", "Dettes")} value={formatMoney(finance.liabilities, settings.language)} borderColor={palette.border} noBorder />
        </Card>

        {/* Loans */}
        <SectionTitle title={label("Money out and back", "Argent prêté et à recevoir")} action={label("Manage", "Gérer")} onPress={() => router.push('/finance-manage?mode=loan')} />
        <Card className="p-0 overflow-hidden">
          <LineItem icon={Landmark} color={palette.success} title={label("Loans receivable", "Prêts à recevoir")} value={formatMoney(finance.loansReceivable, settings.language)} borderColor={palette.border} />
          <LineItem icon={ArrowLeftRight} color={palette.primary} title={label("Lent to others", "Prêté à d'autres")} value={formatMoney(finance.lentOutstanding, settings.language)} borderColor={palette.border} noBorder />
        </Card>

        
      
          </div>
        </div>
</div>
    </div>
  );
}

function LineItem({ icon: Icon, color, title, value, borderColor, noBorder }: { icon: any; color: string; title: string; value: string; borderColor: string; noBorder?: boolean }) {
  return (
    <div className={`flex flex-row items-center gap-3 px-3.5 py-3 ${noBorder ? '' : 'border-b border-dashed'}`} style={{ borderColor }}>
      <RoundIcon icon={Icon} size={34} color={color} background="var(--color-background)" />
      <span className="flex-1 text-[14px] font-bold" style={{ color: 'var(--color-foreground)' }}>{title}</span>
      <span className="text-[14px] font-extrabold tabular-nums" style={{ color: 'var(--color-foreground)' }}>{value}</span>
    </div>
  );
}
