import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";

import { getApiKey, setApiKey } from "../storage/apiKeyStore";
import Button from "../components/Button";
import { colors, spacing, fonts, type } from "../theme/broadsheet";

export default function SettingsScreen() {
  const [key, setKey] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await setApiKey(key.trim());
      Alert.alert("Saved", "Your API key has been saved on this device.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anthropic API key</Text>
      <TextInput
        style={styles.input}
        value={key}
        onChangeText={setKey}
        placeholder="sk-ant-…"
        placeholderTextColor={colors.neutral500}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button label="Save" onPress={handleSave} loading={saving} style={styles.button} />
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
    backgroundColor: colors.bg,
    padding: spacing[4],
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "rgba(32,30,29,0.7)",
    marginBottom: spacing[1],
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 2,
    paddingHorizontal: spacing[2],
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing[4],
  },
  button: {
    marginBottom: spacing[4],
  },
  note: {
    ...type.rowMeta,
  },
});
