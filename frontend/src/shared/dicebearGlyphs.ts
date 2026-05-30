/** DiceBear HTTP API — Glyphs stili. https://www.dicebear.com/styles/glyphs/ */
export const DICEBEAR_GLYPHS_API = "https://api.dicebear.com/10.x/glyphs";

/** CC BY 4.0 — uygulama içi atıf metinleri için sabitler */
export const DICEBEAR_GLYPHS_ATTRIBUTION = {
  styleName: "Glyphs",
  styleUrl: "https://www.dicebear.com/styles/glyphs/",
  creator: "Matt Houser",
  creatorUrl: "https://x.com/mattkhouser",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  libraryUrl: "https://www.dicebear.com/",
} as const;

const AVATAR_BACKGROUND = "0a1123";

export const diceBearSeedForAvatarId = (avatarId: string): string => `astrocus-${avatarId}`;

/** PNG URI — React Native Image ile uyumlu; seed sabit olduğu sürece aynı görsel döner. */
export const buildDiceBearGlyphsUri = (seed: string, sizePx: number): string => {
  const size = Math.min(512, Math.max(48, Math.round(sizePx)));
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor: AVATAR_BACKGROUND,
  });
  return `${DICEBEAR_GLYPHS_API}/png?${params.toString()}`;
};

export const buildDiceBearGlyphsUriForAvatarId = (avatarId: string, sizePx: number): string =>
  buildDiceBearGlyphsUri(diceBearSeedForAvatarId(avatarId), sizePx);
