import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { ui } from "@/components/budget-ui";
import { useResponsiveLayout } from "@/lib/responsive-layout";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
};

const fromIsoDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const candidate = new Date(year, (month || 1) - 1, day || 1, 12);
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
};

const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const sameDate = (left: Date, right: Date) => toIsoDate(left) === toIsoDate(right);

/** A consistent Budgetly calendar sheet instead of the platform-specific system picker. */
export function DatePickerField({ value, onChange, accessibilityLabel }: DatePickerFieldProps) {
  const { isCompactPhone } = useResponsiveLayout();
  const selectedDate = fromIsoDate(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const weekdayNames = useMemo(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, index + 1))), [locale]);
  const calendarDays = useMemo(() => {
    const firstWeekday = (visibleMonth.getDay() + 6) % 7;
    const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: firstWeekday + dayCount }, (_, index) => index < firstWeekday ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstWeekday + 1, 12));
  }, [visibleMonth]);
  const openSheet = () => { setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)); setOpen(true); };
  const choose = (date: Date) => { onChange(toIsoDate(date)); setOpen(false); };

  return <View>
    <Pressable onPress={openSheet} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.field, isCompactPhone && styles.fieldCompact, pressed && styles.pressed]}>
      <View style={styles.dateLabel}><MaterialIcons name="calendar-month" size={18} color={"var(--color-primary)"} /><Text style={styles.value}>{new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(selectedDate)}</Text></View>
      <MaterialIcons name="expand-more" size={20} color={"var(--color-primary)"} />
    </Pressable>
    <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}><Pressable style={styles.backdrop} onPress={() => setOpen(false)} /><View style={[styles.sheet, isCompactPhone && styles.sheetCompact]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>BUDGETLY</Text><Text style={styles.sheetTitle}>Choose date</Text></View><Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close calendar" style={styles.closeButton}><MaterialIcons name="close" size={20} color={"var(--color-foreground)"} /></Pressable></View>
        <View style={styles.monthNav}><Pressable onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.monthButton}><MaterialIcons name="chevron-left" size={22} color={"var(--color-primary)"} /></Pressable><Text style={styles.monthTitle}>{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth)}</Text><Pressable onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} accessibilityRole="button" accessibilityLabel="Next month" style={styles.monthButton}><MaterialIcons name="chevron-right" size={22} color={"var(--color-primary)"} /></Pressable></View>
        <View style={styles.weekdays}>{weekdayNames.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
        <View style={styles.days}>{calendarDays.map((date, index) => date ? <Pressable key={toIsoDate(date)} onPress={() => choose(date)} accessibilityRole="button" accessibilityLabel={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date)} accessibilityState={{ selected: sameDate(date, selectedDate) }} style={({ pressed }) => [styles.day, sameDate(date, selectedDate) && styles.daySelected, pressed && styles.dayPressed]}><Text style={[styles.dayText, sameDate(date, selectedDate) && styles.dayTextSelected]}>{date.getDate()}</Text></Pressable> : <View key={`blank-${index}`} style={styles.day} />)}</View>
        <Pressable onPress={() => choose(new Date())} style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}><Text style={styles.todayText}>Use today</Text></Pressable>
      </View></View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  field: { height: 52, borderWidth: 1, borderColor: "#C9D6FF", borderRadius: 16, paddingHorizontal: 14, backgroundColor: "var(--color-surface)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldCompact: { height: 48, borderRadius: 14, paddingHorizontal: 12 }, dateLabel: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }, value: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,32,51,0.42)" }, backdrop: { ...StyleSheet.absoluteFill }, sheet: { backgroundColor: "var(--color-surface)", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 30, maxHeight: "80%" }, sheetCompact: { paddingHorizontal: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, sheetHandle: { height: 4, width: 38, borderRadius: 99, backgroundColor: "#DDE2EC", alignSelf: "center" },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 }, sheetEyebrow: { color: "var(--color-primary)", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, sheetTitle: { color: "var(--color-foreground)", fontSize: 23, fontWeight: "800", marginTop: 3 }, closeButton: { height: 40, width: 40, borderRadius: 14, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22 }, monthButton: { height: 40, width: 40, borderRadius: 13, borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" }, monthTitle: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800" },
  weekdays: { flexDirection: "row", marginTop: 18 }, weekday: { width: "14.285%", color: "var(--color-muted)", fontSize: 11, textAlign: "center", fontWeight: "800" }, days: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 }, day: { width: "14.285%", height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14 }, daySelected: { backgroundColor: "var(--color-primary)" }, dayPressed: { opacity: 0.7, transform: [{ scale: 0.94 }] }, dayText: { color: "var(--color-foreground)", fontSize: 14, fontWeight: "700" }, dayTextSelected: { color: "#FFFFFF", fontWeight: "800" },
  todayButton: { height: 48, borderRadius: 15, marginTop: 18, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center" }, todayText: { color: "var(--color-primary)", fontSize: 14, fontWeight: "800" }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
