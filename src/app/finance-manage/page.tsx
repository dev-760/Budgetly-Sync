"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  X, Landmark, User, CreditCard as CardIcon, Wallet, Edit2, Trash2, CheckCircle, SwapHorizontal as SwapHoriz, RefreshCw as RepeatIcon
} from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { BucketId, formatDate, formatMoney, ReminderLeadDays } from "@/lib/budget-data";
import { Card, EmptyState, RoundIcon, Button, Input } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

type Mode = "income" | "transfer" | "loan" | "subscription" | "lend";
const modes: Mode[] = ["income", "transfer", "loan", "subscription", "lend"];

function FinanceManageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as Mode;
  
  const { palette } = useThemeContext();
  const { 
    settings, recurring, buckets, transfers, loans, subscriptions, lends, 
    upsertTransfer, removeTransfer, upsertLoan, removeLoan, upsertSubscription, 
    removeSubscription, upsertRecurringIncome, removeRecurringIncome, upsertLend, 
    settleLend, removeLend 
  } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const [mode, setMode] = useState<Mode>(modes.includes(initialMode) ? initialMode : "transfer");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState<BucketId>("cash");
  const [to, setTo] = useState<BucketId>("card");
  const [note, setNote] = useState("");
  const [incomeReminderLeadDays, setIncomeReminderLeadDays] = useState<ReminderLeadDays>(1);

  const recurringIncome = recurring.filter((item) => item.kind === "income");

  const reset = (nextMode = mode) => {
    setEditingId(null); 
    setName(""); 
    setAmount(""); 
    setDate(new Date().toISOString().slice(0, 10)); 
    setFrom("cash"); 
    setTo("card"); 
    setNote(""); 
    setIncomeReminderLeadDays(1); 
    setMode(nextMode);
  };

  const save = () => {
    const numericAmount = Number(amount.replace(",", "."));
    let success = false;
    
    if (mode === "income") success = upsertRecurringIncome({ id: editingId ?? undefined, title: name, amount: numericAmount, nextDueDate: date, frequency: "monthly", reminderLeadDays: incomeReminderLeadDays });
    if (mode === "transfer") success = upsertTransfer({ id: editingId ?? undefined, from, to, amount: numericAmount, note });
    if (mode === "loan") success = upsertLoan({ id: editingId ?? undefined, name, amount: numericAmount, dueDate: date, active: true });
    if (mode === "subscription") success = upsertSubscription({ id: editingId ?? undefined, name, amount: numericAmount, nextDueDate: date, frequency: "monthly", active: true });
    if (mode === "lend") success = upsertLend({ id: editingId ?? undefined, name, amount: numericAmount, from, on: date, due: note || undefined });
    
    if (!success) {
      alert(label("Check the amount and required details.", "Vérifie le montant et les informations requises."));
      return;
    }
    
    reset(mode);
  };

  const editTransfer = (id: string) => {
    const item = transfers.find((t) => t.id === id); if (!item) return;
    setMode("transfer"); setEditingId(item.id); setAmount(String(item.amount)); setFrom(item.from); setTo(item.to); setNote(item.note ?? "");
  };
  const editIncome = (id: string) => { 
    const item = recurringIncome.find((i) => i.id === id); if (!item) return; 
    setMode("income"); setEditingId(item.id); setName(item.title); setAmount(String(item.amount)); setDate(item.nextDueDate); setIncomeReminderLeadDays(item.reminderLeadDays ?? 1); 
  };
  const editLoan = (id: string) => { 
    const item = loans.find((l) => l.id === id); if (!item) return; 
    setMode("loan"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.dueDate ?? new Date().toISOString().slice(0, 10)); 
  };
  const editSubscription = (id: string) => { 
    const item = subscriptions.find((s) => s.id === id); if (!item) return; 
    setMode("subscription"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.nextDueDate); 
  };
  const editLend = (id: string) => { 
    const item = lends.find((l) => l.id === id); if (!item) return; 
    setMode("lend"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.on); setFrom(item.from); setNote(item.due ?? ""); 
  };
  
  const destructive = (message: string, action: () => void) => {
    if (window.confirm(label(`Remove item: ${message}?`, `Supprimer l’élément: ${message} ?`))) {
      action();
    }
  };

  const headerTitle = mode === "income" ? label("Manage income", "Gérer les revenus") : mode === "transfer" ? label("Manage buckets", "Gérer les comptes") : mode === "subscription" ? label("Manage commitments", "Gérer les engagements") : label("Money out and back", "Argent prêté et à recevoir");
  const visibleModes = (mode === "loan" || mode === "lend") ? ["loan", "lend"] : [];

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ backgroundColor: palette.background }}>
      <div className="flex items-center justify-between mb-6 max-w-xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {headerTitle}
        </h1>
        <button 
          onClick={save}
          className="h-10 px-4 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: palette.primary }}
        >
          <span className="text-sm font-bold text-white">{editingId ? label("Save changes", "Enregistrer") : label("Save", "Enregistrer")}</span>
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {visibleModes.length > 0 && (
          <div className="flex gap-2">
            {visibleModes.map((item) => (
              <button
                key={item}
                onClick={() => reset(item as Mode)}
                className={cn(
                  "flex-1 h-12 rounded-2xl border flex items-center justify-center gap-2 transition-colors",
                  mode === item ? "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700" : "bg-white dark:bg-slate-900"
                )}
                style={mode === item ? { backgroundColor: `${palette.primary}10`, borderColor: palette.primaryLight } : { borderColor: palette.border }}
              >
                {item === "loan" ? <Landmark size={16} color={mode === item ? palette.primary : palette.muted} /> : <User size={16} color={mode === item ? palette.primary : palette.muted} />}
                <span className="text-sm font-bold" style={{ color: mode === item ? palette.primary : palette.muted }}>
                  {item === "loan" ? label("Loans", "Prêts") : label("Money lent", "Argent prêté")}
                </span>
              </button>
            ))}
          </div>
        )}

        <Card className="p-5">
          <h2 className="text-lg font-bold mb-4" style={{ color: palette.foreground }}>
            {editingId ? label("Edit item", "Modifier") : mode === "income" ? label("Add monthly income", "Ajouter un revenu mensuel") : mode === "transfer" ? label("Move money", "Déplacer l’argent") : mode === "loan" ? label("Add loan", "Ajouter un prêt") : mode === "subscription" ? label("Add subscription", "Ajouter un abonnement") : label("Add lend", "Ajouter un prêt")}
          </h2>

          <div className="space-y-4">
            {mode !== "transfer" && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                  {mode === "income" ? label("Income name", "Nom du revenu") : label("Name", "Nom")}
                </label>
                <Input 
                  value={name} 
                  onChange={setName} 
                  placeholder={mode === "income" ? label("Monthly salary", "Salaire mensuel") : mode === "subscription" ? "Spotify" : label("Name", "Nom")}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>{label("Amount", "Montant")}</label>
              <div 
                className="h-14 rounded-2xl border px-4 flex items-center shadow-sm"
                style={{ borderColor: palette.border, backgroundColor: palette.surface }}
              >
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 h-full text-2xl font-bold bg-transparent outline-none tabular-nums"
                  style={{ color: palette.foreground }}
                />
                <span className="text-base font-bold ml-2" style={{ color: palette.primary }}>DH</span>
              </div>
            </div>

            {(mode === "transfer" || mode === "lend") && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>{label("From", "Depuis")}</label>
                <div className="flex gap-2">
                  {buckets.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setFrom(b.id)}
                      className="flex-1 h-12 rounded-xl border font-bold text-sm transition-colors"
                      style={{ 
                        backgroundColor: from === b.id ? `${palette.primary}10` : palette.surface,
                        borderColor: from === b.id ? palette.primary : palette.border,
                        color: from === b.id ? palette.primary : palette.muted
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "transfer" && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>{label("To", "Vers")}</label>
                <div className="flex gap-2">
                  {buckets.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setTo(b.id)}
                      className="flex-1 h-12 rounded-xl border font-bold text-sm transition-colors"
                      style={{ 
                        backgroundColor: to === b.id ? `${palette.primary}10` : palette.surface,
                        borderColor: to === b.id ? palette.primary : palette.border,
                        color: to === b.id ? palette.primary : palette.muted
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode !== "transfer" && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                  {mode === "income" ? label("Next payday", "Prochain versement") : mode === "lend" ? label("Lent on", "Prêté le") : mode === "subscription" ? label("Next due date", "Prochaine échéance") : label("Due date", "Date d’échéance")}
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-12 rounded-xl px-4 border outline-none font-medium transition-colors"
                  style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.foreground }}
                />
              </div>
            )}

            {mode === "income" && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>{label("Remind me", "Me rappeler")}</label>
                <div className="flex flex-wrap gap-2">
                  {([0, 1, 3, 7] as ReminderLeadDays[]).map((days) => (
                    <button
                      key={days}
                      onClick={() => setIncomeReminderLeadDays(days)}
                      className={cn(
                        "h-9 px-3 rounded-xl border text-[10px] font-bold transition-colors"
                      )}
                      style={incomeReminderLeadDays === days ? { borderColor: palette.primaryLight, backgroundColor: `${palette.primary}10`, color: palette.primary } : { borderColor: palette.border, backgroundColor: palette.surface, color: palette.muted }}
                    >
                      {days === 0 ? label("Payday", "Jour J") : `${days} ${label(days === 1 ? "day before" : "days before", days === 1 ? "jour avant" : "jours avant")}`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-2" style={{ color: palette.muted }}>
                  {label("Apply local reminder preferences in Settings.", "Applique les préférences de rappel locales dans Réglages.")}
                </p>
              </div>
            )}

            {(mode === "transfer" || mode === "lend") && (
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                  {mode === "transfer" ? label("Note", "Note") : label("Due date (optional)", "Échéance (facultatif)")}
                </label>
                <Input 
                  value={note} 
                  onChange={setNote} 
                  placeholder={mode === "transfer" ? label("Optional", "Facultatif") : "YYYY-MM-DD"} 
                />
              </div>
            )}
            
            {editingId && (
              <Button variant="outline" onPress={() => reset(mode)} className="w-full mt-2">
                {label("Cancel editing", "Annuler la modification")}
              </Button>
            )}
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-bold mb-3" style={{ color: palette.foreground }}>
            {mode === "income" ? label("Monthly income", "Revenu mensuel") : mode === "transfer" ? label("Transfer history", "Historique des transferts") : mode === "loan" ? label("Loans", "Prêts") : mode === "subscription" ? label("Subscriptions", "Abonnements") : label("Money lent", "Argent prêté")}
          </h3>
          <Card className="divide-y divide-gray-100 dark:divide-slate-800 py-1">
            {mode === "income" ? (
              recurringIncome.length ? recurringIncome.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 px-2">
                  <RoundIcon icon={Wallet} size={36} color={palette.primary} background={`${palette.primary}15`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.title}</h4>
                    <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                      {label("Every month · next", "Chaque mois · prochain")} {item.nextDueDate} · {item.reminderLeadDays === 0 ? label("payday", "jour J") : `${item.reminderLeadDays ?? 1} ${label("day reminder", "jour de rappel")}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(item.amount, settings.language as any)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editIncome(item.id)} className="p-1"><Edit2 size={16} color={palette.primary} /></button>
                      <button onClick={() => destructive(item.title, () => removeRecurringIncome(item.id))} className="p-1"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState icon={Wallet} title={label("No recurring income yet", "Aucun revenu récurrent")} description={label("Add your monthly salary or allowance to keep your payday visible.", "Ajoute ton salaire ou allocation mensuelle pour garder ton prochain versement visible.")} />
              )
            ) : mode === "transfer" ? (
              transfers.length ? transfers.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 px-2">
                  <RoundIcon icon={SwapHoriz} size={36} color={palette.primary} background={`${palette.primary}15`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>
                      {item.from === "cash" ? label("Cash", "Espèces") : label("Card", "Carte")} → {item.to === "cash" ? label("Cash", "Espèces") : label("Card", "Carte")}
                    </h4>
                    <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                      {item.note || formatDate(item.createdAt, settings.language as any)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(item.amount, settings.language as any)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editTransfer(item.id)} className="p-1"><Edit2 size={16} color={palette.primary} /></button>
                      <button onClick={() => destructive(item.note || item.id, () => removeTransfer(item.id))} className="p-1"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState icon={SwapHoriz} title={label("No transfers yet", "Aucun transfert")} description={label("Move money between Cash and Card to see it here.", "Déplace de l’argent entre Espèces et Carte pour le voir ici.")} />
              )
            ) : mode === "loan" ? (
              loans.length ? loans.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 px-2">
                  <RoundIcon icon={Landmark} size={36} color={palette.primary} background={`${palette.primary}15`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.name}</h4>
                    <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                      {item.dueDate ? `${label("Due", "Échéance")} ${item.dueDate}` : label("No due date", "Sans échéance")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(item.amount, settings.language as any)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editLoan(item.id)} className="p-1"><Edit2 size={16} color={palette.primary} /></button>
                      <button onClick={() => destructive(item.name, () => removeLoan(item.id))} className="p-1"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState icon={Landmark} title={label("No loans yet", "Aucun prêt")} description={label("Add a loan to track money owed to you.", "Ajoute un prêt pour suivre l’argent qui te revient.")} />
              )
            ) : mode === "subscription" ? (
              subscriptions.length ? subscriptions.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 px-2">
                  <RoundIcon icon={RepeatIcon} size={36} color={palette.primary} background={`${palette.primary}15`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.name}</h4>
                    <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                      {item.frequency} · {item.nextDueDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(item.amount, settings.language as any)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editSubscription(item.id)} className="p-1"><Edit2 size={16} color={palette.primary} /></button>
                      <button onClick={() => destructive(item.name, () => removeSubscription(item.id))} className="p-1"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState icon={RepeatIcon} title={label("No subscriptions yet", "Aucun abonnement")} description={label("Add a recurring payment to receive local reminders.", "Ajoute un paiement récurrent pour recevoir des rappels locaux.")} />
              )
            ) : (
              lends.length ? lends.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 px-2">
                  <RoundIcon icon={item.settled ? CheckCircle : User} size={36} color={palette.primary} background={`${palette.primary}15`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: palette.foreground }}>{item.name}</h4>
                    <p className="text-[11px] mt-1" style={{ color: palette.muted }}>
                      {item.settled ? label("Settled", "Réglé") : item.due ? `${label("Due", "Échéance")} ${item.due}` : label("Outstanding", "En attente")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold" style={{ color: palette.foreground }}>{formatMoney(item.amount, settings.language as any)}</span>
                    <div className="flex gap-2 items-center">
                      {!item.settled && (
                        <button 
                          onClick={() => settleLend(item.id)}
                          className="px-2 py-1 bg-[#E7F7F1] text-[#10B981] text-[10px] font-bold rounded-lg mr-1"
                        >
                          {label("Settle", "Régler")}
                        </button>
                      )}
                      <button onClick={() => editLend(item.id)} className="p-1"><Edit2 size={16} color={palette.primary} /></button>
                      <button onClick={() => destructive(item.name, () => removeLend(item.id))} className="p-1"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState icon={User} title={label("No money lent yet", "Aucun prêt accordé")} description={label("Add money you lent to keep its due date visible.", "Ajoute l’argent prêté pour garder son échéance visible.")} />
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FinanceManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <FinanceManageContent />
    </Suspense>
  );
}
