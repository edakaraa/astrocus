# Expo Go: Google OAuth + yerel API birlikte

## Sorun (iki mod, ikisi birden yok)

| Mod | Metro | Google OAuth | `POST /account/delete` → Express |
|-----|--------|--------------|----------------------------------|
| **A** `expo start --tunnel` | ngrok (Expo) | ✅ | ❌ `http://192.168.x.x:4000` telefondan erişilemez |
| **B** `expo start --lan` | LAN IP | ❌ (çoğunlukla yanlış `redirectTo`) | ✅ aynı Wi‑Fi |

**Neden:** Expo `--tunnel` yalnızca **Metro (8081)** için. Node API (4000) tünellenmez. Supabase istemcisi zaten internette; sorun Express’e giden `fetch`.

---

## Önerilen mimari: çift tünel (Expo Go, dev build yok)

```
Telefon (Expo Go)
    ├─ Metro JS  ──►  expo start --tunnel
    ├─ Google OAuth ──►  Supabase (cloud) ──► redirect → exp://… (tunnel/LAN uyumlu)
    └─ Express API ──►  https://xxxx.ngrok-free.app  (backend tüneli)
                              ▲
                         ngrok / cloudflared → localhost:4000
```

### Adımlar

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 — API tüneli (ngrok örneği)**

```bash
ngrok http 4000
```

HTTPS forwarding URL’ini kopyala (ör. `https://abc123.ngrok-free.app`).

**Terminal 3 — Expo (tunnel)**

```bash
cd frontend
# PowerShell:
$env:EXPO_PUBLIC_API_URL="https://abc123.ngrok-free.app"
npx expo start --tunnel -c
```

`frontend/.env` içine de yazabilirsin; **https URL’i kod LAN IP’ye çevirmez.**

### Supabase Redirect URLs

Tunnel ve LAN için Metro’daki log’a bak:

```
[Astrocus OAuth] redirectTo = ...
```

Bu satırı **Authentication → URL Configuration** listesine ekle. Örnekler:

- `exp://192.168.1.103:8081/--/auth/callback` (LAN)
- `exp://localhost:8081/--/auth/callback` (simülatör)
- `astrocus://auth/callback`
- `exp://**` (geliştirme wildcard)

Google Cloud Console’da yalnızca: `https://<project>.supabase.co/auth/v1/callback`

---

## Alternatif: yalnızca LAN (tünel yok)

1. `npx expo start --lan -c` (tunnel kullanma).
2. Metro’da `redirectTo` logunu kopyala → Supabase’e ekle.
3. `EXPO_PUBLIC_API_URL=http://<PC-LAN-IP>:4000` (veya boş bırak; `config.ts` Metro IP ile hizalar).
4. Telefon ve PC **aynı Wi‑Fi**; Windows’ta 4000 portu açık.

**Önemli:** Fiziksel cihazda `exp://localhost:8081` kullanma — localhost telefonun kendisidir.

---

## Ne zaman dev build?

Expo Go her zaman bu kısıtları taşır. Production’a yakın test için **EAS development build** + `astrocus://` scheme tek redirect ile ikisi de sadeleşir.
