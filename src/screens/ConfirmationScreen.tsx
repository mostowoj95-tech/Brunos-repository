import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { CalendarCheckIcon } from "phosphor-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { useScanSession } from "../context/ScanSessionContext";
import { formatShortDate } from "../utils/dateFormat";
import { colors, spacing, fonts, type } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "Confirmation">;

function describeHandoff(method: string | null, detail: string | null): string {
  switch (method) {
    case "calendar":
      return `Added to your ${detail ?? "device"} calendar.`;
    case "share sheet":
      return "Shared as events.ics.";
    case "Files":
      return "Saved to Files as events.ics.";
    default:
      return "Handed off as events.ics.";
  }
}

export default function ConfirmationScreen({ navigation }: Props) {
  const { selectedEvents, method, handoffDetail, reset } = useScanSession();
  const count = selectedEvents.length;

  function handleScanAnother() {
    reset();
    navigation.navigate("Home");
  }

  return (
    <View style={styles.container}>
      <CalendarCheckIcon size={44} color={colors.accent} weight="duotone" />
      <Text style={styles.headline}>
        {count} event{count === 1 ? "" : "s"} {count === 1 ? "is" : "are"} on their way
      </Text>
      <Text style={styles.body}>{describeHandoff(method, handoffDetail)} Anything you changed here went with it.</Text>

      <ScrollView style={styles.list}>
        {selectedEvents.map((event) => (
          <View key={event.id} style={styles.row}>
            <Text style={styles.rowDate}>
              {formatShortDate(event.date)}
              {event.start_time ? ` · ${event.start_time}` : ""}
            </Text>
            <Text style={styles.rowTitle}>{event.title}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Results")}>
        <Text style={styles.secondaryButtonText}>Back to the events</Text>
      </Pressable>
      <Pressable style={styles.ghostButton} onPress={handleScanAnother}>
        <Text style={styles.ghostButtonText}>Scan another flyer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
  },
  headline: {
    ...type.screenHeadline,
    color: colors.text,
    marginTop: spacing[4],
  },
  body: {
    ...type.body,
    color: colors.text,
    marginTop: spacing[3],
    maxWidth: 340,
  },
  list: {
    marginTop: spacing[4],
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowDate: {
    width: 104,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.neutral600,
  },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 2,
    paddingVertical: spacing[3],
    alignItems: "center",
    marginTop: spacing[4],
  },
  secondaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },
  ghostButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.accent,
  },
});
