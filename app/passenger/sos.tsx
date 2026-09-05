import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { sendSos } from "@/api/sos";
import { colors, radius, spacing, typography } from "@/theme";

// Socorro, Surigao del Norte town-center fallback, matching the web app's SOS screen.
const FALLBACK_LOCATION = { lat: 9.6234, lng: 125.9685 };

const EMERGENCY_NUMBERS = [
  { label: "PNP Emergency Hotline", number: "117" },
  { label: "Bureau of Fire Protection", number: "160" },
  { label: "NDRRMC", number: "911" },
];

function PulsingSosButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  function handlePress() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onPress();
  }

  return (
    <View style={styles.sosWrap}>
      <Animated.View
        style={[styles.sosRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <Pressable onPress={handlePress} disabled={loading} style={styles.sosButton}>
        <Ionicons name="warning" size={36} color="#fff" />
        <Text style={styles.sosButtonText}>{loading ? "Sending…" : "SEND SOS"}</Text>
      </Pressable>
    </View>
  );
}

export default function SosScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      );
    })();
    return () => subscription?.remove();
  }, []);

  async function handleSend() {
    setIsSending(true);
    try {
      const point = location ?? FALLBACK_LOCATION;
      await sendSos({ lat: point.lat, lng: point.lng, message: message || undefined });
      setSent(true);
    } catch (err) {
      Alert.alert("Could not send alert", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Ionicons name="shield-checkmark" size={22} color={colors.coral} />
        <Text style={styles.title}>Emergency SOS</Text>
      </View>
      <Text style={styles.subtitle}>
        Sends your live location straight to Pasakja admins so they can respond immediately.
      </Text>

      {sent ? (
        <Card variant="muted" style={styles.sentCard}>
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={styles.sentText}>Alert sent — help is on the way</Text>
          <Pressable onPress={() => setSent(false)}>
            <Text style={styles.sendAnotherText}>Send another alert</Text>
          </Pressable>
        </Card>
      ) : (
        <>
          <PulsingSosButton onPress={handleSend} loading={isSending} />
          <TextField
            label="Message (optional)"
            icon="chatbubble-ellipses-outline"
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your emergency…"
            multiline
          />
          <View style={styles.locationHintRow}>
            <Ionicons
              name={location ? "location" : "location-outline"}
              size={14}
              color={location ? colors.success : colors.inkFaint}
            />
            <Text style={styles.locationHint}>
              {location ? "Location locked in (±10m)" : "Getting your location — you can still send without it."}
            </Text>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Local Emergency Numbers</Text>
      {EMERGENCY_NUMBERS.map((n) => (
        <Pressable key={n.number} onPress={() => Linking.openURL(`tel:${n.number}`)}>
          <Card style={styles.numberRow}>
            <View style={styles.numberIconWrap}>
              <Ionicons name="call" size={16} color={colors.coral} />
            </View>
            <Text style={styles.numberLabel}>{n.label}</Text>
            <Text style={styles.numberValue}>{n.number}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
  title: { ...typography.display, fontSize: 24, color: colors.ink },
  subtitle: { ...typography.body, color: colors.inkMuted, marginBottom: spacing.xl },
  sosWrap: { alignItems: "center", justifyContent: "center", marginBottom: spacing.xl, height: 190 },
  sosRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: radius.full,
    backgroundColor: colors.coral,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: radius.full,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sosButtonText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.3 },
  locationHintRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.lg },
  locationHint: { ...typography.caption },
  sentCard: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl, marginBottom: spacing.xl },
  sentText: { ...typography.title, fontSize: 16, color: colors.success },
  sendAnotherText: { ...typography.bodyStrong, color: colors.teal, marginTop: spacing.xs },
  sectionTitle: { ...typography.title, fontSize: 16, marginTop: spacing.md, marginBottom: spacing.md },
  numberRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  numberIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  numberLabel: { ...typography.body, flex: 1 },
  numberValue: { ...typography.bodyStrong },
});
