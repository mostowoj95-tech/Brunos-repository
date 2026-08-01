import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { ArrowLeftIcon, CaretRightIcon, CheckSquareIcon, SquareIcon, ShareNetworkIcon, CalendarPlusIcon } from "phosphor-react-native";
import * as Sharing from "expo-sharing";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { useScanSession } from "../context/ScanSessionContext";
import { writeIcsFile } from "../services/icsGenerator";
import ThickThinRule from "../components/ThickThinRule";
import Tag from "../components/Tag";
import HandoffSheet from "../components/HandoffSheet";
import { groupEventsByDate, formatWeekday, formatDayKicker } from "../utils/dateFormat";
import { colors, spacing, type, fonts } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function ResultsScreen({ navigation }: Props) {
  const { events, skipped, selectMode, selectedEvents, toggleSkip, setSelectMode, setMethod } = useScanSession();
  const [handoffOpen, setHandoffOpen] = useState(false);

  const dayGroups = groupEventsByDate(events);
  const allSameDate = events.length > 0 && events.every((e) => e.date === events[0].date);
  const subtitle =
    events.length === 0
      ? ""
      : allSameDate
      ? formatDayKicker(events[0].date)
      : `${formatDayKicker(events[0].date)} – ${formatDayKicker(events[events.length - 1].date)}`;

  const headline = selectMode ? `${selectedEvents.length} of ${events.length} selected` : `Found ${events.length} event${events.length === 1 ? "" : "s"}`;

  function handleRowPress(id: string) {
    if (selectMode) {
      toggleSkip(id);
    } else {
      navigation.navigate("EventDetail", { eventId: id });
    }
  }

  async function handleQuickShare() {
    try {
      const fileUri = await writeIcsFile(selectedEvents);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing unavailable", "This device can't share files.");
        return;
      }
      await Sharing.shareAsync(fileUri, { mimeType: "text/calendar", dialogTitle: "Share the .ics file" });
      setMethod("share sheet");
      navigation.navigate("Confirmation");
    } catch {
      Alert.alert("Error", "Couldn't create the calendar file.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Home")} hitSlop={8}>
          <ArrowLeftIcon size={22} color={colors.accent} weight="duotone" />
        </Pressable>
        <Pressable onPress={() => setSelectMode(!selectMode)} hitSlop={8}>
          <Text style={styles.headerAction}>{selectMode ? "Done" : "Select"}</Text>
        </Pressable>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <ThickThinRule />

      <ScrollView contentContainerStyle={styles.listContent}>
        {dayGroups.map((group) => (
          <View key={group.date}>
            <View style={styles.dayHeadRow}>
              <Text style={styles.dayHead}>{formatWeekday(group.date)}</Text>
              <Text style={[type.kicker, styles.dayKicker]}>{formatDayKicker(group.date)}</Text>
            </View>
            {group.events.map((event) => {
              const isSkipped = !!skipped[event.id];
              const flagged = event.flagged_fields.length > 0;
              return (
                <Pressable
                  key={event.id}
                  onPress={() => handleRowPress(event.id)}
                  style={[styles.row, isSkipped && styles.rowSkipped]}
                >
                  {selectMode ? (
                    isSkipped ? (
                      <SquareIcon size={20} color={colors.neutral600} weight="duotone" />
                    ) : (
                      <CheckSquareIcon size={20} color={colors.accent} weight="duotone" />
                    )
                  ) : (
                    <View style={styles.timeColumn}>
                      {event.start_time ? (
                        <>
                          <Text style={styles.timeStart}>{event.start_time}</Text>
                          {event.end_time ? <Text style={styles.timeEnd}>{event.end_time}</Text> : null}
                        </>
                      ) : (
                        <Text style={styles.timeStart}>All day</Text>
                      )}
                    </View>
                  )}

                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{event.title}</Text>
                    <View style={styles.rowMetaLine}>
                      {event.location ? <Text style={styles.rowMeta}>{event.location}</Text> : null}
                      {flagged ? <Tag label="check" /> : null}
                    </View>
                  </View>

                  {!selectMode && <CaretRightIcon size={17} color={colors.neutral500} weight="duotone" />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            selectedEvents.length === 0 && styles.primaryButtonDisabled,
            pressed && selectedEvents.length > 0 && styles.primaryButtonPressed,
          ]}
          disabled={selectedEvents.length === 0}
          onPress={() => setHandoffOpen(true)}
        >
          <CalendarPlusIcon size={20} color={colors.bg} weight="duotone" />
          <Text style={styles.primaryButtonText}>
            {selectMode ? `Add ${selectedEvents.length} to Outlook` : `Open all ${selectedEvents.length} in Outlook`}
          </Text>
        </Pressable>
        <Pressable style={styles.shareIconButton} onPress={handleQuickShare} disabled={selectedEvents.length === 0}>
          <ShareNetworkIcon size={20} color={colors.text} weight="duotone" />
        </Pressable>
      </View>

      <HandoffSheet
        visible={handoffOpen}
        events={selectedEvents}
        onClose={() => setHandoffOpen(false)}
        onHandedOff={(method) => {
          setHandoffOpen(false);
          setMethod(method);
          navigation.navigate("Confirmation");
        }}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  headerAction: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.accent,
  },
  headline: {
    ...type.sectionHeadline,
    color: colors.text,
  },
  subtitle: {
    ...type.rowMeta,
    marginTop: spacing[1],
    marginBottom: spacing[3],
  },
  listContent: {
    paddingBottom: spacing[8],
  },
  dayHeadRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[2],
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  dayHead: {
    ...type.dayHead,
    color: colors.text,
  },
  dayKicker: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowSkipped: {
    opacity: 0.45,
  },
  timeColumn: {
    width: 50,
  },
  timeStart: {
    ...type.time,
    color: colors.text,
  },
  timeEnd: {
    ...type.time,
    color: colors.neutral600,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    ...type.eventTitle,
    color: colors.text,
  },
  rowMetaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginTop: 2,
  },
  rowMeta: {
    ...type.rowMeta,
  },
  footer: {
    flexDirection: "row",
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    backgroundColor: colors.accent,
    borderRadius: 2,
    paddingVertical: spacing[3],
  },
  primaryButtonPressed: {
    backgroundColor: colors.accent700,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.bg,
  },
  shareIconButton: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 2,
  },
});
