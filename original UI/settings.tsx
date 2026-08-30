import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Card, RoundIcon, SectionTitle, ui } from "@/components/budget-ui";
import { ScreenContainer } from "@/components/screen-container";
import type { VisualThemeId } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { useThemeContext, visualThemes } from "@/lib/theme-provider";
import { useToast } from "@/lib/toast-context";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

const colors = ["var(--color-primary)", "var(--color-success)", "#D67A1F", "#7A63D2", "#D55A9B", "#1F9BB0"];
const icons = ["category", "local-grocery-store", "pets", "fitness-center", "sports-esports", "spa"];

export default function SettingsModal() {
  const { settings, addCustomExpenseCategory, updateCustomExpenseCategory, removeCustomExpenseCategory, setAppearancePreferences, setNotificationPreferences, toggleNotifications, syncReminders } = useBudget();
  const { palette } = useThemeContext();
  const { showSuccess } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState(icons[0]);
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const resetForm = () => { setEditingId(null); setName(""); setColor(colors[0]); setIcon(icons[0]); };
  const saveCategory = () => {
    const input = { name, color, icon };
    const saved = editingId ? updateCustomExpenseCategory(editingId, input) : addCustomExpenseCategory(input);
    if (!saved) { haptic.error(); return; }
    haptic.success();
    showSuccess(label(editingId ? "Category updated" : "Category added", editingId ? "Catégorie modifiée" : "Catégorie ajoutée"));
    resetForm();
  };
  const beginEdit = (id: string) => {
    const current = settings.customExpenseCategories.find((item) => item.id === id);
    if (!current) return;
    setEditingId(id); setName(current.name); setColor(current.color); setIcon(current.icon);
  };
  const remove = (id: string, title: string) => Alert.alert(label("Remove category?", "Supprimer la catégorie ?"), title, [
    { text: label("Cancel", "Annuler"), style: "cancel" },
    { text: label("Remove", "Supprimer"), style: "destructive", onPress: () => {
      if (!removeCustomExpenseCategory(id)) { Alert.alert(label("Category in use", "Catégorie utilisée"), label("Move or delete its transactions and budget before removing it.", "Déplace ou supprime ses transactions et son budget avant de la retirer.")); return; }
      haptic.medium(); showSuccess(label("Category removed", "Catégorie supprimée"));
    } },
  ]);
  const schedule = async () => {
    const scheduled = await syncReminders();
    if (scheduled) { haptic.success(); showSuccess(label("Reminder preferences applied", "Préférences de rappel appliquées")); }
    else { haptic.error(); Alert.alert(label("Reminders need permission", "Autorisation nécessaire"), label("Allow notifications in your device settings, then try again.", "Autorise les notifications dans les réglages de l’appareil, puis réessaie.")); }
  };
  const preferenceRows: { key: keyof typeof settings.notificationPreferences; icon: keyof typeof MaterialIcons.glyphMap; en: string; fr: string; descriptionEn: string; descriptionFr: string }[] = [
    { key: "goalDeadlines", icon: "flag", en: "Goal deadlines", fr: "Échéances d’objectifs", descriptionEn: "Target-date reminders", descriptionFr: "Rappels de dates cibles" },
    { key: "scheduledIncome", icon: "event-available", en: "Scheduled income", fr: "Revenus programmés", descriptionEn: "Payday reminders", descriptionFr: "Rappels de versements" },
    { key: "subscriptionDue", icon: "subscriptions", en: "Subscriptions", fr: "Abonnements", descriptionEn: "Upcoming subscription dates", descriptionFr: "Prochaines échéances" },
    { key: "loanDue", icon: "account-balance", en: "Loans", fr: "Prêts", descriptionEn: "Loan-payment dates", descriptionFr: "Dates de remboursement" },
  ];
  const themeOptions = Object.entries(visualThemes) as [VisualThemeId, (typeof visualThemes)[VisualThemeId]][];

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} style={{ flex: 1, minHeight: 0 }}><View style={styles.header}><AnimatedPressable onPress={() => router.back()} style={({ pressed }: { pressed: boolean }) => [styles.close, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={"var(--color-foreground)"} /></AnimatedPressable><View><Text style={styles.title}>{label("Settings", "Réglages")}</Text><Text style={styles.subtitle}>{label("Local controls for your spending plan", "Contrôles locaux de ton budget")}</Text></View><View style={styles.close} /></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
      <SectionTitle title={label("Appearance", "Apparence")} />
      <Card style={{ ...appearanceStyles.card, backgroundColor: palette.surface, borderColor: palette.border }}><View style={[appearanceStyles.modeRow, { borderBottomColor: palette.border }]}><View style={{ flex: 1 }}><Text style={[appearanceStyles.modeTitle, { color: palette.foreground }]}>{label("Dark mode", "Mode sombre")}</Text><Text style={[appearanceStyles.modeBody, { color: palette.muted }]}>{label("A calmer interface for low-light study sessions.", "Une interface plus douce pour les sessions d’étude en faible lumière.")}</Text></View><Switch value={settings.appearance.colorScheme === "dark"} onValueChange={(enabled) => { haptic.medium(); setAppearancePreferences({ colorScheme: enabled ? "dark" : "light" }); }} trackColor={{ false: "#D5DBE8", true: palette.primary }} thumbColor="#FFFFFF" /></View><Text style={[appearanceStyles.themeLabel, { color: palette.muted }]}>{label("Accent theme", "Thème d’accentuation")}</Text><View style={appearanceStyles.themeRow}>{themeOptions.map(([theme, details]) => <AnimatedPressable key={theme} accessibilityRole="radio" accessibilityState={{ selected: settings.appearance.visualTheme === theme }} onPress={() => { haptic.selection(); setAppearancePreferences({ visualTheme: theme }); showSuccess(label(`${details.name} theme selected`, `Thème ${details.name} sélectionné`)); }} style={({ pressed }: { pressed: boolean }) => [appearanceStyles.themeOption, { borderColor: settings.appearance.visualTheme === theme ? details.primary : palette.border, backgroundColor: settings.appearance.visualTheme === theme ? details.soft : palette.background }, pressed && styles.pressed]}><View style={[appearanceStyles.themeDot, { backgroundColor: details.primary }]} /><Text style={[appearanceStyles.themeName, { color: settings.appearance.visualTheme === theme ? details.primary : palette.foreground }]}>{details.name}</Text></AnimatedPressable>)}</View></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
      <SectionTitle title={label("Expense categories", "Catégories de dépenses")} />
      <Card style={styles.explainer}><RoundIcon icon="category" size={36} color={"var(--color-primary)"} background="#EAF0FF" /><View style={{ flex: 1 }}><Text style={styles.explainerTitle}>{label("Your categories, on this device", "Tes catégories, sur cet appareil")}</Text><Text style={styles.explainerText}>{label("Create a category for expense entry. Built-in categories stay available.", "Crée une catégorie pour tes dépenses. Les catégories intégrées restent disponibles.")}</Text></View></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <Card style={styles.formCard}><Text style={styles.formTitle}>{editingId ? label("Edit category", "Modifier la catégorie") : label("New category", "Nouvelle catégorie")}</Text><TextInput value={name} onChangeText={setName} maxLength={24} placeholder={label("e.g. Sports", "ex. Sport")} placeholderTextColor="var(--color-muted)" style={styles.input} /><Text style={styles.formLabel}>{label("Color", "Couleur")}</Text><View style={styles.choiceRow}>{colors.map((item) => <AnimatedPressable key={item} onPress={() => setColor(item)} accessibilityRole="radio" accessibilityState={{ selected: color === item }} style={({ pressed }: { pressed: boolean }) => [styles.colorChoice, { backgroundColor: item }, color === item && styles.colorChoiceActive, pressed && styles.pressed]} />)}</View><Text style={styles.formLabel}>{label("Icon", "Icône")}</Text><View style={styles.choiceRow}>{icons.map((item) => <AnimatedPressable key={item} onPress={() => setIcon(item)} accessibilityRole="radio" accessibilityState={{ selected: icon === item }} style={({ pressed }: { pressed: boolean }) => [styles.iconChoice, icon === item && styles.iconChoiceActive, pressed && styles.pressed]}><MaterialIcons name={item as keyof typeof MaterialIcons.glyphMap} size={19} color={icon === item ? "var(--color-primary)" : "var(--color-muted)"} /></AnimatedPressable>)}</View><View style={styles.formActions}><AnimatedPressable onPress={saveCategory} style={({ pressed }: { pressed: boolean }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>{editingId ? label("Save changes", "Enregistrer") : label("Add category", "Ajouter")}</Text></AnimatedPressable>{editingId ? <AnimatedPressable onPress={resetForm} style={({ pressed }: { pressed: boolean }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>{label("Cancel", "Annuler")}</Text></AnimatedPressable> : null}</View></Card>
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
      {settings.customExpenseCategories.length ? <Card style={styles.listCard}>{settings.customExpenseCategories.map((item, index) => <View key={item.id} style={[styles.categoryRow, index < settings.customExpenseCategories.length - 1 && styles.divider]}><RoundIcon icon={item.icon as keyof typeof MaterialIcons.glyphMap} size={38} color={item.color} background={`${item.color}18`} /><Text style={styles.categoryName}>{item.name}</Text><AnimatedPressable onPress={() => beginEdit(item.id)} style={({ pressed }: { pressed: boolean }) => [styles.smallAction, pressed && styles.pressed]}><MaterialIcons name="edit" size={17} color={"var(--color-primary)"} /></AnimatedPressable><AnimatedPressable onPress={() => remove(item.id, item.name)} style={({ pressed }: { pressed: boolean }) => [styles.smallAction, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={18} color={"var(--color-error)"} /></AnimatedPressable></View>)}</Card> : null}
    </Animated.View>

    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
      <SectionTitle title={label("Notifications", "Notifications")} />
      <Card style={styles.notificationCard}><View style={styles.masterRow}><View style={styles.masterCopy}><Text style={styles.masterTitle}>{label("Device reminders", "Rappels de l’appareil")}</Text><Text style={styles.masterBody}>{label("Only local notifications. Nothing is sent to a server.", "Notifications uniquement locales. Rien n’est envoyé à un serveur.")}</Text></View><Switch value={settings.notificationsEnabled} onValueChange={() => { haptic.medium(); toggleNotifications(); }} trackColor={{ false: "var(--color-border)", true: "var(--color-primary)" }} thumbColor={settings.notificationsEnabled ? "var(--color-primary)" : "#FFFFFF"} /></View>{preferenceRows.map((item) => <View key={item.key} style={styles.preferenceRow}><View style={styles.preferenceCopy}><Text style={styles.preferenceTitle}>{label(item.en, item.fr)}</Text><Text style={styles.preferenceBody}>{label(item.descriptionEn, item.descriptionFr)}</Text></View><Switch disabled={!settings.notificationsEnabled} value={settings.notificationPreferences[item.key]} onValueChange={(value) => { haptic.selection(); setNotificationPreferences({ [item.key]: value }); }} trackColor={{ false: "var(--color-border)", true: "var(--color-primary)" }} thumbColor={settings.notificationPreferences[item.key] && settings.notificationsEnabled ? "var(--color-primary)" : "#FFFFFF"} /></View>)}<AnimatedPressable onPress={schedule} style={({ pressed }: { pressed: boolean }) => [styles.schedule, !settings.notificationsEnabled && styles.disabled, pressed && styles.pressed]} disabled={!settings.notificationsEnabled}><MaterialIcons name="notifications-active" size={18} color="#FFFFFF" /><Text style={styles.scheduleText}>{label("Apply reminder preferences", "Appliquer les préférences")}</Text></AnimatedPressable></Card>
    </Animated.View>
  </ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 68, flexDirection: "row", alignItems: "center", gap: 12 }, close: { height: 40, width: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)" }, title: { color: "var(--color-foreground)", fontSize: 17, fontWeight: "800" }, subtitle: { color: "var(--color-muted)", fontSize: 11, marginTop: 2 }, content: { paddingTop: 8, paddingBottom: 34 }, explainer: { flexDirection: "row", gap: 11, alignItems: "center", marginBottom: 12 }, explainerTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, explainerText: { color: "var(--color-muted)", fontSize: 11, lineHeight: 16, marginTop: 3 }, formCard: { padding: 15 }, formTitle: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "800" }, input: { height: 50, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", borderRadius: 16, paddingHorizontal: 13, color: "var(--color-foreground)", fontSize: 14, marginTop: 13 }, formLabel: { color: "var(--color-muted)", fontSize: 11, fontWeight: "800", marginTop: 13, marginBottom: 7 }, choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" }, colorChoice: { height: 28, width: 28, borderRadius: 14, borderWidth: 3, borderColor: "transparent" }, colorChoiceActive: { borderColor: "var(--color-foreground)" }, iconChoice: { height: 38, width: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }, iconChoiceActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" }, formActions: { flexDirection: "row", gap: 10, marginTop: 18 }, primary: { flex: 1, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: "var(--color-primary)" }, primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 }, secondary: { paddingHorizontal: 14, justifyContent: "center" }, secondaryText: { color: "var(--color-muted)", fontSize: 12, fontWeight: "800" }, listCard: { marginTop: 12, paddingVertical: 4 }, categoryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }, categoryName: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800", flex: 1 }, smallAction: { height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "var(--color-background)" }, divider: { borderBottomWidth: 1, borderBottomColor: "var(--color-border)" }, notificationCard: { padding: 15 }, masterRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: "var(--color-border)" }, masterCopy: { flex: 1 }, masterTitle: { color: "var(--color-foreground)", fontSize: 14, fontWeight: "800" }, masterBody: { color: "var(--color-muted)", fontSize: 11, lineHeight: 16, marginTop: 3 }, preferenceRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "var(--color-border)" }, preferenceCopy: { flex: 1 }, preferenceTitle: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800" }, preferenceBody: { color: "var(--color-muted)", fontSize: 10, marginTop: 3 }, schedule: { minHeight: 48, borderRadius: 14, marginTop: 14, backgroundColor: "var(--color-foreground)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 }, scheduleText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.7 },
});

const appearanceStyles = StyleSheet.create({
  card: { padding: 15 },
  modeRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 14, borderBottomWidth: 1 },
  modeTitle: { fontSize: 14, fontWeight: "800" }, modeBody: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  themeLabel: { fontSize: 11, fontWeight: "800", marginTop: 14, marginBottom: 8 },
  themeRow: { flexDirection: "row", gap: 8 }, themeOption: { flex: 1, minHeight: 76, borderRadius: 14, borderWidth: 1.5, padding: 9, justifyContent: "space-between" },
  themeDot: { height: 18, width: 18, borderRadius: 9 }, themeName: { fontSize: 11, fontWeight: "800" },
});
