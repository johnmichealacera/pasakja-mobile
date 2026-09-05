import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ALL_SOCORRO_PLACES, type SocorroPlace } from "@/lib/socorroPlaces";
import { colors } from "@/theme";

interface DestinationSearchModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (place: SocorroPlace) => void;
}

export function DestinationSearchModal({
  visible,
  title,
  onClose,
  onSelect,
}: DestinationSearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_SOCORRO_PLACES;
    return ALL_SOCORRO_PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.barangay.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Search a place or barangay…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={results}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                onSelect(item);
                setQuery("");
                onClose();
              }}
            >
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowBarangay}>{item.barangay}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No matching places.</Text>}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  close: { color: colors.primary, fontWeight: "600" },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: colors.card,
    color: colors.text,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowName: { color: colors.text, fontWeight: "600" },
  rowBarangay: { color: colors.muted, fontSize: 12, marginTop: 2 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
});
