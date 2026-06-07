import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { AcknowledgmentsScreen } from "../../src/screens/AcknowledgmentsScreen";

export default function AcknowledgmentsRoute() {
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

  return <AcknowledgmentsScreen />;
}
