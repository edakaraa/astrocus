import type { EmailOtpType } from "@supabase/supabase-js";
import { Router } from "express";
import type { Response } from "express";
import { createSupabaseAnonClient } from "../lib/supabaseAdmin";

const router = Router();

const ALLOWED_APP_PATHS = new Set(["reset-password", "verify-success"]);

const sendHtml = (res: Response, status: number, html: string) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
  );
  res.status(status).send(html);
};

const AUTH_PAGE_STYLE = `
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0A1123; color: #E8E4C0; font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
    p { margin: 0 0 12px; line-height: 1.5; }
    .muted { color: #959BB5; font-size: 14px; }
    .error { color: #E8A0A0; }`;

const buildErrorPage = (message: string): string => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astrocus</title>
  <style>${AUTH_PAGE_STYLE}</style>
</head>
<body>
  <p class="error">${message}</p>
</body>
</html>`;

const escapeHtmlAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** E-posta güvenlik tarayıcıları doğrudan /verify linkini tüketmesin diye ara sayfa. */
const buildConfirmPage = (verifyUrl: string, actionLabel: string): string => {
  const verifyHref = escapeHtmlAttr(verifyUrl);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astrocus</title>
  <style>${AUTH_PAGE_STYLE}
    a.btn { display: inline-block; margin-top: 8px; padding: 14px 28px; background: #8387C3; color: #0A1123;
      text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 16px; }
  </style>
</head>
<body>
  <div>
    <p>Astrocus</p>
    <p class="muted">Devam etmek için aşağıdaki düğmeye dokunun.</p>
    <a class="btn" href="${verifyHref}">${actionLabel}</a>
    <p class="muted" style="margin-top:16px;">Bağlantı 15 dakika geçerlidir.</p>
  </div>
</body>
</html>`;
};

const buildDeepLinkRedirectPage = (deepLink: string): string => {
  const deepLinkJson = JSON.stringify(deepLink);
  const deepLinkHref = escapeHtmlAttr(deepLink);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astrocus</title>
  <style>${AUTH_PAGE_STYLE}
    a.btn { display: inline-block; margin-top: 16px; padding: 14px 28px; background: #8387C3; color: #0A1123;
      text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 16px; }
  </style>
</head>
<body>
  <div>
    <p>Astrocus uygulamasına yönlendiriliyorsunuz…</p>
    <a class="btn" href="${deepLinkHref}">Astrocus'u aç</a>
    <p class="muted" style="margin-top:16px;">Otomatik açılmazsa yukarıdaki düğmeye dokunun.</p>
  </div>
  <script>
    (function () {
      window.location.replace(${deepLinkJson});
    })();
  </script>
</body>
</html>`;
};

const MOBILE_REDIRECT_PAGE = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astrocus</title>
  <style>${AUTH_PAGE_STYLE}
    a.btn { display: inline-block; margin-top: 16px; padding: 14px 28px; background: #8387C3; color: #0A1123;
      text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 16px; }
  </style>
</head>
<body>
  <div>
    <p>Astrocus uygulamasına yönlendiriliyorsunuz…</p>
    <a class="btn" id="open-app" href="astrocus://reset-password">Astrocus'u aç</a>
    <p class="muted" style="margin-top:16px;">Otomatik açılmazsa yukarıdaki düğmeye dokunun.</p>
  </div>
  <script>
    (function () {
      var params = new URLSearchParams(window.location.search);
      var path = params.get("path") || "reset-password";
      params.delete("path");
      var rest = params.toString();
      var suffix = (rest ? "?" + rest : "") + (window.location.hash || "");
      var deepLink = "astrocus://" + path + suffix;
      var btn = document.getElementById("open-app");
      if (btn) btn.href = deepLink;
      window.location.replace(deepLink);
    })();
  </script>
</body>
</html>`;

const normalizeOtpType = (raw: string): EmailOtpType | null => {
  const value = raw.toLowerCase();
  if (value === "signup" || value === "email") {
    return "signup";
  }
  if (value === "recovery") {
    return "recovery";
  }
  if (value === "invite" || value === "magiclink" || value === "email_change") {
    return value as EmailOtpType;
  }
  return null;
};

const readQueryString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * E-posta şablonları buraya yönlendirir; token tüketilmez (Outlook/Gmail ön tarama koruması).
 */
router.get("/confirm", (req, res) => {
  const tokenHash = readQueryString(req.query.token_hash);
  const rawType = readQueryString(req.query.type);
  const requestedPath = readQueryString(req.query.path);
  const otpType = normalizeOtpType(rawType);

  if (!tokenHash || !otpType) {
    sendHtml(
      res,
      400,
      buildErrorPage("Geçersiz bağlantı. Astrocus uygulamasından yeni bir e-posta isteyebilirsin."),
    );
    return;
  }

  const params = new URLSearchParams({
    token_hash: tokenHash,
    type: rawType,
  });
  if (requestedPath && ALLOWED_APP_PATHS.has(requestedPath)) {
    params.set("path", requestedPath);
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const verifyUrl = `${baseUrl}/auth/verify?${params.toString()}`;
  const actionLabel = otpType === "recovery" ? "Şifremi sıfırla" : "E-postamı doğrula";
  sendHtml(res, 200, buildConfirmPage(verifyUrl, actionLabel));
});

/**
 * E-posta linkleri: token_hash doğrulama → astrocus:// deep link (Supabase URL görünmez).
 */
router.get("/verify", async (req, res) => {
  const tokenHash = readQueryString(req.query.token_hash);
  const rawType = readQueryString(req.query.type);
  const requestedPath = readQueryString(req.query.path);
  const otpType = normalizeOtpType(rawType);

  if (!tokenHash || !otpType) {
    sendHtml(
      res,
      400,
      buildErrorPage("Geçersiz bağlantı. Astrocus uygulamasından yeni bir e-posta isteyebilirsin."),
    );
    return;
  }

  const appPath =
    requestedPath && ALLOWED_APP_PATHS.has(requestedPath)
      ? requestedPath
      : otpType === "recovery"
        ? "reset-password"
        : "verify-success";

  try {
    const supabaseAuth = createSupabaseAnonClient();
    let data: Awaited<ReturnType<typeof supabaseAuth.auth.verifyOtp>>["data"] = null;
    let error: Awaited<ReturnType<typeof supabaseAuth.auth.verifyOtp>>["error"] = null;

    const attempt = await supabaseAuth.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    data = attempt.data;
    error = attempt.error;

    if ((error || !data.session) && otpType === "signup") {
      const fallback = await supabaseAuth.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });
      if (!fallback.error && fallback.data.session) {
        data = fallback.data;
        error = null;
      }
    }

    if (error || !data.session) {
      sendHtml(
        res,
        400,
        buildErrorPage(
          "Bağlantının süresi dolmuş veya geçersiz. Astrocus uygulamasından yeni bir e-posta isteyebilirsin.",
        ),
      );
      return;
    }

    const { access_token, refresh_token } = data.session;
    const hashType = otpType === "recovery" ? "recovery" : "signup";
    const hash = `access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}&type=${hashType}`;
    const deepLink = `astrocus://${appPath}#${hash}`;
    sendHtml(res, 200, buildDeepLinkRedirectPage(deepLink));
  } catch {
    sendHtml(res, 500, buildErrorPage("Bir sorun oluştu. Lütfen daha sonra tekrar deneyin."));
  }
});

/** Supabase redirect sonrası: hash/query parametrelerini astrocus:// deep link'ine aktarır. */
router.get("/mobile-redirect", (_req, res) => {
  sendHtml(res, 200, MOBILE_REDIRECT_PAGE);
});

export default router;
