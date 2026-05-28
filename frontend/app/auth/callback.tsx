import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { completeOAuthFromUrl } from "../../src/lib/oauth";
import { loadAuthPayloadFromSession } from "../../src/shared/api";
import { useAppContext } from "../../src/context/AppContext";
import { colors } from "../../src/shared/theme";

const isOAuthReturnUrl = (url: string | null | undefined): boolean => {
  if (!url) {
    return false;
  }
  return url.includes("auth/callback") || url.includes("code=") || url.includes("access_token=");
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
        if (__DEV__) {
          console.info("[Astrocus OAuth] callback success user =", payload.user.email);
        }
        router.replace(
          payload.user.onboardingCompleted ? "/(tabs)/session" : "/(onboarding)/star-pick",
        );
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[Astrocus OAuth] callback failed:",
            error instanceof Error ? error.message : error,
          );
        }
        router.replace("/(auth)");
      }
    };

    void Linking.getInitialURL().then((url) => finish(url));
    const subscription = Linking.addEventListener("url", (event) => {
      void finish(event.url);
    });
    const fallbackTimer = setTimeout(() => {
      if (!handledRef.current) {
        router.replace("/(auth)");
      }
    }, 15_000);

    return () => {
      subscription.remove();
      clearTimeout(fallbackTimer);
    };
  }, [applyAuthPayload, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
