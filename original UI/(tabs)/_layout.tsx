import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";
import { useBudget } from "@/lib/budget-store";
import { useResponsiveLayout } from "@/lib/responsive-layout";
import { useThemeContext } from "@/lib/theme-provider";

const screens: { name: "index" | "transactions" | "budget" | "finance" | "insights" | "profile"; titleKey: "home" | "transactions" | "budget" | "finance" | "insights" | "profile"; icon: IconSymbolName }[] = [
  { name: "index", titleKey: "home", icon: "house.fill" },
  { name: "transactions", titleKey: "transactions", icon: "list.bullet" },
  { name: "budget", titleKey: "budget", icon: "chart.pie.fill" },
  { name: "finance", titleKey: "finance", icon: "wallet.pass.fill" },
  { name: "insights", titleKey: "insights", icon: "chart.line.uptrend.xyaxis" },
  { name: "profile", titleKey: "profile", icon: "person.fill" },
];

export default function TabLayout() {
  const { t } = useBudget();
  const { palette } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { isCompactPhone, isTablet } = useResponsiveLayout();
  const showLabels = isTablet;
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const mobileTabHeight = showLabels ? 64 + bottomPadding : (isCompactPhone ? 50 : 54) + bottomPadding;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarButton: HapticTab, tabBarActiveTintColor: palette.primary, tabBarInactiveTintColor: palette.muted, tabBarShowLabel: showLabels, tabBarLabelPosition: "below-icon", sceneStyle: { paddingTop: 0, backgroundColor: palette.background }, tabBarStyle: { position: Platform.OS === "web" ? "fixed" : "relative", height: mobileTabHeight, paddingTop: showLabels ? 8 : isCompactPhone ? 3 : 5, paddingBottom: bottomPadding, paddingHorizontal: 2, backgroundColor: palette.surface, borderTopColor: palette.border, borderTopWidth: 1, borderBottomColor: "transparent", borderBottomWidth: 0, shadowColor: "#000000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }, tabBarLabelStyle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.1 }, tabBarItemStyle: { flex: 1, borderRadius: isCompactPhone ? 11 : 14, marginHorizontal: 0, marginVertical: isCompactPhone ? 2 : 3 } }}>
      {screens.map((screen) => <Tabs.Screen key={screen.name} name={screen.name} options={{ title: t(screen.titleKey), tabBarAccessibilityLabel: t(screen.titleKey), tabBarIcon: ({ color }) => <IconSymbol name={screen.icon} size={showLabels ? 23 : isCompactPhone ? 22 : 25} color={color} /> }} />)}
    </Tabs>
  );
}
