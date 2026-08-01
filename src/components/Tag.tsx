import React from "react";
import { Text, StyleSheet } from "react-native";

import { colors, fonts } from "../theme/broadsheet";

interface Props {
  label: string;
  variant?: "accent" | "accent2";
}

export default function Tag({ label, variant = "accent2" }: Props) {
  return <Text style={[styles.base, variant === "accent" ? styles.accent : styles.accent2]}>{label}</Text>;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
    fontSize: 11,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 2,
    overflow: "hidden",
  },
  accent: {
    backgroundColor: colors.accent100,
    color: colors.accent800,
  },
  accent2: {
    backgroundColor: colors.accent2_100,
    color: colors.accent2_800,
  },
});
