import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts, SourceSerif4_400Regular, SourceSerif4_600SemiBold, SourceSerif4_400Regular_Italic } from "@expo-google-fonts/source-serif-4";

import AppNavigator from "./src/navigation/AppNavigator";
import { ScanSessionProvider } from "./src/context/ScanSessionContext";
import { getApiKey } from "./src/storage/apiKeyStore";
import { colors } from "./src/theme/broadsheet";

export default function App() {
  const [fontsLoaded] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
    SourceSerif4_400Regular_Italic,
  });
  const [initialRoute, setInitialRoute] = useState<"Setup" | "Home" | null>(null);

  useEffect(() => {
    getApiKey().then((key) => setInitialRoute(key ? "Home" : "Setup"));
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <ScanSessionProvider>
      <StatusBar style="dark" />
      <AppNavigator initialRouteName={initialRoute} />
    </ScanSessionProvider>
  );
}
