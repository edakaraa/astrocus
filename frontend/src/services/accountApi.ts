import Constants from "expo-constants";

const resolveApiUrl = (): string => {
  const raw = Constants.expoConfig?.extra?.apiUrl;
  return typeof raw === "string" ? raw.trim() : "";
};

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

/**
 * Calls backend POST /account/delete which uses SUPABASE_SERVICE_ROLE_KEY
 * and auth.admin.deleteUser — never deletes only public.profiles from the client.
 */
export const deleteRemoteAccount = async (accessToken: string): Promise<void> => {
  const base = resolveApiUrl();
  if (!base) {
    throw new Error("API URL not configured (EXPO_PUBLIC_API_URL)");
  }

  if (__DEV__ && /:8081\/?$/.test(base)) {
    throw new Error(
      "EXPO_PUBLIC_API_URL points to Expo Metro (port 8081). Use your API server on port 4000, e.g. http://192.168.1.x:4000",
    );
  }

  const response = await fetch(`${base.replace(/\/$/, "")}/account/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
