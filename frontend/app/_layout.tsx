// [GÖREV 3] — AuthProvider > SessionProvider > UIProvider iç içe sarma

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AuthProvider,
  SessionProvider,
  UIProvider,
  useAstrocusInfrastructureRefs,
} from "../src/context/AppContext";
import { colors } from "../src/shared/theme";

const RootStack = () => {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
};

export default function RootLayout() {
  const refs = useAstrocusInfrastructureRefs();

  return (
    <AuthProvider {...refs}>
      <SessionProvider {...refs}>
        <UIProvider {...refs}>
          <RootStack />
        </UIProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
