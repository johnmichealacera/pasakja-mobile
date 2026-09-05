import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useAuth } from "@/auth/AuthContext";
import { roleHome } from "@/api/auth";
import { ApiError } from "@/api/client";
import { colors, gradients, radius, spacing, typography } from "@/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(roleHome(user.role) as never);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not log in. Try again.";
      Alert.alert("Login failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}
      >
        <View style={styles.logoBadge}>
          <Ionicons name="car-sport" size={30} color="#fff" />
        </View>
        <Text style={styles.wordmark}>Pasakja</Text>
        <Text style={styles.tagline}>Community rides for Socorro</Text>
      </LinearGradient>

      <Screen edges={["bottom"]}>
        <Text style={styles.formTitle}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Log in to book or drive a ride.</Text>

        <TextField
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Button title="Log In" icon="log-in-outline" onPress={handleLogin} loading={isSubmitting} />

        <View style={styles.footer}>
          <Link href="/register" style={styles.link}>
            New here? Create an account
          </Link>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingBottom: spacing.xxl,
    alignItems: "center",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  wordmark: { fontSize: 30, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  tagline: { ...typography.body, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  formTitle: { ...typography.display, fontSize: 22, marginTop: spacing.lg },
  formSubtitle: { ...typography.body, color: colors.inkMuted, marginBottom: spacing.xl, marginTop: 4 },
  footer: { marginTop: spacing.xl, alignItems: "center" },
  link: { ...typography.bodyStrong, color: colors.teal },
});
