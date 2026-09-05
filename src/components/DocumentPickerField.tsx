import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/Button";
import { colors } from "@/theme";
import type { PickedFile } from "@/api/uploads";

export interface UploadedDocument {
  type: string;
  url: string;
  filename: string;
}

interface DocumentPickerFieldProps {
  label: string;
  required?: boolean;
  docType: string;
  upload: (file: PickedFile) => Promise<{ url: string }>;
  onUploaded: (doc: UploadedDocument | null) => void;
}

/**
 * Only supports image capture/selection (no PDF) — the web app also accepts
 * PDFs for these documents, but photos of the physical document are enough
 * for a capstone demo and avoid pulling in expo-document-picker.
 */
export function DocumentPickerField({
  label,
  required,
  docType,
  upload,
  onUploaded,
}: DocumentPickerFieldProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function pickAndUpload(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to continue.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const file: PickedFile = {
      uri: asset.uri,
      name: asset.fileName ?? `${docType.toLowerCase()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
    };

    setIsUploading(true);
    try {
      const { url } = await upload(file);
      setPreviewUri(asset.uri);
      onUploaded({ type: docType, url, filename: file.name });
    } catch (err) {
      Alert.alert("Upload failed", err instanceof Error ? err.message : "Please try again.");
      onUploaded(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : " (optional)"}
      </Text>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.preview} />
      ) : null}
      <View style={styles.row}>
        <View style={styles.buttonWrap}>
          <Button title="Camera" variant="outline" onPress={() => pickAndUpload("camera")} loading={isUploading} />
        </View>
        <View style={styles.buttonWrap}>
          <Button title="Gallery" variant="outline" onPress={() => pickAndUpload("library")} loading={isUploading} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8 },
  preview: { width: 96, height: 96, borderRadius: 10, marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  buttonWrap: { flex: 1 },
});
