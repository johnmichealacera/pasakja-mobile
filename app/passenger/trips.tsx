import React, { useCallback, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { listBookings, rateBooking, requestDispute } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { BOOKING_STATUS, DISPUTE_STATUS } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

const DISPUTE_WINDOW_MS = 2 * 60 * 60 * 1000;

function canRate(b: Booking) {
  return b.status === "COMPLETED" && !b.rating;
}

function canDispute(b: Booking) {
  return (
    b.status === "COMPLETED" &&
    b.paymentMethod === "ONLINE" &&
    b.paymentStatus === "PAID" &&
    b.disputeStatus === "NONE" &&
    Date.now() - new Date(b.updatedAt).getTime() < DISPUTE_WINDOW_MS
  );
}

export default function PassengerTripsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState<Booking | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    try {
      setBookings(await listBookings());
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
      <ScreenHeader title="My Trips" subtitle={`${bookings.length} rides with Pasakja`} />
      <Screen edges={["bottom"]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        {bookings.map((b) => {
          const status = BOOKING_STATUS[b.status];
          return (
            <Card key={b.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Badge {...status} />
                <Text style={styles.fare}>{b.fare != null ? `₱${Number(b.fare).toFixed(2)}` : "—"}</Text>
              </View>
              <View style={styles.routeRow}>
                <Ionicons name="ellipse" size={8} color={colors.emerald} />
                <Text style={styles.address} numberOfLines={1}>
                  {b.pickupAddress}
                </Text>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeRow}>
                <Ionicons name="location" size={11} color={colors.coral} />
                <Text style={styles.address} numberOfLines={1}>
                  {b.dropoffAddress}
                </Text>
              </View>

              {b.rating ? (
                <View style={styles.noteRow}>
                  <Ionicons name="star" size={14} color={colors.amberDark} />
                  <Text style={styles.ratedNote}>You rated this trip {b.rating.score}/5</Text>
                </View>
              ) : null}
              {b.disputeStatus !== "NONE" ? (
                <View style={styles.noteRow}>
                  <Badge {...DISPUTE_STATUS[b.disputeStatus]} />
                </View>
              ) : null}

              {canRate(b) || canDispute(b) ? (
                <View style={styles.actions}>
                  {canRate(b) ? (
                    <View style={{ flex: 1 }}>
                      <Button title="Rate Driver" variant="outline" icon="star-outline" onPress={() => setRatingTarget(b)} />
                    </View>
                  ) : null}
                  {canDispute(b) ? (
                    <View style={{ flex: 1 }}>
                      <Button title="Dispute" variant="outline" icon="alert-circle-outline" onPress={() => setDisputeTarget(b)} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Card>
          );
        })}
        {!isLoading && bookings.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No trips yet" subtitle="Book your first ride to see it here." />
        ) : null}
      </Screen>

      <RatingModal
        booking={ratingTarget}
        onClose={() => setRatingTarget(null)}
        onRated={(updated) => {
          setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        }}
      />
      <DisputeModal
        booking={disputeTarget}
        onClose={() => setDisputeTarget(null)}
        onSubmitted={(id) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, disputeStatus: "REQUESTED" } : b))
          );
        }}
      />
    </View>
  );
}

function RatingModal({
  booking,
  onClose,
  onRated,
}: {
  booking: Booking | null;
  onClose: () => void;
  onRated: (booking: Booking) => void;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!booking) return;
    setIsSubmitting(true);
    try {
      await rateBooking(booking.id, score, comment || undefined);
      onRated({ ...booking, rating: { score, comment: comment || null } });
      setScore(5);
      setComment("");
      onClose();
    } catch (err) {
      Alert.alert("Could not submit rating", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal visible={!!booking} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Rate your driver</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setScore(n)} hitSlop={8}>
                <Ionicons
                  name={n <= score ? "star" : "star-outline"}
                  size={34}
                  color={n <= score ? colors.amber : colors.borderStrong}
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Add a comment (optional)"
            placeholderTextColor={colors.inkFaint}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <View style={styles.modalActions}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Submit" onPress={submit} loading={isSubmitting} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DisputeModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSubmitted: (bookingId: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!booking || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      await requestDispute(booking.id, reason.trim());
      onSubmitted(booking.id);
      setReason("");
      onClose();
      Alert.alert("Dispute submitted", "An admin will review your refund request.");
    } catch (err) {
      Alert.alert("Could not submit dispute", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal visible={!!booking} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Request a refund</Text>
          <Text style={styles.modalSubtitle}>
            Explain what went wrong — an admin will review and issue a GCash refund if approved.
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="What happened?"
            placeholderTextColor={colors.inkFaint}
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <View style={styles.modalActions}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Submit" onPress={submit} loading={isSubmitting} disabled={!reason.trim()} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  card: { marginBottom: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  fare: { ...typography.title, fontSize: 16 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  routeConnector: { width: 1, height: 10, backgroundColor: colors.border, marginLeft: 4, marginVertical: 1 },
  address: { ...typography.body, flex: 1 },
  noteRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  ratedNote: { ...typography.caption, color: colors.amberDark, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,32,28,0.55)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl },
  modalTitle: { ...typography.title, marginBottom: 6 },
  modalSubtitle: { ...typography.caption, marginBottom: spacing.lg },
  starsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg, justifyContent: "center" },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.ink,
    minHeight: 60,
    marginBottom: spacing.lg,
  },
  modalActions: { flexDirection: "row", gap: spacing.sm },
});
