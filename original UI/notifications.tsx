import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { EmptyState, RoundIcon, ui } from "@/components/budget-ui";
import { formatDate } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function NotificationsScreen() {
  const { settings, notifications, markNotificationsRead, t } = useBudget();
  const unread = notifications.some((item) => !item.isRead);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><View style={styles.header}><AnimatedPressable onPress={() => router.back()} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><Text style={styles.title}>{t("notifications")}</Text><AnimatedPressable disabled={!unread} onPress={() => { markNotificationsRead(); haptic.success(); }} style={({ pressed }: { pressed: boolean }) => [styles.markAll, !unread && styles.markAllDisabled, pressed && styles.pressed]}><Text style={[styles.markAllText, !unread && styles.markAllTextDisabled]}>{t("markAllRead")}</Text></AnimatedPressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>{notifications.length === 0 ? <EmptyState icon="notifications-none" title={t("noNotifications")} body="" /> : notifications.map((item, index) => { const color = item.type === "warning" ? "var(--color-warning)" : item.type === "success" ? "var(--color-success)" : "var(--color-primary)"; const icon = item.type === "warning" ? "priority-high" : item.type === "success" ? "check" : "event"; return <Animated.View key={item.id} entering={FadeInDown.duration(400).delay(100 + index * 50).springify()}><View style={[styles.notification, !item.isRead && styles.unread]}><RoundIcon icon={icon} size={42} color={color} background={`${color}18`} /><View style={styles.main}><Text style={styles.notificationTitle}>{t(item.titleKey as Parameters<typeof t>[0])}</Text><Text style={styles.notificationBody}>{t(item.bodyKey as Parameters<typeof t>[0])}</Text><Text style={styles.date}>{formatDate(item.createdAt, settings.language)}</Text></View>{!item.isRead ? <View style={styles.unreadDot} /> : null}</View></Animated.View>; })}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { height: 40, width: 40, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", alignItems: "center", justifyContent: "center" },
  title: { color: "var(--color-foreground)", fontSize: 17, fontWeight: "800" },
  markAll: { paddingVertical: 8, paddingLeft: 8 },
  markAllDisabled: { opacity: 0.45 },
  markAllText: { color: "var(--color-primary)", fontSize: 12, fontWeight: "800" },
  markAllTextDisabled: { color: "var(--color-muted)" },
  content: { paddingTop: 14, paddingBottom: 28 },
  notification: { minHeight: 92, backgroundColor: "var(--color-surface)", borderRadius: 20, borderWidth: 1, borderColor: "var(--color-border)", marginBottom: 10, padding: 14, flexDirection: "row", gap: 11 },
  unread: { borderColor: "var(--color-border)", backgroundColor: "#F8FAFC" },
  main: { flex: 1, paddingRight: 7 },
  notificationTitle: { color: "var(--color-foreground)", fontSize: 14, fontWeight: "800" },
  notificationBody: { color: "var(--color-muted)", fontSize: 12, lineHeight: 17, marginTop: 4 },
  date: { color: "var(--color-muted)", fontSize: 11, marginTop: 7, fontWeight: "600" },
  unreadDot: { height: 8, width: 8, borderRadius: 99, backgroundColor: "var(--color-primary)", marginTop: 3 },
  pressed: { opacity: 0.72 },
});
