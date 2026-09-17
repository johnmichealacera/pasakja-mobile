import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";
import type { PickedFile } from "@/api/uploads";

/**
 * Gallery photos on Android/iOS are often HEIC/HEIF, or reported as
 * `image/jpg` (not a real MIME type). Cloudinary's `/image/upload`
 * endpoint then rejects them with "incompatible with this resource type".
 * Re-encode to JPEG so the file bytes match a type Cloudinary accepts.
 */
export async function toUploadableJpeg(asset: ImagePickerAsset, fallbackName: string): Promise<PickedFile> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > 1600) {
    context.resize({ width: 1600 });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  const base = (asset.fileName ?? fallbackName).replace(/\.[^.]+$/, "") || "photo";
  return {
    uri: result.uri,
    name: `${base}.jpg`,
    mimeType: "image/jpeg",
  };
}

export const IMAGE_LIBRARY_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.8,
};

export const IMAGE_CAMERA_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.8,
};
