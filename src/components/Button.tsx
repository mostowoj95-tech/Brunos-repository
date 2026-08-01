import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, spacing, fonts } from "../theme/broadsheet";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Button({ label, onPress, variant = "primary", disabled, loading, icon, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && !isDisabled && variant === "primary" && { backgroundColor: colors.accent700 },
        pressed && !isDisabled && variant === "secondary" && { backgroundColor: "rgba(32,30,29,0.14)" },
        pressed && !isDisabled && variant === "ghost" && { backgroundColor: "rgba(0,136,176,0.1)" },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? colors.bg : colors.accent} />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.label,
                variant === "primary" && styles.labelPrimary,
                variant === "secondary" && styles.labelSecondary,
                variant === "ghost" && styles.labelGhost,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[4],
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 17,
  },
  labelPrimary: {
    color: colors.bg,
  },
  labelSecondary: {
    color: colors.text,
  },
  labelGhost: {
    color: colors.accent,
  },
});
