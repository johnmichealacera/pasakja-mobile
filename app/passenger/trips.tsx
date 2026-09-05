import React, { useCallback, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { listBookings, rateBooking, requestDispute } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { colors } from "@/theme";

const STATUS_COLORS: Record<Booking["status"], string> = {
  PENDING: colors.warning,
  ACCEPTED: colors.primary,
  PICKED_UP: colors.primary,
  IN_PROGRESS: colors.primary,
  COMPLETED: colors.success,
  CANCELLED: colors.danger,
};

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
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.title}>My Trips</Text>
      {bookings.map((b) => (
        <View key={b.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.status, { color: STATUS_COLORS[b.status] }]}>{b.status}</Text>
            <Text style={styles.fare}>{b.fare != null ? `₱${Number(b.fare).toFixed(2)}` : "—"}</Text>
          </View>
          <Text style={styles.address} numberOfLines={1}>
            From: {b.pickupAddress}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            To: {b.dropoffAddress}
          </Text>

          {b.rating ? <Text style={styles.ratedNote}>You rated this trip {b.rating.score}★</Text> : null}
          {b.disputeStatus !== "NONE" ? (
            <Text style={styles.disputeNote}>Dispute: {b.disputeStatus}</Text>
          ) : null}

          {canRate(b) || canDispute(b) ? (
            <View style={styles.actions}>
              {canRate(b) ? (
                <View style={{ flex: 1 }}>
                  <Button title="Rate Driver" variant="outline" onPress={() => setRatingTarget(b)} />
                </View>
              ) : null}
              {canDispute(b) ? (
                <View style={{ flex: 1 }}>
                  <Button title="Dispute" variant="outline" onPress={() => setDisputeTarget(b)} />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
      {!isLoading && bookings.length === 0 ? (
        <Text style={{ color: colors.muted }}>No trips yet — book your first ride!</Text>
      ) : null}

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
    </Screen>
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
              <Pressable key={n} onPress={() => setScore(n)}>
                <Text style={[styles.star, n <= score && styles.starFilled]}>★</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Add a comment (optional)"
            placeholderTextColor={colors.muted}
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
            placeholderTextColor={colors.muted}
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
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  status: { fontWeight: "700" },
  fare: { fontWeight: "700", color: colors.text },
  address: { color: colors.muted, fontSize: 13 },
  ratedNote: { color: colors.success, fontSize: 12, marginTop: 6, fontWeight: "600" },
  disputeNote: { color: colors.warning, fontSize: 12, marginTop: 6, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: colors.muted, marginBottom: 14 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 16, justifyContent: "center" },
  star: { fontSize: 32, color: colors.border },
  starFilled: { color: colors.warning },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    minHeight: 60,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 10 },
});
