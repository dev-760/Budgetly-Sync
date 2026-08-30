import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { categoryIds, getCategoryIcon, incomeCategoryIds, TransactionKind } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { ui } from "@/components/budget-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useResponsiveLayout } from "@/lib/responsive-layout";
import { DatePickerField } from "@/components/date-picker-field";
import { useToast } from "@/lib/toast-context";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function TransactionModal() {
  const { id, kind: kindParam } = useLocalSearchParams<{ id?: string; kind?: TransactionKind }>();
  const { settings, transactions, expenseCategories, addTransaction, updateTransaction, deleteTransaction, t, categoryName } = useBudget();
  const { isCompactPhone, isShortPhone } = useResponsiveLayout();
  const { showSuccess } = useToast();
  const existing = useMemo(() => transactions.find((item) => item.id === id), [id, transactions]);
  const [kind, setKind] = useState<TransactionKind>(existing?.kind ?? kindParam ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? (kind === "income" ? "scholarship" : "food"));
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod ?? "cash");
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState("");
  const categories = kind === "income" ? incomeCategoryIds : [...categoryIds, ...expenseCategories.filter((item) => !categoryIds.includes(item.id as typeof categoryIds[number])).map((item) => item.id)];

  const toggleKind = (next: TransactionKind) => { setKind(next); setCategoryId(next === "income" ? "scholarship" : "food"); haptic.selection(); };
  const save = () => {
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) { setError(t("amount")); haptic.error(); return; }
    const title = existing?.title.trim() || categoryName(categoryId);
    const input = { kind, amount: numericAmount, categoryId, title, date, paymentMethod, note: note.trim() || undefined, isRecurring: existing?.isRecurring };
    if (existing) updateTransaction(existing.id, input); else addTransaction(input);
    haptic.success();
    showSuccess(settings.language === "fr" ? "Transaction enregistrée" : "Transaction saved");
    router.back();
  };
  const remove = () => Alert.alert(t("delete"), existing?.title || categoryName(categoryId), [{ text: t("cancel"), style: "cancel" }, { text: t("delete"), style: "destructive", onPress: () => { deleteTransaction(existing!.id); haptic.medium(); router.back(); } }]);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} style={{ flex: 1, minHeight: 0 }}><View style={[styles.header, isCompactPhone && styles.headerCompact]}><AnimatedPressable onPress={() => router.back()} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{existing ? t("edit") : kind === "income" ? t("addIncome") : t("addExpense")}</Text>{existing ? <AnimatedPressable onPress={remove} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={22} color={"var(--color-error)"} /></AnimatedPressable> : <View style={styles.headerSpacer} />}</View><ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: 48 }, isShortPhone && styles.contentShort]} keyboardShouldPersistTaps="handled">
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} />

    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <Text style={styles.label}>{t("amount")}</Text><View style={[styles.amountField, isCompactPhone && styles.amountFieldCompact]}><TextInput value={amount} onChangeText={(value) => { setAmount(value); setError(""); }} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#B9C2D6" style={[styles.amountInput, isCompactPhone && styles.amountInputCompact]} /><Text style={styles.currency}>DH</Text></View>{error ? <Text style={styles.error}>{error} {settings.language === "fr" ? "est requis." : "is required."}</Text> : null}
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <Text style={styles.label}>{kind === "income" ? t("source") : t("category")}</Text><View style={kind === "income" ? styles.sourceGrid : styles.categoryGrid}>{categories.map((item) => <AnimatedPressable key={item} onPress={() => { setCategoryId(item); haptic.selection(); }} style={({ pressed }: { pressed: boolean }) => [kind === "income" ? styles.source : styles.category, isCompactPhone && (kind === "income" ? styles.sourceCompact : styles.categoryCompact), categoryId === item && (kind === "income" ? styles.sourceActive : styles.categoryActive), pressed && styles.pressed]}><MaterialIcons name={getCategoryIcon(item, settings.customExpenseCategories) as keyof typeof MaterialIcons.glyphMap} size={isCompactPhone ? 17 : 19} color={categoryId === item ? "var(--color-primary)" : "var(--color-muted)"} /><Text style={[kind === "income" ? styles.sourceText : styles.categoryText, categoryId === item && (kind === "income" ? styles.sourceTextActive : styles.categoryTextActive)]} numberOfLines={1}>{categoryName(item)}</Text></AnimatedPressable>)}</View>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
      <Text style={styles.label}>{t("date")}</Text><DatePickerField value={date} onChange={setDate} accessibilityLabel={settings.language === "fr" ? "Choisir la date de la transaction" : "Choose transaction date"} />
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
      <Text style={styles.label}>{t("paymentMethod")}</Text><View style={styles.paymentRow}>{(["cash", "card", "transfer"] as const).map((item) => <AnimatedPressable key={item} onPress={() => { setPaymentMethod(item); haptic.selection(); }} style={({ pressed }: { pressed: boolean }) => [styles.payment, paymentMethod === item && styles.paymentActive, pressed && styles.pressed]}><Text style={[styles.paymentText, paymentMethod === item && styles.paymentTextActive]}>{t(item)}</Text></AnimatedPressable>)}</View>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(350).springify()}>
      <Text style={styles.label}>{t("optionalNote")}</Text><TextInput value={note} onChangeText={setNote} placeholder="…" placeholderTextColor="#8B94A7" multiline style={[styles.textField, styles.noteField]} />
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(400).springify()}>
      <AnimatedPressable onPress={save} style={({ pressed }: { pressed: boolean }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveText}>{kind === "income" ? t("saveIncome") : t("saveExpense")}</Text><MaterialIcons name="check" size={20} color="#FFFFFF" /></AnimatedPressable>
    </Animated.View>
  </ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerCompact: { height: 54 },
  iconButton: { height: 40, width: 40, borderRadius: 14, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" },
  headerSpacer: { height: 40, width: 40, opacity: 0 },
  headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" },
  content: { paddingTop: 14, paddingBottom: 28 },
  contentShort: { paddingTop: 8, paddingBottom: 16 },
  kindSwitch: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 16, padding: 4, marginBottom: 20 },
  kindOption: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14 },
  kindOptionActive: { backgroundColor: "var(--color-surface)", shadowColor: "#000000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  kindText: { color: "var(--color-muted)", fontSize: 14, fontWeight: "700" },
  kindTextActive: { color: "var(--color-foreground)" },
  label: { marginTop: 19, marginBottom: 8, color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  amountField: { height: 82, borderRadius: 18, backgroundColor: "var(--color-surface)", borderWidth: 1.5, borderColor: "#AFC4FF", paddingHorizontal: 18, flexDirection: "row", alignItems: "center", shadowColor: "var(--color-primary)", shadowOpacity: 0.06, shadowRadius: 10, elevation: 1, justifyContent: "space-between" },
  amountFieldCompact: { height: 70, borderRadius: 16, paddingHorizontal: 15 },
  amountInput: { flex: 1, color: "var(--color-foreground)", fontSize: 30, fontWeight: "800", height: "100%", fontVariant: ["tabular-nums"], textAlign: "left" },
  amountInputCompact: { fontSize: 26 },
  currency: { color: "var(--color-primary)", fontWeight: "800", fontSize: 16, marginLeft: 8 },
  error: { color: "var(--color-error)", marginTop: 6, fontSize: 12, fontWeight: "600" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  category: { width: "31%", minHeight: 76, padding: 12, borderRadius: 18, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#F1F5F9", gap: 6, alignItems: "center", justifyContent: "center" },
  categoryCompact: { minHeight: 70, padding: 10, gap: 4 },
  categoryActive: { borderColor: "var(--color-primary)", backgroundColor: "#EEF3FF", borderWidth: 2 },
  categoryText: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700", textAlign: "center" },
  categoryTextActive: { color: "var(--color-primary)" },
  sourceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  source: { width: "48%", minHeight: 76, padding: 12, borderRadius: 18, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#F1F5F9", gap: 6, alignItems: "center", justifyContent: "center" },
  sourceCompact: { minHeight: 70, padding: 10, gap: 4 },
  sourceActive: { borderColor: "var(--color-primary)", backgroundColor: "#EEF3FF", borderWidth: 2 },
  sourceText: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700", textAlign: "center" },
  sourceTextActive: { color: "var(--color-primary)" },
  textField: { minHeight: 52, backgroundColor: "#F8FAFC", borderRadius: 16, color: "var(--color-foreground)", paddingHorizontal: 16, fontSize: 15 },
  noteField: { minHeight: 86, paddingTop: 14, textAlignVertical: "top" },
  paymentRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  payment: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#F1F5F9", justifyContent: "center", minHeight: 52 },
  paymentActive: { backgroundColor: "#EEF3FF", borderColor: "var(--color-primary)", borderWidth: 1.5 },
  paymentText: { color: "var(--color-muted)", fontSize: 13, fontWeight: "700" },
  paymentTextActive: { color: "var(--color-primary)", fontWeight: "800" },
  saveButton: { height: 56, backgroundColor: "var(--color-primary)", borderRadius: 28, marginTop: 24, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
