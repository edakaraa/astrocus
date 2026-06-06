/** Gökyüzü kartları — yıldız parlaklık kademesi (takımyıldız içi sıra). */
export type StarMagnitudeTier = "anchor" | "bright" | "companion";

export const getStarMagnitudeTier = (starSortOrder: number): StarMagnitudeTier => {
  if (starSortOrder <= 1) return "anchor";
  if (starSortOrder <= 3) return "bright";
  return "companion";
};
