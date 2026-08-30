import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandLockup, ui } from "@/components/budget-ui";
import { useBudget } from "@/lib/budget-store";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

export default function ProfileEditScreen() {
  const { settings, updateProfile } = useBudget();
  const isFrench = settings.language === "fr";
  const label = (en: string, fr: string) => isFrench ? fr : en;
  const [displayName, setDisplayName] = useState(settings.displayName ?? "");
  const [profileImageUri, setProfileImageUri] = useState(settings.profileImageUri);

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) setProfileImageUri(result.assets[0].uri);
  };

  const save = () => {
    updateProfile({ displayName: displayName.trim(), profileImageUri });
    router.back();
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={label("Close profile editor", "Fermer l’éditeur de profil")} style={({ pressed }: { pressed: boolean }) => [styles.iconButton, pressed && styles.pressed]}>
              <MaterialIcons name="close" size={22} color={"var(--color-foreground)"} />
            </AnimatedPressable>
            <BrandLockup compact />
            <AnimatedPressable onPress={save} accessibilityRole="button" accessibilityLabel={label("Save profile", "Enregistrer le profil")} style={({ pressed }: { pressed: boolean }) => [styles.headerSave, pressed && styles.pressed]}>
              <Text style={styles.headerSaveText}>{label("Save", "Enregistrer")}</Text>
            </AnimatedPressable>
          </View>
          <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
            <Text style={styles.title}>{label("Edit profile", "Modifier le profil")}</Text>
            <Text style={styles.subtitle}>{label("Your name and photo stay on this device. Nothing is uploaded.", "Ton nom et ta photo restent sur cet appareil. Rien n’est envoyé en ligne.")}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
            <View style={styles.photoSection}>
              <AnimatedPressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel={label("Choose profile photo", "Choisir une photo de profil")} style={({ pressed }: { pressed: boolean }) => [styles.avatar, pressed && styles.pressed]}>
                {profileImageUri ? <Image source={{ uri: profileImageUri }} style={styles.avatarImage} /> : <MaterialIcons name="person" size={42} color="#FFFFFF" />}
                <View style={styles.camera}><MaterialIcons name="photo-camera" size={15} color="#FFFFFF" /></View>
              </AnimatedPressable>
              <AnimatedPressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel={label("Change profile photo", "Changer la photo de profil")} style={({ pressed }: { pressed: boolean }) => pressed && styles.pressed}><Text style={styles.changePhoto}>{profileImageUri ? label("Change photo", "Changer la photo") : label("Add a profile photo", "Ajouter une photo")}</Text></AnimatedPressable>
            </View>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
            <View style={styles.form}>
              <Text style={styles.eyebrow}>{label("PERSONAL", "PERSONNEL")}</Text>
              <Text style={styles.label}>{label("Name", "Nom")}</Text>
              <TextInput value={displayName} onChangeText={setDisplayName} placeholder={label("Your name", "Ton nom")} placeholderTextColor="#9AA5B8" autoCapitalize="words" autoCorrect style={styles.input} maxLength={60} returnKeyType="done" onSubmitEditing={save} />
              <Text style={styles.helper}>{label("This helps make your dashboard feel personal.", "Cela personnalise ton tableau de bord.")}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24 },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  iconButton: { height: 40, width: 40, borderRadius: 14, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", alignItems: "center", justifyContent: "center" },
  title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", marginTop: 22, letterSpacing: -0.8 },
  subtitle: { color: "var(--color-muted)", fontSize: 13, lineHeight: 19, marginTop: 7 },
  photoSection: { alignItems: "center", marginTop: 25 },
  avatar: { width: 104, height: 104, borderRadius: 34, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center", overflow: "visible" },
  avatarImage: { width: "100%", height: "100%", borderRadius: 34 },
  camera: { position: "absolute", right: -4, bottom: -4, width: 32, height: 32, borderRadius: 12, backgroundColor: "var(--color-foreground)", borderWidth: 3, borderColor: "var(--color-background)", alignItems: "center", justifyContent: "center" },
  changePhoto: { color: "var(--color-primary)", fontSize: 13, fontWeight: "800", marginTop: 13 },
  form: { marginTop: 28, gap: 9, backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderWidth: 1, borderRadius: 20, padding: 16 },
  eyebrow: { color: "var(--color-primary)", fontSize: 11, fontWeight: "800", letterSpacing: 0.9 },
  label: { color: "var(--color-foreground)", fontSize: 13, fontWeight: "800", marginTop: 5 },
  input: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-foreground)", fontSize: 15, paddingHorizontal: 15 },
  helper: { color: "var(--color-muted)", fontSize: 12, lineHeight: 17 },
  headerSave: { height: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "var(--color-primary)", alignItems: "center", justifyContent: "center" },
  headerSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
