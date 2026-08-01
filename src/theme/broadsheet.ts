// Design tokens for the "Broadsheet" design system used throughout the app.
// Source: design handoff (`design_handoff_photo_to_ics/README.md`).

import type { TextStyle } from "react-native";

export const colors = {
  bg: "#f3f2f2",
  surface: "#eae9e9",
  text: "#201e1d",
  accent: "#0088b0",
  accent600: "#1186ac",
  accent700: "#006786",
  accent100: "#e9f8ff",
  accent800: "#004961",
  accent2: "#d6006c",
  accent2_100: "#fff1f4",
  accent2_800: "#790e3d",
  accent2_300: "#ffc0d0",
  neutral200: "#eae7e7",
  neutral300: "#d7d3d3",
  neutral400: "#bab6b6",
  neutral500: "#9b9797",
  neutral600: "#7d7979",
  neutral700: "#605d5d",
  neutral800: "#444141",
  divider: "rgba(32, 30, 29, 0.16)",
  backdrop: "rgba(32, 30, 29, 0.34)",
};

export const spacing = {
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  6: 30,
  8: 40,
};

export const radius = {
  sm: 1,
  md: 2,
  lg: 4,
};

export const shadow = {
  sm: {
    shadowColor: "#2d2b2b",
    shadowOpacity: 0.14,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: "#2d2b2b",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lg: {
    shadowColor: "#2d2b2b",
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

// Source Serif 4 font family names, as registered by useFonts() in App.tsx.
export const fonts = {
  regular: "SourceSerif4_400Regular",
  semibold: "SourceSerif4_600SemiBold",
  italic: "SourceSerif4_400Regular_Italic",
};

export const type = {
  screenHeadline: {
    fontFamily: fonts.semibold,
    fontSize: 42,
    lineHeight: 42 * 1.08,
    letterSpacing: -0.015 * 42,
  },
  sectionHeadline: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 32 * 1.12,
  },
  screenTitle: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 26 * 1.1,
  },
  dayHead: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 20 * 1.2,
  },
  eventTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 17 * 1.25,
  },
  eventTitleCard: {
    fontFamily: fonts.semibold,
    fontSize: 19,
    lineHeight: 19 * 1.25,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 16 * 1.6,
  },
  rowMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 14 * 1.55,
    color: colors.neutral700,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: colors.accent,
  },
  tag: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
  },
};
