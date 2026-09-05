import React, { useCallback, useState } from "react";
import { Alert, Linking, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { listSosAlerts, resolveSos } from "@/api/sos";
import { listBookings, resolveDispute } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking, SosAlert } from "@/types";
import { colors } from "@/theme";

export default function AdminSosScreen() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [disputes, setDisputes] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [sosAlerts, disputedBookings] = await Promise.all([
        listSosAlerts(),
        listBookings({ disputeStatus: "REQUESTED", limit: 50 }),
      ]);
      setAlerts(sosAlerts);
      setDisputes(disputedBookings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleResolveSos(id: string) {
    await resolveSos(id, true);
    load();
  }

  async function handleDispute(id: string, action: "approve" | "deny") {
    setActioningId(id);
    try {
      await resolveDispute(id, action);
      load();
    } catch (err) {
      Alert.alert("Could not resolve dispute", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setActioningId(null);
    }
  }

  const unresolved = alerts.filter((a) => !a.isResolved);
  const resolved = alerts.filter((a) => a.isResolved);

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>SOS — Unresolved ({unresolved.length})</Text>
      {unresolved.map((a) => (
        <View key={a.id} style={styles.alertCard}>
          <Text style={styles.alertMessage}>{a.message || "No message provided"}</Text>
          <Text style={styles.alertMeta}>{new Date(a.createdAt).toLocaleString()}</Text>
          <View style={styles.rowGap}>
            <Button
              title="Open in Maps"
              variant="outline"
              onPress={() => Linking.openURL(`https://www.google.com/maps?q=${a.lat},${a.lng}`)}
            />
            <Button title="Mark Resolved" onPress={() => handleResolveSos(a.id)} />
          </View>
        </View>
      ))}
      {!isLoading && unresolved.length === 0 ? (
        <Text style={{ color: colors.muted, marginBottom: 20 }}>No active SOS alerts.</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Refund Disputes ({disputes.length})</Text>
      {disputes.map((b) => (
        <View key={b.id} style={styles.disputeCard}>
          <Text style={styles.alertMessage}>{b.disputeReason || "No reason given"}</Text>
          <Text style={styles.alertMeta}>
            {b.passenger?.user?.name ?? "Passenger"} · ₱{b.fare != null ? Number(b.fare).toFixed(2) : "—"}
          </Text>
          <View style={styles.rowGap}>
            <View style={{ flex: 1 }}>
              <Button
                title="Deny"
                variant="outline"
                onPress={() => handleDispute(b.id, "deny")}
                loading={actioningId === b.id}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Approve Refund"
                onPress={() => handleDispute(b.id, "approve")}
                loading={actioningId === b.id}
              />
            </View>
          </View>
        </View>
      ))}
      {!isLoading && disputes.length === 0 ? (
        <Text style={{ color: colors.muted, marginBottom: 20 }}>No pending disputes.</Text>
      ) : null}

      <Text style={styles.sectionTitle}>SOS — Resolved ({resolved.length})</Text>
      {resolved.slice(0, 10).map((a) => (
        <View key={a.id} style={[styles.alertCard, styles.resolvedCard]}>
          <Text style={styles.alertMeta}>{new Date(a.createdAt).toLocaleString()}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10, marginTop: 12 },
  alertCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  disputeCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  resolvedCard: { backgroundColor: colors.card, borderColor: colors.border },
  alertMessage: { color: colors.text, fontWeight: "600" },
  alertMeta: { color: colors.muted, fontSize: 12 },
  rowGap: { flexDirection: "row", gap: 10 },
});
