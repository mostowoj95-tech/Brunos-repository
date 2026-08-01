import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProcessingScreen from "../screens/ProcessingScreen";
import ResultsScreen from "../screens/ResultsScreen";
import type { ExtractedEvent } from "../types/event";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Processing: { base64Image: string; mediaType: string };
  Results: { events: ExtractedEvent[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Photo to ICS" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{ title: "Processing", headerBackVisible: false }}
        />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: "Events" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
