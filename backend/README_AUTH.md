# Astrocus — Supabase Auth (Frontend Integration)

This guide describes how the **Expo / React Native** app should authenticate against Supabase and call the Astrocus Express API. No frontend code lives in this repo; wire these steps in `frontend/`.

## Prerequisites

1. Create a Supabase project and apply `supabase/migrations/001_initial_schema.sql` (via CLI: `supabase db push` or Dashboard SQL).
2. Copy keys into the mobile app (public) and backend (secret):

| Variable | Where | Purpose |
|----------|--------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Frontend `.env` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Frontend `.env` | Client SDK (RLS-enforced) |
| `SUPABASE_URL` | `backend/.env` | Same URL |
| `SUPABASE_ANON_KEY` | `backend/.env` | Used by API to build user-scoped clients |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` only | **Never** ship to the app |

3. In Supabase Dashboard → **Authentication → URL Configuration**, set:
   - **Site URL**: your production web URL or `astrocus://` for deep links
   - **Redirect URLs**: all OAuth redirect URIs you use (see below)

---

## 1. Email / Password

### Sign up

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      username: "Kaşif",
      galaxy_name: "Astrocus",
    },
  },
});
```

`handle_new_user` trigger creates `profiles` + grants starter star `luna`.

### Sign in

```ts
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const accessToken = data.session?.access_token;
```

### Session persistence

Use `@supabase/supabase-js` with Expo Secure Store (recommended: `@supabase/supabase-js` + custom `storage` adapter or `expo-secure-store`).

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: /* AsyncStorage or SecureStore adapter */,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

Listen for auth changes:

```ts
supabase.auth.onAuthStateChange((_event, session) => {
  // sync app context; session?.access_token for API calls
});
```

### Password reset

```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "astrocus://reset-password",
});
```

Handle the deep link in Expo Router and call `supabase.auth.updateUser({ password: newPassword })`.

---

## 2. Google OAuth (Native)

Use **Expo AuthSession** with Supabase OAuth (PKCE). Do **not** embed the service role key in the app.

### Supabase Dashboard

1. **Authentication → Providers → Google** → enable, add Web Client ID + secret from Google Cloud Console.
2. For native, you also need **iOS** and **Android** OAuth client IDs in Google Cloud (same project).

### App config (`app.json` / `app.config.ts`)

```json
{
  "expo": {
    "scheme": "astrocus",
    "ios": { "bundleIdentifier": "com.yourorg.astrocus" },
    "android": { "package": "com.yourorg.astrocus" }
  }
}
```

### Redirect URI

Register in Supabase **Redirect URLs**:

- `astrocus://auth/callback`
- Expo dev: `https://auth.expo.io/@your-username/astrocus` (if using Expo proxy during development)

### Sign-in flow

```ts
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: "astrocus", path: "auth/callback" });

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo,
    skipBrowserRedirect: true,
  },
});

if (data?.url) {
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success" && result.url) {
    // Exchange code for session (Supabase v2 handles via setSession from URL fragments)
    await supabase.auth.exchangeCodeForSession(result.url);
  }
}
```

Store `session.access_token` and send it to the Express API:

```ts
fetch(`${API_URL}/analytics/summary`, {
  headers: { Authorization: `Bearer ${session.access_token}` },
});
```

---

## 3. Apple Sign In (Native — required for iOS App Store)

### Supabase Dashboard

1. **Authentication → Providers → Apple** → enable.
2. Configure **Apple Developer**:
   - App ID with “Sign in with Apple”
   - Services ID (for web/OAuth) if needed
   - Key (.p8), Team ID, Key ID → enter in Supabase

### iOS capability

In Xcode / EAS: enable **Sign in with Apple** capability for your bundle ID.

### Expo

Use `expo-apple-authentication` together with Supabase:

```ts
import * as AppleAuthentication from "expo-apple-authentication";

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});

if (!credential.identityToken) throw new Error("No identity token");

const { data, error } = await supabase.auth.signInWithIdToken({
  provider: "apple",
  token: credential.identityToken,
});
```

On first sign-in, pass display name into user metadata if Apple provides it:

```ts
await supabase.auth.updateUser({
  data: { username: credential.fullName?.givenName ?? "Kaşif" },
});
```

### Android

Apple Sign In on Android is optional; use Google or email there. iOS builds must offer Apple per App Store guidelines when other third-party logins exist.

---

## Calling backend endpoints

All protected routes require:

```
Authorization: Bearer <supabase_access_token>
```

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/analytics/summary?timezone=Europe/Istanbul` | Charts + streak/level |
| `POST` | `/stars/unlock` | Body: `{ "star_id": "solis" }` |
| `POST` | `/account/delete` | Permanent account deletion (App Store compliance) |

### Complete focus session (Supabase RPC — client only)

Do **not** POST rewards to Express. Call from the app with the user JWT:

```ts
const { data, error } = await supabase.rpc("complete_focus_session", {
  p_category_id: categoryId,
  p_duration_minutes: durationMinutes,
  p_started_at: startedAt,
  p_completed_at: completedAt,
  p_pause_used: pauseCount > 0,
  p_is_offline: false,
  p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});
```

Response fields for the celebration modal: `xp_earned`, `stardust_earned`, `streak_count`, `new_badges`.

---

## Security checklist

- [ ] Anon key only in the mobile app; service role only on the server.
- [ ] Never send `stardust_earned` or XP from the client; the RPC computes them.
- [ ] Refresh tokens via Supabase SDK; attach fresh `access_token` to API calls.
- [ ] Deep link / redirect URLs whitelisted in Supabase.
- [ ] Test account deletion on a sandbox user before App Store submission.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Invalid session` from API | Token expired; call `supabase.auth.getSession()` and refresh |
| OAuth redirect loop | Mismatch between `redirectTo` and Supabase Redirect URLs |
| `duration_mismatch` on RPC | `completed_at - started_at` &lt; 90% of `duration_minutes` |
| Profile missing after signup | Confirm `on_auth_user_created` trigger exists on `auth.users` |
| RLS errors on insert | User must be authenticated; use `auth.uid()`-scoped policies |

For local API development: `cd backend && npm run dev` (default `http://localhost:4000`).
