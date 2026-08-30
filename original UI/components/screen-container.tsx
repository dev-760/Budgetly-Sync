import { StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";
import { useResponsiveLayout } from "@/lib/responsive-layout";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
  /**
   * Whether to disable safe area padding (useful for modals that handle their own spacing)
   */
  disableSafeAreaPadding?: boolean;
}

/** A container component that properly handles SafeArea and background colors. */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  disableSafeAreaPadding = false,
  style,
  ...props
}: ScreenContainerProps) {
  const { gutter } = useResponsiveLayout();
  return (
    <View
      style={styles.root}
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={[styles.safeArea, style]}
      >
        <View className={cn("flex-1", className)} style={[styles.content, { paddingHorizontal: disableSafeAreaPadding ? 0 : gutter }]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  safeArea: { flex: 1, minHeight: 0 },
  content: { flex: 1, minHeight: 0, width: "100%" },
});
