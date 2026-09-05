import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/StatTile";
import { EmptyState } from "@/components/EmptyState";
import { getDriverEarnings } from "@/api/driverEarnings";
import type { DriverEarnings } from "@/api/driverEarnings";
import { colors, radius, spacing, typography } from "@/theme";

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
    <View style={styles.flex}>
      <ScreenHeader title="My Earnings" subtitle="You keep the full trip fare">
        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>₱{(earnings?.totalEarnings ?? 0).toFixed(2)}</Text>
          <Text style={styles.totalLabel}>Total earned</Text>
        </View>
      </ScreenHeader>

      <Screen edges={["bottom"]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        <Card variant="muted" style={styles.notice}>
          <Ionicons name="information-circle-outline" size={16} color={colors.teal} />
          <Text style={styles.noticeText}>
            The platform fee is an add-on the passenger pays — never deducted from you.
          </Text>
        </Card>

        {earnings ? (
          <>
            <View style={styles.statsRow}>
              <StatTile icon="calendar-outline" value={`₱${earnings.weeklyNet.toFixed(0)}`} label="This Week" tone="teal" />
              <StatTile icon="trending-up-outline" value={`₱${earnings.monthlyNet.toFixed(0)}`} label="This Month" tone="emerald" />
            </View>

            <Card style={styles.tripsCard}>
              <View style={styles.tripsIconWrap}>
                <Ionicons name="checkmark-done" size={18} color={colors.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tripsCount}>{earnings.completedTrips} completed trips</Text>
                <Text style={styles.tripsAvg}>
                  Average per trip: ₱
                  {earnings.completedTrips > 0
                    ? (earnings.totalEarnings / earnings.completedTrips).toFixed(2)
                    : "0.00"}
                </Text>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Earnings History</Text>
            {earnings.history.length === 0 ? (
              <EmptyState icon="wallet-outline" title="No earnings yet" subtitle="Complete a trip to start earning." />
            ) : (
              earnings.history.map((e) => (
                <Card key={e.id} style={styles.historyRow}>
                  <View style={styles.historyIconWrap}>
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>Trip Completed</Text>
                    <Text style={styles.historyDate}>{new Date(e.date).toLocaleString()}</Text>
                  </View>
                  <Text style={styles.historyAmount}>+₱{e.amount.toFixed(2)}</Text>
                </Card>
              ))
            )}
          </>
        ) : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  totalRow: { marginTop: spacing.lg },
  totalValue: { fontSize: 40, fontWeight: "800", color: "#fff", letterSpacing: -1 },
  totalLabel: { ...typography.body, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  notice: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  noticeText: { ...typography.caption, flex: 1 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  tripsCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  tripsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  tripsCount: { ...typography.bodyStrong },
  tripsAvg: { ...typography.caption, marginTop: 2 },
  sectionTitle: { ...typography.title, fontSize: 16, marginBottom: spacing.md },
  historyRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  historyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
  },
  historyLabel: { ...typography.bodyStrong },
  historyDate: { ...typography.caption, marginTop: 2 },
  historyAmount: { ...typography.title, fontSize: 15, color: colors.success },
});
