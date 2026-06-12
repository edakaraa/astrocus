import { useMemo } from "react";
import { PixelRatio, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomSafePadding, layout, spacing, getTabBarMetrics } from "./theme";

/** Web-aligned breakpoints adapted for React Native / tablet layouts */
export const breakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

export const getBreakpoint = (width: number): BreakpointKey => {
  if (width >= breakpoints.xxl) return "xxl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
};

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));

/** Reference design width (iPhone 14 logical px). */
export const BASE_WIDTH = 390;
/** Reference design height. */
export const BASE_HEIGHT = 844;

/** Fluid value between min/max based on viewport (mobile-first). */
export const fluid = (min: number, max: number, width: number, referenceWidth = BASE_WIDTH) =>
  Math.round(clamp(min, min + ((max - min) * (width - breakpoints.xs)) / (referenceWidth - breakpoints.xs), max));

/**
 * Linear width-based scale with sane clamps so tiny (≤320) and large
 * (tablet) screens stay legible. Caps growth at 1.3× the reference size.
 */
export const scaleSize = (size: number, width: number, minFactor = 0.82, maxFactor = 1.3) => {
  const factor = clamp(minFactor, width / BASE_WIDTH, maxFactor);
  return Math.round(size * factor);
};

/**
 * Upper bound for OS font scaling. The user's "huge text" accessibility
 * setting can otherwise blow past layouts; we still allow growth up to 1.3×.
 * Pass to <Text maxFontSizeMultiplier={...}> (set globally at the app root).
 */
export const MAX_FONT_SCALE = 1.3;

/**
 * Width-based font size that also respects (but caps) the device font scale
 * via PixelRatio.getFontScale(). Use for precise, layout-sensitive text.
 */
export const normalizeFont = (size: number, width: number) => {
  const widthScaled = scaleSize(size, width, 0.9, 1.15);
  const fontScale = clamp(1, PixelRatio.getFontScale(), MAX_FONT_SCALE);
  return Math.round(widthScaled * fontScale);
};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const breakpoint = getBreakpoint(width);
    const isMobile = width < breakpoints.md;
    const isTablet = width >= breakpoints.md && width < breakpoints.lg;
    const isDesktop = width >= breakpoints.lg;

    /** Smallest phones (iPhone SE / older Android, ≤360 logical px). */
    const isCompact = width <= 360;
    /** Short viewports where vertical space is tight. */
    const isShort = height <= 700;

    const contentPadding = fluid(spacing.md, spacing["3xl"], width, BASE_WIDTH);
    /** Tab screens: consistent left/right inset; blocks stretch edge-to-edge inside this gutter. */
    const edgePadding = isMobile ? (isCompact ? spacing.sm : spacing.md) : contentPadding;
    const maxContentWidth = isDesktop ? layout.maxContentWidth : width;
    const tabBarMetrics = getTabBarMetrics(insets.bottom);
    const tabBarClearance = isMobile ? tabBarMetrics.clearance : spacing.xl + spacing.md;
    const topInset = insets.top;
    const topBarHeight = Math.max(layout.topBarMaxHeight, spacing.lg + topInset);
    /** Safe area + fluid breathing room so tab content does not hug the status bar. */
    const screenTopPadding = Math.max(
      topInset + fluid(spacing.sm, spacing.lg, width),
      topInset + spacing.sm,
    );

    /** Usable height after system insets (for centering / sizing rings). */
    const availableHeight = height - insets.top - insets.bottom;

    return {
      width,
      height,
      availableHeight,
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isCompact,
      isShort,
      contentPadding,
      edgePadding,
      maxContentWidth,
      tabBarClearance,
      topInset,
      topBarHeight,
      screenTopPadding,
      hitSlop: layout.hitSlop,
      /** Scale a px value to the current viewport width. */
      scale: (size: number, minFactor?: number, maxFactor?: number) =>
        scaleSize(size, width, minFactor, maxFactor),
      /** Scale a font (tighter clamps to avoid extreme sizes). */
      font: (size: number) => normalizeFont(size, width),
    };
  }, [height, insets.bottom, insets.top, width]);
};

export const useModalLayout = () => {
  const { isMobile, width, height, contentPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const bottomSafePadding = getBottomSafePadding(insets.bottom);

  return useMemo(
    () => ({
      isSheet: isMobile,
      backdropJustify: isMobile ? ("flex-end" as const) : ("center" as const),
      cardWidth: isMobile ? width : Math.min(width - contentPadding * 2, 420),
      cardMaxWidth: isMobile ? width : 420,
      horizontalPad: isMobile ? 0 : contentPadding,
      bottomSafePadding,
      /** Sheet max height — leaves room for status bar on short phones. */
      sheetMaxHeight: isMobile
        ? Math.min(height * 0.88, height - insets.top - spacing.md)
        : height * 0.88,
    }),
    [bottomSafePadding, contentPadding, height, insets.top, isMobile, width],
  );
};
