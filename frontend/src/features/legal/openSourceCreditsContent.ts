import type { Language } from "../../shared/types";

const TYPOGRAPHY_AND_ICONS = {
  tr: "DM Sans, Outfit ve Space Mono (SIL Open Font License 1.1 · Google Fonts). Uygulama ikonları Material Community Icons / Pictogrammers (SIL OFL 1.1).",
  en: "DM Sans, Outfit, and Space Mono (SIL Open Font License 1.1 · Google Fonts). App icons: Material Community Icons / Pictogrammers (SIL OFL 1.1).",
} as const;

export const getTypographyAndIconsCredits = (language: Language): string =>
  language === "en" ? TYPOGRAPHY_AND_ICONS.en : TYPOGRAPHY_AND_ICONS.tr;
