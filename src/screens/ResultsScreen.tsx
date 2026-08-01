import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import * as Sharing from "expo-sharing";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import type { ExtractedEvent } from "../types/event";
import { writeIcsFile } from "../services/icsGenerator";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

async function shareEvents(events: ExtractedEvent[]) {
  try {
    const fileUri = await writeIcsFile(events);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert("Sharing unavailable", "This device can't share files.");
      return;
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/calendar",
      dialogTitle: "Add to Calendar",
    });
  } catch {
    Alert.alert("Error", "Couldn't create the calendar file.");
  }
}

function EventCard({ event }: { event: ExtractedEvent }) {
  const timeLabel = event.start_time
    ? `${event.date} · ${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}`
    : event.date;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardMeta}>{timeLabel}</Text>
      {event.location ? <Text style={styles.cardMeta}>{event.location}</Text> : null}
      {event.description ? <Text style={styles.cardDescription}>{event.description}</Text> : null}
      <Pressable style={styles.cardButton} onPress={() => shareEvents([event])}>
        <Text style={styles.cardButtonText}>Add to Calendar</Text>
      </Pressable>
    </View>
  );
}

export default function ResultsScreen({ route }: Props) {
  const { events } = route.params;

  return (
    <View style={styles.container}>
      {events.length > 1 && (
        <Pressable style={styles.exportAllButton} onPress={() => shareEvents(events)}>
          <Text style={styles.exportAllButtonText}>Export All ({events.length})</Text>
        </Pressable>
      )}
      <FlatList
        data={events}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
  },
  exportAllButton: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  exportAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },
  cardButton: {
    marginTop: 12,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: "600",
  },
});
