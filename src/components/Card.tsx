import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  /** "flat" (bordered, no shadow) is the default for dense lists; "elevated" is for the few things that matter most on a screen. */
  variant?: "flat" | "elevated" | "muted";
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = "flat", style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === "flat" && styles.flat,
        variant === "elevated" && styles.elevated,
        variant === "muted" && styles.muted,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  flat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadow.md,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
});
