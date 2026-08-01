import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { extractEventsFromImage, NoEventsFoundError } from "../services/claudeApi";
import { getDeviceTimezone } from "../utils/deviceTimezone";

type Props = NativeStackScreenProps<RootStackParamList, "Processing">;

export default function ProcessingScreen({ route, navigation }: Props) {
  const { base64Image, mediaType } = route.params;
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    try {
      const deviceTimezone = getDeviceTimezone();
      const events = await extractEventsFromImage(base64Image, mediaType, deviceTimezone);
      navigation.replace("Results", { events });
    } catch (err) {
      if (err instanceof NoEventsFoundError) {
        setError("Couldn't find any events in this image. Try a clearer photo.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  }, [base64Image, mediaType, navigation]);

  useEffect(() => {
    run();
  }, [run]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={run}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backLink}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1a1a1a" />
      <Text style={styles.loadingText}>Reading your photo…</Text>
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  retryButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    color: "#666",
    fontSize: 14,
  },
});
