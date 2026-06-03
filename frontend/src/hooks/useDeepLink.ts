import { useCallback, useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";
import {
  isAuthEmailDeepLink,
  parseAuthDeepLinkParams,
  resolveAuthDeepLinkType,
  type DeepLinkAuthType,
} from "../lib/authDeepLink";
import { supabase } from "../lib/supabase";

export type { DeepLinkAuthType } from "../lib/authDeepLink";
export { isAuthEmailDeepLink, isOAuthCallbackUrl } from "../lib/authDeepLink";

export type DeepLinkState = {
  type: DeepLinkAuthType;
  handled: boolean;
  error: string | null;
  session: Session | null;
};

const INITIAL_STATE: DeepLinkState = {
  type: null,
  handled: false,
  error: null,
  session: null,
};

export const handleAuthDeepLink = async (url: string): Promise<DeepLinkState> => {
  if (!isAuthEmailDeepLink(url)) {
    return INITIAL_STATE;
  }

  try {
    const params = parseAuthDeepLinkParams(url);
    const authType = resolveAuthDeepLinkType(params.type, url);
    const authCode = params.code;
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    let session: Session | null = null;

    if (authCode) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
      if (error || !data.session) {
        throw new Error(error?.message ?? "Could not establish session from auth code.");
      }
      session = data.session;
    } else if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error || !data.session) {
        throw new Error(error?.message ?? "Could not establish session from tokens.");
      }
      session = data.session;
    } else {
      throw new Error("Auth link is missing tokens or authorization code.");
    }

    const resolvedType = authType ?? resolveAuthDeepLinkType(undefined, url);
    if (!resolvedType) {
      throw new Error("Auth link type could not be determined.");
    }

    if (__DEV__) {
      console.info("[Astrocus DeepLink] handled", { type: resolvedType, url: url.slice(0, 160) });
    }

    return {
      type: resolvedType,
      handled: true,
      error: null,
      session,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth deep link failed.";
    if (__DEV__) {
      console.warn("[Astrocus DeepLink] failed:", message);
    }
    return {
      type: resolveAuthDeepLinkType(undefined, url),
      handled: true,
      error: message,
      session: null,
    };
  }
};

/**
 * Supabase auth e-posta linklerini dinler (doğrulama, şifre sıfırlama).
 * OAuth callback URL'leri bu hook tarafından işlenmez.
 */
export function useDeepLink(): DeepLinkState {
  const [state, setState] = useState<DeepLinkState>(INITIAL_STATE);
  const handledUrlsRef = useRef<Set<string>>(new Set());

  const processUrl = useCallback(async (url: string | null | undefined) => {
    if (!url || handledUrlsRef.current.has(url)) {
      return;
    }
    if (!isAuthEmailDeepLink(url)) {
      return;
    }

    handledUrlsRef.current.add(url);
    const result = await handleAuthDeepLink(url);
    if (result.handled) {
      setState(result);
    }
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => processUrl(url));

    const subscription = Linking.addEventListener("url", (event) => {
      void processUrl(event.url);
    });

    return () => subscription.remove();
  }, [processUrl]);

  return state;
}
