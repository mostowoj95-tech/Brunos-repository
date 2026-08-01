import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { getApiKey } from "../storage/apiKeyStore";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);

  async function ensureApiKeyOrRedirect(): Promise<boolean> {
    const key = await getApiKey();
    if (!key) {
      Alert.alert("API key required", "Add your Anthropic API key in Settings before capturing a flyer.", [
        { text: "Go to Settings", onPress: () => navigation.navigate("Settings") },
      ]);
      return false;
    }
    return true;
  }

  async function handleResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Error", "Couldn't read the selected image.");
      return;
    }
    const mediaType = asset.mimeType ?? "image/jpeg";
    navigation.navigate("Processing", { base64Image: asset.base64, mediaType });
  }

  async function handleTakePhoto() {
    if (!(await ensureApiKeyOrRedirect())) return;
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
    if (!(await ensureApiKeyOrRedirect())) return;
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
      <Pressable style={styles.gearButton} onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.gearIcon}>⚙️</Text>
      </Pressable>

      <Text style={styles.title}>Photo to ICS</Text>
      <Text style={styles.subtitle}>Turn a flyer photo into calendar events</Text>

      <Pressable style={[styles.button, styles.primaryButton]} onPress={handleTakePhoto} disabled={busy}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleChooseFromLibrary} disabled={busy}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Choose from Library</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  gearButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  gearIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1a1a1a",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1a1a1a",
  },
});
