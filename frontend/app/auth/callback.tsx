import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { completeOAuthFromUrl } from "../../src/lib/oauth";
import {
  clearOAuthReturnUrl,
  isOAuthReturnUrl,
  peekOAuthReturnUrl,
  stashOAuthReturnUrl,
} from "../../src/lib/oauthLinking";
import { loadAuthPayloadFromSession } from "../../src/shared/api";
import { useAppContext } from "../../src/context/AppContext";
import { colors } from "../../src/shared/theme";

const resolveOAuthReturnUrl = async (): Promise<string | null> => {
  const stashed = await peekOAuthReturnUrl();
  if (stashed) {
    return stashed;
  }
  const initial = await Linking.getInitialURL();
  if (isOAuthReturnUrl(initial)) {
    await stashOAuthReturnUrl(initial!);
    return initial;
  }
  return null;
};

/**
 * Deep link yedek tamamlayıcı — WebBrowser aynı oturumda bitiremezse (Android cold start).
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { applyAuthPayload } = useAppContext();
  const handledRef = useRef(false);

  useEffect(() => {
    const finish = async (url: string | null) => {
      if (!url || handledRef.current || !isOAuthReturnUrl(url)) {
        return;
      }

      handledRef.current = true;

      if (__DEV__) {
        console.info("[Astrocus OAuth] callback screen url =", url.slice(0, 160));
      }

      try {
        const session = await completeOAuthFromUrl(url);
        const payload = await loadAuthPayloadFromSession(session);
        await applyAuthPayload(payload);
        await clearOAuthReturnUrl();
        if (__DEV__) {
          console.info("[Astrocus OAuth] callback success user =", payload.user.email);
        }
        router.replace(
          payload.user.onboardingCompleted ? "/(tabs)/session" : "/(onboarding)/star-pick",
        );
      } catch (error) {
        await clearOAuthReturnUrl();
        if (__DEV__) {
          console.warn(
            "[Astrocus OAuth] callback failed:",
            error instanceof Error ? error.message : error,
          );
        }
        router.replace("/(auth)");
      }
    };

    void resolveOAuthReturnUrl().then((url) => finish(url));
    const subscription = Linking.addEventListener("url", (event) => {
      void stashOAuthReturnUrl(event.url);
      void finish(event.url);
    });
    const stashPoll = setInterval(() => {
      void peekOAuthReturnUrl().then((url) => finish(url));
    }, 400);
    const fallbackTimer = setTimeout(() => {
      if (!handledRef.current) {
        router.replace("/(auth)");
      }
    }, 15_000);

    return () => {
      subscription.remove();
      clearInterval(stashPoll);
      clearTimeout(fallbackTimer);
    };
  }, [applyAuthPayload, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
