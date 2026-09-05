import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}

export function TextField({ label, error, icon, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.inkFaint} style={styles.icon} /> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.inkFaint}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.bodyStrong, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  inputError: { borderColor: colors.danger },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
