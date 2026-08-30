import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { BrandLockup, BrandMark, ProgressBar, ui } from "@/components/budget-ui";
import { Language } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { useResponsiveLayout } from "@/lib/responsive-layout";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function OnboardingScreen() {
  const { settings, setLanguage, t, completeOnboarding } = useBudget();
  const [step, setStep] = useState(0);
  const language = settings.language;
  const { gutter, isCompactPhone, isShortPhone } = useResponsiveLayout();

  const cards = [
    { icon: "account-balance-wallet" as const, title: t("welcome"), body: t("welcomeBody"), accent: "var(--color-primary)" },
    { icon: "school" as const, title: t("mainIncome"), body: language === "fr" ? "Bourse, allocation familiale, stage ou travail à temps partiel." : "Scholarship, family allowance, internship, or a part-time job.", accent: "var(--color-success)" },
    { icon: "event-repeat" as const, title: t("recurringExpenses"), body: language === "fr" ? "Loyer, transport, internet et abonnements sont pris en compte." : "Rent, transport, internet, and subscriptions are included in your plan.", accent: "var(--color-warning)" },
    { icon: "savings" as const, title: t("savingsGoal"), body: language === "fr" ? "Ton premier budget et tes objectifs sont prêts à évoluer avec toi." : "Your first budget and savings goals are ready to grow with you.", accent: "#7A63D2" },
  ];
  const current = cards[step];
  const lastStep = step === cards.length - 1;

  const handleContinue = () => {
    haptic.light();
    if (lastStep) {
      completeOnboarding();
      haptic.success();
      router.replace({ pathname: "/budget-edit", params: { fromOnboarding: "1" } } as never);
    } else setStep((value) => value + 1);
  };

  return (
    <View style={[styles.screen, { paddingHorizontal: gutter, paddingTop: isShortPhone ? 34 : 64, paddingBottom: isCompactPhone ? 20 : 34 }]}>
      <View style={styles.topBar}>
        <View style={styles.languageSwitch}>
          {(["en", "fr"] as Language[]).map((item) => (
            <AnimatedPressable key={item} onPress={() => { haptic.selection(); setLanguage(item); }} style={({ pressed }: { pressed: boolean }) => [styles.languageOption, language === item && styles.languageActive, pressed && styles.pressed]}>
              <Text style={[styles.languageText, language === item && styles.languageTextActive]}>{item === "en" ? "EN" : "FR"}</Text>
            </AnimatedPressable>
          ))}
        </View>
      </View>

      <View style={[styles.progressWrap, isShortPhone && styles.progressWrapShort]}><ProgressBar value={(step + 1) / cards.length} color={"var(--color-primary)"} /></View>

      <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={[styles.artwork, isShortPhone && styles.artworkShort, isCompactPhone && styles.artworkCompact, { backgroundColor: `${current.accent}15` }]}>
        <View style={[styles.artworkOrb, isCompactPhone && styles.artworkOrbCompact, { backgroundColor: current.accent }]}>{step === 0 ? <BrandMark size={isCompactPhone ? 92 : 116} radius={isCompactPhone ? 23 : 28} /> : <MaterialIcons name={current.icon} size={isCompactPhone ? 50 : 62} color="#FFFFFF" />}</View>
        <View style={[styles.dot, styles.dotOne, { backgroundColor: current.accent }]} />
        <View style={[styles.dot, styles.dotTwo, { backgroundColor: current.accent }]} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(150).springify()} style={[styles.content, isShortPhone && styles.contentShort]}>
        <Text style={styles.eyebrow}>{t("studentTip")}</Text>
        <Text style={[styles.title, isCompactPhone && styles.titleCompact]}>{current.title}</Text>
        <Text style={[styles.body, isCompactPhone && styles.bodyCompact]}>{current.body}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200).springify()} style={styles.bottom}>
        <View style={styles.dots}>{cards.map((_, index) => <View key={index} style={[styles.stepDot, index === step && styles.stepDotActive]} />)}</View>
        <AnimatedPressable onPress={handleContinue} style={({ pressed }: { pressed: boolean }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{lastStep ? t("finish") : t("continue")}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </AnimatedPressable>
        {!lastStep ? <AnimatedPressable onPress={() => { completeOnboarding(); router.replace("/(tabs)" as never); }} style={({ pressed }: { pressed: boolean }) => [styles.skip, pressed && styles.pressed]}><Text style={styles.skipText}>{t("skip")}</Text></AnimatedPressable> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "var(--color-background)", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 34 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  languageSwitch: { flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 24, padding: 4, gap: 4, borderWidth: 1, borderColor: "var(--color-border)" },
  languageOption: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, minWidth: 64, alignItems: "center", justifyContent: "center" },
  languageActive: { backgroundColor: "var(--color-surface)", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  languageText: { color: "var(--color-muted)", fontWeight: "600", fontSize: 13 },
  languageTextActive: { color: "var(--color-primary)", fontWeight: "800" },
  progressWrap: { marginTop: 28 },
  progressWrapShort: { marginTop: 18 },
  artwork: { marginTop: 54, height: 260, borderRadius: 44, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  artworkShort: { marginTop: 30, height: 205, borderRadius: 34 },
  artworkCompact: { height: 220, borderRadius: 36 },
  artworkOrb: { width: 146, height: 146, borderRadius: 42, alignItems: "center", justifyContent: "center", shadowColor: "var(--color-primary)", shadowOpacity: 0.2, shadowRadius: 28, elevation: 4 },
  artworkOrbCompact: { width: 120, height: 120, borderRadius: 34 },
  dot: { position: "absolute", borderRadius: 99, opacity: 0.25 },
  dotOne: { width: 30, height: 30, right: 48, top: 45 },
  dotTwo: { width: 18, height: 18, left: 55, bottom: 45 },
  content: { flex: 1, paddingTop: 40 },
  contentShort: { paddingTop: 24 },
  eyebrow: { fontSize: 13, fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: 0.6 },
  title: { marginTop: 13, color: "var(--color-foreground)", fontSize: 32, lineHeight: 39, fontWeight: "800", letterSpacing: -0.8 },
  titleCompact: { fontSize: 28, lineHeight: 34 },
  body: { marginTop: 14, color: "var(--color-muted)", fontSize: 16, lineHeight: 24 },
  bodyCompact: { fontSize: 15, lineHeight: 22 },
  bottom: { alignItems: "center" },
  dots: { flexDirection: "row", gap: 7, marginBottom: 24 },
  stepDot: { height: 7, width: 7, borderRadius: 7, backgroundColor: "var(--color-border)" },
  stepDotActive: { width: 25, backgroundColor: "var(--color-primary)" },
  primaryButton: { width: "100%", height: 56, borderRadius: 16, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, minWidth: 200, shadowColor: "var(--color-primary)", shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  skip: { paddingVertical: 16, paddingHorizontal: 18 },
  skipText: { color: "var(--color-muted)", fontWeight: "700", fontSize: 14 },
  pressed: { opacity: 0.78 }
});
