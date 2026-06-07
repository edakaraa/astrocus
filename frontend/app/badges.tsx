import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { BadgesScreen } from "../src/screens/BadgesScreen";

export default function BadgesRoute() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/(auth)");
    }
  }, [isReady, router, user]);

  if (!isReady || !user) {
    return null;
  }

  return <BadgesScreen />;
}
