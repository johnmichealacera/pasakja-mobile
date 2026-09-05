import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { gradients, typography } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimension]} />;
  }

  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fallback, dimension]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: "#e2e8f0" },
  fallback: { alignItems: "center", justifyContent: "center" },
  initial: { ...typography.title, color: "#fff", fontWeight: "800" },
});
