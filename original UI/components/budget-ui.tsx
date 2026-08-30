import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

import { formatMoney, Language } from "@/lib/budget-data";

export function BrandMark({ size = 42, radius = 14 }: { size?: number; radius?: number }) {
  return <Image source={require("@/assets/images/budgetly-logo-mark.png")} resizeMode="contain" style={{ width: size, height: size, borderRadius: radius, backgroundColor: "var(--color-surface)" }} />;
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return <View style={styles.brandLockup}><BrandMark size={compact ? 34 : 40} radius={compact ? 11 : 13} /><Text style={[styles.brandName, compact && styles.brandNameCompact]}>Budgetly</Text></View>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onPress ? <Pressable onPress={onPress} style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}><Text style={styles.sectionActionText}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function ProgressBar({ value, color = "var(--color-primary)", trackColor = "var(--color-border)" }: { value: number; color?: string; trackColor?: string }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.min(Math.max(value, 0), 1) * 100}%`, { damping: 20, stiffness: 90 })
  }));
  return <View style={[styles.progressTrack, { backgroundColor: trackColor }]}><Animated.View style={[styles.progressFill, { backgroundColor: color }, animatedStyle]} /></View>;
}

export function RoundIcon({ icon, color = "var(--color-primary)", background = "#EAF0FF", size = 42 }: { icon: keyof typeof MaterialIcons.glyphMap; color?: string; background?: string; size?: number }) {
  return <View style={[styles.roundIcon, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}><MaterialIcons name={icon} size={Math.round(size * 0.48)} color={color} /></View>;
}

export function MoneyText({ amount, language, type, style }: { amount: number; language: Language; type?: "income" | "expense"; style?: object }) {
  const sign = type === "income" ? "positive" : type === "expense" ? "negative" : undefined;
  return <Text style={[styles.money, type === "income" ? styles.income : type === "expense" ? styles.expense : null, style]}>{formatMoney(amount, language, sign)}</Text>;
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; body: string }) {
  return <View style={styles.emptyState}><RoundIcon icon={icon} size={52} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}

export const ui = { navy: "var(--color-foreground)", muted: "var(--color-muted)", cobalt: "var(--color-primary)", mint: "var(--color-success)", amber: "var(--color-warning)", coral: "var(--color-error)", cloud: "var(--color-background)", lilac: "var(--color-surface)", border: "var(--color-border)" };

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 16, borderWidth: 1, shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "var(--color-foreground)", letterSpacing: -0.3 },
  sectionAction: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#EEF3FF", borderRadius: 12 },
  sectionActionText: { color: "var(--color-primary)", fontWeight: "800", fontSize: 12 },
  progressTrack: { height: 8, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  roundIcon: { alignItems: "center", justifyContent: "center" },
  money: { color: "var(--color-foreground)", fontWeight: "800", fontVariant: ["tabular-nums"] },
  income: { color: "var(--color-success)" },
  expense: { color: "var(--color-error)" },
  emptyState: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 28, minHeight: 120 },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: "700", color: "var(--color-foreground)", textAlign: "center" },
  emptyBody: { marginTop: 8, color: "var(--color-muted)", textAlign: "center", fontSize: 14, lineHeight: 22, maxWidth: 280 },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandName: { color: "var(--color-foreground)", fontSize: 22, fontWeight: "800", letterSpacing: -0.7 },
  brandNameCompact: { fontSize: 18 },
  pressed: { opacity: 0.65 },
});
