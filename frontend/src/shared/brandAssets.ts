/**
 * Uygulama logosu — tek dosya, kare PNG.
 *
 * Yükle: frontend/assets/brand/logo.png
 * Önerilen: 1024×1024 veya 2000×2000, şeffaf arka plan.
 */
export const brandAssets = {
  logo: require("../../assets/brand/logo.png"),
} as const;

export type LogoSize = "sm" | "md" | "lg" | "xl";

/** Kare logo kenar uzunluğu (px) */
export const brandSizes: Record<LogoSize, number> = {
  sm: 36,
  md: 52,
  lg: 80,
  xl: 112,
};
