import React from "react";
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: "rgba(7, 5, 26, 0.98)",
          borderTopColor: "rgba(179, 191, 255, 0.08)",
          borderTopWidth: 1,
          height: 74,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
        },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarIcon: ({ focused, color }) => {
          const name =
            route.name === "Galaxy"
              ? focused
                ? "star-four-points"
                : "star-four-points-outline"
              : route.name === "Session"
                ? focused
                  ? "rocket-launch"
                  : "rocket-launch-outline"
                : route.name === "Profile"
                  ? focused
                    ? "account"
                    : "account-outline"
                  : "circle-outline";

          return <MaterialCommunityIcons name={name} size={22} color={color} style={{ opacity: focused ? 1 : 0.6 }} />;
        },
      })}
    >
      <Tab.Screen name="Galaxy" component={GalaxyScreen} options={{ title: t(language, "galaxy") }} />
      <Tab.Screen name="Session" component={SessionScreen} options={{ title: t(language, "session") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t(language, "profile") }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isReady, user } = useAppContext();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        {!user ? <AuthScreen /> : !user.onboardingCompleted ? <OnboardingScreen /> : <MainTabs />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
