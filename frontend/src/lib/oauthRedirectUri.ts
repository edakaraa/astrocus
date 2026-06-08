import { makeRedirectUri } from "expo-auth-session";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { getMetroLanHost, isExpoTunnelHost } from "../shared/config";

const SCHEME = "astrocus";
const CALLBACK_PATH = "auth/callback";

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

/** Expo Go: Metro'nun o an kullandığı exp:// tabanını kullan (tunnel/LAN ile uyumlu). */
const getExpoGoRedirectUri = (): string => {
  const linkingUri = Constants.linkingUri?.trim();
  if (linkingUri?.startsWith("exp://")) {
    const base = linkingUri.replace(/\/--\/.*$/, "").replace(/\/$/, "");
    return replaceLoopbackWithLan(`${base}/--/${CALLBACK_PATH}`);
  }
  return replaceLoopbackWithLan(makeRedirectUri({ path: CALLBACK_PATH }));
};

export const getOAuthRedirectUri = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI?.trim();
  if (fromEnv?.includes("://")) {
    return replaceLoopbackWithLan(fromEnv);
  }

  if (isExpoGo()) {
    return getExpoGoRedirectUri();
  }

  return makeRedirectUri({
    scheme: SCHEME,
    path: CALLBACK_PATH,
  });
};
