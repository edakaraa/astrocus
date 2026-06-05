/** DiceBear HTTP API — Lorelei stili. https://www.dicebear.com/styles/lorelei/ */
export const DICEBEAR_AVATAR_API = "https://api.dicebear.com/10.x/lorelei";

/** CC0 1.0 — uygulama içi atıf metinleri için sabitler */
export const DICEBEAR_AVATAR_ATTRIBUTION = {
  styleName: "Lorelei",
  styleUrl: "https://www.dicebear.com/styles/lorelei/",
  creator: "Lisa Wischofsky",
  creatorUrl: "https://www.instagram.com/lischi_art/",
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  libraryUrl: "https://www.dicebear.com/",
} as const;

const AVATAR_BACKGROUND = "0a1123";

export const diceBearSeedForAvatarId = (avatarId: string): string => `astrocus-${avatarId}`;

/** PNG URI — React Native Image ile uyumlu; seed sabit olduğu sürece aynı görsel döner. */
export const buildDiceBearAvatarUri = (seed: string, sizePx: number): string => {
  const size = Math.min(512, Math.max(48, Math.round(sizePx)));
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor: AVATAR_BACKGROUND,
  });
  return `${DICEBEAR_AVATAR_API}/png?${params.toString()}`;
};

export const buildDiceBearAvatarUriForAvatarId = (avatarId: string, sizePx: number): string =>
  buildDiceBearAvatarUri(diceBearSeedForAvatarId(avatarId), sizePx);
