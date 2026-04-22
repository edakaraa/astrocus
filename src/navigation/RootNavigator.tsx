import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { AuthScreen } from "../screens/AuthScreen";
import { GalaxyScreen } from "../screens/GalaxyScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SessionScreen } from "../screens/SessionScreen";
import { colors } from "../shared/theme";
import { t } from "../shared/i18n";

const Tab = createBottomTabNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primaryStrong,
    text: colors.text,
  },
};

const LoadingScreen = () => (
  <View style={{ alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" }}>
    <ActivityIndicator color={colors.primaryStrong} />
    <Text style={{ color: colors.text, marginTop: 12 }}>Astrocus</Text>
  </View>
);

const MainTabs = () => {
  const { language } = useAppContext();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Session" component={SessionScreen} options={{ title: t(language, "session") }} />
      <Tab.Screen name="Galaxy" component={GalaxyScreen} options={{ title: t(language, "galaxy") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t(language, "profile") }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isReady, user } = useAppContext();

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!user.onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
