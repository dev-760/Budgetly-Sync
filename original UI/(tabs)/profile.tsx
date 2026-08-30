import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";

import { BrandLockup, Card, EmptyState, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { Language } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function ProfileScreen() {
  const { settings, goals, recurring, setLanguage, toggleNotifications, clearLocalData, t } = useBudget();
  const profileName = settings.displayName || (settings.language === "fr" ? "Ton profil" : "Your profile");
  const localProfileSubtitle = settings.language === "fr" ? "Nom et photo enregistrés sur cet appareil" : "Name and photo stored on this device";
  const confirmReset = () => Alert.alert(t("clearLocalData"), settings.language === "fr" ? "Cette action efface les données financières enregistrées sur cet appareil." : "This erases the finance data saved on this device.", [{ text: t("cancel"), style: "cancel" }, { text: t("clearLocalData"), style: "destructive", onPress: () => { clearLocalData(); haptic.success(); } }]);
  return (
    <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}><View><Text style={styles.title}>{t("profile")}</Text><Text style={styles.subtitle}>{t("studentTip")}</Text></View></View>

      <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
        <AnimatedPressable onPress={() => router.push("/profile-edit" as never)} accessibilityRole="button" accessibilityLabel={settings.language === "fr" ? "Modifier le profil" : "Edit profile"} style={({ pressed }: { pressed: boolean }) => [styles.profileCard, styles.profileCardCentered, pressed && styles.pressed]}><View style={styles.avatar}>{settings.profileImageUri ? <Image source={{ uri: settings.profileImageUri }} style={styles.avatarImage} /> : <MaterialIcons name="person" size={28} color="#FFFFFF" />}</View><View style={{ flex: 1 }}><Text style={styles.name}>{profileName}</Text><Text style={styles.profileSub}>{localProfileSubtitle}</Text></View><View style={styles.editPill}><Text style={styles.editPillText}>{settings.language === "fr" ? "Modifier" : "Edit"}</Text></View><MaterialIcons name="chevron-right" size={24} color={"var(--color-muted)"} /></AnimatedPressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
        <SectionTitle title={t("preferences")} action={settings.language === "fr" ? "Réglages" : "Settings"} onPress={() => router.push("/settings" as never)} />
        <Card style={styles.settingsCard}><Text style={styles.settingLabel}>{t("language")}</Text><View style={styles.languageRow}>{(["en", "fr"] as Language[]).map((language) => <AnimatedPressable key={language} onPress={() => { haptic.selection(); setLanguage(language); }} style={({ pressed }: { pressed: boolean }) => [styles.languageButton, settings.language === language && styles.languageButtonActive, pressed && styles.pressed]}><Text style={[styles.languageText, settings.language === language && styles.languageTextActive]}>{language === "en" ? t("english") : t("french")}</Text></AnimatedPressable>)}</View><View style={styles.divider} /><View style={styles.settingRow}><View style={styles.rowLeft}><RoundIcon icon="notifications" size={36} color={"var(--color-primary)"} background="#EAF0FF" /><Text style={styles.settingText}>{t("notificationsEnabled")}</Text></View><Switch value={settings.notificationsEnabled} onValueChange={() => { haptic.medium(); toggleNotifications(); }} trackColor={{ false: "var(--color-border)", true: "var(--color-primary)" }} thumbColor={settings.notificationsEnabled ? "var(--color-primary)" : "#FFFFFF"} /></View><View style={styles.divider} /><View style={styles.settingRow}><View style={styles.rowLeft}><RoundIcon icon="payments" size={36} color={"var(--color-success)"} background="#E7F7F1" /><Text style={styles.settingText}>{t("currency")}</Text></View><Text style={styles.currency}>MAD · DH</Text></View></Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
        <SectionTitle title={t("goals")} action={t("addGoal")} onPress={() => router.push("/goal" as never)} />
        <Card>{goals.length ? goals.map((goal, index) => <AnimatedPressable key={goal.id} onPress={() => router.push("/goal" as never)} style={({ pressed }: { pressed: boolean }) => [styles.goalRow, index !== goals.length - 1 && styles.goalBorder, pressed && styles.pressed]}><RoundIcon icon={goal.icon as keyof typeof MaterialIcons.glyphMap} size={40} color="#7A63D2" background="var(--color-surface)" /><View style={{ flex: 1 }}><Text style={styles.goalTitle}>{goal.title}</Text><Text style={styles.goalSub}>{goal.savedAmount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} / {goal.targetAmount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} DH</Text></View><MaterialIcons name="chevron-right" size={21} color={"var(--color-muted)"} /></AnimatedPressable>) : <EmptyState icon="flag" title={settings.language === "fr" ? "Ton premier objectif" : "Your first goal"} body={settings.language === "fr" ? "Ajoute un objectif pour visualiser ta progression ici." : "Add a goal to see your progress here."} />}</Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
        <SectionTitle title={t("recurringItems")} />
        <Card>{recurring.length ? recurring.map((item, index) => <View key={item.id} style={[styles.goalRow, index !== recurring.length - 1 && styles.goalBorder]}><RoundIcon icon="repeat" size={40} color={"var(--color-warning)"} background="#FFF3D8" /><View style={{ flex: 1 }}><Text style={styles.goalTitle}>{item.title}</Text><Text style={styles.goalSub}>{item.amount.toLocaleString(settings.language === "fr" ? "fr-MA" : "en-US")} DH · {t("recurring")}</Text></View></View>) : <EmptyState icon="event-repeat" title={settings.language === "fr" ? "Pas encore de paiement régulier" : "No recurring payments yet"} body={settings.language === "fr" ? "Les dépenses régulières apparaîtront ici." : "Regular expenses will appear here."} />}</Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(350).springify()}>
        <AnimatedPressable onPress={confirmReset} accessibilityRole="button" accessibilityLabel={t("clearLocalData")} style={({ pressed }: { pressed: boolean }) => [styles.reset, pressed && styles.pressed]}><MaterialIcons name="restart-alt" size={18} color={"var(--color-error)"} /><Text style={styles.resetText}>{t("clearLocalData")}</Text></AnimatedPressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(400).springify()} style={styles.brandFooter}>
        <BrandLockup compact />
        <AnimatedPressable onPress={() => require('react-native').Linking.openURL("https://github.com/dev-760")} style={({ pressed }: { pressed: boolean }) => [pressed && styles.pressed, { marginTop: 12 }]}>
          <Text style={{ color: "var(--color-muted)", fontSize: 13, fontWeight: "600" }}>
            Developed by dev
          </Text>
        </AnimatedPressable>
      </Animated.View>

    </ScrollView></ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 28 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
  title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: "var(--color-muted)", fontSize: 12, marginTop: 5 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 24, padding: 18, marginBottom: 20 },
  profileCardCentered: { marginHorizontal: "auto", maxWidth: 400 },
  avatar: { height: 60, width: 60, borderRadius: 20, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" },
  avatarImage: { width: "100%", height: "100%", borderRadius: 20 },
  name: { color: "var(--color-foreground)", fontSize: 18, fontWeight: "800" },
  profileSub: { color: "var(--color-muted)", fontSize: 13, marginTop: 4, lineHeight: 18 },
  editPill: { backgroundColor: "#EEF3FF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  editPillText: { color: "var(--color-primary)", fontSize: 12, fontWeight: "800" },
  settingsCard: { paddingVertical: 6 },
  settingLabel: { color: "var(--color-muted)", fontSize: 12, fontWeight: "700", paddingTop: 10, paddingHorizontal: 10 },
  languageRow: { flexDirection: "row", gap: 8, padding: 10 },
  languageButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "var(--color-background)", borderWidth: 1, borderColor: "var(--color-border)" },
  languageButtonActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" },
  languageText: { color: "var(--color-muted)", fontWeight: "700", fontSize: 13 },
  languageTextActive: { color: "var(--color-primary)" },
  divider: { height: 1, backgroundColor: "var(--color-border)", marginHorizontal: 10 },
  settingRow: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingText: { color: "var(--color-foreground)", fontSize: 14, fontWeight: "700" },
  currency: { color: "var(--color-muted)", fontSize: 13, fontWeight: "700" },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12 },
  goalBorder: { borderBottomWidth: 1, borderBottomColor: "var(--color-border)" },
  goalTitle: { color: "var(--color-foreground)", fontSize: 14, fontWeight: "800" },
  goalSub: { color: "var(--color-muted)", fontSize: 12, marginTop: 3 },
  reset: { marginTop: 22, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, padding: 12 },
  resetText: { color: "var(--color-error)", fontSize: 13, fontWeight: "700" },
  brandFooter: { marginTop: 32, alignItems: "center", paddingBottom: 20 },
  pressed: { opacity: 0.7 },
});
