import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Alert, Platform, Linking } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { CalendarPlusIcon, ShareNetworkIcon, FolderOpenIcon } from "phosphor-react-native";

import { generateIcs, writeIcsFile } from "../services/icsGenerator";
import { addEventsToDeviceCalendar, CalendarPermissionError } from "../services/deviceCalendar";
import type { SessionEvent } from "../types/event";
import { colors, spacing, fonts, type } from "../theme/broadsheet";
import type { HandoffMethod } from "../context/ScanSessionContext";

interface Props {
  visible: boolean;
  events: SessionEvent[];
  onClose: () => void;
  onHandedOff: (method: HandoffMethod, detail?: string) => void;
}

export default function HandoffSheet({ visible, events, onClose, onHandedOff }: Props) {
  const [busy, setBusy] = useState(false);

  const { sizeLabel } = useMemo(() => {
    const ics = generateIcs(events);
    const kb = Math.max(0.1, ics.length / 1024);
    return { sizeLabel: `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB` };
  }, [events]);

  async function shareFile(dialogTitle: string, method: HandoffMethod) {
    setBusy(true);
    try {
      const fileUri = await writeIcsFile(events);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Sharing unavailable", "This device can't share files.");
        return;
      }
      await Sharing.shareAsync(fileUri, { mimeType: "text/calendar", dialogTitle });
      onHandedOff(method);
    } catch {
      Alert.alert("Error", "Couldn't create the calendar file.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddToCalendar() {
    setBusy(true);
    try {
      const { addedCount, calendarTitle } = await addEventsToDeviceCalendar(events);
      onHandedOff("calendar", calendarTitle);
      void addedCount;
    } catch (err) {
      if (err instanceof CalendarPermissionError) {
        Alert.alert(
          "Calendar access needed",
          "Enable calendar access for this app in system settings, then try again.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert("Error", "Couldn't add the events to your calendar.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveToFiles() {
    // Android: let the user pick a real destination via the Storage Access Framework.
    // iOS has no equivalent — "Save to Files" surfaces as a share-sheet destination there.
    if (Platform.OS !== "android") {
      return shareFile("Save to Files", "Files");
    }
    setBusy(true);
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) return;
      const ics = generateIcs(events);
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `events-${Date.now()}`,
        "text/calendar"
      );
      await FileSystem.writeAsStringAsync(fileUri, ics, { encoding: FileSystem.EncodingType.UTF8 });
      onHandedOff("Files");
    } catch {
      Alert.alert("Error", "Couldn't save the calendar file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Add {events.length} events</Text>
        <Text style={styles.subtitle}>events.ics · {sizeLabel}</Text>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          disabled={busy}
          onPress={handleAddToCalendar}
        >
          <CalendarPlusIcon size={22} color={colors.bg} weight="duotone" />
          <Text style={styles.primaryButtonText}>Add to Calendar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          disabled={busy}
          onPress={() => shareFile("Share the .ics file", "share sheet")}
        >
          <ShareNetworkIcon size={22} color={colors.text} weight="duotone" />
          <Text style={styles.secondaryButtonText}>Share the .ics file</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          disabled={busy}
          onPress={handleSaveToFiles}
        >
          <FolderOpenIcon size={22} color={colors.text} weight="duotone" />
          <Text style={styles.secondaryButtonText}>Save to Files</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: spacing[4],
    paddingBottom: spacing[6],
    shadowColor: "#2d2b2b",
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -12 },
    elevation: 10,
  },
  title: {
    ...type.sectionHeadline,
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    ...type.rowMeta,
    marginTop: spacing[1],
    marginBottom: spacing[4],
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.accent,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 2,
    marginBottom: spacing[2],
  },
  primaryButtonPressed: {
    backgroundColor: colors.accent700,
  },
  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.bg,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 2,
    marginBottom: spacing[2],
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(32,30,29,0.07)",
  },
  secondaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.accent,
  },
});
