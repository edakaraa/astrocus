import React from "react";
import { useRouter } from "expo-router";
import { OnboardingScreen } from "../../src/screens/OnboardingScreen";
import { asyncStorage } from "../../src/shared/storage";
import { STORAGE_KEYS } from "../../src/shared/constants";

export default function OnboardingRoute() {
  const router = useRouter();

  const handleComplete = async () => {
    await asyncStorage.set(STORAGE_KEYS.onboardingSeen, true);
    router.replace("/(auth)");
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}

