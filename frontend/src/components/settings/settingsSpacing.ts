import { useMemo } from "react";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";

/**
 * Settings list rhythm (iOS-style grouped list inside one card):
 *
 * - blockInsetY × 2 + 1px divider ≈ sectionGap between content blocks
 * - labelGap: title → caption
 * - contentGap: header block → body (avatars, button, …)
 */
export const useSettingsSpacing = () => {
  const { scale, isCompact } = useResponsive();

  return useMemo(() => {
    const sectionGap = scale(isCompact ? 14 : 16);
    const blockInsetY = Math.round(sectionGap / 2);

    return {
      sectionGap,
      blockInsetY,
      labelGap: theme.spacing.xs,
      contentGap: theme.spacing.sm,
      linkMinHeight: scale(44),
      cardPaddingX: scale(isCompact ? 14 : 16),
      cardPaddingY: scale(isCompact ? 4 : 6),
    };
  }, [isCompact, scale]);
};
