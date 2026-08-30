"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  X, Plus, PiggyBank, RefreshCw, Calendar as CalendarIcon, 
  BellRing, Trash2, Edit2, Check
} from "lucide-react";
import { useThemeContext } from "@/lib/theme-provider";
import { useBudget } from "@/lib/budget-store";
import { formatMoney, ReminderLeadDays } from "@/lib/budget-data";
import { Card, EmptyState, ProgressBar, RoundIcon, Button, Input } from "@/components/budget-ui";
import { cn } from "@/lib/utils";

const reminderOptions: ReminderLeadDays[] = [0, 1, 3, 7];

function GoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGoalId = searchParams.get("goalId");
  
  const { palette } = useThemeContext();
  const { settings, goals, addGoal, updateGoal, deleteGoal, addGoalContribution, t } = useBudget();
  
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [reminderLeadDays, setReminderLeadDays] = useState<ReminderLeadDays>(3);
  const [monthlyContributionAmount, setMonthlyContributionAmount] = useState("");
  
  const [contributionForId, setContributionForId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  const resetForm = () => { 
    setAdding(false); 
    setEditingId(null); 
    setTitle(""); 
    setAmount(""); 
    setTargetDate(""); 
    setReminderLeadDays(3); 
    setMonthlyContributionAmount(""); 
  };
  
  const startAdd = () => { 
    setAdding(true); 
    setEditingId(null); 
    setTitle(""); 
    setAmount(""); 
    setTargetDate(""); 
    setReminderLeadDays(3); 
    setMonthlyContributionAmount(""); 
  };
  
  const startEdit = (id: string) => {
    const goal = goals.find((item) => item.id === id);
    if (!goal) return;
    setAdding(true); 
    setEditingId(goal.id); 
    setTitle(goal.title); 
    setAmount(String(goal.targetAmount)); 
    setTargetDate(goal.targetDate ?? ""); 
    setReminderLeadDays(goal.reminderLeadDays ?? 3); 
    setMonthlyContributionAmount(goal.monthlyContributionAmount ? String(goal.monthlyContributionAmount) : "");
  };
  
  const save = () => {
    const target = Number(amount.replace(",", "."));
    const monthlyContribution = Number(monthlyContributionAmount.replace(",", "."));
    
    if (!title.trim() || !target || target <= 0 || (monthlyContributionAmount.trim() !== "" && (!monthlyContribution || monthlyContribution < 0))) { 
      alert("Invalid form data.");
      return; 
    }
    
    const data = { 
      title: title.trim(), 
      targetAmount: target, 
      targetDate: targetDate || undefined, 
      reminderLeadDays: targetDate ? reminderLeadDays : undefined, 
      monthlyContributionAmount: monthlyContribution > 0 ? monthlyContribution : undefined, 
      icon: "savings" 
    };
    
    if (editingId) {
      updateGoal(editingId, data);
    } else {
      addGoal({ ...data, savedAmount: 0 });
    }
    
    resetForm();
  };
  
  const remove = (id: string, goalTitle: string) => {
    if (window.confirm(label(`Delete this goal: ${goalTitle}?`, `Supprimer cet objectif: ${goalTitle} ?`))) {
      deleteGoal(id);
      if (editingId === id) resetForm();
    }
  };
  
  const saveContribution = (id: string) => {
    const contribution = Number(contributionAmount.replace(",", "."));
    if (!contribution || contribution <= 0) return;
    addGoalContribution(id, contribution);
    setContributionForId(null); 
    setContributionAmount("");
  };
  
  const scheduleReminders = () => {
    alert("Reminders scheduled successfully.");
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          <X size={22} color={palette.foreground} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: palette.foreground }}>
          {t("goals")}
        </h1>
        <button 
          onClick={() => adding ? resetForm() : startAdd()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: palette.border }}
        >
          {adding ? <X size={22} color={palette.primary} /> : <Plus size={22} color={palette.primary} />}
        </button>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {adding ? (
          <Card className="mb-6 p-5">
            <h2 className="text-lg font-bold mb-4" style={{ color: palette.foreground }}>
              {editingId ? label("Edit goal", "Modifier l’objectif") : t("addGoal")}
            </h2>
            
            <div className="space-y-4">
              <Input 
                value={title} 
                onChange={setTitle} 
                placeholder={t("savingsGoal")} 
              />
              
              <div className="relative">
                <Input 
                  value={amount} 
                  onChange={setAmount} 
                  type="number"
                  placeholder="0 DH" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                  {label("Automatic monthly contribution (optional)", "Versement mensuel automatique (facultatif)")}
                </label>
                <div 
                  className="h-12 rounded-xl border px-3 flex items-center gap-2"
                  style={{ borderColor: "#CFC6F3", backgroundColor: "#FBFAFF" }}
                >
                  <RefreshCw size={16} color="#7A63D2" />
                  <input 
                    type="number"
                    value={monthlyContributionAmount}
                    onChange={e => setMonthlyContributionAmount(e.target.value)}
                    placeholder={label("Leave empty to add manually", "Laisse vide pour ajouter manuellement")}
                    className="flex-1 text-sm bg-transparent outline-none"
                    style={{ color: palette.foreground }}
                  />
                  <span className="text-xs font-bold" style={{ color: "#7A63D2" }}>DH</span>
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: palette.muted }}>
                  {label("Budgetly adds this amount once when you next open the app in a new month.", "Budgetly ajoute ce montant une fois à l’ouverture de l’app chaque nouveau mois.")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                  {label("Target date (optional)", "Date cible (facultative)")}
                </label>
                {targetDate ? (
                  <div className="space-y-2">
                    <input 
                      type="date"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full h-12 rounded-xl px-4 border outline-none font-medium"
                      style={{ backgroundColor: palette.surface, borderColor: palette.border, color: palette.foreground }}
                    />
                    <button 
                      onClick={() => setTargetDate("")}
                      className="text-xs font-bold hover:underline"
                      style={{ color: palette.muted }}
                    >
                      {label("Remove target date", "Retirer la date cible")}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setTargetDate(new Date().toISOString().slice(0, 10))}
                    className="w-full h-12 rounded-xl border flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
                    style={{ borderColor: palette.border, backgroundColor: palette.surface }}
                  >
                    <CalendarIcon size={16} color={palette.primary} />
                    <span className="text-sm font-bold" style={{ color: palette.primary }}>
                      {label("Set a target date", "Ajouter une date cible")}
                    </span>
                  </button>
                )}
              </div>

              {targetDate && (
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: palette.foreground }}>
                    {label("Remind me", "Me rappeler")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {reminderOptions.map((days) => (
                      <button
                        key={days}
                        onClick={() => setReminderLeadDays(days)}
                        className={cn(
                          "h-9 px-3 rounded-xl border text-[10px] font-bold transition-colors",
                          reminderLeadDays === days ? "border-blue-200 bg-blue-50 text-blue-600" : "bg-white text-gray-500"
                        )}
                        style={reminderLeadDays === days ? { borderColor: palette.primaryLight, backgroundColor: `${palette.primary}10`, color: palette.primary } : { borderColor: palette.border }}
                      >
                        {days === 0 ? label("On the date", "Le jour J") : `${days} ${label(days === 1 ? "day before" : "days before", days === 1 ? "jour avant" : "jours avant")}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-2">
                <Button onPress={save} className="w-full">
                  {editingId ? label("Save changes", "Enregistrer") : t("addGoal")}
                </Button>
                {editingId && (
                  <Button variant="outline" onPress={resetForm} className="w-full">
                    {label("Cancel editing", "Annuler")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : goals.length === 0 ? (
          <Card className="mt-12 p-8 text-center flex flex-col items-center">
            <EmptyState 
              icon={PiggyBank} 
              title={label("Set your first goal", "Ton premier objectif")} 
              description={label("Add a goal to track your savings, even a little at a time.", "Ajoute un objectif pour suivre ton épargne, même petit à petit.")} 
            />
            <Button onPress={startAdd} className="mt-6 min-w-[200px]">
              {t("addGoal")}
            </Button>
          </Card>
        ) : null}

        {/* Goals List */}
        {!adding && goals.map((goal) => {
          const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
          const isFocused = goal.id === initialGoalId;
          
          return (
            <Card 
              key={goal.id} 
              className={cn("p-5 mb-4 transition-all", isFocused ? "border-[#7A63D2] border-2 bg-[#FBFAFF]" : "")}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <RoundIcon icon={PiggyBank} size={44} color="#7A63D2" background="#EEEAFE" />
                  <div>
                    <h3 className="text-base font-bold" style={{ color: palette.foreground }}>{goal.title}</h3>
                    <p className="text-xs mt-1" style={{ color: palette.muted }}>
                      {formatMoney(goal.savedAmount, settings.language as any)} / {formatMoney(goal.targetAmount, settings.language as any)}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold" style={{ color: "#7A63D2" }}>
                  {Math.round((goal.savedAmount / goal.targetAmount) * 100)}%
                </span>
              </div>
              
              <ProgressBar value={goal.savedAmount / goal.targetAmount} color="#7A63D2" />
              
              <p className="text-xs mt-2" style={{ color: palette.muted }}>
                {formatMoney(remaining, settings.language as any)} {t("remaining")}
              </p>

              {goal.monthlyContributionAmount && (
                <div className="flex items-center gap-1 mt-2">
                  <RefreshCw size={12} color="#7A63D2" />
                  <span className="text-[11px] font-bold" style={{ color: "#7A63D2" }}>
                    {formatMoney(goal.monthlyContributionAmount, settings.language as any)} {label("added monthly", "ajoutés chaque mois")}
                  </span>
                </div>
              )}

              {goal.targetDate && (
                <div className="flex items-center gap-1 mt-2">
                  <CalendarIcon size={12} color={palette.primary} />
                  <span className="text-[11px] font-bold" style={{ color: palette.primary }}>
                    {label("Target", "Cible")} {goal.targetDate} · {goal.reminderLeadDays === 0 ? label("on the date", "le jour J") : `${goal.reminderLeadDays ?? 3} ${label("days ahead", "jours avant")}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => { setContributionForId(goal.id); setContributionAmount(""); }}
                  className="flex-1 h-10 rounded-xl bg-[#EEEAFE] flex items-center justify-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <Plus size={16} color="#7A63D2" />
                  <span className="text-xs font-bold text-[#7A63D2]">{label("Add savings", "Ajouter")}</span>
                </button>
                <button
                  onClick={() => startEdit(goal.id)}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors dark:bg-slate-800"
                >
                  <Edit2 size={16} color={palette.primary} />
                </button>
                <button
                  onClick={() => remove(goal.id, goal.title)}
                  className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors dark:bg-red-900/30"
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>

              {contributionForId === goal.id && (
                <div className="h-12 rounded-xl border px-3 mt-3 bg-[#FBFAFF] flex items-center" style={{ borderColor: "#CFC6F3" }}>
                  <input
                    type="number"
                    autoFocus
                    value={contributionAmount}
                    onChange={e => setContributionAmount(e.target.value)}
                    placeholder={label("Contribution amount", "Montant à ajouter")}
                    className="flex-1 text-sm bg-transparent outline-none"
                    style={{ color: palette.foreground }}
                  />
                  <span className="text-xs font-bold mr-2" style={{ color: "#7A63D2" }}>DH</span>
                  <button
                    onClick={() => saveContribution(goal.id)}
                    className="w-10 h-8 rounded-lg bg-[#7A63D2] flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Check size={16} color="#FFFFFF" />
                  </button>
                </div>
              )}
            </Card>
          );
        })}

        {!adding && goals.some(g => g.targetDate) && (
          <button
            onClick={scheduleReminders}
            className="w-full h-12 rounded-xl border flex items-center justify-center gap-2 mt-4 hover:opacity-80 transition-opacity"
            style={{ borderColor: palette.border, backgroundColor: palette.surface }}
          >
            <BellRing size={16} color={palette.primary} />
            <span className="text-sm font-bold" style={{ color: palette.primary }}>
              {label("Schedule goal reminders", "Programmer les rappels d’objectif")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function GoalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900" />}>
      <GoalForm />
    </Suspense>
  );
}
