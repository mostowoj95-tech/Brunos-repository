import React from "react";
import { View, StyleSheet } from "react-native";

import { colors } from "../theme/broadsheet";

// The "thick-thin rule" — 3px solid ink, 2px gap, 1px solid ink.
// Front-page furniture used under the header on camera, home and results screens.
export default function ThickThinRule() {
  return (
    <View>
      <View style={styles.thick} />
      <View style={styles.gap} />
      <View style={styles.thin} />
    </View>
  );
}

const styles = StyleSheet.create({
  thick: {
    height: 3,
    backgroundColor: colors.text,
  },
  gap: {
    height: 2,
  },
  thin: {
    height: 1,
    backgroundColor: colors.text,
  },
});
