import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography } from "@/theme";
import type { StatusPresentation } from "@/lib/statusPresentation";

/** A status pill built from the centralized status-presentation maps — color + icon + humanized label together. */
export function Badge({ label, color, bg, icon }: StatusPresentation) {
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={13} color={color} style={styles.icon} /> : null}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  icon: { marginRight: 4 },
  text: { ...typography.micro, fontWeight: "700" },
});
