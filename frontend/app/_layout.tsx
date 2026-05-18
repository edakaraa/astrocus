import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import {
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import {
  AuthProvider,
  SessionProvider,
  UIProvider,
  useAstrocusInfrastructureRefs,
} from "../src/context/AppContext";
import { colors } from "../src/shared/theme";

export default function RootLayout() {
  const refs = useAstrocusInfrastructureRefs();
  const [fontsLoaded] = useFonts({
    Outfit_800ExtraBold,
    Outfit_700Bold,
    DMSans_500Medium,
    DMSans_400Regular,
    SpaceMono_700Bold,
    SpaceMono_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider {...refs}>
      <SessionProvider {...refs}>
        <UIProvider {...refs}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </UIProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
