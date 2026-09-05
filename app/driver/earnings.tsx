import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { getDriverEarnings } from "@/api/driverEarnings";
import type { DriverEarnings } from "@/api/driverEarnings";
import { colors } from "@/theme";

export default function DriverEarningsScreen() {
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setEarnings(await getDriverEarnings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.title}>My Earnings</Text>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeText}>
          You receive the full trip fare for every completed ride — the platform fee is an
          add-on the passenger pays, never deducted from you.
        </Text>
      </View>

      {earnings ? (
        <>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalValue}>₱{earnings.totalEarnings.toFixed(2)}</Text>
            <Text style={styles.totalHint}>
              Passengers paid ₱{earnings.totalGross.toFixed(2)} incl. ₱
              {earnings.totalPlatformFees.toFixed(2)} platform fees
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Stat label="This Week" value={`₱${earnings.weeklyNet.toFixed(2)}`} />
            <Stat label="This Month" value={`₱${earnings.monthlyNet.toFixed(2)}`} />
          </View>

          <View style={styles.tripsCard}>
            <Text style={styles.tripsCount}>{earnings.completedTrips} completed trips</Text>
            <Text style={styles.tripsAvg}>
              Average per trip: ₱
              {earnings.completedTrips > 0
                ? (earnings.totalEarnings / earnings.completedTrips).toFixed(2)
                : "0.00"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Earnings History</Text>
          {earnings.history.length === 0 ? (
            <Text style={{ color: colors.muted }}>No earnings yet — complete a trip to start.</Text>
          ) : (
            earnings.history.map((e) => (
              <View key={e.id} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyLabel}>Trip Completed</Text>
                  <Text style={styles.historyDate}>{new Date(e.date).toLocaleString()}</Text>
                </View>
                <Text style={styles.historyAmount}>+₱{e.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 16 },
  noticeCard: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noticeText: { color: colors.text, fontSize: 12 },
  totalCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  totalLabel: { color: colors.muted, fontSize: 13 },
  totalValue: { color: colors.success, fontSize: 32, fontWeight: "700", marginTop: 4 },
  totalHint: { color: colors.muted, fontSize: 12, marginTop: 6 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  tripsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  tripsCount: { fontWeight: "700", color: colors.text },
  tripsAvg: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyLabel: { color: colors.text, fontWeight: "600" },
  historyDate: { color: colors.muted, fontSize: 12, marginTop: 2 },
  historyAmount: { color: colors.success, fontWeight: "700", fontSize: 16 },
});
