import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/auth/AuthContext";
import { uploadProfileImage } from "@/api/uploads";
import { updateProfile } from "@/api/profile";
import { IMAGE_LIBRARY_OPTIONS, toUploadableJpeg } from "@/lib/pickedImage";
import { colors, radius, spacing, typography } from "@/theme";

const ROLE_LABEL: Record<string, string> = {
  PASSENGER: "Passenger",
  DRIVER: "Driver",
  ADMIN: "Admin",
};

export function ProfileScreenBody() {
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function changePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_LIBRARY_OPTIONS);
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      const file = await toUploadableJpeg(asset, "profile.jpg");
      const { url } = await uploadProfileImage(file);
      await updateProfile({ profileImage: url });
      setAvatarUri(file.uri);
    } catch (err) {
      Alert.alert("Upload failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Profile" subtitle="Manage your account" />
      <Screen edges={["bottom"]}>
        <View style={styles.avatarSection}>
          <Pressable onPress={changePhoto} style={styles.avatarWrap}>
            <Avatar name={user?.name} uri={avatarUri} size={92} />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.name}>{user?.name ?? "—"}</Text>
          <Text style={styles.changePhoto}>{isUploading ? "Uploading…" : "Tap to change photo"}</Text>
        </View>

        <Card style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email || "—"} />
          <View style={styles.divider} />
          <InfoRow icon="shield-checkmark-outline" label="Role" value={ROLE_LABEL[user?.role ?? ""] ?? "—"} />
        </Card>

        <Button title="Sign Out" variant="danger" icon="log-out-outline" onPress={handleLogout} />
      </Screen>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.inkFaint} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  avatarSection: { alignItems: "center", marginTop: -spacing.xxl, marginBottom: spacing.xl },
  avatarWrap: { position: "relative" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.title, marginTop: spacing.md },
  changePhoto: { ...typography.caption, color: colors.teal, marginTop: 2 },
  card: { marginBottom: spacing.xl },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  infoIcon: { marginRight: spacing.md },
  infoLabel: { ...typography.body, color: colors.inkMuted, flex: 1 },
  infoValue: { ...typography.bodyStrong },
  divider: { height: 1, backgroundColor: colors.border },
});
