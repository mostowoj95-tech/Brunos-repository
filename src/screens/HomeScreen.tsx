import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon, ImagesIcon, GearIcon } from "phosphor-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { getApiKey } from "../storage/apiKeyStore";
import ThickThinRule from "../components/ThickThinRule";
import { colors, spacing, type } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);

  // If the key was cleared (e.g. in Settings) since the app launched, send the user back to Setup.
  useFocusEffect(
    useCallback(() => {
      getApiKey().then((key) => {
        if (!key) navigation.replace("Setup");
      });
    }, [navigation])
  );

  async function handleResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Error", "Couldn't read the selected image.");
      return;
    }
    const mediaType = asset.mimeType ?? "image/jpeg";
    navigation.navigate("Scanning", { base64Image: asset.base64, mediaType });
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "Enable camera access in system settings to take a photo.");
      return;
    }
    setBusy(true);
    try {
      const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
      await handleResult(result);
    } finally {
      setBusy(false);
    }
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo library permission needed", "Enable photo access in system settings to choose an image.");
      return;
    }
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
      await handleResult(result);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={type.kicker}>Photo to ICS</Text>
        <Pressable onPress={() => navigation.navigate("Settings")} hitSlop={8}>
          <GearIcon size={24} color={colors.accent} weight="duotone" />
        </Pressable>
      </View>
      <ThickThinRule />

      <Text style={styles.headline}>Which flyer are we filing today?</Text>
      <Text style={styles.body}>
        Snap it or pick it, and we'll pull out every event we can find — whole conference programmes
        included.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={handleTakePhoto}
        disabled={busy}
      >
        <CameraIcon size={26} color={colors.bg} weight="duotone" />
        <Text style={styles.primaryButtonText}>Take a photo</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        onPress={handleChooseFromLibrary}
        disabled={busy}
      >
        <ImagesIcon size={26} color={colors.text} weight="duotone" />
        <Text style={styles.secondaryButtonText}>Choose from library</Text>
      </Pressable>

      <View style={styles.spacer} />

      <Text style={type.kicker}>Reads best</Text>
      <Text style={styles.footerNote}>Printed schedules, conference programmes and event posters. Screenshots of an email work too.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  headline: {
    ...type.screenHeadline,
    color: colors.text,
    marginTop: spacing[4],
  },
  body: {
    ...type.body,
    color: colors.text,
    maxWidth: 340,
    marginTop: spacing[3],
    marginBottom: spacing[6],
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.accent,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: 2,
    marginBottom: spacing[3],
  },
  primaryButtonPressed: {
    backgroundColor: colors.accent700,
  },
  primaryButtonText: {
    ...type.eventTitleCard,
    color: colors.bg,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: 2,
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(32,30,29,0.07)",
  },
  secondaryButtonText: {
    ...type.eventTitleCard,
    color: colors.text,
  },
  spacer: {
    flex: 1,
    minHeight: spacing[8],
  },
  footerNote: {
    ...type.body,
    color: colors.text,
    marginTop: spacing[1],
  },
});
