import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    primary: colors.primary,
    text: colors.text,
  },
};

const LoadingScreen = () => (
  <View style={{ alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" }}>
    <ActivityIndicator color={colors.primary} />
    <Text style={{ color: colors.text, marginTop: 12 }}>Astrocus</Text>
  </View>
);

const MainTabs = () => {
  const { language } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.warmOffWhite,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          backgroundColor: "rgba(6, 7, 22, 0.94)",
          borderColor: "rgba(149, 155, 181, 0.12)",
          borderTopWidth: 1,
          borderWidth: 1,
          borderRadius: 26,
          height: 70,
          paddingBottom: 10,
          paddingTop: 9,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
        },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarIcon: ({ focused, color }) => {
          const name =
            route.name === "Session"
              ? focused
                ? "timer"
                : "timer-outline"
              : route.name === "Galaxy"
              ? focused
                ? "star-four-points"
                : "star-four-points-outline"
              : route.name === "Profile"
                  ? focused
                    ? "account"
                    : "account-outline"
                  : "circle-outline";

          return <MaterialCommunityIcons name={name} size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />;
        },
      })}
    >
      <Tab.Screen name="Session" component={SessionScreen} options={{ title: t(language, "session") }} />
      <Tab.Screen name="Galaxy" component={GalaxyScreen} options={{ title: t(language, "galaxy") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t(language, "profile") }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isReady, user } = useAppContext();
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        {!hasCompletedIntro ? (
          <OnboardingScreen onComplete={() => setHasCompletedIntro(true)} />
        ) : !user ? (
          <AuthScreen />
        ) : (
          <MainTabs />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
