import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, Animated, Easing, AccessibilityInfo } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircleIcon, CircleNotchIcon, CircleIcon } from "phosphor-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { extractEventsFromImage, NoEventsFoundError } from "../services/claudeApi";
import { getDeviceTimezone } from "../utils/deviceTimezone";
import { useScanSession } from "../context/ScanSessionContext";
import type { SessionEvent } from "../types/event";
import { colors, spacing, type, fonts } from "../theme/broadsheet";

type Props = NativeStackScreenProps<RootStackParamList, "Scanning">;

const STEPS = ["Uploading photo", "Reading the flyer with Claude", "Building your calendar"];

function makeEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ScanningScreen({ route, navigation }: Props) {
  const { base64Image, mediaType } = route.params;
  const { setEvents } = useScanSession();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true })
    );
    scanLoop.start();
    shimmerLoop.start();
    return () => {
      scanLoop.stop();
      shimmerLoop.stop();
    };
  }, [reduceMotion, scanAnim, shimmerAnim]);

  const run = useCallback(async () => {
    setError(null);
    setStep(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const deviceTimezone = getDeviceTimezone();
      setStep(1);
      const events = await extractEventsFromImage(base64Image, mediaType, deviceTimezone, controller.signal);
      setStep(2);
      const sessionEvents: SessionEvent[] = events.map((event) => ({ ...event, id: makeEventId() }));
      setEvents(sessionEvents);
      navigation.replace("Results");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof NoEventsFoundError) {
        setError("Couldn't find any events in this image. Try a clearer photo.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  }, [base64Image, mediaType, navigation, setEvents]);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  function handleCancel() {
    abortRef.current?.abort();
    navigation.navigate("Home");
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={run}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backLink}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  const scanTranslateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 292] });
  const shimmerTranslateX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-120, 400] });

  return (
    <View style={styles.container}>
      <View style={styles.photoFrame}>
        <Image source={{ uri: `data:${mediaType};base64,${base64Image}` }} style={styles.photo} resizeMode="cover" />
        <View style={styles.photoOverlay} />
        {!reduceMotion && (
          <Animated.View style={[styles.scanBar, { transform: [{ translateY: scanTranslateY }] }]}>
            <LinearGradient
              colors={["rgba(0,136,176,0)", "rgba(0,136,176,0.28)"]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>

      <Text style={styles.headline}>Reading your photo…</Text>

      <View style={styles.statusList}>
        {STEPS.map((label, index) => {
          const done = index < step;
          const current = index === step;
          const Icon = done ? CheckCircleIcon : current ? CircleNotchIcon : CircleIcon;
          const color = done ? colors.neutral600 : current ? colors.text : colors.neutral500;
          return (
            <View key={label} style={styles.statusRow}>
              <Icon size={18} color={color} weight="duotone" />
              <Text style={[styles.statusText, { color }, current && styles.statusTextCurrent]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.shimmerTrack}>
        {!reduceMotion && (
          <Animated.View style={[styles.shimmerSweep, { transform: [{ translateX: shimmerTranslateX }] }]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>

      <Pressable onPress={handleCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
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
    alignItems: "center",
  },
  photoFrame: {
    width: "100%",
    height: 326,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.neutral300,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(32,30,29,0.25)",
  },
  scanBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 34,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  headline: {
    ...type.sectionHeadline,
    color: colors.text,
    alignSelf: "flex-start",
    marginTop: spacing[6],
  },
  statusList: {
    width: "100%",
    marginTop: spacing[4],
    gap: spacing[3],
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  statusText: {
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  statusTextCurrent: {
    fontFamily: fonts.semibold,
  },
  shimmerTrack: {
    width: "100%",
    height: 60,
    marginTop: spacing[6],
    borderRadius: 2,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  shimmerSweep: {
    width: 120,
    height: "100%",
  },
  cancelButton: {
    marginTop: "auto",
    marginBottom: spacing[4],
    paddingVertical: spacing[3],
  },
  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.accent,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlign: "center",
    marginTop: spacing[8],
    marginBottom: spacing[4],
    color: colors.text,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 2,
    marginBottom: spacing[3],
  },
  retryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.bg,
  },
  backLink: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.neutral600,
  },
});
