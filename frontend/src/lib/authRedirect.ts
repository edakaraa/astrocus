import { makeRedirectUri } from "expo-auth-session";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { getMetroLanHost, isExpoTunnelHost } from "../shared/config";
import { getOAuthRedirectUri } from "./oauth";

const SCHEME = "astrocus";

export type AuthEmailRedirectPath = "reset-password" | "verify-success";

const isExpoGo = () => Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const replaceLoopbackWithLan = (uri: string): string => {
  if (isExpoTunnelHost()) {
    return uri;
  }
  const lan = getMetroLanHost();
  if (!lan) {
    return uri;
  }
  return uri.replace(/\b127\.0\.0\.1\b/g, lan).replace(/\blocalhost\b/gi, lan);
};

/** Supabase e-posta linkleri (doğrulama, şifre sıfırlama) için redirect URI. */
export const getAuthEmailRedirectUri = (path: AuthEmailRedirectPath): string => {
  const fromEnv =
    path === "reset-password"
      ? process.env.EXPO_PUBLIC_AUTH_RESET_REDIRECT_URI?.trim()
      : process.env.EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI?.trim();

  if (fromEnv?.includes("://")) {
    return replaceLoopbackWithLan(fromEnv);
  }

  if (isExpoGo()) {
    const linkingUri = Constants.linkingUri?.trim();
    if (linkingUri?.startsWith("exp://")) {
      const base = linkingUri.replace(/\/--\/.*$/, "").replace(/\/$/, "");
      return replaceLoopbackWithLan(`${base}/--/${path}`);
    }
    return replaceLoopbackWithLan(makeRedirectUri({ path }));
  }

  return makeRedirectUri({
    scheme: SCHEME,
    path,
    native: `${SCHEME}://${path}`,
  });
};

/** Tüm auth redirect URI'leri (OAuth + e-posta) — Supabase Dashboard için. */
export const getAllAuthRedirectUris = (): string[] => {
  const unique = new Set<string>([
    getOAuthRedirectUri(),
    getAuthEmailRedirectUri("reset-password"),
    getAuthEmailRedirectUri("verify-success"),
  ]);
  return [...unique];
};
