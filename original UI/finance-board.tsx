import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandLockup, Card, EmptyState, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export function FinanceBoardContent({ embedded = false }: { embedded?: boolean }) {
  const { settings, recurring, buckets, finance } = useBudget();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const recurringIncome = recurring.filter((item) => item.kind === "income");
  const cigarettes = settings.cigaretteTracker ?? { entries: [] };
  const cigaretteMonth = new Date().toISOString().slice(0, 7);
  const cigaretteSpent = cigarettes.entries.filter((entry) => entry.date.slice(0, 7) === cigaretteMonth).reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <ScreenContainer edges={embedded ? ["top", "left", "right"] : ["top", "bottom", "left", "right"]} className="px-5">
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: embedded ? 40 : 52 }]}>
        {!embedded ? <View style={styles.header}>
          <AnimatedPressable onPress={() => router.back()} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable>
          <BrandLockup compact />
          <View style={styles.headerSpacer} />
        </View> : null}
        <Text style={[styles.title, embedded && styles.embeddedTitle]}>{label("Finance board", "Vue financière")}</Text>
        <Text style={styles.subtitle}>{label("Everything you own, owe, and plan — kept on this device.", "Ce que tu possèdes, dois et prévois — conservé sur cet appareil.")}</Text>

        <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={styles.netCard}>
          <Text style={styles.netLabel}>{label("Net worth", "Patrimoine net")}</Text>
          <Text style={styles.netValue}>{formatMoney(finance.netWorth, settings.language)}</Text>
          <Text style={styles.netCaption}>{label("Buckets + receivables − liabilities", "Comptes + créances − dettes")}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(150).springify()} style={styles.quickActionsContainer}>
          <Animated.View style={styles.quickActions}>
            <AnimatedPressable onPress={() => router.push("/transaction?kind=income" as never)} accessibilityRole="button" accessibilityLabel={label("Record income", "Ajouter un revenu")} style={({ pressed }: { pressed: boolean }) => [styles.incomeAction, pressed && styles.pressed]}><MaterialIcons name="add-circle-outline" size={19} color="#FFFFFF" /><Text style={styles.incomeActionText}>{label("Record income", "Ajouter un revenu")}</Text></AnimatedPressable>
            <AnimatedPressable onPress={() => router.push({ pathname: "/finance-manage", params: { mode: "income" } } as never)} accessibilityRole="button" accessibilityLabel={label("Plan monthly income", "Planifier le revenu mensuel")} style={({ pressed }: { pressed: boolean }) => [styles.manageAction, pressed && styles.pressed]}><MaterialIcons name="event-repeat" size={19} color="var(--color-primary)" /><Text style={styles.manageActionText}>{label("Plan income", "Planifier le revenu")}</Text></AnimatedPressable>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
          <SectionTitle title={label("Monthly income", "Revenu mensuel")} action={label("Calendar", "Calendrier")} onPress={() => router.push("/income-calendar" as never)} />
          <Card style={styles.incomeScheduleCard}>{recurringIncome.length ? recurringIncome.map((item) => <IncomeScheduleLine key={item.id} title={item.title} subtitle={`${label("Next payday", "Prochain versement")} · ${item.nextDueDate}`} amount={formatMoney(item.amount, settings.language)} />) : <EmptyState icon="payments" title={label("Plan your monthly income", "Planifie ton revenu mensuel")} body={label("Add your salary or allowance and its next payday.", "Ajoute ton salaire ou allocation et son prochain versement.")} />}</Card>
        </Animated.View>

        {false && <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
          <SectionTitle title={label("Private monthly tracker", "Suivi mensuel privé")} action={label("Open", "Ouvrir")} onPress={() => router.push("/cigarette-tracker" as never)} />
          <AnimatedPressable onPress={() => router.push("/cigarette-tracker" as never)} style={({ pressed }: { pressed: boolean }) => [styles.privateCard, pressed && styles.pressed]}><RoundIcon icon="visibility-off" color={"var(--color-primary)"} background="#EEF3FF" /><View style={styles.privateCopy}><Text style={styles.privateTitle}>{label("Cigarettes of the month", "Cigarettes du mois")}</Text><Text style={styles.privateSub}>{cigarettes.monthlyLimit === undefined ? label("No monthly limit set", "Aucune limite mensuelle") : `${label("Limit", "Limite")} · ${formatMoney(cigarettes.monthlyLimit ?? 0, settings.language)}`}</Text></View><Text style={styles.privateAmount}>{formatMoney(cigaretteSpent, settings.language)}</Text><MaterialIcons name="chevron-right" size={20} color={"var(--color-primary)"} /></AnimatedPressable>
        </Animated.View>}

        <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
          <SectionTitle title={label("Buckets", "Comptes")} action={label("Manage", "Gérer")} onPress={() => router.push({ pathname: "/finance-manage", params: { mode: "transfer" } } as never)} />
          <View style={styles.grid}>{buckets.map((bucket) => <Card key={bucket.id} style={styles.gridCard}><RoundIcon icon={bucket.icon as keyof typeof MaterialIcons.glyphMap} size={35} color={bucket.color} background={bucket.id === "cash" ? "#E7F7F1" : "#EAF0FF"} /><Text style={styles.cardLabel}>{bucket.name}</Text><Text style={styles.cardValue}>{formatMoney(bucket.balance, settings.language)}</Text></Card>)}</View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(350).springify()}>
          <SectionTitle title={label("Commitments", "Engagements")} action={label("Manage", "Gérer")} onPress={() => router.push({ pathname: "/finance-manage", params: { mode: "subscription" } } as never)} />
          <Card style={styles.listCard}>
            <Line icon="repeat" color={"var(--color-warning)"} title={label("Subscriptions", "Abonnements")} value={formatMoney(finance.subscriptionTotal, settings.language)} />
            <Line icon="event" color={"var(--color-error)"} title={label("Upcoming expenses", "Dépenses à venir")} value={formatMoney(finance.upcomingTotal, settings.language)} />
            <Line icon="receipt-long" color={"var(--color-foreground)"} title={label("Liabilities", "Dettes")} value={formatMoney(finance.liabilities, settings.language)} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400).springify()}>
          <SectionTitle title={label("Money out and back", "Argent prêté et à recevoir")} action={label("Manage", "Gérer")} onPress={() => router.push({ pathname: "/finance-manage", params: { mode: "loan" } } as never)} />
          <Card style={styles.listCard}>
            <Line icon="account-balance" color={"var(--color-success)"} title={label("Loans receivable", "Prêts à recevoir")} value={formatMoney(finance.loansReceivable, settings.language)} />
            <Line icon="swap-horiz" color={"var(--color-primary)"} title={label("Lent to others", "Prêté à d’autres")} value={formatMoney(finance.lentOutstanding, settings.language)} />
          </Card>
        </Animated.View>

        <Text style={styles.localNote}>{label("Private by default: this board is stored locally on your device.", "Privé par défaut : cette vue est conservée localement sur ton appareil.")}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

export default function FinanceBoardScreen() {
  return <FinanceBoardContent />;
}

function Line({ icon, color, title, value }: { icon: keyof typeof MaterialIcons.glyphMap; color: string; title: string; value: string }) {
  return <View style={styles.line}><RoundIcon icon={icon} size={34} color={color} background="var(--color-background)" /><Text style={styles.lineTitle}>{title}</Text><Text style={styles.lineValue}>{value}</Text></View>;
}

function IncomeScheduleLine({ title, subtitle, amount }: { title: string; subtitle: string; amount: string }) {
  return <View style={styles.incomeScheduleLine}><RoundIcon icon="payments" size={36} color={"var(--color-success)"} background="#E7F7F1" /><View style={styles.incomeScheduleCopy}><Text style={styles.incomeScheduleTitle}>{title}</Text><Text style={styles.incomeScheduleSub}>{subtitle}</Text></View><Text style={styles.incomeScheduleAmount}>{amount}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 36 },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { height: 40, width: 40, borderRadius: 14, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" },
  headerSpacer: { height: 40, width: 40, opacity: 0 },
  title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", letterSpacing: -0.7, marginTop: 12 },
  embeddedTitle: { marginTop: 14 },
  subtitle: { color: "var(--color-muted)", fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: 330 },
  netCard: { marginTop: 18, backgroundColor: "var(--color-foreground)", borderRadius: 22, padding: 20 },
  netLabel: { color: "#BFD0FF", fontSize: 13, fontWeight: "700" },
  netValue: { color: "#FFFFFF", fontSize: 34, lineHeight: 42, fontWeight: "800", marginTop: 8, fontVariant: ["tabular-nums"] },
  netCaption: { color: "#BFD0FF", fontSize: 12, marginTop: 7 },
  quickActions: { flexDirection: "row", gap: 12, marginTop: 14, justifyContent: "space-between", marginHorizontal: "auto", maxWidth: 400 },
  incomeAction: { flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: "var(--color-primary)", borderWidth: 1, borderColor: "var(--color-primary)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 2, minWidth: 140 },
  incomeActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  manageAction: { flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: "#EEF3FF", borderWidth: 1, borderColor: "#AFC4FF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minWidth: 140 },
  manageActionText: { color: "var(--color-primary)", fontSize: 13, fontWeight: "800" },
  quickActionsContainer: { marginHorizontal: "auto", maxWidth: 400 },
  incomeScheduleCard: { paddingVertical: 4 },
  incomeScheduleLine: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  incomeScheduleCopy: { flex: 1 },
  incomeScheduleTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  incomeScheduleSub: { color: "var(--color-muted)", fontSize: 11, marginTop: 3 },
  incomeScheduleAmount: { color: "var(--color-success)", fontSize: 13, fontWeight: "800" },
  privateCard: { marginTop: 0, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  privateCopy: { flex: 1 },
  privateTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  privateSub: { color: "var(--color-muted)", fontSize: 11, marginTop: 3 },
  privateAmount: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  grid: { flexDirection: "row", gap: 12 },
  gridCard: { flex: 1, padding: 15 },
  cardLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700", marginTop: 10 },
  cardValue: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800", marginTop: 4 },
  listCard: { paddingVertical: 5 },
  line: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  lineTitle: { flex: 1, color: "var(--color-foreground)", fontSize: 13, fontWeight: "700" },
  lineValue: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  localNote: { color: "var(--color-muted)", fontSize: 11, textAlign: "center", marginTop: 22, lineHeight: 16 },
  pressed: { opacity: 0.7 },
});
