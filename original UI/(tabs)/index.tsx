import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { BrandLockup, Card, EmptyState, MoneyText, ProgressBar, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { formatDate, formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { useResponsiveLayout } from "@/lib/responsive-layout";
import { ScreenContainer } from "@/components/screen-container";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function HomeScreen() {
  const { settings, transactions, budgets, recurring, buckets, notifications, finance, t, categoryName } = useBudget();
  const language = settings.language;
  const { isCompactPhone } = useResponsiveLayout();
  const recent = transactions.slice(0, 3);
  const upcoming = recurring.slice(0, 2);
  const spendingByCategory = transactions.filter((item) => item.kind === "expense").reduce<Record<string, number>>((result, item) => ({ ...result, [item.categoryId]: (result[item.categoryId] ?? 0) + item.amount }), {});
  const foodBudget = budgets[0];
  const foodSpend = foodBudget ? spendingByCategory[foodBudget.id] ?? 0 : 0;
  const hasUnreadNotifications = notifications.some((item) => !item.isRead);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: 44 }]}>
        <View style={styles.header}>
          <View><BrandLockup compact /><Text style={styles.subtitle}>{t("goodMorning")}</Text></View>
          <AnimatedPressable onPress={() => router.push("/notifications" as never)} accessibilityRole="button" accessibilityLabel={language === "fr" ? "Ouvrir les notifications" : "Open notifications"} style={({ pressed }: { pressed: boolean }) => [styles.notificationButton, pressed && styles.pressed]}><MaterialIcons name="notifications-none" size={23} color={"var(--color-foreground)"} />{hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}</AnimatedPressable>
        </View>

        <Animated.View entering={FadeInDown.duration(400).springify()} style={[styles.safeCard, isCompactPhone && styles.safeCardCompact]}>
          <View style={styles.safeCardTop}><View><Text style={styles.safeEyebrow}>{t("safeToSpend")}</Text><Text style={styles.safeBody}>{t("spendToday")}</Text></View><View style={styles.safeIcon}><MaterialIcons name="savings" size={24} color="#FFFFFF" /></View></View>
          <Text style={[styles.safeAmount, isCompactPhone && styles.safeAmountCompact]}>{formatMoney(finance.safeToSpend, language)}</Text>
          <View style={styles.dailyPill}><MaterialIcons name="today" size={15} color="#FFFFFF" /><Text style={styles.dailyPillText}>{formatMoney(finance.dailySafeToSpend, language)} / {language === "fr" ? "jour" : "day"}</Text></View>
        </Animated.View>

        <View style={styles.workspaceGrid}>
          <View style={styles.primaryColumn}>
            <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={styles.metricsRow}>
              <Card style={styles.metricCard}><RoundIcon icon="account-balance-wallet" size={34} color={"var(--color-primary)"} background="#EAF0FF" /><Text style={styles.metricLabel}>{t("availableBalance")}</Text><MoneyText amount={finance.availableBalance} language={language} style={styles.metricMoney} /></Card>
              <Card style={styles.metricCard}><RoundIcon icon="calendar-month" size={34} color={"var(--color-success)"} background="#E7F7F1" /><Text style={styles.metricLabel}>{t("thisMonth")}</Text><Text style={styles.metricSplit}><Text style={{ color: "var(--color-success)" }}>{formatMoney(finance.income, language)}</Text> · <Text style={{ color: "var(--color-error)" }}>{formatMoney(finance.expenses, language)}</Text></Text></Card>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(400).delay(150).springify()} style={styles.expenseButtonWrap}>
              <AnimatedPressable onPress={() => { haptic.light(); router.push("/transaction?kind=expense" as never); }} accessibilityRole="button" accessibilityLabel={t("addExpense")} accessibilityHint={language === "fr" ? "Ouvre le formulaire de dépense" : "Opens the expense form"} style={({ pressed }: { pressed: boolean }) => [styles.expenseButton, styles.expenseButtonFull, isCompactPhone && styles.actionButtonCompact, pressed && styles.pressed]}><Text style={styles.expenseButtonText}>{t("addExpense")}</Text></AnimatedPressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
              <SectionTitle title={t("recentTransactions")} action={t("viewAll")} onPress={() => router.push("/(tabs)/transactions" as never)} />
              <Card>
                {recent.length ? recent.map((item, index) => <AnimatedPressable key={item.id} onPress={() => router.push({ pathname: "/transaction", params: { id: item.id } } as never)} style={({ pressed }: { pressed: boolean }) => [styles.listRow, index !== recent.length - 1 && styles.listBorder, pressed && styles.pressed]}><RoundIcon icon={item.kind === "income" ? "arrow-downward" : "arrow-upward"} size={38} color={item.kind === "income" ? "var(--color-success)" : "var(--color-error)"} background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"} /><View style={styles.rowMain}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowSub}>{formatDate(item.date, language)} · {categoryName(item.categoryId)}</Text></View><MoneyText amount={item.amount} language={language} type={item.kind} style={styles.rowAmount} /></AnimatedPressable>) : <EmptyState icon="receipt-long" title={language === "fr" ? "Prêt à commencer" : "Ready when you are"} body={language === "fr" ? "Ajoute un revenu ou une dépense pour voir ton activité." : "Add income or an expense to see your activity."} />}
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(250).springify()} style={styles.boardStripContainer}>
              <AnimatedPressable onPress={() => router.push("/(tabs)/finance" as never)} accessibilityRole="button" accessibilityLabel={language === "fr" ? "Ouvrir la vue financière" : "Open finance board"} style={({ pressed }: { pressed: boolean }) => [styles.boardStrip, pressed && styles.pressed]}><View style={styles.boardStripHeader}><View><Text style={styles.boardStripTitle}>{language === "fr" ? "Vue financière" : "Finance board"}</Text><Text style={styles.boardStripHint}>{language === "fr" ? "Comptes et engagements" : "Accounts & commitments"}</Text></View><View style={styles.netWorthWrap}><Text style={styles.netWorthLabel}>{language === "fr" ? "Valeur nette" : "Net worth"}</Text><Text style={styles.netWorthValue}>{formatMoney(finance.netWorth, language)}</Text></View></View><View style={styles.bucketRow}>{buckets.map((bucket) => <View key={bucket.id} style={styles.bucketItem}><RoundIcon icon={bucket.icon as keyof typeof MaterialIcons.glyphMap} size={30} color={bucket.color} background={bucket.id === "cash" ? "rgba(22, 167, 123, 0.15)" : "rgba(26, 86, 219, 0.15)"} /><View><Text style={styles.bucketName}>{bucket.id === "cash" ? t("cash") : t("card")}</Text><Text style={styles.bucketValue}>{formatMoney(bucket.balance, language)}</Text></View></View>)}</View></AnimatedPressable>
            </Animated.View>
          </View>
          <Animated.View entering={FadeInDown.duration(400).delay(300).springify()} style={styles.secondaryColumn}>
            <SectionTitle title={t("budgetHealth")} />
            {foodBudget ? <Card><View style={styles.budgetHead}><View style={styles.budgetLabelWrap}><RoundIcon icon="restaurant" size={38} color={foodBudget.color} background="#E7F7F1" /><View><Text style={styles.budgetName}>{categoryName(foodBudget.id)}</Text><Text style={styles.budgetCaption}>{formatMoney(foodSpend, language)} {t("spent")}</Text></View></View><Text style={styles.remainingText}>{formatMoney(Math.max(foodBudget.limit - foodSpend, 0), language)} {t("remaining")}</Text></View><ProgressBar value={foodSpend / foodBudget.limit} color={foodSpend / foodBudget.limit > 0.85 ? "var(--color-warning)" : foodBudget.color} /></Card> : <AnimatedPressable onPress={() => router.push("/budget-edit" as never)} accessibilityRole="button" accessibilityLabel={language === "fr" ? "Créer mon premier budget" : "Create my first budget"} style={({ pressed }: { pressed: boolean }) => [styles.emptyBudgetCard, pressed && styles.pressed]}><EmptyState icon="pie-chart-outline" title={language === "fr" ? "Crée ton premier budget" : "Create your first budget"} body={language === "fr" ? "Ajoute une limite de catégorie pour suivre tes dépenses." : "Add a category limit to track your spending."} /><View style={styles.emptyBudgetAction}><Text style={styles.emptyBudgetActionText}>{language === "fr" ? "Créer le budget" : "Create budget"}</Text><MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" /></View></AnimatedPressable>}
            <SectionTitle title={t("upcoming")} />
            <Card>{upcoming.length ? upcoming.map((item, index) => <View key={item.id} style={[styles.listRow, index !== upcoming.length - 1 && styles.listBorder]}><RoundIcon icon="event-repeat" size={38} color={"var(--color-warning)"} background="#FFF3D8" /><View style={styles.rowMain}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowSub}>{formatDate(item.nextDueDate, language)}</Text></View><Text style={styles.rowAmount}>{formatMoney(item.amount, language)}</Text></View>) : <EmptyState icon="event-available" title={language === "fr" ? "Aucun paiement à venir" : "No upcoming payments"} body={language === "fr" ? "Les dépenses récurrentes apparaîtront ici." : "Recurring expenses will appear here."} />}</Card>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  subtitle: { marginTop: 7, color: "var(--color-muted)", fontSize: 13 },
  notificationButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 11, top: 9, width: 7, height: 7, borderRadius: 99, backgroundColor: "var(--color-error)", borderWidth: 1.5, borderColor: "#FFFFFF" },
  safeCard: { borderRadius: 24, backgroundColor: "var(--color-primary)", padding: 22, overflow: "hidden", shadowColor: "var(--color-primary)", shadowOpacity: 0.24, shadowRadius: 20, elevation: 5 },
  safeCardCompact: { padding: 18, borderRadius: 21 },
  safeCardTop: { flexDirection: "row", justifyContent: "space-between" },
  safeEyebrow: { color: "#DDE6FF", fontSize: 13, fontWeight: "700" },
  safeBody: { color: "#CCD9FF", fontSize: 12, marginTop: 5, maxWidth: 215, lineHeight: 17 },
  safeIcon: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)" },
  safeAmount: { color: "#FFFFFF", marginTop: 25, fontSize: 42, lineHeight: 48, letterSpacing: -1.5, fontWeight: "800", fontVariant: ["tabular-nums"] },
  safeAmountCompact: { marginTop: 20, fontSize: 36, lineHeight: 42 },
  dailyPill: { marginTop: 16, alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  dailyPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  metricsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  workspaceGrid: { gap: 0 },
  primaryColumn: {},
  secondaryColumn: {},
  metricCard: { flex: 1, minHeight: 132, padding: 15 },
  metricLabel: { marginTop: 13, color: "var(--color-muted)", fontSize: 12, fontWeight: "600" },
  metricMoney: { marginTop: 5, fontSize: 18 },
  metricSplit: { marginTop: 8, fontWeight: "700", fontSize: 12, lineHeight: 17 },
  expenseButtonWrap: { alignItems: "center", width: "100%", marginTop: 16 },
  actionButtonCompact: { flex: undefined, width: "100%" },
  expenseButton: { width: "100%", height: 52, borderRadius: 16, backgroundColor: "var(--color-primary)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "var(--color-primary)", shadowOpacity: 0.18, shadowRadius: 10, elevation: 2 },
  expenseButtonFull: { marginHorizontal: "auto", maxWidth: 300 },
  expenseButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  
  boardStrip: { marginTop: 16, backgroundColor: "var(--color-foreground)", borderRadius: 24, padding: 22, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 },
  boardStripContainer: { width: "100%" },
  boardStripHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  boardStripTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  boardStripHint: { color: "#8B94A7", fontSize: 13, marginTop: 4 },
  netWorthWrap: { alignItems: "flex-end", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  netWorthLabel: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  netWorthValue: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", marginTop: 4, fontVariant: ["tabular-nums"] },
  bucketRow: { flexDirection: "row", gap: 14, marginTop: 18 },
  bucketItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 16 },
  bucketName: { color: "#DDE6FF", fontSize: 13, fontWeight: "700" },
  bucketValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 2 },
  
  emptyBudgetCard: { backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 22, overflow: "hidden" },
  emptyBudgetAction: { marginHorizontal: 16, marginBottom: 16, height: 44, borderRadius: 14, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  emptyBudgetActionText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  budgetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  budgetLabelWrap: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  budgetName: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800" },
  budgetCaption: { color: "var(--color-muted)", fontSize: 12, marginTop: 2 },
  remainingText: { color: "var(--color-success)", fontSize: 12, fontWeight: "800", textAlign: "right", maxWidth: 95 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12, minHeight: 70 },
  listBorder: { borderBottomColor: "var(--color-border)", borderBottomWidth: 1 },
  rowMain: { flex: 1 },
  rowTitle: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "700" },
  rowSub: { color: "var(--color-muted)", fontSize: 12, marginTop: 4 },
  rowAmount: { fontSize: 14, textAlign: "right", fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
