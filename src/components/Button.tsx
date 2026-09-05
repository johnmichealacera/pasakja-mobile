import React, { useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radius, typography } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
}

/** Primary buttons carry the brand gradient and a light haptic tap — the app's one recurring "feel". */
export function Button({ title, onPress, variant = "primary", icon, loading, disabled }: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  }
  function handlePress() {
    if (variant === "primary" || variant === "danger") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }

  const textColor =
    variant === "outline" ? colors.teal : variant === "ghost" ? colors.teal : colors.onBrand;

  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <View style={styles.row}>
      {icon ? <Ionicons name={icon} size={18} color={textColor} style={styles.icon} /> : null}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        style={[isDisabled && styles.disabled]}
      >
        {variant === "primary" ? (
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.base}
          >
            {content}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.base,
              variant === "secondary" && styles.secondary,
              variant === "outline" && styles.outline,
              variant === "danger" && styles.danger,
              variant === "ghost" && styles.ghost,
            ]}
          >
            {content}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 8 },
  secondary: { backgroundColor: colors.emerald },
  danger: { backgroundColor: colors.coral },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.teal },
  ghost: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.5 },
  text: { ...typography.subtitle, color: colors.onBrand },
});
