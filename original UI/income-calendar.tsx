import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Card, EmptyState, RoundIcon, ui } from "@/components/budget-ui";
import { formatMoney } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { useResponsiveLayout } from "@/lib/responsive-layout";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

const dueDay = (isoDate: string) => Number(isoDate.slice(8, 10));

export default function IncomeCalendarScreen() {
  const { settings, recurring } = useBudget();
  const { incomeId } = useLocalSearchParams<{ incomeId?: string }>();
  const { isCompactPhone } = useResponsiveLayout();
  const language = settings.language;
  const label = (en: string, fr: string) => language === "fr" ? fr : en;
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const income = recurring.filter((item) => item.kind === "income");
  const focusedIncome = income.find((item) => item.id === incomeId);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const focusDate = focusedIncome ? new Date(`${focusedIncome.nextDueDate}T12:00:00`) : new Date();
    return new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
  });
  const monthIncome = income.filter((item) => dueDay(item.nextDueDate) <= new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate());
  const monthTotal = monthIncome.reduce((sum, item) => sum + item.amount, 0);
  const weekdayNames = useMemo(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, index + 1))), [locale]);
  const days = useMemo(() => {
    const firstWeekday = (visibleMonth.getDay() + 6) % 7;
    const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: firstWeekday + count }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);
  }, [visibleMonth]);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className={isCompactPhone ? "px-4" : "px-5"}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><AnimatedPressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={label("Close", "Fermer")} style={styles.close}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.headerTitle}>{label("Income calendar", "Calendrier des revenus")}</Text><View style={styles.headerSpacer} /></View>
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <Text style={[styles.title, isCompactPhone && styles.titleCompact]}>{label("Monthly income", "Revenu mensuel")}</Text>
      <Text style={styles.subtitle}>{label("See your salary and allowance dates at a glance.", "Visualise rapidement tes dates de salaire et d’allocation.")}</Text>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <Card style={styles.summary}><RoundIcon icon="payments" size={40} color={"var(--color-success)"} background="#E7F7F1" /><View style={styles.summaryCopy}><Text style={styles.summaryLabel}>{label("Planned this month", "Prévu ce mois")}</Text><Text style={styles.summaryAmount}>{formatMoney(monthTotal, language)}</Text><Text style={styles.summarySub}>{monthIncome.length ? `${monthIncome.length} ${label("scheduled item", "élément programmé")}${monthIncome.length > 1 ? "s" : ""}` : label("No income planned yet", "Aucun revenu prévu")}</Text></View></Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <Card style={styles.calendarCard}><View style={styles.monthNav}><AnimatedPressable onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} accessibilityRole="button" accessibilityLabel={label("Previous month", "Mois précédent")} style={styles.monthButton}><MaterialIcons name="chevron-left" size={22} color={"var(--color-primary)"} /></AnimatedPressable><Text style={styles.monthTitle}>{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth)}</Text><AnimatedPressable onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} accessibilityRole="button" accessibilityLabel={label("Next month", "Mois suivant")} style={styles.monthButton}><MaterialIcons name="chevron-right" size={22} color={"var(--color-primary)"} /></AnimatedPressable></View>
        <View style={styles.weekdays}>{weekdayNames.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
        <View style={styles.days}>{days.map((day, index) => {
          if (!day) return <View key={`blank-${index}`} style={styles.day} />;
          const scheduled = monthIncome.filter((item) => dueDay(item.nextDueDate) === day);
          const total = scheduled.reduce((sum, item) => sum + item.amount, 0);
          return <View key={day} style={[styles.day, scheduled.length > 0 && styles.scheduledDay]}><Text style={[styles.dayNumber, scheduled.length > 0 && styles.scheduledDayNumber]}>{day}</Text>{scheduled.length ? <Text numberOfLines={1} style={styles.dayAmount}>{Math.round(total)}<Text style={styles.dayCurrency}> DH</Text></Text> : null}</View>;
        })}</View>
      </Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
      <Text style={styles.listTitle}>{label("Scheduled income", "Revenus programmés")}</Text>
      <Card style={styles.listCard}>{monthIncome.length ? monthIncome.sort((a, b) => dueDay(a.nextDueDate) - dueDay(b.nextDueDate)).map((item, index) => <View key={item.id} style={[styles.incomeRow, index !== monthIncome.length - 1 && styles.rowBorder, item.id === incomeId && styles.focusedIncomeRow]}><RoundIcon icon="payments" size={36} color={"var(--color-success)"} background="#E7F7F1" /><View style={styles.incomeCopy}><Text style={styles.incomeTitle}>{item.title}</Text><Text style={styles.incomeDate}>{label("Every month on", "Chaque mois le")} {dueDay(item.nextDueDate)}</Text></View><Text style={styles.incomeAmount}>{formatMoney(item.amount, language)}</Text></View>) : <EmptyState icon="event-available" title={label("No income scheduled", "Aucun revenu programmé")} body={label("Plan your salary or allowance to place it on this calendar.", "Planifie ton salaire ou allocation pour l’ajouter à ce calendrier.")} />}</Card>
    </Animated.View>
    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
      <AnimatedPressable onPress={() => router.push({ pathname: "/finance-manage", params: { mode: "income" } } as never)} style={({ pressed }: { pressed: boolean }) => [styles.manageButton, pressed && styles.pressed]}><MaterialIcons name="add" size={19} color="#FFFFFF" /><Text style={styles.manageText}>{label("Manage monthly income", "Gérer les revenus mensuels")}</Text></AnimatedPressable>
    </Animated.View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 32 }, header: { height: 56, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, close: { height: 40, width: 40, borderRadius: 16, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", alignItems: "center", justifyContent: "center" }, headerSpacer: { height: 40, width: 40 }, headerTitle: { color: "var(--color-foreground)", fontSize: 16, fontWeight: "800" }, title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", letterSpacing: -0.7, marginTop: 12 }, titleCompact: { fontSize: 24 }, subtitle: { color: "var(--color-muted)", fontSize: 13, lineHeight: 19, marginTop: 6 }, summary: { marginTop: 18, flexDirection: "row", gap: 12, alignItems: "center" }, summaryCopy: { flex: 1 }, summaryLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700" }, summaryAmount: { color: "var(--color-foreground)", fontSize: 25, fontWeight: "800", marginTop: 3 }, summarySub: { color: "var(--color-muted)", fontSize: 11, marginTop: 3 }, calendarCard: { marginTop: 14 }, monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, monthButton: { height: 38, width: 38, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }, monthTitle: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800" }, weekdays: { flexDirection: "row", marginTop: 18 }, weekday: { width: "14.285%", color: "var(--color-muted)", fontSize: 10, fontWeight: "800", textAlign: "center" }, days: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 }, day: { width: "14.285%", height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" }, scheduledDay: { backgroundColor: "#F1F5F9" }, dayNumber: { color: "var(--color-foreground)", fontSize: 12, fontWeight: "700" }, scheduledDayNumber: { color: "var(--color-primary)", fontWeight: "900" }, dayAmount: { color: "var(--color-primary)", fontSize: 8, fontWeight: "900", marginTop: 3 }, dayCurrency: { fontSize: 7 }, listTitle: { color: "var(--color-foreground)", fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 9 }, listCard: { paddingVertical: 4 }, incomeRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }, focusedIncomeRow: { backgroundColor: "#E7F7F1", borderRadius: 16, paddingHorizontal: 8, marginHorizontal: -4 }, rowBorder: { borderBottomWidth: 1, borderBottomColor: "var(--color-border)" }, incomeCopy: { flex: 1 }, incomeTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, incomeDate: { color: "var(--color-muted)", fontSize: 11, marginTop: 3 }, incomeAmount: { color: "var(--color-success)", fontSize: 12, fontWeight: "800" }, manageButton: { height: 52, marginTop: 16, borderRadius: 16, backgroundColor: "var(--color-primary)", flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" }, manageText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, pressed: { opacity: 0.72 }
});
