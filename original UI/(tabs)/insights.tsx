import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

const donutRadius = 43;
const donutLength = 2 * Math.PI * donutRadius;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthTotal = (transactions: { kind: "income" | "expense"; amount: number; date: string }[], year: number, month: number, kind: "income" | "expense") => transactions.filter((item) => {
  const date = new Date(item.date);
  return date.getFullYear() === year && date.getMonth() === month && item.kind === kind;
}).reduce((sum, item) => sum + item.amount, 0);
const percentChange = (current: number, previous: number) => previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

export default function InsightsScreen() {
  const { settings, transactions, goals, categoryName, finance } = useBudget();
  const language = settings.language;
  const isFrench = language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const now = new Date();
  const thisMonth = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const income = thisMonth.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const spending = thisMonth.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousIncome = monthTotal(transactions, previousMonthDate.getFullYear(), previousMonthDate.getMonth(), "income");
  const previousSpending = monthTotal(transactions, previousMonthDate.getFullYear(), previousMonthDate.getMonth(), "expense");
  const previousNet = previousIncome - previousSpending;
  const totalFlow = income + spending;
  const incomeShare = totalFlow > 0 ? income / totalFlow : 0.5;
  const spendingLimit = settings.monthlySpendingLimit;
  const limitUsed = spendingLimit ? Math.round((spending / spendingLimit) * 100) : 0;
  const limitRemaining = spendingLimit ? spendingLimit - spending : 0;
  const limitState = !spendingLimit ? "unset" : limitUsed >= 100 ? "over" : limitUsed >= 80 ? "near" : "under";
  const categoryTotals = thisMonth.filter((item) => item.kind === "expense").reduce<Record<string, number>>((sum, item) => ({ ...sum, [item.categoryId]: (sum[item.categoryId] ?? 0) + item.amount }), {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const categoryMax = Math.max(...categories.map(([, amount]) => amount), 1);
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index)));
    const nextDate = new Date(date); nextDate.setDate(date.getDate() + 1);
    const amount = transactions.filter((item) => item.kind === "expense" && new Date(item.date) >= date && new Date(item.date) < nextDate).reduce((sum, item) => sum + item.amount, 0);
    const day = new Intl.DateTimeFormat(isFrench ? "fr-MA" : "en-US", { weekday: "narrow" }).format(date);
    return { amount, day };
  });
  const weeklyMax = Math.max(...weekly.map((item) => item.amount), 1);
  const net = income - spending;
  const top = categories[0];

  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.title}>{label("Monthly dashboard", "Tableau mensuel")}</Text><Text style={styles.subtitle}>{label("Your money story, based on this device.", "Ton aperçu, basé sur cet appareil.")}</Text></View><View style={styles.period}><MaterialIcons name="calendar-month" color={"var(--color-primary)"} size={16} /><Text style={styles.periodText}>{label("This month", "Ce mois-ci")}</Text></View></View>

    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <Card style={styles.hero}><View style={styles.heroTop}><View><Text style={styles.heroEyebrow}>{label("Monthly balance", "Solde mensuel")}</Text><Text style={[styles.heroValue, { color: net >= 0 ? "#FFFFFF" : "#FFD8D8" }]}>{formatMoney(Math.abs(net), language)}</Text><Text style={styles.heroCaption}>{net >= 0 ? label("You earned more than you spent.", "Tu as gagné plus que tu as dépensé.") : label("Spending is above income this month.", "Les dépenses dépassent les revenus ce mois-ci.")}</Text></View><View style={styles.heroIcon}><MaterialIcons name={net >= 0 ? "trending-up" : "trending-down"} size={26} color="#FFFFFF" /></View></View><View style={styles.heroBottom}><Text style={styles.heroMeta}>{label("Safe to spend", "Reste à dépenser")}</Text><Text style={styles.heroMetaValue}>{formatMoney(finance.safeToSpend, language)}</Text></View></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <SectionTitle title={label("Income & spending", "Revenus et dépenses")} />
      <Card style={styles.flowCard}><View style={styles.donutWrap} accessibilityLabel={label(`Income ${formatMoney(income, language)} and spending ${formatMoney(spending, language)}`, `Revenus ${formatMoney(income, language)} et dépenses ${formatMoney(spending, language)}`)}><Svg width={108} height={108} viewBox="0 0 108 108"><Circle cx="54" cy="54" r={donutRadius} stroke="#FDEBEC" strokeWidth="13" fill="transparent" /><Circle cx="54" cy="54" r={donutRadius} stroke={"var(--color-success)"} strokeWidth="13" fill="transparent" strokeLinecap="round" strokeDasharray={`${donutLength * incomeShare} ${donutLength}`} rotation="-90" origin="54,54" /></Svg><View style={styles.donutCenter}><Text style={styles.donutLabel}>{label("Inflow", "Entrées")}</Text><Text style={styles.donutValue}>{Math.round(incomeShare * 100)}%</Text></View></View><View style={styles.flowLegend}><Legend color={"var(--color-success)"} label={label("Income", "Revenus")} value={formatMoney(income, language)} /><Legend color={"var(--color-error)"} label={label("Spending", "Dépenses")} value={formatMoney(spending, language)} /><View style={styles.balanceLine}><Text style={styles.balanceLabel}>{label("Net", "Net")}</Text><Text style={[styles.balanceValue, { color: net >= 0 ? "var(--color-success)" : "var(--color-error)" }]}>{net >= 0 ? "+" : "−"}{formatMoney(Math.abs(net), language)}</Text></View></View></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <SectionTitle title={label("Compared with last month", "Comparé au mois dernier")} />
      <Card style={styles.compareCard}>{previousIncome || previousSpending ? <View style={styles.compareRow}><CompareMetric label={label("Income", "Revenus")} value={formatMoney(income, language)} change={percentChange(income, previousIncome)} positive /><CompareMetric label={label("Spending", "Dépenses")} value={formatMoney(spending, language)} change={percentChange(spending, previousSpending)} positive={false} /><CompareMetric label={label("Net", "Net")} value={formatMoney(Math.abs(net), language)} change={percentChange(net, previousNet)} positive={net >= previousNet} /></View> : <Text style={styles.emptyText}>{label("Add entries next month to unlock your month-to-month comparison.", "Ajoute des opérations le mois prochain pour débloquer la comparaison mensuelle.")}</Text>}</Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
      <SectionTitle title={label("Last 7 days", "7 derniers jours")} />
      <Card><View style={styles.chartHeader}><Text style={styles.chartCaption}>{label("Daily spending", "Dépenses quotidiennes")}</Text><Text style={styles.chartTotal}>{formatMoney(weekly.reduce((sum, item) => sum + item.amount, 0), language)}</Text></View><View style={styles.bars}>{weekly.map((item, index) => <View key={`${item.day}-${index}`} style={styles.barColumn} accessibilityLabel={`${item.day}: ${formatMoney(item.amount, language)}`}><View style={[styles.bar, { height: Math.max(item.amount ? 12 : 4, 104 * (item.amount / weeklyMax)), backgroundColor: index === 6 ? "var(--color-primary)" : "#BFD0FF" }]} /><Text style={styles.barLabel}>{item.day}</Text></View>)}</View><Text style={styles.chartNote}>{label("The latest day is highlighted in blue.", "Le dernier jour est en bleu.")}</Text></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
      <SectionTitle title={label("Savings goal progress", "Progression des objectifs")} action={label("Manage", "Gérer")} onPress={() => router.push("/goal" as never)} />
      <Card>{goals.length ? goals.slice(0, 4).map((goal, index) => { const percent = Math.min(100, Math.round((goal.savedAmount / Math.max(goal.targetAmount, 1)) * 100)); const accent = ["#7A63D2", "var(--color-primary)", "var(--color-success)", "var(--color-warning)"][index]; return <AnimatedPressable key={goal.id} accessibilityRole="button" accessibilityLabel={label(`${goal.title}, ${percent}% complete. Tap to manage.`, `${goal.title}, ${percent}% atteint. Appuie pour gérer.`)} onPress={() => router.push({ pathname: "/goal", params: { goalId: goal.id } } as never)} style={({ pressed }: { pressed: boolean }) => [goalStyles.row, index < Math.min(goals.length, 4) - 1 && goalStyles.divider, pressed && styles.pressed]}><View style={goalStyles.top}><View style={goalStyles.titleWrap}><View style={[goalStyles.marker, { backgroundColor: accent }]} /><Text style={goalStyles.name} numberOfLines={1}>{goal.title}</Text></View><Text style={goalStyles.percent}>{percent}%</Text></View><View style={goalStyles.track}><View style={[goalStyles.fill, { width: `${Math.max(percent ? 5 : 0, percent)}%`, backgroundColor: accent }]} /></View><View style={goalStyles.foot}><Text style={goalStyles.amount}>{formatMoney(goal.savedAmount, language)} / {formatMoney(goal.targetAmount, language)}</Text><Text style={goalStyles.open}>{label("Open", "Ouvrir")} ›</Text></View></AnimatedPressable>; }) : <View style={goalStyles.empty}><RoundIcon icon="flag" size={36} color="#7A63D2" background="var(--color-surface)" /><View style={{ flex: 1 }}><Text style={goalStyles.emptyTitle}>{label("Your next milestone starts here", "Ton prochain objectif commence ici")}</Text><Text style={goalStyles.emptyBody}>{label("Add a goal to track each contribution visually.", "Ajoute un objectif pour suivre chaque contribution visuellement.")}</Text></View></View>}</Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(350).springify()}>
      <SectionTitle title={label("Where your money went", "Répartition des dépenses")} />
      <Card>{categories.length ? categories.map(([id, amount], index) => <AnimatedPressable key={id} accessibilityRole="button" accessibilityLabel={label(`View ${categoryName(id as Parameters<typeof categoryName>[0])} transactions`, `Voir les transactions ${categoryName(id as Parameters<typeof categoryName>[0])}`)} onPress={() => router.push({ pathname: "/(tabs)/transactions", params: { category: id } } as never)} style={({ pressed }: { pressed: boolean }) => [styles.categoryRow, pressed && styles.pressed]}><View style={styles.categoryLabel}><View style={[styles.categoryDot, { backgroundColor: ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "#7A63D2"][index] }]} /><Text style={styles.categoryName}>{categoryName(id as Parameters<typeof categoryName>[0])}</Text><MaterialIcons name="chevron-right" size={16} color={"var(--color-muted)"} /></View><Text style={styles.categoryAmount}>{formatMoney(amount, language)}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.max(5, (amount / categoryMax) * 100)}%`, backgroundColor: ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "#7A63D2"][index] }]} /></View></AnimatedPressable>) : <Text style={styles.emptyText}>{label("Add an expense to see your category mix.", "Ajoute une dépense pour voir la répartition.")}</Text>}</Card>
      {top ? <Card style={styles.tipCard}><RoundIcon icon="insights" size={40} color={"var(--color-warning)"} background="#FFF3D8" /><View style={{ flex: 1 }}><Text style={styles.tipLabel}>{label("Top spending category", "Catégorie principale")}</Text><Text style={styles.tipText}>{categoryName(top[0] as Parameters<typeof categoryName>[0])} · {formatMoney(top[1], language)}</Text></View></Card> : null}
    </Animated.View>


  </ScrollView></ScreenContainer>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue}>{value}</Text></View>;
}

function CompareMetric({ label, value, change, positive }: { label: string; value: string; change: number | null; positive: boolean }) {
  const color = change === null ? "var(--color-muted)" : positive ? "var(--color-success)" : "var(--color-error)";
  const prefix = change === null ? "" : change > 0 ? "+" : "";
  return <View style={styles.compareMetric}><Text style={styles.compareLabel}>{label}</Text><Text style={styles.compareValue}>{value}</Text><Text style={[styles.compareChange, { color }]}>{change === null ? "—" : `${prefix}${change}%`}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 28 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, title: { color: "var(--color-foreground)", fontSize: 27, fontWeight: "800", letterSpacing: -0.8 }, subtitle: { color: "var(--color-muted)", fontSize: 12, marginTop: 5 }, period: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EAF0FF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 }, periodText: { color: "var(--color-primary)", fontWeight: "700", fontSize: 11 }, hero: { marginTop: 18, backgroundColor: "var(--color-foreground)", borderWidth: 0, borderRadius: 23, padding: 20 }, heroTop: { flexDirection: "row", justifyContent: "space-between" }, heroEyebrow: { color: "#BFD0FF", fontSize: 12, fontWeight: "700" }, heroValue: { fontSize: 34, lineHeight: 42, fontWeight: "800", marginTop: 8, fontVariant: ["tabular-nums"] }, heroCaption: { color: "#DCE6FF", fontSize: 12, marginTop: 5 }, heroIcon: { height: 46, width: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" }, heroBottom: { marginTop: 18, paddingTop: 14, borderTopColor: "rgba(255,255,255,0.18)", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between" }, heroMeta: { color: "#BFD0FF", fontSize: 12, fontWeight: "700" }, heroMetaValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, flowCard: { flexDirection: "row", alignItems: "center", gap: 17, padding: 16 }, donutWrap: { width: 108, height: 108, alignItems: "center", justifyContent: "center" }, donutCenter: { position: "absolute", alignItems: "center" }, donutLabel: { color: "var(--color-muted)", fontSize: 10, fontWeight: "700" }, donutValue: { color: "var(--color-foreground)", fontSize: 19, fontWeight: "800", marginTop: 2 }, flowLegend: { flex: 1, gap: 9 }, legendRow: { flexDirection: "row", alignItems: "center", gap: 7 }, legendDot: { height: 8, width: 8, borderRadius: 4 }, legendLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700", flex: 1 }, legendValue: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800" }, balanceLine: { paddingTop: 9, marginTop: 1, borderTopColor: "var(--color-border)", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between" }, balanceLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, balanceValue: { fontSize: 12, fontWeight: "800" }, limitCard: { backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "#DDE5F6", borderRadius: 20, padding: 16 }, limitTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, limitLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, limitValue: { color: "var(--color-foreground)", fontSize: 22, fontWeight: "800", marginTop: 4 }, limitState: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 }, limitStateText: { fontSize: 11, fontWeight: "800" }, limitNumbers: { flexDirection: "row", justifyContent: "space-between", marginTop: 17 }, limitSpent: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800" }, limitRemaining: { fontSize: 12, fontWeight: "800" }, limitTrack: { height: 9, borderRadius: 8, backgroundColor: "#EEF1F7", marginTop: 9, overflow: "hidden" }, limitFill: { height: "100%", borderRadius: 8 }, limitFootnote: { color: "var(--color-muted)", fontSize: 11, marginTop: 8 }, limitEmpty: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#EEF3FF", borderRadius: 20, padding: 16 }, limitEmptyTitle: { color: "var(--color-primary)", fontSize: 16, fontWeight: "800" }, limitEmptyBody: { color: "#5478D2", fontSize: 13, marginTop: 4, lineHeight: 18 }, compareCard: { padding: 15 }, compareRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, compareMetric: { flex: 1 }, compareLabel: { color: "var(--color-muted)", fontSize: 10, fontWeight: "700" }, compareValue: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800", marginTop: 5 }, compareChange: { fontSize: 11, fontWeight: "800", marginTop: 4 }, chartHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }, chartCaption: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, chartTotal: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "800" }, bars: { height: 142, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 3 }, barColumn: { alignItems: "center", gap: 7, width: 28 }, bar: { width: 18, borderRadius: 99 }, barLabel: { color: "var(--color-muted)", fontSize: 10, fontWeight: "800" }, chartNote: { color: "var(--color-muted)", fontSize: 11, marginTop: 12 }, categoryRow: { marginBottom: 15 }, categoryLabel: { flexDirection: "row", alignItems: "center", gap: 7 }, categoryDot: { height: 9, width: 9, borderRadius: 5 }, categoryName: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "700", flex: 1 }, categoryAmount: { color: "var(--color-muted)", fontSize: 12, fontWeight: "800" }, track: { height: 7, borderRadius: 5, backgroundColor: "#EEF1F7", marginTop: 8, overflow: "hidden" }, fill: { height: "100%", borderRadius: 5 }, emptyText: { color: "var(--color-muted)", fontSize: 13, lineHeight: 18, textAlign: "center", paddingVertical: 14 }, tipCard: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12 }, tipLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, tipText: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800", marginTop: 3 }, pressed: { opacity: 0.72 },
});

const goalStyles = StyleSheet.create({
  row: { paddingVertical: 12 }, divider: { borderBottomWidth: 1, borderBottomColor: "var(--color-border)" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, titleWrap: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1, paddingRight: 8 }, marker: { height: 9, width: 9, borderRadius: 5 }, name: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800", flex: 1 }, percent: { color: "var(--color-primary)", fontSize: 12, fontWeight: "800" },
  track: { height: 8, borderRadius: 6, backgroundColor: "#EEF1F7", overflow: "hidden", marginTop: 9 }, fill: { height: "100%", borderRadius: 6 }, foot: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 }, amount: { color: "var(--color-muted)", fontSize: 10, fontWeight: "700" }, open: { color: "var(--color-primary)", fontSize: 11, fontWeight: "800" },
  empty: { flexDirection: "row", gap: 11, alignItems: "center", paddingVertical: 6 }, emptyTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, emptyBody: { color: "var(--color-muted)", fontSize: 11, lineHeight: 16, marginTop: 3 },
});
