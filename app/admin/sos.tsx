import React, { useCallback, useState } from "react";
import { Alert, Linking, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { listSosAlerts, resolveSos } from "@/api/sos";
import { listBookings, resolveDispute } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking, SosAlert } from "@/types";
import { colors, spacing, typography } from "@/theme";

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
      <Text style={styles.sectionTitle}>🚨 Unresolved SOS ({unresolved.length})</Text>
      {unresolved.map((a) => (
        <Card key={a.id} style={styles.alertCard}>
          <View style={styles.alertHeaderRow}>
            <Ionicons name="warning" size={16} color={colors.coral} />
            <Text style={styles.alertMessage}>{a.message || "No message provided"}</Text>
          </View>
          <Text style={styles.alertMeta}>{new Date(a.createdAt).toLocaleString()}</Text>
          <View style={styles.rowGap}>
            <View style={{ flex: 1 }}>
              <Button
                title="Open in Maps"
                variant="outline"
                icon="map-outline"
                onPress={() => Linking.openURL(`https://www.google.com/maps?q=${a.lat},${a.lng}`)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Mark Resolved" icon="checkmark-circle" onPress={() => handleResolveSos(a.id)} />
            </View>
          </View>
        </Card>
      ))}
      {!isLoading && unresolved.length === 0 ? (
        <EmptyState icon="shield-checkmark-outline" title="No active SOS alerts" />
      ) : null}

      <Text style={styles.sectionTitle}>Refund Disputes ({disputes.length})</Text>
      {disputes.map((b) => (
        <Card key={b.id} style={styles.disputeCard}>
          <View style={styles.alertHeaderRow}>
            <Ionicons name="alert-circle" size={16} color={colors.amberDark} />
            <Text style={styles.alertMessage}>{b.disputeReason || "No reason given"}</Text>
          </View>
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
        </Card>
      ))}
      {!isLoading && disputes.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" title="No pending disputes" />
      ) : null}

      <Text style={styles.sectionTitle}>Resolved SOS ({resolved.length})</Text>
      {resolved.slice(0, 10).map((a) => (
        <Card key={a.id} variant="muted" style={styles.resolvedCard}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
          <Text style={styles.alertMeta}>{new Date(a.createdAt).toLocaleString()}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.title, fontSize: 16, marginBottom: spacing.md, marginTop: spacing.md },
  alertCard: { borderColor: colors.coral, borderWidth: 1, marginBottom: spacing.md, gap: spacing.sm },
  disputeCard: { borderColor: colors.warning, borderWidth: 1, marginBottom: spacing.md, gap: spacing.sm },
  resolvedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  alertHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  alertMessage: { ...typography.bodyStrong, flex: 1 },
  alertMeta: { ...typography.caption },
  rowGap: { flexDirection: "row", gap: spacing.sm },
});
