import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { listDrivers, updateDriver } from "@/api/drivers";
import { ApiError } from "@/api/client";
import type { Driver, DriverStatus } from "@/types";
import { colors } from "@/theme";

const STATUS_COLORS: Record<DriverStatus, string> = {
  PENDING: colors.warning,
  VERIFIED: colors.success,
  SUSPENDED: colors.danger,
};

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDrivers(await listDrivers());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSetStatus(driverId: string, status: DriverStatus) {
    setActioningId(driverId);
    try {
      const updated = await updateDriver(driverId, { status });
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...updated } : d)));
    } catch (err) {
      Alert.alert("Could not update driver", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setActioningId(null);
    }
  }

  const counts = {
    PENDING: drivers.filter((d) => d.status === "PENDING").length,
    VERIFIED: drivers.filter((d) => d.status === "VERIFIED").length,
    SUSPENDED: drivers.filter((d) => d.status === "SUSPENDED").length,
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <View style={styles.summaryRow}>
        <SummaryStat label="Pending" value={counts.PENDING} color={colors.warning} />
        <SummaryStat label="Verified" value={counts.VERIFIED} color={colors.success} />
        <SummaryStat label="Suspended" value={counts.SUSPENDED} color={colors.danger} />
      </View>

      {drivers.map((d) => (
        <View key={d.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{d.user?.name ?? "Driver"}</Text>
            <Text style={[styles.statusBadge, { color: STATUS_COLORS[d.status] }]}>{d.status}</Text>
          </View>
          <Text style={styles.meta}>
            {d.vehicleType} · {d.vehiclePlate} · {d.licenseNo}
          </Text>
          {d._count ? (
            <Text style={styles.meta}>
              {d._count.bookings} trips · {d._count.ratings} ratings
            </Text>
          ) : null}

          <View style={styles.actions}>
            {d.status !== "VERIFIED" ? (
              <View style={{ flex: 1 }}>
                <Button
                  title="Approve"
                  onPress={() => handleSetStatus(d.id, "VERIFIED")}
                  loading={actioningId === d.id}
                />
              </View>
            ) : null}
            {d.status !== "SUSPENDED" ? (
              <View style={{ flex: 1 }}>
                <Button
                  title="Suspend"
                  variant="danger"
                  onPress={() => handleSetStatus(d.id, "SUSPENDED")}
                  loading={actioningId === d.id}
                />
              </View>
            ) : null}
          </View>
        </View>
      ))}
      {!isLoading && drivers.length === 0 ? (
        <Text style={{ color: colors.muted }}>No drivers yet.</Text>
      ) : null}
    </Screen>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryStat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  summaryLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  name: { color: colors.text, fontWeight: "700", fontSize: 15 },
  statusBadge: { fontWeight: "700", fontSize: 12 },
  meta: { color: colors.muted, fontSize: 13, marginBottom: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
});
