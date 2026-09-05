import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookingStatus } from "@/types";
import { colors } from "@/theme";

const STEPS: { status: BookingStatus; label: string }[] = [
  { status: "PENDING", label: "Requested" },
  { status: "ACCEPTED", label: "Accepted" },
  { status: "PICKED_UP", label: "Picked up" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "COMPLETED", label: "Completed" },
];

export function TripStatusTimeline({ status }: { status: BookingStatus }) {
  if (status === "CANCELLED") {
    return (
      <View style={styles.cancelledRow}>
        <Text style={styles.cancelledText}>Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <View style={styles.row}>
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <React.Fragment key={step.status}>
            <View style={styles.stepWrap}>
              <View style={[styles.dot, isDone && styles.dotDone]} />
              <Text style={[styles.label, isDone && styles.labelDone]} numberOfLines={1}>
                {step.label}
              </Text>
            </View>
            {index < STEPS.length - 1 ? (
              <View style={[styles.line, index < currentIndex && styles.lineDone]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  stepWrap: { alignItems: "center", width: 56 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  dotDone: { backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.muted, textAlign: "center" },
  labelDone: { color: colors.primary, fontWeight: "700" },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginTop: 5 },
  lineDone: { backgroundColor: colors.primary },
  cancelledRow: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelledText: { color: colors.danger, fontWeight: "700" },
});
