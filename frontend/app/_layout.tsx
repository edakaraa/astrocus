import * as WebBrowser from "expo-web-browser";

// OAuth dönüşü — provider yüklenmeden önce (Expo Go Android cold start)
WebBrowser.maybeCompleteAuthSession();

import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { MAX_FONT_SCALE } from "../src/shared/responsive";

// Clamp OS font scaling globally so a very large system text setting cannot
// break tightly-laid-out screens (still allows growth up to MAX_FONT_SCALE).
type FontScalableDefaults = { defaultProps?: { maxFontSizeMultiplier?: number } };
const TextWithDefaults = Text as unknown as FontScalableDefaults;
const TextInputWithDefaults = TextInput as unknown as FontScalableDefaults;
TextWithDefaults.defaultProps = {
  ...(TextWithDefaults.defaultProps ?? {}),
  maxFontSizeMultiplier: MAX_FONT_SCALE,
};
TextInputWithDefaults.defaultProps = {
  ...(TextInputWithDefaults.defaultProps ?? {}),
  maxFontSizeMultiplier: MAX_FONT_SCALE,
};
// TODO: React 19 removes defaultProps support for function components.
// When upgrading RN/Expo SDK, replace these defaultProps blocks with a
// project-wide <AppText> / <AppTextInput> wrapper that forwards
// maxFontSizeMultiplier={MAX_FONT_SCALE} to every Text/TextInput.
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
      if (!url) return;
      if (__DEV__) {
        console.info("[Astrocus OAuth] app launch initialURL =", url.slice(0, 160));
      }
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
