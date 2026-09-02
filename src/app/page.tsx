'use client';

import { ArrowDownLeft, ArrowUpRight, WalletCards, ShieldCheck, CalendarDays, Check, ChevronRight, HelpCircle } from 'lucide-react';
import { useBudget } from '@/lib/budget-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const money = (amount: number) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 }).format(amount);

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en-MA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-primary">{eyebrow}</p>}
        <h2 className="text-[21px] font-bold tracking-[-.035em] text-foreground sm:text-[23px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone = 'mint' }: { label: string; value: string; detail: string; icon: React.ReactNode; tone?: 'mint' | 'amber' | 'blue' }) {
  const toneClass = { 
    mint: 'bg-secondary text-[#118260]', 
    amber: 'bg-[#fff1d8] text-[#a66908]', 
    blue: 'bg-[#e9efff] text-primary' 
  };
  return (
    <article className="soft-card rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${toneClass[tone]}`}>{icon}</span>
      </div>
      <p className="mt-5 font-numeric text-[27px] font-bold tracking-[-.05em] text-foreground">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{detail}</p>
    </article>
  );
}

function BudgetRow({ item }: { item: { name: string; spent: number; limit: number; note: string; accent: string } }) {
  const percentage = Math.round(item.spent / item.limit * 100);
  const warning = percentage >= 80;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2 font-bold">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.accent }} />
          <span className="truncate">{item.name}</span>
        </div>
        <span className={`shrink-0 font-numeric font-semibold ${warning ? 'text-[#a66908]' : 'text-muted-foreground'}`}>
          {money(item.spent)} <span className="font-normal text-muted-foreground/60">/ {money(item.limit)}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div 
          className="h-full rounded-full transition-all" 
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: warning ? '#F0A322' : item.accent }} 
        />
      </div>
      <p className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
        {warning ? 'Near your limit' : `${money(item.limit - item.spent)} left to spend`}
      </p>
    </div>
  );
}

function Commitment({ transaction }: { transaction: any }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3.5 transition hover:bg-muted">
      <span className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-[#fff1d8] py-1">
        <span className="text-[9px] font-bold text-[#a66908]">MAY</span>
        <span className="font-numeric text-lg font-bold leading-5 text-[#a66908]">22</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{transaction.title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{money(transaction.amount)} · {transaction.category}</p>
      </div>
      <ChevronRight size={15} className="text-muted-foreground" />
    </div>
  );
}

function accentClasses(accent: string) {
  return { 
    blue: 'bg-[#e9efff] text-[#2859D6]', 
    mint: 'bg-[#e5f7f0] text-[#147e61]', 
    amber: 'bg-[#fff1d8] text-[#a66908]', 
    lilac: 'bg-[#eeeafe] text-[#6959a9]', 
    coral: 'bg-[#fde9e8] text-[#b24444]' 
  }[accent as keyof typeof accentClasses] || 'bg-[#e9efff] text-[#2859D6]';
}

function TransactionList({ transactions }: { transactions: any[] }) {
  return (
    <div className="soft-card overflow-hidden rounded-2xl border border-border bg-card">
      {transactions.map((transaction) => (
        <button
          key={transaction.id}
          className="group flex w-full items-center gap-3 border-b border-border/70 px-4 py-3.5 text-left transition hover:bg-muted last:border-0 sm:px-5"
        >
          <span className={`grid size-10 shrink-0 place-items-center rounded-[13px] text-[10px] font-bold ${accentClasses(transaction.accent)}`}>
            {transaction.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-foreground">{transaction.title}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {transaction.category} <span className="mx-1 text-border">·</span> {dateLabel(transaction.date)}
            </span>
          </span>
          <span className={`font-numeric text-sm font-bold ${transaction.kind === 'income' ? 'text-[#118260]' : 'text-foreground'}`}>
            {transaction.kind === 'income' ? '+' : '−'}{money(transaction.amount)}
          </span>
          <ChevronRight size={15} className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { transactions, budgets, finance, categoryName } = useBudget();
  
  const categoryNames: Record<string, string> = {
    food: 'Food & dining',
    transport: 'Transport',
    housing: 'Housing',
    studies: 'Studies',
    phoneInternet: 'Bills',
    cafe: 'Dining out',
    entertainment: 'Entertainment',
    shopping: 'Personal',
    health: 'Health',
    travel: 'Travel',
    scholarship: 'Scholarship',
    allowance: 'Family allowance',
    internship: 'Internship',
  };

  const displayTransactions = transactions.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    category: categoryNames[item.categoryId] || item.categoryId,
    date: item.date,
    amount: item.amount,
    kind: item.kind,
    initials: item.title.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    accent: item.kind === 'income' ? 'mint' : item.categoryId === 'cafe' ? 'amber' : 'blue',
  }));

  const displayBudgets = budgets.map((item) => ({
    name: categoryNames[item.id] || item.id,
    spent: transactions.filter((t) => t.kind === 'expense' && t.categoryId === item.id).reduce((sum, t) => sum + t.amount, 0),
    limit: item.limit,
    note: item.id === 'transport' ? 'Tram, fuel, petit taxis' : item.id === 'food' ? 'Groceries, cafés, meals' : 'A category to shape your month',
    accent: item.color,
  }));

  const upcoming = transactions.filter((item) => item.isRecurring && item.kind === 'expense').slice(0, 3);
  const categoryUsed = displayBudgets.reduce((sum, item) => sum + item.spent, 0);

  return (
    <div className="space-y-8">
      <div className="rise-in flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-semibold text-muted-foreground">Saturday, 18 May 2024 · Rabat</p>
          <h2 className="text-[32px] font-bold leading-tight tracking-[-.055em] text-foreground sm:text-[40px]">
            A calmer month starts <span className="text-primary">here.</span>
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            See what is available today, then make your next money choice with confidence.
          </p>
        </div>
        <Button variant="link" className="group flex w-fit items-center gap-1 text-xs font-bold text-primary">
          View insights <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.28fr_.72fr]">
        <article className="paper-grid relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_20px_40px_-24px_hsl(219_67%_50%/.65)] sm:p-8">
          <div className="absolute -right-12 -top-14 size-48 rounded-full border-[20px] border-white/10" />
          <div className="absolute right-10 top-12 size-20 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-primary-foreground/75">Safe to spend</p>
                <p className="mt-3 font-numeric text-[42px] font-bold tracking-[-.07em] sm:text-[52px]">
                  {money(finance.safeToSpend)}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">available for the rest of May</p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-white/12">
                <ShieldCheck size={21} />
              </span>
            </div>
            <div className="mt-9 flex items-center justify-between text-[11px] font-semibold text-primary-foreground/75">
              <span>Monthly plan {money(displayBudgets.reduce((sum, item) => sum + item.limit, 0))}</span>
              <span>{Math.round((categoryUsed / displayBudgets.reduce((sum, item) => sum + item.limit, 0)) * 100)}% planned</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#173b98]/55">
              <div 
                className="h-full rounded-full bg-[#b6caff]" 
                style={{ width: `${Math.min(100, categoryUsed / displayBudgets.reduce((sum, item) => sum + item.limit, 0) * 100)}%` }} 
              />
            </div>
          </div>
        </article>
        
        <article className="soft-card rounded-3xl border border-border bg-[#eaf8f3] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#327b68]">Daily safe amount</p>
              <p className="mt-4 font-numeric text-[35px] font-bold tracking-[-.06em] text-[#155b49]">
                {money(finance.dailySafeToSpend)}
              </p>
              <p className="mt-1 text-xs text-[#327b68]">for the next 16 days</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-white/70 text-[#16A77B]">
              <CalendarDays size={19} />
            </span>
          </div>
          <p className="mt-8 border-t border-[#b9e6d6] pt-4 text-xs font-semibold text-[#327b68]">
            Keep a little room for surprises.
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Available balance" value={money(finance.availableBalance)} detail="after recorded activity" icon={<WalletCards size={18} />} tone="blue" />
        <MetricCard label="Income this month" value={money(finance.income)} detail="3 sources recorded" icon={<ArrowDownLeft size={18} />} tone="mint" />
        <MetricCard label="Spent this month" value={money(finance.expenses)} detail="22% under last month" icon={<ArrowUpRight size={18} />} tone="amber" />
      </section>

      <div className="grid gap-7 xl:grid-cols-[1.18fr_.82fr]">
        <section className="rise-in">
          <SectionHeading 
            eyebrow="Stay on track" 
            title="Budget health" 
            action={<Button variant="link" className="text-xs font-bold text-primary hover:underline">Manage budget</Button>} 
          />
          <Card className="soft-card rounded-2xl border border-border bg-card p-5">
            <CardContent className="p-0">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">{displayBudgets.length} envelopes this month</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-[#118260]">
                  <Check size={12} /> On track
                </span>
              </div>
              <div className="space-y-4">
                {displayBudgets.slice(0, 3).map((item) => <BudgetRow key={item.name} item={item} />)}
              </div>
              <Button variant="outline" className="mt-5 w-full">
                See all categories <ChevronRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="rise-in">
          <SectionHeading 
            eyebrow="Plan ahead" 
            title="Upcoming commitments" 
            action={<Button variant="link" className="text-xs font-bold text-primary hover:underline">View all</Button>} 
          />
          <Card className="soft-card rounded-2xl border border-border bg-card p-2">
            <CardContent className="p-0">
              {upcoming.length ? upcoming.map((item) => <Commitment key={item.id} transaction={item} />) : <p className="p-5 text-sm text-muted-foreground">No recurring payments coming up.</p>}
              <div className="mx-3 my-2 flex items-center gap-3 rounded-xl bg-[#fff5df] p-3">
                <span className="grid size-8 place-items-center rounded-lg bg-[#ffe3ad] text-[#a66908]">
                  <HelpCircle size={16} />
                </span>
                <p className="text-[11px] font-semibold leading-4 text-[#76521a]">
                  Rent is due in 3 days. Your safe amount already leaves room for it.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <section className="rise-in">
        <SectionHeading 
          eyebrow="Latest activity" 
          title="Recent transactions" 
          action={
            <Button variant="link" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              See all <ArrowUpRight size={14} />
            </Button>
          } 
        />
        <TransactionList transactions={displayTransactions} />
      </section>
    </div>
  );
}
