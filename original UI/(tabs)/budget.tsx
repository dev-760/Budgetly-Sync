import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Card, EmptyState, ProgressBar, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { ExpoUiPrimaryButton } from "@/components/expo-ui-primary-button";
import { formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function BudgetScreen() {
  const { settings, budgets, transactions, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const spending = transactions.filter((item) => item.kind === "expense").reduce<Record<string, number>>((sum, item) => ({ ...sum, [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount }), {});
  return (
    <ScreenContainer className="px-5">
      <FlatList style={{ flex: 1 }} data={budgets} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: 44 }]} ListHeaderComponent={<><View style={styles.header}><View><Text style={styles.title}>{t("budget")}</Text><Text style={styles.subtitle}>{t("monthlyPlan")}</Text></View><AnimatedPressable onPress={() => router.push("/budget-edit" as never)} accessibilityRole="button" accessibilityLabel={language === "fr" ? "Créer un budget" : "Create a budget"} style={({ pressed }: { pressed: boolean }) => [styles.addButton, pressed && styles.pressed]}><MaterialIcons name="add" size={22} color="#FFFFFF" /></AnimatedPressable></View><Animated.View entering={FadeInDown.duration(400).springify()}><Card style={styles.summaryCard}><View><Text style={styles.summaryLabel}>{t("safeToSpend")}</Text><Text style={styles.summaryAmount}>{formatMoney(finance.safeToSpend, language)}</Text><Text style={styles.summaryCaption}>{formatMoney(finance.dailySafeToSpend, language)} / {language === "fr" ? "jour" : "day"}</Text></View><RoundIcon icon="account-balance-wallet" size={54} color="#FFFFFF" background="rgba(255,255,255,0.16)" /></Card></Animated.View><SectionTitle title={t("budgetHealth")} /></>} ListEmptyComponent={<Card style={styles.emptyCard}><EmptyState icon="pie-chart-outline" title={language === "fr" ? "Ton premier budget" : "Your first budget"} body={language === "fr" ? "Choisis une catégorie puis définis sa limite mensuelle." : "Choose a category, then set its monthly limit."} /><ExpoUiPrimaryButton label={language === "fr" ? "Créer un budget" : "Create budget"} onPress={() => router.push("/budget-edit" as never)} style={styles.createButton} /></Card>} ListFooterComponent={<Animated.View entering={FadeInDown.duration(400).delay(200).springify()}><AnimatedPressable onPress={() => router.push("/monthly-limit" as never)} style={({ pressed }: { pressed: boolean }) => [styles.limitCard, pressed && styles.pressed]}><RoundIcon icon="savings" size={42} color="var(--color-primary)" background="#FFFFFF" /><View style={{ flex: 1 }}><Text style={styles.limitTitle}>{language === "fr" ? "Définir une limite globale" : "Set a spending limit"}</Text><Text style={styles.limitSub}>{language === "fr" ? "Compare tes dépenses à une cible mensuelle simple." : "Compare your expenses with one simple monthly target."}</Text></View><MaterialIcons name="chevron-right" size={22} color="var(--color-primary)" /></AnimatedPressable></Animated.View>} renderItem={({ item, index }) => {
        const spent = spending[item.id] ?? 0;
        const ratio = item.limit ? spent / item.limit : 0;
        const over = spent > item.limit;
        return <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index * 30, 300)).springify()}><AnimatedPressable onPress={() => router.push({ pathname: "/budget-edit", params: { id: item.id } } as never)} style={({ pressed }: { pressed: boolean }) => [styles.budgetCard, pressed && styles.pressed]}><View style={styles.row}><View style={styles.identity}><RoundIcon icon={item.icon as keyof typeof MaterialIcons.glyphMap} size={42} color={item.color} background={`${item.color}18`} /><View><Text style={styles.budgetName}>{categoryName(item.id)}</Text><Text style={styles.budgetSub}>{formatMoney(spent, language)} {t("spent")}</Text></View></View><Text style={[styles.status, over && { color: "var(--color-error)" }]}>{over ? `${formatMoney(spent - item.limit, language)} ${t("overBudget")}` : `${formatMoney(item.limit - spent, language)} ${t("remaining")}`}</Text></View><ProgressBar value={ratio} color={over ? "var(--color-error)" : ratio > 0.82 ? "var(--color-warning)" : item.color} /></AnimatedPressable></Animated.View>;
      }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: "var(--color-muted)", marginTop: 2, fontSize: 13 },
  addButton: { width: 44, height: 44, backgroundColor: "var(--color-primary)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  summaryCard: { backgroundColor: "var(--color-foreground)", borderColor: "var(--color-foreground)", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700" },
  summaryAmount: { color: "#FFFFFF", fontSize: 29, fontWeight: "800", letterSpacing: -0.8, marginTop: 6 },
  summaryCaption: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 5 },
  limitCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#EEF3FF", borderRadius: 22, padding: 16, marginTop: 22, marginBottom: 18, marginHorizontal: "auto", maxWidth: 400 },
  limitTitle: { color: "var(--color-primary)", fontSize: 16, fontWeight: "800" },
  limitSub: { color: "#5478D2", fontSize: 13, marginTop: 4, lineHeight: 18 },
  budgetCard: { backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 22, padding: 14, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13 },
  identity: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  budgetName: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800" },
  budgetSub: { color: "var(--color-muted)", fontSize: 12, marginTop: 3 },
  status: { color: "var(--color-success)", fontSize: 12, fontWeight: "800", maxWidth: 100, textAlign: "right" },
  emptyCard: { paddingBottom: 16 },
  createButton: { marginTop: 2 },
  pressed: { opacity: 0.72 },
});
