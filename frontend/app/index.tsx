import React, { useEffect, useMemo, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useAppContext } from "../src/context/AppContext";
import { asyncStorage } from "../src/shared/storage";
import { STORAGE_KEYS } from "../src/shared/constants";
import { colors } from "../src/shared/theme";

const LoadingScreen = () => (
  <View
    style={{
      alignItems: "center",
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: "center",
    }}
  >
    <ActivityIndicator color={colors.primary} />
    <Text style={{ color: colors.text, marginTop: 12 }}>Astrocus</Text>
  </View>
);

export default function Index() {
  const { isReady, user } = useAppContext();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const stored = await asyncStorage.get<boolean>(STORAGE_KEYS.onboardingSeen, false);
      setHasSeenOnboarding(stored);
    };

    void load();
  }, []);

  const href = useMemo(() => {
    if (!isReady || hasSeenOnboarding === null) {
      return null;
    }

    if (!hasSeenOnboarding) {
      return "/(onboarding)";
    }

    if (!user) {
      return "/(auth)";
    }

    return "/(tabs)/session";
  }, [hasSeenOnboarding, isReady, user]);

  if (!href) {
    return <LoadingScreen />;
  }

  return <Redirect href={href} />;
}

