import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { Card, MoneyText, RoundIcon, ui } from "@/components/budget-ui";
import { DatePickerField } from "@/components/date-picker-field";
import { ScreenContainer } from "@/components/screen-container";
import { useBudget } from "@/lib/budget-store";
import { useToast } from "@/lib/toast-context";
import { useResponsiveLayout } from "@/lib/responsive-layout";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

const monthKey = (date: string) => date.slice(0, 7);

export default function CigaretteTrackerScreen() {
  const { settings, setCigaretteMonthlyLimit, addCigaretteSpend } = useBudget();
  const { showSuccess } = useToast();
  const { isCompactPhone, isShortPhone } = useResponsiveLayout();
  const language = settings.language;
  const label = (en: string, fr: string) => language === "fr" ? fr : en;
  const tracker = settings.cigaretteTracker ?? { entries: [] };
  const [limit, setLimit] = useState(tracker.monthlyLimit ? String(tracker.monthlyLimit) : "");
  const [spend, setSpend] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const monthSpend = useMemo(() => tracker.entries.filter((entry) => monthKey(entry.date) === monthKey(new Date().toISOString())).reduce((sum, entry) => sum + entry.amount, 0), [tracker.entries]);
  const remaining = tracker.monthlyLimit === undefined ? undefined : Math.max(tracker.monthlyLimit - monthSpend, 0);
  const trendMonths = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const total = tracker.entries.filter((entry) => monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.amount, 0);
      return { key, label: date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short" }).replace(".", ""), total };
    });
  }, [language, tracker.entries]);
  const trendMax = Math.max(...trendMonths.map((month) => month.total), 1);
  const trendTotal = trendMonths.reduce((sum, month) => sum + month.total, 0);

  const saveLimit = () => {
    const value = limit.trim() ? Number(limit.replace(",", ".")) : undefined;
    if (!setCigaretteMonthlyLimit(value)) return;
    showSuccess(label("Monthly limit saved", "Limite mensuelle enregistrée"));
  };
  const addSpend = () => {
    if (!addCigaretteSpend(Number(spend.replace(",", ".")), date)) return;
    setSpend("");
    showSuccess(label("Monthly spending updated", "Dépenses mensuelles mises à jour"));
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className={isCompactPhone ? "px-4" : "px-5"}><ScrollView contentContainerStyle={[styles.content, isShortPhone && styles.contentShort]} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><AnimatedPressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={label("Close", "Fermer")} style={styles.close}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{label("Private tracker", "Suivi privé")}</Text><View style={styles.headerSpacer} /></View>
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <Text style={[styles.title, isCompactPhone && styles.titleCompact]}>{label("Cigarettes of the month", "Cigarettes du mois")}</Text>
      <Text style={styles.subtitle}>{label("A private monthly total stored only on this device.", "Un total mensuel privé stocké uniquement sur cet appareil.")}</Text>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <Card style={styles.summary}><RoundIcon icon="visibility-off" color={"var(--color-primary)"} background="#EEF3FF" /><View style={styles.summaryCopy}><Text style={styles.summaryLabel}>{label("This month", "Ce mois-ci")}</Text><MoneyText amount={monthSpend} language={language} style={styles.summaryValue} /><Text style={styles.summarySub}>{remaining === undefined ? label("Set a limit when you want one.", "Définis une limite si tu le souhaites.") : `${label("Remaining", "Restant")} · ${remaining.toFixed(2)} DH`}</Text></View></Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <Card style={styles.trendCard}><View style={styles.trendHeader}><View style={styles.trendCopy}><Text style={styles.cardTitle}>{label("Spending trend", "Tendance des dépenses")}</Text><Text style={styles.trendSubtitle}>{label("Last 6 months", "6 derniers mois")} · {trendTotal.toFixed(2)} DH</Text></View><RoundIcon icon="show-chart" color={"var(--color-primary)"} background="#EEF3FF" size={isCompactPhone ? 34 : 40} /></View><View style={[styles.chart, isCompactPhone && styles.chartCompact]}>{trendMonths.map((month) => <View key={month.key} style={styles.chartColumn}><View style={styles.barTrack}><View style={[styles.bar, { height: month.total > 0 ? Math.max(6, (month.total / trendMax) * (isCompactPhone ? 62 : 78)) : 4 }]} /></View><Text style={styles.chartLabel}>{month.label}</Text><Text style={styles.chartValue}>{month.total > 0 ? `${Math.round(month.total)}` : "–"}</Text></View>)}</View>{trendTotal === 0 ? <Text style={styles.trendEmpty}>{label("Add spending to reveal your monthly pattern.", "Ajoute des dépenses pour voir ta tendance mensuelle.")}</Text> : null}</Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
      <Card style={styles.card}><Text style={styles.cardTitle}>{label("Monthly limit", "Limite mensuelle")}</Text><View style={styles.amountField}><TextInput value={limit} onChangeText={setLimit} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#9AA5B8" style={styles.amountInput} /><Text style={styles.currency}>DH</Text></View><AnimatedPressable onPress={saveLimit} style={({ pressed }: { pressed: boolean }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{label("Save limit", "Enregistrer la limite")}</Text></AnimatedPressable></Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
      <Card style={styles.card}><Text style={styles.cardTitle}>{label("Add spending", "Ajouter une dépense")}</Text><View style={styles.amountField}><TextInput value={spend} onChangeText={setSpend} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#9AA5B8" style={styles.amountInput} /><Text style={styles.currency}>DH</Text></View><Text style={styles.fieldLabel}>{label("Date", "Date")}</Text><DatePickerField value={date} onChange={setDate} accessibilityLabel={label("Choose spending date", "Choisir la date de dépense")} /><AnimatedPressable onPress={addSpend} style={({ pressed }: { pressed: boolean }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{label("Add to this month", "Ajouter au mois")}</Text></AnimatedPressable></Card>
    </Animated.View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 32 }, contentShort: { paddingTop: 4, paddingBottom: 22 }, header: { height: 56, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, close: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", alignItems: "center", justifyContent: "center" }, headerSpacer: { width: 40, height: 40 }, headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, title: { color: "var(--color-foreground)", fontSize: 27, fontWeight: "800", letterSpacing: -0.7, marginTop: 12 }, subtitle: { color: "var(--color-muted)", fontSize: 13, lineHeight: 19, marginTop: 6 }, summary: { marginTop: 18, flexDirection: "row", gap: 12, alignItems: "center" }, summaryCopy: { flex: 1 }, summaryLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, summaryValue: { marginTop: 4, fontSize: 24 },   summarySub: { color: "var(--color-muted)", fontSize: 11, marginTop: 4 }, trendCard: { marginTop: 14, paddingBottom: 14 }, trendHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, trendCopy: { flex: 1 }, trendSubtitle: { color: "var(--color-muted)", fontSize: 11, marginTop: 4 }, chart: { height: 130, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 6, marginTop: 18 }, chartCompact: { gap: 2, marginTop: 14 }, chartColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", minWidth: 0 }, barTrack: { height: 82, width: "100%", alignItems: "center", justifyContent: "flex-end" }, bar: { width: 24, maxWidth: "72%", borderRadius: 8, backgroundColor: "var(--color-primary)" }, chartLabel: { color: "var(--color-muted)", fontSize: 10, fontWeight: "800", marginTop: 8, textTransform: "uppercase" }, chartValue: { color: "var(--color-foreground)", fontSize: 9, fontWeight: "700", marginTop: 2 }, trendEmpty: { color: "var(--color-muted)", fontSize: 11, lineHeight: 16, marginTop: 10 }, titleCompact: { fontSize: 24 }, card: { marginTop: 14 }, cardTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, fieldLabel: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800", marginTop: 16, marginBottom: 7 }, amountField: { height: 62, borderRadius: 16, borderWidth: 1.5, borderColor: "#AFC4FF", paddingHorizontal: 14, marginTop: 14, flexDirection: "row", alignItems: "center" }, amountInput: { flex: 1, height: "100%", color: "var(--color-foreground)", fontSize: 26, fontWeight: "800" }, currency: { color: "var(--color-primary)", fontSize: 15, fontWeight: "800" }, primaryButton: { height: 52, borderRadius: 15, marginTop: 18, backgroundColor: "var(--color-primary)", justifyContent: "center", alignItems: "center" }, primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, secondaryButton: { height: 46, borderRadius: 14, marginTop: 14, backgroundColor: "#EEF3FF", justifyContent: "center", alignItems: "center" }, secondaryButtonText: { color: "var(--color-primary)", fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.72 }
});
