import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, layout, spacing } from "../../src/shared/theme";
import { useAppContext } from "../../src/context/AppContext";
import { t } from "../../src/shared/i18n";

export default function TabsLayout() {
  const { language, isReady, user } = useAppContext();
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(spacing.sm, insets.bottom);
  const tabBarHeight = layout.tabBarHeight + tabBarBottom - spacing.sm;

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
          bottom: tabBarBottom,
          backgroundColor: "rgba(6, 7, 22, 0.94)",
          borderColor: "rgba(149, 155, 181, 0.12)",
          borderTopWidth: 1,
          borderWidth: 1,
          borderRadius: 26,
          height: tabBarHeight,
          maxHeight: 56 + tabBarBottom,
          paddingBottom: Math.max(spacing.xs, insets.bottom * 0.5),
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIconStyle: { marginBottom: 2 },
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
              size={24}
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
};
