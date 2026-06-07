import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DeleteAccountScreen } from "../../src/screens/DeleteAccountScreen";

export default function DeleteAccountRoute() {
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

  return <DeleteAccountScreen />;
}
