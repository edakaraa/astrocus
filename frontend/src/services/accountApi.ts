import Constants from "expo-constants";
import { getApiUrl } from "../shared/config";
import { isLocalDevApiUrl } from "../shared/apiUrlResolver";

const parseApiError = async (response: Response): Promise<string> => {
  const text = await response.text();
  if (!text) {
    return `Account deletion failed (${response.status})`;
  }

  try {
    const body = JSON.parse(text) as { error?: string; code?: string };
    return body.code ?? body.error ?? text;
  } catch {
    return text;
  }
};

const networkHint = (apiUrl: string): string => {
  const appEnv = Constants.expoConfig?.extra?.appEnv;
  const isReleaseBuild = appEnv === "production" || !__DEV__;

  if (isReleaseBuild || !isLocalDevApiUrl(apiUrl)) {
    return (
      `API'ye ulaşılamadı (${apiUrl}). ` +
      "İnternet bağlantınızı kontrol edin; sorun sürerse daha sonra tekrar deneyin."
    );
  }

  return (
    `API'ye ulaşılamadı (${apiUrl}). ` +
    "Backend çalışıyor olmalı (backend: npm run dev). " +
    "Telefon bilgisayarla aynı Wi‑Fi'de olmalı; Expo tunnel yalnızca Metro içindir, API'yi tünellemez. " +
    "Yerel backend kullanmıyorsanız .env içinde EXPO_PUBLIC_API_URL=https://astrocus.up.railway.app yapıp Metro'yu yeniden başlatın."
  );
};

/**
 * POST /account/delete — service role ile auth.users silinir.
 */
export const deleteRemoteAccount = async (accessToken: string): Promise<void> => {
  const base = getApiUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_API_URL tanımlı değil.");
  }

  if (__DEV__ && /:8081\/?$/.test(base)) {
    throw new Error("EXPO_PUBLIC_API_URL Metro portu (8081) olamaz; backend portu 4000 kullanın.");
  }

  const url = `${base}/account/delete`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/network request failed|failed to fetch|timed out/i.test(message)) {
      throw new Error(networkHint(base));
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
