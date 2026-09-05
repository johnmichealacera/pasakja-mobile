import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { gradients, radius, spacing, typography } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Extra content inside the gradient — a stat row, a CTA, a status banner. */
  children?: React.ReactNode;
}

/** The app's one hero treatment per screen — everything below it stays calm and bordered. */
export function ScreenHeader({ title, subtitle, right, children }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + spacing.md }]}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  textCol: { flex: 1 },
  title: { ...typography.display, color: "#ffffff" },
  subtitle: { ...typography.body, color: "rgba(255,255,255,0.85)", marginTop: 4 },
});
