import React from "react";
import { Redirect } from "expo-router";
import { AuthScreen } from "../../src/screens/AuthScreen";
import { useAppContext } from "../../src/context/AppContext";

export default function AuthRoute() {
  const { user, isReady } = useAppContext();

  if (isReady && user) {
    return (
      <Redirect href={user.onboardingCompleted ? "/(tabs)/session" : "/(onboarding)/star-pick"} />
    );
  }

  return <AuthScreen />;
}

