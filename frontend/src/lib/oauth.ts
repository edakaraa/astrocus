import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "./supabase";
import { requireSupabaseConfig } from "./supabaseConfig";
import { OAuthError } from "./oauthErrors";
import Constants, { ExecutionEnvironment } from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

const OAUTH_SCHEME = "astrocus";
const OAUTH_CALLBACK_PATH = "auth/callback";

export const getOAuthRedirectUri = (): string => {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const redirectTo = makeRedirectUri({
    scheme: OAUTH_SCHEME,
    path: OAUTH_CALLBACK_PATH,
    preferLocalhost: false,
    native: isExpoGo ? undefined : `${OAUTH_SCHEME}://${OAUTH_CALLBACK_PATH}`,
  });

  if (!redirectTo || redirectTo === "null" || !redirectTo.includes("://")) {
    return `${OAUTH_SCHEME}://${OAUTH_CALLBACK_PATH}`;
  }

  return redirectTo;
};

const parseHashParams = (url: string): Record<string, string> => {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) {
    return {};
  }

  const hash = url.slice(hashIndex + 1);
  const params: Record<string, string> = {};
  for (const part of hash.split("&")) {
    const [rawKey, rawValue = ""] = part.split("=");
    if (!rawKey) {
      continue;
    }
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
  }
  return params;
};

const parseOAuthRedirect = (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    throw new OAuthError(errorCode, "connection");
  }

  const hashParams = parseHashParams(url);
  const merged = { ...hashParams, ...params };

  return merged;
};

export const signInWithGoogle = async () => {
  const provider = "google" as const;
  try {
    requireSupabaseConfig();
  } catch (error) {
    throw new OAuthError(
      error instanceof Error ? error.message : "Supabase configuration is missing.",
      "config",
    );
  }

  const redirectTo = getOAuthRedirectUri();

  let data: { url: string | null } | null = null;
  let oauthError: { message: string } | null = null;

  try {
    const response = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    data = response.data;
    oauthError = response.error;
  } catch {
    throw new OAuthError(
      "We're having trouble connecting to the auth service. Check your connection and try again.",
      "connection",
    );
  }

  if (oauthError) {
    throw new OAuthError(oauthError.message, "connection");
  }

  const authUrl = data?.url?.trim();
  if (!authUrl || authUrl === "null" || !/^https?:\/\//i.test(authUrl)) {
    throw new OAuthError(
      "Auth service URL is invalid. Verify EXPO_PUBLIC_SUPABASE_URL in frontend/.env and restart Expo.",
      "config",
    );
  }

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  } catch {
    throw new OAuthError(
      "We're having trouble connecting to the auth service. Check your connection and try again.",
      "connection",
    );
  }

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new OAuthError("Sign-in was cancelled.", "cancelled");
  }

  if (result.type !== "success" || !result.url) {
    throw new OAuthError("Sign-in was cancelled.", "cancelled");
  }

  const params = parseOAuthRedirect(result.url);
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new OAuthError(
      "Sign-in completed but session tokens were missing. Add this redirect URL in Supabase → Authentication → URL Configuration: " +
        redirectTo,
      "connection",
    );
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !sessionData.session) {
    throw new OAuthError(sessionError?.message ?? "Failed to establish session.", "connection");
  }

  return sessionData.session;
};
