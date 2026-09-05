import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useAuth } from "@/auth/AuthContext";
import { roleHome } from "@/api/auth";
import { ApiError } from "@/api/client";
import { colors } from "@/theme";

export default function LoginScreen() {
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
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text, marginBottom: 4 }}>
        Pasakja
      </Text>
      <Text style={{ fontSize: 15, color: colors.muted, marginBottom: 28 }}>
        Log in to book or drive a ride.
      </Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <Button title="Log In" onPress={handleLogin} loading={isSubmitting} />

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Link href="/register" style={{ color: colors.primary, fontWeight: "600" }}>
          New here? Create an account
        </Link>
      </View>
    </Screen>
  );
}
