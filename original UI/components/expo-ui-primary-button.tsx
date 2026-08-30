import { Button, Host } from "@expo/ui";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

type ExpoUiPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

/**
 * Uses Expo UI's universal bridge: Jetpack Compose on Android, SwiftUI on iOS,
 * and the Expo UI web implementation on web. The host seed color keeps the
 * platform-native control aligned with Budgetly's cobalt brand.
 */
export function ExpoUiPrimaryButton({ label, onPress, style }: ExpoUiPrimaryButtonProps) {
  if (Platform.OS === "android") {
    return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.androidFallback, style, pressed && styles.pressed]}><Text style={styles.androidFallbackText}>{label}</Text></Pressable>;
  }
  return (
    <View style={[styles.wrapper, style]}>
      <Host matchContents seedColor="var(--color-primary)" style={styles.host}>
        <Button label={label} variant="filled" onPress={onPress} />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { minHeight: 48, width: "100%", justifyContent: "center" },
  host: { width: "100%" },
  androidFallback: { minHeight: 52, width: "100%", borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-primary)" },
  androidFallbackText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
