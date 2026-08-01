import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Linking } from "react-native";
import { KeyIcon, LockKeyIcon, ShieldCheckIcon } from "phosphor-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { setApiKey } from "../storage/apiKeyStore";
import Button from "../components/Button";
import { colors, spacing, type, fonts } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "Setup">;

export default function SetupScreen({ navigation }: Props) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await setApiKey(trimmed);
      navigation.replace("Home");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyIcon size={38} color={colors.accent} weight="duotone" />

      <Text style={styles.headline}>One quick setup and you're done</Text>

      <Text style={styles.body}>
        Photo to ICS reads your flyers with Anthropic's Claude. Paste your team's API key once — it
        stays on this phone.
      </Text>

      <View style={styles.field}>
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
      </View>

      <View style={styles.reassuranceRow}>
        <LockKeyIcon size={19} color={colors.accent} weight="duotone" />
        <Text style={styles.reassuranceText}>Stored in the iOS Keychain / Android Keystore — never synced.</Text>
      </View>
      <View style={styles.reassuranceRow}>
        <ShieldCheckIcon size={19} color={colors.accent} weight="duotone" />
        <Text style={styles.reassuranceText}>Photos go straight to Anthropic and nowhere else. No account, no server of ours.</Text>
      </View>

      <View style={styles.spacer} />

      <Button label="Save key and continue" onPress={handleSave} disabled={!key.trim()} loading={saving} />

      <Pressable
        style={styles.helpLink}
        onPress={() => Linking.openURL("https://console.anthropic.com/settings/keys")}
      >
        <Text style={styles.helpLinkText}>Where do I find the key?</Text>
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
    maxWidth: 320,
    marginTop: spacing[3],
  },
  field: {
    marginTop: spacing[6],
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "rgba(32, 30, 29, 0.7)",
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
  },
  reassuranceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    marginTop: spacing[3],
  },
  reassuranceText: {
    ...type.rowMeta,
    flex: 1,
  },
  spacer: {
    flex: 1,
    minHeight: spacing[8],
  },
  helpLink: {
    alignSelf: "center",
    paddingVertical: spacing[4],
  },
  helpLinkText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.accent,
  },
});
