import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "@/theme";

/** Common page shell: safe area + keyboard avoidance + scroll. */
export function Screen({
  children,
  scroll = true,
  refreshControl,
  edges = ["top", "bottom"],
  padded = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshControl?: ScrollViewProps["refreshControl"];
  /** Pass ["bottom"] when a ScreenHeader above this Screen already handles the top inset. */
  edges?: Edge[];
  /** False when a screen (e.g. a full-bleed map) manages its own padding. */
  padded?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={padded ? styles.scrollContent : undefined}
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padded && styles.scrollContent]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: 20, flexGrow: 1 },
});
