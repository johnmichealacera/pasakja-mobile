import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { listDrivers, updateDriver } from "@/api/drivers";
import { ApiError } from "@/api/client";
import type { Driver, DriverStatus } from "@/types";
import { DRIVER_STATUS } from "@/lib/statusPresentation";
import { colors, spacing, typography } from "@/theme";

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
        <SummaryStat label="Suspended" value={counts.SUSPENDED} color={colors.coral} />
      </View>

      {drivers.map((d) => (
        <Card key={d.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Avatar name={d.user?.name} size={40} />
            <View style={styles.nameCol}>
              <Text style={styles.name}>{d.user?.name ?? "Driver"}</Text>
              <Text style={styles.meta}>
                {d.vehicleType} · {d.vehiclePlate}
              </Text>
            </View>
            <Badge {...DRIVER_STATUS[d.status]} />
          </View>
          <Text style={styles.meta}>License: {d.licenseNo}</Text>
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
                  icon="checkmark-circle"
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
                  icon="ban"
                  onPress={() => handleSetStatus(d.id, "SUSPENDED")}
                  loading={actioningId === d.id}
                />
              </View>
            ) : null}
          </View>
        </Card>
      ))}
      {!isLoading && drivers.length === 0 ? (
        <EmptyState icon="car-outline" title="No drivers yet" />
      ) : null}
    </Screen>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={styles.summaryStat}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  summaryStat: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  summaryLabel: { ...typography.caption, marginTop: 2 },
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  nameCol: { flex: 1 },
  name: { ...typography.bodyStrong, fontSize: 15 },
  meta: { ...typography.caption, marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
