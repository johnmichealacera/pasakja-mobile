import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/auth/tokenStorage";
import { ApiError } from "@/api/client";

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

async function uploadFile(
  path: string,
  file: PickedFile,
  { auth }: { auth: boolean }
): Promise<{ url: string }> {
  const form = new FormData();
  // React Native's fetch accepts this shape for a file part; not a browser File/Blob.
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const headers: Record<string, string> = {};
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: form,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? "Upload failed", data);
  }
  return data as { url: string };
}

/** Authenticated generic upload (profile photo). Matches /api/upload. */
export function uploadProfileImage(file: PickedFile) {
  return uploadFile("/api/upload", file, { auth: true });
}

/** No auth — used during registration, before the account exists. */
export function uploadDriverDocument(file: PickedFile) {
  return uploadFile("/api/upload/driver-docs", file, { auth: false });
}

/** No auth — used during registration, before the account exists. */
export function uploadPassengerDocument(file: PickedFile) {
  return uploadFile("/api/upload/passenger-docs", file, { auth: false });
}
