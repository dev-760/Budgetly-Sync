import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandLockup, Card, ui } from "@/components/budget-ui";
import { formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function MonthlyLimitScreen() {
  const { settings, finance, setMonthlySpendingLimit } = useBudget();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const [value, setValue] = useState(settings.monthlySpendingLimit ? String(settings.monthlySpendingLimit) : "");
  const save = () => {
    const amount = Number(value.replace(",", "."));
    if (!setMonthlySpendingLimit(amount)) { Alert.alert(label("Enter a valid monthly limit.", "Saisis une limite mensuelle valide.")); return; }
    router.back();
  };
  const clear = () => { setMonthlySpendingLimit(undefined); router.back(); };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, minHeight: 0 }}><ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><AnimatedPressable onPress={() => router.back()} style={({ pressed }: { pressed: boolean }) => [styles.close, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{label("Spending limit", "Limite de dépenses")}</Text><AnimatedPressable onPress={save} accessibilityRole="button" accessibilityLabel={label("Save limit", "Enregistrer la limite")} style={({ pressed }: { pressed: boolean }) => [styles.headerSave, pressed && styles.pressed]}><Text style={styles.headerSaveText}>{label("Save", "Enregistrer")}</Text></AnimatedPressable></View>
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <Text style={styles.title}>{label("Monthly spending limit", "Limite mensuelle")}</Text><Text style={styles.subtitle}>{label("Set one total limit to compare against your monthly expenses.", "Définis une limite totale à comparer à tes dépenses mensuelles.")}</Text>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <Card style={styles.card}><Text style={styles.label}>{label("Your limit", "Ta limite")}</Text><View style={styles.inputWrap}><TextInput value={value} onChangeText={setValue} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="var(--color-muted)" style={styles.input} autoFocus /><Text style={styles.currency}>DH</Text></View><View style={styles.info}><MaterialIcons name="info-outline" size={18} color={"var(--color-primary)"} /><Text style={styles.infoText}>{label(`This month’s recorded spending is ${formatMoney(finance.expenses, settings.language)}.`, `Les dépenses enregistrées ce mois-ci sont de ${formatMoney(finance.expenses, settings.language)}.`)}</Text></View>{settings.monthlySpendingLimit ? <AnimatedPressable onPress={clear} style={styles.clear}><Text style={styles.clearText}>{label("Remove limit", "Supprimer la limite")}</Text></AnimatedPressable> : null}</Card>
    </Animated.View>
  </ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flexGrow: 1, paddingBottom: 48 }, header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }, close: { height: 40, width: 40, borderRadius: 16, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", alignItems: "center", justifyContent: "center" }, headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, headerSave: { height: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" }, headerSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", marginTop: 23, letterSpacing: -0.8 }, subtitle: { color: "var(--color-muted)", fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 340 }, card: { marginTop: 24, padding: 17 }, label: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, inputWrap: { height: 70, flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "var(--color-border)", borderRadius: 18, paddingHorizontal: 18, marginTop: 10, backgroundColor: "var(--color-surface)" }, input: { flex: 1, color: "var(--color-foreground)", fontSize: 31, fontWeight: "800", height: "100%", textAlign: "left" }, currency: { color: "var(--color-primary)", fontSize: 17, fontWeight: "800", marginLeft: 8 }, info: { flexDirection: "row", gap: 9, backgroundColor: "var(--color-background)", borderRadius: 16, padding: 12, marginTop: 16 }, infoText: { color: "var(--color-muted)", fontSize: 12, lineHeight: 17, flex: 1 }, clear: { alignItems: "center", paddingVertical: 16 }, clearText: { color: "var(--color-error)", fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.72 } });
