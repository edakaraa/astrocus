# Google OAuth (Expo Go)

Ayrıntılı ağ modları: [dev-expo-go-networking.md](./dev-expo-go-networking.md)

## Expo Go + `expo-notifications` (Android kırmızı ekran)

SDK 53+ **Expo Go Android**'de `expo-notifications` paketi yüklenirken `console.error` üretir; LogBox bunu fatal sayar. Google OAuth sonrası uygulama yeniden açılınca aynı hata görülebilir (**redirect doğru olsa bile**).

**Kod tarafı:** `src/shared/notifications.ts` Expo Go'da modülü hiç import etmez (arka plan uyarısı dev build / mağaza sürümünde çalışır).

Hâlâ kırmızı ekran görürsen: Metro'yu durdur → `npx expo start --lan -c` → Expo Go'da projeyi tamamen kapatıp QR ile yeniden aç.

---

## `Failed to download remote update` (mavi ekran)

Google’dan dönünce Expo Go Metro’dan JS bundle’ı yeniden indiremez.

**Sebep A — yanlış redirect:** URL’de `127.0.0.1` / `localhost` — fiziksel telefonda bu adres telefonun kendisidir, PC değil.

**Sebep B — Android cold start (redirect doğru olsa bile):** Metro logunda `Android Bundled … (1 module)` görürsen Chrome Custom Tab ayrı Android görevinde açılmış, `exp://` dönüşü Expo Go’yu sıfırdan başlatmış demektir. Kodda `openAuthSessionAsync` için `createTask: false` kullanılır (aynı görevde kalır).

**Çözüm (fiziksel cihaz, önerilen):**

```powershell
cd frontend
npx expo start --lan -c
```

1. Metro logunda `[Astrocus OAuth] redirectTo = exp://192.168.x.x:8081/--/auth/callback` görmelisin (**127.0.0.1 olmamalı**).
2. Bu satırı **Supabase → Authentication → Redirect URLs** listesine ekle.
3. Telefon ve PC **aynı Wi‑Fi**; Expo Go’yu QR ile aç (tunnel değil).

İstersen `.env` ile sabitle:

```env
EXPO_PUBLIC_OAUTH_REDIRECT_URI=exp://192.168.1.103:8081/--/auth/callback
```

(`192.168.1.103` → kendi PC IP’n; `ipconfig` ile bak.)

**Tunnel kullanıyorsan:** `npx expo start --tunnel -c` ve logdaki `redirectTo` değerini (genelde `*.exp.direct`) Supabase’e ekle. `--tunnel` ile `--lan` karıştırma.

**Hâlâ `(1 module)` + mavi ekran:** Önce `createTask: false` güncellemesiyle **LAN** dene (aşağıdaki bölüm). Tunnel yalnızca LAN imkânsızsa (farklı ağ, emülatör yok).

---

## `failed to start tunnel` / `remote gone away`

Expo’nun gömülü ngrok servisi sık sık düşer; bu **proje hatası değil**. Çoğu geliştirmede tunnel **gerekmez**.

**Önerilen (aynı Wi‑Fi, fiziksel telefon):**

```powershell
cd frontend
npx expo start --lan -c
```

1. PC ve telefon aynı ağda.
2. Windows: “Özel ağ” + güvenlik duvarında **Node.js** için **8081** izinli.
3. Supabase Redirect URLs: logdaki `exp://192.168.x.x:8081/--/auth/callback`.
4. Expo Go’yu son görevlerden kapat → QR ile yeniden aç → Google girişi.

**Tunnel gerçekten şartsa (farklı ağ vb.):**

1. [ngrok.com](https://ngrok.com) hesabı → authtoken.
2. İki terminal: `npx expo start --lan` + `ngrok http 8081 --host-header=localhost`
3. ngrok’un `https://….ngrok-free.app` adresini kullanarak Expo’yu proxy ile başlat (Expo dokümantasyonu: `EXPO_PACKAGER_PROXY_URL`).

`--tunnel` birkaç kez yeniden denenebilir; ngrok outage ise [status.ngrok.com](https://status.ngrok.com/) kontrol et.

---

## Kurulum kontrol listesi

1. `npx expo start --lan -c` (fiziksel cihaz) veya `--tunnel` (tutarlı tunnel redirect)
2. Metro’da `[Astrocus OAuth] redirectTo` → Supabase **Redirect URLs**
3. Örnekler:
   - `exp://192.168.x.x:8081/--/auth/callback` (LAN)
   - `exp://localhost:8081/--/auth/callback` (yalnızca emülatör)
   - `astrocus://auth/callback`
   - `exp://**` (geliştirme wildcard)
4. **Google Cloud** → yalnızca: `https://<project>.supabase.co/auth/v1/callback`
