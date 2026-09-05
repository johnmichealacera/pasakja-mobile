import { apiRequest } from "@/api/client";

export function registerPushToken(pushToken: string) {
  return apiRequest("/api/mobile/register-push-token", { method: "POST", body: { pushToken } });
}

export function unregisterPushToken() {
  return apiRequest("/api/mobile/register-push-token", { method: "DELETE" });
}
