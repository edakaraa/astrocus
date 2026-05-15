import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { AuthScreen } from "../../src/screens/AuthScreen";
import { useAppContext } from "../../src/context/AppContext";

export default function AuthRoute() {
  const { user, isReady } = useAppContext();

  useEffect(() => {
    // no-op: keeping component stable for future side-effects
  }, []);

  if (isReady && user) {
    return <Redirect href="/(tabs)/session" />;
  }

  return <AuthScreen />;
}

