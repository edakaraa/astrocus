import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../src/shared/theme";
import { useAppContext } from "../../src/context/AppContext";
import { t } from "../../src/shared/i18n";

export default function TabsLayout() {
  const { language } = useAppContext();

  return (
    <Tabs
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
              style={{ opacity: focused ? 1 : 0.6 }}
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

