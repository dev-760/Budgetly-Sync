import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Card, EmptyState, RoundIcon, ui } from "@/components/budget-ui";
import { BucketId, formatDate, formatMoney, ReminderLeadDays } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { confirmSensitiveFinanceAction } from "@/lib/security";
import { ScreenContainer } from "@/components/screen-container";
import { useResponsiveLayout } from "@/lib/responsive-layout";
import { DatePickerField } from "@/components/date-picker-field";
import { useToast } from "@/lib/toast-context";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

type Mode = "income" | "transfer" | "loan" | "subscription" | "lend";
const modes: Mode[] = ["income", "transfer", "loan", "subscription", "lend"];

export default function FinanceManageScreen() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(modes.includes(params.mode as Mode) ? params.mode as Mode : "transfer");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState<BucketId>("cash");
  const [to, setTo] = useState<BucketId>("card");
  const [note, setNote] = useState("");
  const [incomeReminderLeadDays, setIncomeReminderLeadDays] = useState<ReminderLeadDays>(1);
  const { settings, recurring, buckets, transfers, loans, subscriptions, lends, upsertTransfer, removeTransfer, upsertLoan, removeLoan, upsertSubscription, removeSubscription, upsertRecurringIncome, removeRecurringIncome, upsertLend, settleLend, removeLend } = useBudget();
  const { isCompactPhone, isShortPhone } = useResponsiveLayout();
  const { showSuccess } = useToast();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const numericAmount = Number(amount.replace(",", "."));
  const recurringIncome = recurring.filter((item) => item.kind === "income");

  const reset = (nextMode = mode) => {
    setEditingId(null); setName(""); setAmount(""); setDate(new Date().toISOString().slice(0, 10)); setFrom("cash"); setTo("card"); setNote(""); setIncomeReminderLeadDays(1); setMode(nextMode);
  };

  const chooseMode = (next: Mode) => reset(next);
  const save = () => {
    let success = false;
    if (mode === "income") success = upsertRecurringIncome({ id: editingId ?? undefined, title: name, amount: numericAmount, nextDueDate: date, frequency: "monthly", reminderLeadDays: incomeReminderLeadDays });
    if (mode === "transfer") success = upsertTransfer({ id: editingId ?? undefined, from, to, amount: numericAmount, note });
    if (mode === "loan") success = upsertLoan({ id: editingId ?? undefined, name, amount: numericAmount, dueDate: date, active: true });
    if (mode === "subscription") success = upsertSubscription({ id: editingId ?? undefined, name, amount: numericAmount, nextDueDate: date, frequency: "monthly", active: true });
    if (mode === "lend") success = upsertLend({ id: editingId ?? undefined, name, amount: numericAmount, from, on: date, due: note || undefined });
    if (!success) {
      Alert.alert(label("Check the amount and required details.", "Vérifie le montant et les informations requises."));
      return;
    }
    showSuccess(label(editingId ? "Finance item updated" : "Finance item saved", editingId ? "Élément financier mis à jour" : "Élément financier enregistré"));
    reset(mode);
  };

  const editTransfer = (id: string) => {
    const item = transfers.find((transfer) => transfer.id === id); if (!item) return;
    setMode("transfer"); setEditingId(item.id); setAmount(String(item.amount)); setFrom(item.from); setTo(item.to); setNote(item.note ?? "");
  };
  const editIncome = (id: string) => { const item = recurringIncome.find((income) => income.id === id); if (!item) return; setMode("income"); setEditingId(item.id); setName(item.title); setAmount(String(item.amount)); setDate(item.nextDueDate); setIncomeReminderLeadDays(item.reminderLeadDays ?? 1); };
  const editLoan = (id: string) => { const item = loans.find((loan) => loan.id === id); if (!item) return; setMode("loan"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.dueDate ?? new Date().toISOString().slice(0, 10)); };
  const editSubscription = (id: string) => { const item = subscriptions.find((subscription) => subscription.id === id); if (!item) return; setMode("subscription"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.nextDueDate); };
  const editLend = (id: string) => { const item = lends.find((lend) => lend.id === id); if (!item) return; setMode("lend"); setEditingId(item.id); setName(item.name); setAmount(String(item.amount)); setDate(item.on); setFrom(item.from); setNote(item.due ?? ""); };
  const destructive = (message: string, action: () => void) => Alert.alert(label("Remove item?", "Supprimer l’élément ?"), message, [{ text: label("Cancel", "Annuler"), style: "cancel" }, { text: label("Remove", "Supprimer"), style: "destructive", onPress: async () => { if (await confirmSensitiveFinanceAction(settings.language)) action(); } }]);
  const confirmSettlement = async (id: string) => { if (await confirmSensitiveFinanceAction(settings.language)) settleLend(id); };

  const headerTitle = mode === "income" ? label("Manage income", "Gérer les revenus") : mode === "transfer" ? label("Manage buckets", "Gérer les comptes") : mode === "subscription" ? label("Manage commitments", "Gérer les engagements") : label("Money out and back", "Argent prêté et à recevoir");
  const visibleModes = (mode === "loan" || mode === "lend") ? ["loan", "lend"] : [];

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, isShortPhone && styles.contentShort]} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><AnimatedPressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={label("Close", "Fermer")} style={({ pressed }: { pressed: boolean }) => [styles.close, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{headerTitle}</Text><AnimatedPressable onPress={save} style={({ pressed }: { pressed: boolean }) => [styles.headerSave, pressed && styles.pressed]}><Text style={styles.headerSaveText}>{editingId ? label("Save changes", "Enregistrer") : label("Save", "Enregistrer")}</Text></AnimatedPressable></View>
    {visibleModes.length > 0 && <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <View style={styles.segment}>{visibleModes.map((item) => <AnimatedPressable key={item} onPress={() => chooseMode(item as Mode)} accessibilityRole="tab" accessibilityState={{ selected: mode === item }} style={({ pressed }: { pressed: boolean }) => [styles.segmentItem, isCompactPhone && styles.segmentItemCompact, mode === item && styles.segmentActive, pressed && styles.pressed]}><MaterialIcons name={item === "loan" ? "account-balance" : "person"} size={isCompactPhone ? 15 : 16} color={mode === item ? "var(--color-primary)" : "var(--color-muted)"} /><Text numberOfLines={1} style={[styles.segmentText, isCompactPhone && styles.segmentTextCompact, mode === item && styles.segmentTextActive]}>{item === "loan" ? label("Loans", "Prêts") : label("Money lent", "Argent prêté")}</Text></AnimatedPressable>)}</View>
    </Animated.View>}

    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <Card style={isCompactPhone ? styles.formCardCompact : styles.formCard}><Text style={styles.formTitle}>{editingId ? label("Edit item", "Modifier") : mode === "income" ? label("Add monthly income", "Ajouter un revenu mensuel") : mode === "transfer" ? label("Move money", "Déplacer l’argent") : mode === "loan" ? label("Add loan", "Ajouter un prêt") : mode === "subscription" ? label("Add subscription", "Ajouter un abonnement") : label("Add lend", "Ajouter un prêt")}</Text>
        {mode !== "transfer" && <><Text style={styles.label}>{mode === "income" ? label("Income name", "Nom du revenu") : label("Name", "Nom")}</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder={mode === "income" ? label("Monthly salary", "Salaire mensuel") : mode === "subscription" ? "Spotify" : label("Name", "Nom")} placeholderTextColor="var(--color-muted)" /></>}
        <Text style={styles.label}>{label("Amount", "Montant")}</Text><View style={styles.amountField}><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.amountInput} placeholder="0" placeholderTextColor="var(--color-muted)" /><Text style={styles.currency}>DH</Text></View>
        {mode === "transfer" || mode === "lend" ? <BucketPicker title={label("From", "Depuis")} value={from} onChange={setFrom} buckets={buckets} /> : null}
        {mode === "transfer" ? <BucketPicker title={label("To", "Vers")} value={to} onChange={setTo} buckets={buckets} /> : null}
        {mode !== "transfer" && <><Text style={styles.label}>{mode === "income" ? label("Next payday", "Prochain versement") : mode === "lend" ? label("Lent on", "Prêté le") : mode === "subscription" ? label("Next due date", "Prochaine échéance") : label("Due date", "Date d’échéance")}</Text><DatePickerField value={date} onChange={setDate} accessibilityLabel={label("Choose date", "Choisir la date")} /></>}
        {mode === "income" ? <><Text style={styles.label}>{label("Remind me", "Me rappeler")}</Text><View style={styles.reminderChoices}>{([0, 1, 3, 7] as ReminderLeadDays[]).map((days) => <AnimatedPressable key={days} onPress={() => setIncomeReminderLeadDays(days)} accessibilityRole="radio" accessibilityState={{ selected: incomeReminderLeadDays === days }} style={({ pressed }: { pressed: boolean }) => [styles.reminderChoice, incomeReminderLeadDays === days && styles.reminderChoiceActive, pressed && styles.pressed]}><Text style={[styles.reminderChoiceText, incomeReminderLeadDays === days && styles.reminderChoiceTextActive]}>{days === 0 ? label("Payday", "Jour J") : `${days} ${label(days === 1 ? "day before" : "days before", days === 1 ? "jour avant" : "jours avant")}`}</Text></AnimatedPressable>)}</View><Text style={styles.reminderHint}>{label("Apply local reminder preferences in Settings.", "Applique les préférences de rappel locales dans Réglages.")}</Text></> : null}
        {(mode === "transfer" || mode === "lend") && <><Text style={styles.label}>{mode === "transfer" ? label("Note", "Note") : label("Due date (optional)", "Échéance (facultatif)")}</Text><TextInput value={note} onChangeText={setNote} style={styles.input} placeholder={mode === "transfer" ? label("Optional", "Facultatif") : "YYYY-MM-DD"} placeholderTextColor="var(--color-muted)" /></>}
        {editingId ? <AnimatedPressable onPress={() => reset(mode)} style={styles.cancelEdit}><Text style={styles.cancelEditText}>{label("Cancel editing", "Annuler la modification")}</Text></AnimatedPressable> : null}
      </Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <Text style={styles.listTitle}>{mode === "income" ? label("Monthly income", "Revenu mensuel") : mode === "transfer" ? label("Transfer history", "Historique des transferts") : mode === "loan" ? label("Loans", "Prêts") : mode === "subscription" ? label("Subscriptions", "Abonnements") : label("Money lent", "Argent prêté")}</Text>
      <Card style={styles.listCard}>{mode === "income" ? recurringIncome.length ? recurringIncome.map((item) => <Row key={item.id} icon="payments" title={item.title} subtitle={`${label("Every month · next", "Chaque mois · prochain")} ${item.nextDueDate} · ${item.reminderLeadDays === 0 ? label("payday", "jour J") : `${item.reminderLeadDays ?? 1} ${label("day reminder", "jour de rappel")}`}`} amount={formatMoney(item.amount, settings.language)} onEdit={() => editIncome(item.id)} onRemove={() => destructive(item.title, () => removeRecurringIncome(item.id))} />) : <EmptyState icon="payments" title={label("No recurring income yet", "Aucun revenu récurrent")} body={label("Add your monthly salary or allowance to keep your payday visible.", "Ajoute ton salaire ou allocation mensuelle pour garder ton prochain versement visible.")} /> : mode === "transfer" ? transfers.length ? transfers.map((item) => <Row key={item.id} icon="swap-horiz" title={`${item.from === "cash" ? label("Cash", "Espèces") : label("Card", "Carte")} → ${item.to === "cash" ? label("Cash", "Espèces") : label("Card", "Carte")}`} subtitle={item.note || formatDate(item.createdAt, settings.language)} amount={formatMoney(item.amount, settings.language)} onEdit={() => editTransfer(item.id)} onRemove={() => destructive(item.note || item.id, () => removeTransfer(item.id))} />) : <EmptyState icon="swap-horiz" title={label("No transfers yet", "Aucun transfert")} body={label("Move money between Cash and Card to see it here.", "Déplace de l’argent entre Espèces et Carte pour le voir ici.")} /> : mode === "loan" ? loans.length ? loans.map((item) => <Row key={item.id} icon="account-balance" title={item.name} subtitle={item.dueDate ? `${label("Due", "Échéance")} ${item.dueDate}` : label("No due date", "Sans échéance")} amount={formatMoney(item.amount, settings.language)} onEdit={() => editLoan(item.id)} onRemove={() => destructive(item.name, () => removeLoan(item.id))} />) : <EmptyState icon="account-balance" title={label("No loans yet", "Aucun prêt")} body={label("Add a loan to track money owed to you.", "Ajoute un prêt pour suivre l’argent qui te revient.")} /> : mode === "subscription" ? subscriptions.length ? subscriptions.map((item) => <Row key={item.id} icon="repeat" title={item.name} subtitle={`${item.frequency} · ${item.nextDueDate}`} amount={formatMoney(item.amount, settings.language)} onEdit={() => editSubscription(item.id)} onRemove={() => destructive(item.name, () => removeSubscription(item.id))} />) : <EmptyState icon="repeat" title={label("No subscriptions yet", "Aucun abonnement")} body={label("Add a recurring payment to receive local reminders.", "Ajoute un paiement récurrent pour recevoir des rappels locaux.")} /> : lends.length ? lends.map((item) => <Row key={item.id} icon={item.settled ? "check-circle" : "person"} title={item.name} subtitle={item.settled ? label("Settled", "Réglé") : item.due ? `${label("Due", "Échéance")} ${item.due}` : label("Outstanding", "En attente")} amount={formatMoney(item.amount, settings.language)} onEdit={() => editLend(item.id)} onRemove={() => destructive(item.name, () => removeLend(item.id))} extra={!item.settled ? { label: label("Settle", "Régler"), onPress: () => confirmSettlement(item.id) } : undefined} />) : <EmptyState icon="person" title={label("No money lent yet", "Aucun prêt accordé")} body={label("Add money you lent to keep its due date visible.", "Ajoute l’argent prêté pour garder son échéance visible.")} />}</Card>
    </Animated.View>
  </ScrollView></ScreenContainer>;
}

function BucketPicker({ title, value, onChange, buckets }: { title: string; value: BucketId; onChange: (value: BucketId) => void; buckets: { id: BucketId; name: string }[] }) {
  return <><Text style={styles.label}>{title}</Text><View style={styles.bucketChoice}>{buckets.map((bucket) => <AnimatedPressable key={bucket.id} onPress={() => onChange(bucket.id)} style={({ pressed }: { pressed: boolean }) => [styles.bucketButton, value === bucket.id && styles.bucketButtonActive, pressed && styles.pressed]}><Text style={[styles.bucketText, value === bucket.id && styles.bucketTextActive]}>{bucket.name}</Text></AnimatedPressable>)}</View></>;
}

function Row({ icon, title, subtitle, amount, onEdit, onRemove, extra }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; amount: string; onEdit: () => void; onRemove: () => void; extra?: { label: string; onPress: () => void } }) {
  return <View style={styles.row}><RoundIcon icon={icon} size={36} color={"var(--color-primary)"} background="#F1F5F9" /><View style={styles.rowMain}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSub}>{subtitle}</Text></View><View style={styles.rowActions}><Text style={styles.rowAmount}>{amount}</Text><View style={styles.actionButtons}>{extra ? <AnimatedPressable onPress={extra.onPress} style={styles.settle}><Text style={styles.settleText}>{extra.label}</Text></AnimatedPressable> : null}<AnimatedPressable onPress={onEdit} hitSlop={8}><MaterialIcons name="edit" size={18} color={"var(--color-primary)"} /></AnimatedPressable><AnimatedPressable onPress={onRemove} hitSlop={8}><MaterialIcons name="delete-outline" size={18} color={"var(--color-error)"} /></AnimatedPressable></View></View></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 36 }, contentShort: { paddingTop: 4, paddingBottom: 18 }, header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, close: { width: 40, height: 40, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" }, headerSpacer: { width: 40, height: 40 }, headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, headerSave: { height: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" }, headerSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, segment: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, segmentItem: { width: "48.6%", minHeight: 50, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)" }, segmentItemCompact: { minHeight: 46, paddingHorizontal: 6, gap: 4 }, segmentActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" }, segmentText: { color: "var(--color-muted)", fontSize: 11, fontWeight: "800" }, segmentTextCompact: { fontSize: 10 }, segmentTextActive: { color: "var(--color-primary)" }, formCard: { marginTop: 18, padding: 16 }, formCardCompact: { marginTop: 14, padding: 13 }, formTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, label: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800", marginTop: 16, marginBottom: 7 }, input: { height: 48, borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 16, paddingHorizontal: 13, color: "var(--color-foreground)", fontSize: 14, backgroundColor: "var(--color-surface)" }, amountField: { height: 62, borderWidth: 1.5, borderColor: "var(--color-border)", borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }, amountInput: { flex: 1, color: "var(--color-foreground)", fontSize: 26, fontWeight: "800", height: "100%" }, currency: { color: "var(--color-primary)", fontSize: 15, fontWeight: "800" }, bucketChoice: { flexDirection: "row", gap: 9 }, bucketButton: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }, bucketButtonActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" }, bucketText: { color: "var(--color-muted)", fontSize: 13, fontWeight: "700" }, bucketTextActive: { color: "var(--color-primary)" }, reminderChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, reminderChoice: { minHeight: 36, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: "var(--color-border)", justifyContent: "center", backgroundColor: "var(--color-surface)" }, reminderChoiceActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" }, reminderChoiceText: { color: "var(--color-muted)", fontSize: 10, fontWeight: "800" }, reminderChoiceTextActive: { color: "var(--color-primary)" }, reminderHint: { color: "var(--color-muted)", fontSize: 10, lineHeight: 14, marginTop: 7 }, save: { marginTop: 22, height: 54, borderRadius: 16, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" }, saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, cancelEdit: { alignItems: "center", paddingTop: 13 }, cancelEditText: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, listTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800", marginTop: 24, marginBottom: 9 }, listCard: { paddingVertical: 3 }, row: { flexDirection: "row", gap: 9, paddingVertical: 11, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "var(--color-border)" }, rowMain: { flex: 1, minWidth: 0 }, rowTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, rowSub: { color: "var(--color-muted)", fontSize: 11, marginTop: 3 }, rowActions: { alignItems: "flex-end", gap: 4 }, rowAmount: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800" }, actionButtons: { flexDirection: "row", alignItems: "center", gap: 10 }, settle: { backgroundColor: "#E7F7F1", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }, settleText: { color: "var(--color-success)", fontSize: 10, fontWeight: "800" }, pressed: { opacity: 0.7 }
});
