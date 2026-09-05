import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { useAuth } from "@/auth/AuthContext";
import { uploadProfileImage } from "@/api/uploads";
import { updateProfile } from "@/api/profile";
import { colors } from "@/theme";

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
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      const { url } = await uploadProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? "profile.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      await updateProfile({ profileImage: url });
      setAvatarUri(asset.uri);
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
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={changePhoto} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
          )}
          <Text style={styles.changePhoto}>{isUploading ? "Uploading…" : "Change photo"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <InfoRow label="Name" value={user?.name || "—"} />
        <InfoRow label="Email" value={user?.email || "—"} />
        <InfoRow label="Role" value={user?.role || "—"} />
      </View>

      <Button title="Sign Out" variant="danger" onPress={handleLogout} />
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 24 },
  avatarWrap: { alignItems: "center" },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 32, fontWeight: "700" },
  changePhoto: { marginTop: 8, color: colors.primary, fontWeight: "600" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: { color: colors.muted, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
