import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface StatTileProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string | number;
  label: string;
  tone?: "teal" | "emerald" | "amber" | "ink";
}

const TONE_COLOR: Record<NonNullable<StatTileProps["tone"]>, string> = {
  teal: colors.teal,
  emerald: colors.emerald,
  amber: colors.amberDark,
  ink: colors.ink,
};

export function StatTile({ icon, value, label, tone = "teal" }: StatTileProps) {
  const tint = TONE_COLOR[tone];
  return (
    <View style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: `${tint}1a` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    minWidth: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: { ...typography.title, fontSize: 18 },
  label: { ...typography.caption, marginTop: 2 },
});
