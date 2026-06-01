import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, getTabBarMetrics, spacing } from "../../src/shared/theme";
import { useAppContext } from "../../src/context/AppContext";
import { t } from "../../src/shared/i18n";

export default function TabsLayout() {
  const { language, isReady, user } = useAppContext();
  const insets = useSafeAreaInsets();
  const { bottomOffset, height: tabBarHeight } = getTabBarMetrics(insets.bottom);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (!user.onboardingCompleted) {
    return <Redirect href="/(onboarding)/star-pick" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.warmOffWhite,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          position: "absolute",
          left: spacing.md,
          right: spacing.md,
          bottom: bottomOffset,
          backgroundColor: "rgba(6, 7, 22, 0.94)",
          borderColor: "rgba(149, 155, 181, 0.12)",
          borderTopWidth: 1,
          borderWidth: 1,
          borderRadius: 26,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: tabBarHeight,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          const name =
            route.name === "session"
              ? focused
                ? "timer"
                : "timer-outline"
              : route.name === "galaxy"
              ? focused
                ? "star-four-points"
                : "star-four-points-outline"
              : route.name === "profile"
              ? focused
                ? "account"
                : "account-outline"
              : "circle-outline";

          return (
            <MaterialCommunityIcons
              name={name}
              size={22}
              color={color}
              style={{ opacity: focused ? 1 : 0.65 }}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="session" options={{ title: t(language, "session") }} />
      <Tabs.Screen name="galaxy" options={{ title: t(language, "galaxy") }} />
      <Tabs.Screen name="profile" options={{ title: t(language, "profile") }} />
    </Tabs>
  );
}
