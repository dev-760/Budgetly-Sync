import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useBudget, useBudgetStore } from "@/lib/budget-store";
import { ThemeProvider, useThemeContext } from "@/lib/theme-provider";
import { ToastProvider } from "@/lib/toast-context";

const isBudgetlyReminderRoute = (route: unknown): route is "/finance-board" | `/goal?goalId=${string}` | `/income-calendar?incomeId=${string}` => typeof route === "string" && (route === "/finance-board" || route.startsWith("/goal?goalId=") || route.startsWith("/income-calendar?incomeId="));

function ReminderNavigationObserver() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    const navigate = (notification: Notifications.Notification) => {
      const route = notification.request.content.data?.route;
      if (isBudgetlyReminderRoute(route)) router.push(route as never);
    };
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) navigate(lastResponse.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => navigate(response.notification));
    return () => subscription.remove();
  }, []);
  return null;
}

function AppearanceBridge() {
  const { settings } = useBudget();
  const { setColorScheme, setVisualTheme, colorScheme } = useThemeContext();
  useEffect(() => {
    setVisualTheme(settings.appearance.visualTheme);
    if (settings.appearance.colorScheme !== colorScheme) setColorScheme(settings.appearance.colorScheme);
  }, [colorScheme, setColorScheme, setVisualTheme, settings.appearance.colorScheme, settings.appearance.visualTheme]);
  return <StatusBar style={settings.appearance.colorScheme === "dark" ? "light" : "dark"} />;
}

function BudgetStoreBootstrap({ children }: { children: React.ReactNode }) {
  const initialize = useBudgetStore((state) => state.initialize);
  useEffect(() => { void initialize(); }, [initialize]);
  return <>{children}</>;
}

export default function RootLayout() {
  const isWeb = Platform.OS === "web";
  return (
    <ThemeProvider>
    <BudgetStoreBootstrap>
      <ToastProvider>
      <AppearanceBridge />
      <ReminderNavigationObserver />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="budget-edit" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="goal" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="notifications" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="finance-board" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="finance-manage" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="monthly-limit" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="profile-edit" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="cigarette-tracker" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="income-calendar" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
        <Stack.Screen name="settings" options={{ presentation: isWeb ? "card" : "modal", animation: isWeb ? "fade" : "slide_from_bottom" }} />
      </Stack>
      </ToastProvider>
    </BudgetStoreBootstrap>
    </ThemeProvider>
  );
}
