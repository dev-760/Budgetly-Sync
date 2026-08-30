import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { budgetCategoryOptions, CategoryId } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { ui } from "@/components/budget-ui";
import { ExpoUiPrimaryButton } from "@/components/expo-ui-primary-button";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function BudgetEditModal() {
  const { id, fromOnboarding } = useLocalSearchParams<{ id?: string; fromOnboarding?: string }>();
  const { budgets, setBudget, t, categoryName, settings } = useBudget();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const existing = useMemo(() => budgets.find((item) => item.id === id), [budgets, id]);
  const [selectedId, setSelectedId] = useState<CategoryId>(existing?.id ?? (id as CategoryId | undefined) ?? budgetCategoryOptions[0].id);
  const chosen = useMemo(() => existing ?? budgetCategoryOptions.find((item) => item.id === selectedId) ?? budgetCategoryOptions[0], [existing, selectedId]);
  const [amount, setAmount] = useState(existing ? String(existing.limit) : "");
  const [error, setError] = useState("");
  const close = () => {
    if (fromOnboarding) router.replace("/(tabs)/budget" as never);
    else router.back();
  };
  const save = () => {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) { setError(t("amount")); haptic.error(); return; }
    setBudget(chosen.id, value);
    haptic.success();
    if (fromOnboarding) router.replace("/(tabs)/budget" as never);
    else router.back();
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} style={{ flex: 1, minHeight: 0 }}><View style={styles.header}><AnimatedPressable onPress={close} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{existing ? t("setBudget") : (t("budget") as string)}</Text><AnimatedPressable onPress={save} style={({ pressed }: { pressed: boolean }) => [styles.headerSave, pressed && styles.pressed]}><Text style={styles.headerSaveText}>{existing ? label("Save", "Enregistrer") : label("Set", "Définir")}</Text></AnimatedPressable></View><ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: 48 }]} keyboardShouldPersistTaps="handled">
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={{ alignItems: "center" }}>
      <View style={styles.badge}><MaterialIcons name={chosen.icon as keyof typeof MaterialIcons.glyphMap} size={28} color={chosen.color} /></View><Text style={styles.category}>{categoryName(chosen.id)}</Text>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()} style={{ width: "100%" }}>
      {!existing ? <View style={styles.categoryGrid}>{budgetCategoryOptions.map((item) => <AnimatedPressable key={item.id} onPress={() => setSelectedId(item.id)} style={({ pressed }: { pressed: boolean }) => [styles.categoryChip, selectedId === item.id && { borderColor: item.color, backgroundColor: `${item.color}14` }, pressed && styles.pressed]}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={17} color={selectedId === item.id ? item.color : "var(--color-muted)"} /><Text numberOfLines={1} style={[styles.categoryChipText, selectedId === item.id && { color: item.color }]}>{categoryName(item.id)}</Text></AnimatedPressable>)}</View> : null}
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()} style={{ width: "100%", alignItems: "center" }}>
      <Text style={styles.prompt}>{t("budgetLimit")}</Text><View style={styles.amountField}><TextInput value={amount} onChangeText={(value) => { setAmount(value); setError(""); }} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="var(--color-muted)" style={styles.amountInput} /><Text style={styles.currency}>DH</Text></View>{error ? <Text style={styles.error}>{error} {"is required."}</Text> : null}
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()} style={{ width: "100%" }}>
    </Animated.View>
  </ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { height: 40, width: 40, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" },
  headerSave: { height: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" },
  headerSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  content: { alignItems: "center", paddingTop: 32, paddingBottom: 30 },
  badge: { height: 70, width: 70, borderRadius: 25, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  category: { color: "var(--color-foreground)", fontSize: 24, fontWeight: "800", marginTop: 18 },
  categoryGrid: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 22 },
  categoryChip: { width: "31%", minHeight: 74, padding: 10, gap: 6, borderRadius: 16, borderWidth: 1.5, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", alignItems: "center", justifyContent: "center" },
  categoryChipText: { color: "var(--color-muted)", fontSize: 11, fontWeight: "700", textAlign: "center" },
  prompt: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800", marginTop: 28, alignSelf: "flex-start", marginLeft: 4 },
  amountField: { marginTop: 16, width: "100%", height: 80, borderRadius: 22, backgroundColor: "var(--color-background)", paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1.5, borderColor: "transparent" },
  amountInput: { flex: 1, color: "var(--color-foreground)", fontSize: 36, fontWeight: "800", height: "100%", textAlign: "left" },
  currency: { color: "var(--color-primary)", fontWeight: "800", fontSize: 18, marginLeft: 10 },
  error: { color: "var(--color-error)", marginTop: 7, fontSize: 12 },
  saveButton: { marginTop: 28, minWidth: 160 },
  pressed: { opacity: 0.72 },
});
