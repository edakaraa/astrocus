import { bindSentryToSupabaseAuth, initSentry, wrapRootWithSentry } from "../src/lib/errorTracking";
import { posthog, trackScreen } from "../src/lib/analytics";
import { PostHogProvider } from "posthog-react-native";

initSentry();
bindSentryToSupabaseAuth();

import * as WebBrowser from "expo-web-browser";

// OAuth dönüşü — provider yüklenmeden önce (Expo Go Android cold start)
WebBrowser.maybeCompleteAuthSession();
import "../src/lib/oauthLinking";

import React, { useEffect, useRef } from "react";
import { Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useNavigationContainerRef, useRouter } from "expo-router";
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
  NotificationProvider,
  useAstrocusInfrastructureRefs,
} from "../src/context/AppContext";
import { CelebrationHost } from "../src/components/CelebrationHost";
import { loadSkyCatalog } from "../src/services/skyCatalog";
import { colors } from "../src/shared/theme";

import { isOAuthReturnUrl, peekOAuthReturnUrl } from "../src/lib/oauthLinking";
import { setupNotificationResponseHandler } from "../src/lib/notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useDeepLink } from "../src/hooks/useDeepLink";
import { loadAuthPayloadFromSession } from "../src/shared/api";
import { useAppContext } from "../src/context/AppContext";

type NavigationRouteState = {
  index?: number;
  routes: Array<{ name?: string; state?: NavigationRouteState }>;
};

const resolveActiveRouteName = (
  navigationRef: ReturnType<typeof useNavigationContainerRef>,
): string | undefined => {
  if (!navigationRef.isReady()) {
    return undefined;
  }

  const route = navigationRef.getCurrentRoute();
  if (!route?.name) {
    return undefined;
  }

  let name = route.name;
  let state = route.state as NavigationRouteState | undefined;

  while (state?.routes?.length) {
    const index = state.index ?? state.routes.length - 1;
    const nested = state.routes[index];
    if (nested?.name) {
      name = nested.name;
    }
    state = nested?.state;
  }

  return name;
};

/** PostHog $screen — Expo Router navigation ref state changes. */
const PostHogScreenTracker = () => {
  const navigationRef = useNavigationContainerRef();
  const lastRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog) {
      return;
    }

    const trackCurrentScreen = () => {
      const routeName = resolveActiveRouteName(navigationRef);
      if (!routeName || routeName === lastRouteRef.current) {
        return;
      }
      lastRouteRef.current = routeName;
      trackScreen(routeName);
    };

    trackCurrentScreen();
    const unsubscribe = navigationRef.addListener("state", trackCurrentScreen);
    return unsubscribe;
  }, [navigationRef]);

  return null;
};

/** Cold start: exp://…/auth/callback ile acilinca Metro'da gorunur. */
const OAuthColdStartProbe = () => {
  const router = useRouter();

  useEffect(() => {
    const probe = async () => {
      const stashed = await peekOAuthReturnUrl();
      const initial = await Linking.getInitialURL();
      const url = stashed ?? initial;
      if (!url) {
        return;
      }
      if (__DEV__) {
        console.info("[Astrocus OAuth] app launch url =", url.slice(0, 160));
      }
      if (isOAuthReturnUrl(url)) {
        router.replace("/auth/callback");
      }
    };
    void probe();
  }, [router]);

  return null;
};

/** Supabase e-posta linkleri: doğrulama ve şifre sıfırlama. */
const AuthEmailDeepLinkHandler = () => {
  const router = useRouter();
  const { applyAuthPayload } = useAppContext();
  const { type, handled, error, session } = useDeepLink();
  const navigatedRef = React.useRef(false);

  useEffect(() => {
    if (!handled || navigatedRef.current) {
      return;
    }

    if (error) {
      if (__DEV__) {
        console.warn("[Astrocus DeepLink] navigation skipped:", error);
      }
      navigatedRef.current = true;
      router.replace("/(auth)");
      return;
    }

    const finish = async () => {
      navigatedRef.current = true;

      if (type === "signup" && session) {
        try {
          const payload = await loadAuthPayloadFromSession(session);
          await applyAuthPayload(payload);
        } catch (loadError) {
          if (__DEV__) {
            console.warn("[Astrocus DeepLink] payload load failed:", loadError);
          }
        }
        router.replace("/verify-success");
        return;
      }

      if (type === "recovery") {
        router.replace("/reset-password");
      }
    };

    void finish();
  }, [applyAuthPayload, error, handled, router, session, type]);

  return null;
};

const isExpoGo = () => Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Push notification tap → deep link into app routes. */
const NotificationResponseHandler = () => {
  const router = useRouter();

  useEffect(() => {
    if (__DEV__ && isExpoGo()) {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    void setupNotificationResponseHandler(router).then((listener) => {
      subscription = listener;
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  return null;
};

function RootLayoutInner() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider {...refs}>
        <NotificationProvider>
          <SessionProvider {...refs}>
            <UIProvider {...refs}>
              <PostHogScreenTracker />
              <OAuthColdStartProbe />
              <AuthEmailDeepLinkHandler />
              <NotificationResponseHandler />
              <CelebrationHost />
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </UIProvider>
          </SessionProvider>
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const SentryRootLayout = wrapRootWithSentry(RootLayoutInner);

export default function RootLayout() {
  if (!posthog) {
    return <SentryRootLayout />;
  }

  return (
    <PostHogProvider client={posthog} autocapture={false}>
      <SentryRootLayout />
    </PostHogProvider>
  );
}
