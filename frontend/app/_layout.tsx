import * as WebBrowser from "expo-web-browser";

// OAuth dönüşü — provider yüklenmeden önce (Expo Go Android cold start)
WebBrowser.maybeCompleteAuthSession();

import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
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
import { loadSkyCatalog } from "../src/services/skyCatalog";
import { colors } from "../src/shared/theme";

const isOAuthReturnUrl = (url: string | null | undefined): boolean =>
  Boolean(url && (url.includes("auth/callback") || url.includes("code=") || url.includes("access_token=")));

/** Cold start: exp://…/auth/callback ile acilinca Metro'da gorunur. */
const OAuthColdStartProbe = () => {
  const router = useRouter();

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (!__DEV__ || !url) {
        return;
      }
      console.info("[Astrocus OAuth] app launch initialURL =", url.slice(0, 160));
      if (isOAuthReturnUrl(url)) {
        router.replace("/auth/callback");
      }
    });
  }, [router]);

  return null;
};

export default function RootLayout() {
  const refs = useAstrocusInfrastructureRefs();

  useEffect(() => {
    void loadSkyCatalog().catch((error) => {
      if (__DEV__) {
        console.warn("[Astrocus] sky catalog preload failed:", error);
      }
    });
  }, []);

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
          <OAuthColdStartProbe />
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
