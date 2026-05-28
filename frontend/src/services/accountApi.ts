import { getApiUrl } from "../shared/config";

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

const networkHint = (apiUrl: string): string =>
  `API'ye ulaşılamadı (${apiUrl}). ` +
  "Backend çalışıyor olmalı (backend: npm run dev). " +
  "Telefon bilgisayarla aynı Wi‑Fi'de olmalı; Expo tunnel yalnızca Metro içindir, API'yi tünellemez.";

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
