import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";

import { getApiKey, setApiKey } from "../storage/apiKeyStore";

export default function SettingsScreen() {
  const [key, setKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getApiKey().then((existing) => {
      if (existing) setKey(existing);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    if (!key.trim()) {
      Alert.alert("Missing key", "Enter an API key before saving.");
      return;
    }
    await setApiKey(key.trim());
    Alert.alert("Saved", "Your API key has been saved on this device.");
  }

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anthropic API Key</Text>
      <TextInput
        style={styles.input}
        value={key}
        onChangeText={setKey}
        placeholder="sk-ant-..."
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      <Text style={styles.note}>
        Stored encrypted on this device only (iOS Keychain / Android Keystore) — never synced or sent anywhere except
        directly to the Anthropic API when processing a photo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
  },
});
