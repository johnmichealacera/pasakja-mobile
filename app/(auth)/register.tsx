import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DocumentPickerField, UploadedDocument } from "@/components/DocumentPickerField";
import { useAuth } from "@/auth/AuthContext";
import * as authApi from "@/api/auth";
import { roleHome } from "@/api/auth";
import { uploadDriverDocument, uploadPassengerDocument } from "@/api/uploads";
import { VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { PASSENGER_DOC_TYPES } from "@/lib/verificationDocTypes";
import { colors, radius, spacing, typography } from "@/theme";

type Role = "PASSENGER" | "DRIVER";

export default function RegisterScreen() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("PASSENGER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [licenseNo, setLicenseNo] = useState("");
  const [vehicleType, setVehicleType] = useState<string>(VEHICLE_TYPES[0]);
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const [documents, setDocuments] = useState<Record<string, UploadedDocument>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setDoc(key: string, doc: UploadedDocument | null) {
    setDocuments((prev) => {
      const next = { ...prev };
      if (doc) next[key] = doc;
      else delete next[key];
      return next;
    });
  }

  async function handleSubmit() {
    if (!name || !email || !password) {
      Alert.alert("Missing info", "Name, email, and password are required.");
      return;
    }
    if (role === "DRIVER") {
      if (!licenseNo || !vehiclePlate || !vehicleModel) {
        Alert.alert("Missing info", "License number, plate, and model are required for drivers.");
        return;
      }
      if (!documents.DRIVERS_LICENSE || !documents.VEHICLE_REGISTRATION) {
        Alert.alert(
          "Documents required",
          "Upload your driver's license and vehicle registration to continue."
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const docs = Object.values(documents);
      if (role === "DRIVER") {
        await authApi.register({
          role: "DRIVER",
          name,
          email: email.trim(),
          password,
          phone: phone || undefined,
          licenseNo,
          vehicleType,
          vehiclePlate,
          vehicleModel,
          documents: docs,
        });
      } else {
        await authApi.register({
          role: "PASSENGER",
          name,
          email: email.trim(),
          password,
          phone: phone || undefined,
          documents: docs,
        });
      }

      const user = await login(email.trim(), password);
      router.replace(roleHome(user.role) as never);
    } catch (err) {
      Alert.alert(
        "Registration failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join Pasakja as a passenger or a driver.</Text>

      <View style={styles.roleToggle}>
        <RoleOption
          icon="person"
          label="Passenger"
          active={role === "PASSENGER"}
          onPress={() => setRole("PASSENGER")}
        />
        <RoleOption icon="car" label="Driver" active={role === "DRIVER"} onPress={() => setRole("DRIVER")} />
      </View>

      <TextField label="Full name" icon="person-outline" value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
      <TextField
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField label="Phone (optional)" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry />

      {role === "DRIVER" ? (
        <>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <TextField label="Driver's license number" icon="card-outline" value={licenseNo} onChangeText={setLicenseNo} />
          <Text style={styles.label}>Vehicle type</Text>
          <View style={[styles.roleToggle, { marginBottom: spacing.lg }]}>
            {VEHICLE_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setVehicleType(type)}
                style={[styles.vehicleChip, vehicleType === type && styles.vehicleChipActive]}
              >
                <Text style={[styles.vehicleChipText, vehicleType === type && styles.roleTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextField label="Vehicle plate number" icon="pricetag-outline" value={vehiclePlate} onChangeText={setVehiclePlate} />
          <TextField label="Vehicle model" icon="construct-outline" value={vehicleModel} onChangeText={setVehicleModel} />

          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <Card style={styles.docsCard}>
            <DocumentPickerField
              label="Driver's License"
              required
              docType="DRIVERS_LICENSE"
              upload={uploadDriverDocument}
              onUploaded={(doc) => setDoc("DRIVERS_LICENSE", doc)}
            />
            <DocumentPickerField
              label="Vehicle Registration (OR/CR)"
              required
              docType="VEHICLE_REGISTRATION"
              upload={uploadDriverDocument}
              onUploaded={(doc) => setDoc("VEHICLE_REGISTRATION", doc)}
            />
            <DocumentPickerField
              label="Government-Issued ID"
              docType="VALID_ID"
              upload={uploadDriverDocument}
              onUploaded={(doc) => setDoc("VALID_ID", doc)}
            />
          </Card>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Verification Documents (optional)</Text>
          <Card style={styles.docsCard}>
            {PASSENGER_DOC_TYPES.filter((d) => d.key !== "OTHER").map((docType) => (
              <DocumentPickerField
                key={docType.key}
                label={docType.label}
                docType={docType.key}
                upload={uploadPassengerDocument}
                onUploaded={(doc) => setDoc(docType.key, doc)}
              />
            ))}
          </Card>
        </>
      )}

      <Button title="Create Account" icon="checkmark-circle-outline" onPress={handleSubmit} loading={isSubmitting} />

      <View style={styles.footer}>
        <Link href="/login" style={styles.link}>
          Already have an account? Log in
        </Link>
      </View>
    </Screen>
  );
}

function RoleOption({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.roleOption, active && styles.roleOptionActive]}>
      <Ionicons name={icon} size={18} color={active ? "#fff" : colors.inkMuted} />
      <Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.display, fontSize: 24 },
  subtitle: { ...typography.body, color: colors.inkMuted, marginTop: 4, marginBottom: spacing.xl },
  label: { ...typography.bodyStrong, marginBottom: spacing.sm },
  sectionTitle: { ...typography.title, fontSize: 15, marginTop: spacing.md, marginBottom: spacing.md },
  roleToggle: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  roleText: { ...typography.bodyStrong, color: colors.inkMuted },
  roleTextActive: { color: "#fff" },
  vehicleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  vehicleChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  vehicleChipText: { ...typography.caption, fontWeight: "700", color: colors.inkMuted },
  docsCard: { gap: spacing.sm, marginBottom: spacing.lg },
  footer: { marginTop: spacing.xl, alignItems: "center" },
  link: { ...typography.bodyStrong, color: colors.teal },
});
