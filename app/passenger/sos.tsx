import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { sendSos } from "@/api/sos";
import { colors } from "@/theme";

// Socorro, Surigao del Norte town-center fallback, matching the web app's SOS screen.
const FALLBACK_LOCATION = { lat: 9.6234, lng: 125.9685 };

const EMERGENCY_NUMBERS = [
  { label: "PNP Emergency Hotline", number: "117" },
  { label: "Bureau of Fire Protection", number: "160" },
  { label: "NDRRMC", number: "911" },
];

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
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.subtitle}>
        Sends your live location straight to Pasakja admins so they can respond immediately.
      </Text>

      {sent ? (
        <View style={styles.sentCard}>
          <Text style={styles.sentText}>Alert sent. Help is on the way.</Text>
          <Button title="Send Another Alert" variant="outline" onPress={() => setSent(false)} />
        </View>
      ) : (
        <>
          <TextField
            label="Message (optional)"
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your emergency…"
            multiline
          />
          <Text style={styles.locationHint}>
            {location
              ? `Location locked in (±10m)`
              : "Getting your location — you can still send without it."}
          </Text>
          <Button title="SEND SOS ALERT" variant="danger" onPress={handleSend} loading={isSending} />
        </>
      )}

      <Text style={styles.sectionTitle}>Local Emergency Numbers</Text>
      {EMERGENCY_NUMBERS.map((n) => (
        <View key={n.number} style={styles.numberRow}>
          <Text style={styles.numberLabel}>{n.label}</Text>
          <Text style={styles.numberValue}>{n.number}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: colors.danger, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 20 },
  locationHint: { fontSize: 12, color: colors.muted, marginBottom: 14 },
  sentCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  sentText: { color: colors.success, fontWeight: "700" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 28,
    marginBottom: 10,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numberLabel: { color: colors.text },
  numberValue: { color: colors.text, fontWeight: "700" },
});
