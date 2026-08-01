import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { useScanSession } from "../context/ScanSessionContext";
import Tag from "../components/Tag";
import { colors, spacing, fonts, type } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "EventDetail">;

export default function EventDetailScreen({ route, navigation }: Props) {
  const { eventId } = route.params;
  const { events, updateEvent } = useScanSession();
  const index = events.findIndex((e) => e.id === eventId);
  const event = events[index];

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? "");
  const [startTime, setStartTime] = useState(event?.start_time ?? "");
  const [endTime, setEndTime] = useState(event?.end_time ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [notes, setNotes] = useState(event?.description ?? "");
  const [locationFlagged, setLocationFlagged] = useState(event?.flagged_fields.includes("location") ?? false);

  if (!event) return null;

  const locationAlternatives = event.alternatives.find((a) => a.field === "location")?.values ?? [];

  function pickAlternative(value: string) {
    setLocation(value);
    setLocationFlagged(false);
  }

  function handleLocationChange(value: string) {
    setLocation(value);
    setLocationFlagged(false);
  }

  function handleSave() {
    updateEvent(eventId, {
      title,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
      description: notes || null,
      flagged_fields: locationFlagged ? event.flagged_fields : event.flagged_fields.filter((f) => f !== "location"),
    });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={type.kicker}>
          Event {index + 1} of {events.length}
        </Text>
        <Pressable onPress={handleSave} hitSlop={8}>
          <Text style={[styles.headerAction, styles.headerActionBold]}>Done</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <View style={styles.row3}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.smallInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Start</Text>
            <TextInput style={[styles.smallInput, styles.timeInput]} value={startTime} onChangeText={setStartTime} placeholder="HH:MM" />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>End</Text>
            <TextInput style={[styles.smallInput, styles.timeInput]} value={endTime} onChangeText={setEndTime} placeholder="HH:MM" />
          </View>
        </View>

        <View style={styles.locationHeader}>
          <Text style={styles.label}>Location</Text>
          {locationFlagged && <Tag label="low confidence" />}
        </View>
        <TextInput
          style={[styles.smallInput, locationFlagged && styles.inputFlagged]}
          value={location}
          onChangeText={handleLocationChange}
        />
        {locationFlagged && locationAlternatives.length > 0 && (
          <>
            <Text style={styles.flagNote}>Hard to read on the flyer — pick one:</Text>
            <View style={styles.chipRow}>
              {locationAlternatives.map((alt) => (
                <Pressable key={alt} style={styles.chipFlagged} onPress={() => pickAlternative(alt)}>
                  <Text style={styles.chipFlaggedText}>{alt}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.chipNeutral} onPress={() => pickAlternative("")}>
                <Text style={styles.chipNeutralText}>Leave blank</Text>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} multiline />

        <View style={styles.readOnlyRow}>
          <Text style={styles.readOnlyLabel}>Time zone</Text>
          <Text style={styles.readOnlyValue}>{event.timezone}</Text>
        </View>
        <View style={styles.readOnlyRow}>
          <Text style={styles.readOnlyLabel}>Reminder</Text>
          <Text style={styles.readOnlyValue}>1 hour before</Text>
        </View>
      </ScrollView>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save changes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  headerAction: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.accent,
  },
  headerActionBold: {
    fontFamily: fonts.semibold,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "rgba(32,30,29,0.7)",
    marginBottom: spacing[1],
    marginTop: spacing[4],
  },
  titleInput: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.text,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    paddingBottom: spacing[1],
  },
  row3: {
    flexDirection: "row",
    gap: spacing[2],
  },
  fieldGroup: {
    minWidth: 76,
  },
  smallInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 2,
    paddingHorizontal: spacing[2],
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  timeInput: {
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  inputFlagged: {
    borderWidth: 2,
    borderColor: colors.accent2,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing[4],
  },
  flagNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.accent2_800,
    marginTop: spacing[2],
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    marginTop: spacing[2],
  },
  chipFlagged: {
    backgroundColor: colors.accent2_100,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 2,
  },
  chipFlaggedText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.accent2_800,
  },
  chipNeutral: {
    backgroundColor: colors.surface,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 2,
  },
  chipNeutralText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.neutral700,
  },
  notesInput: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 2,
    padding: spacing[2],
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlignVertical: "top",
  },
  readOnlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing[4],
  },
  readOnlyLabel: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  readOnlyValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.neutral600,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing[4],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderRadius: 2,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.bg,
  },
});
