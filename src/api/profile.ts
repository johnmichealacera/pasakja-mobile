import { apiRequest } from "@/api/client";

export function updateProfile(input: { profileImage?: string }) {
  return apiRequest("/api/profile", { method: "PATCH", body: input });
}

export function listPassengerDocuments() {
  return apiRequest("/api/passenger/documents");
}

export function addPassengerDocument(doc: { type: string; url: string; filename: string }) {
  return apiRequest("/api/passenger/documents", { method: "POST", body: doc });
}

export function deletePassengerDocument(id: string) {
  return apiRequest(`/api/passenger/documents/${id}`, { method: "DELETE" });
}
