import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SetupScreen from "../screens/SetupScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ScanningScreen from "../screens/ScanningScreen";
import ResultsScreen from "../screens/ResultsScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import { colors } from "../theme/broadsheet";

export type RootStackParamList = {
  Setup: undefined;
  Home: undefined;
  Settings: undefined;
  Scanning: { base64Image: string; mediaType: string };
  Results: undefined;
  EventDetail: { eventId: string };
  Confirmation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ initialRouteName }: { initialRouteName: "Setup" | "Home" }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.accent,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        <Stack.Screen
          name="Scanning"
          component={ScanningScreen}
          options={{ headerShown: false, headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
