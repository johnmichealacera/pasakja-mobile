import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
}

/** An empty screen is an invitation to act, not just an absence — icon + plain-language direction. */
export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.teal} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { ...typography.subtitle, textAlign: "center" },
  subtitle: { ...typography.caption, textAlign: "center", marginTop: 4 },
});
