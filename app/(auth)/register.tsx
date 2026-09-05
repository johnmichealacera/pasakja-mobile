import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { DocumentPickerField, UploadedDocument } from "@/components/DocumentPickerField";
import { useAuth } from "@/auth/AuthContext";
import * as authApi from "@/api/auth";
import { roleHome } from "@/api/auth";
import { uploadDriverDocument, uploadPassengerDocument } from "@/api/uploads";
import { VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { PASSENGER_DOC_TYPES } from "@/lib/verificationDocTypes";
import { colors } from "@/theme";

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

      <View style={styles.roleToggle}>
        {(["PASSENGER", "DRIVER"] as Role[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[styles.roleOption, role === r && styles.roleOptionActive]}
          >
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
              {r === "PASSENGER" ? "Passenger" : "Driver"}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Full name" value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {role === "DRIVER" ? (
        <>
          <TextField label="Driver's license number" value={licenseNo} onChangeText={setLicenseNo} />
          <Text style={styles.label}>Vehicle type</Text>
          <View style={[styles.roleToggle, { marginBottom: 16 }]}>
            {VEHICLE_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setVehicleType(type)}
                style={[styles.roleOption, vehicleType === type && styles.roleOptionActive]}
              >
                <Text style={[styles.roleText, vehicleType === type && styles.roleTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextField label="Vehicle plate number" value={vehiclePlate} onChangeText={setVehiclePlate} />
          <TextField label="Vehicle model" value={vehicleModel} onChangeText={setVehicleModel} />

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
        </>
      ) : (
        PASSENGER_DOC_TYPES.filter((d) => d.key !== "OTHER").map((docType) => (
          <DocumentPickerField
            key={docType.key}
            label={docType.label}
            docType={docType.key}
            upload={uploadPassengerDocument}
            onUploaded={(doc) => setDoc(docType.key, doc)}
          />
        ))
      )}

      <Button title="Create Account" onPress={handleSubmit} loading={isSubmitting} />

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Link href="/login" style={{ color: colors.primary, fontWeight: "600" }}>
          Already have an account? Log in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 6 },
  roleToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  roleOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleText: { color: colors.text, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
});
