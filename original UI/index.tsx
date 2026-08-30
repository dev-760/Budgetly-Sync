import { ActivityIndicator, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { ui } from "@/components/budget-ui";
import { useBudget } from "@/lib/budget-store";

export default function Index() {
  const { hydrated, settings, storageError } = useBudget();
  if (!hydrated) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background)" }}><ActivityIndicator color={"var(--color-primary)"} /></View>;
  if (storageError) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background)", padding: 28 }}><Text style={{ color: "var(--color-foreground)", fontSize: 19, fontWeight: "800", textAlign: "center" }}>{settings.language === "fr" ? "Stockage sécurisé requis" : "Secure storage required"}</Text><Text style={{ color: "var(--color-muted)", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 }}>{settings.language === "fr" ? "Budgetly nécessite une version native avec le stockage chiffré activé pour protéger tes données." : "Budgetly requires a native build with encrypted storage enabled to protect your data."}</Text></View>;
  return <Redirect href={(settings.onboardingComplete ? "/(tabs)" : "/onboarding") as never} />;
}
