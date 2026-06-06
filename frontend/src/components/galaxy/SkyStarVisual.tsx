import React, { useId } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from "react-native-svg";
import theme from "../../theme";
import type { StarMagnitudeTier } from "./starVisuals";

type SkyStarVisualProps = {
  tier: StarMagnitudeTier;
  size?: number;
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TIER = {
  anchor: { glow: 48, core: 6, rayLen: 42, rayWidth: 1.4, body: 1, starScale: 1 },
  bright: { glow: 44, core: 5.5, rayLen: 34, rayWidth: 1.2, body: 0.92, starScale: 0.94 },
  companion: { glow: 40, core: 5, rayLen: 24, rayWidth: 1, body: 0.84, starScale: 0.88 },
} as const;

const SKY_PALETTE = {
  core: theme.colors.textPrimary,
  accent: theme.colors.accent,
  mutedCore: theme.colors.textSecondary,
};

/** Gökyüzü kataloğu — tek tip, uygulama paletinde profesyonel yıldız görseli. */
export const SkyStarVisual: React.FC<SkyStarVisualProps> = ({
  tier,
  size = 72,
  muted = false,
  style,
}) => {
  const uid = useId().replace(/:/g, "");
  const metrics = TIER[tier];
  const opacity = muted ? 0.42 : 1;
  const coreColor = muted ? SKY_PALETTE.mutedCore : SKY_PALETTE.core;

  return (
    <View style={[{ width: size, height: size, opacity }, style]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="52%">
            <Stop offset="0%" stopColor={coreColor} stopOpacity={muted ? 0.5 : 0.72 * metrics.body} />
            <Stop offset="50%" stopColor={SKY_PALETTE.accent} stopOpacity={muted ? 0.22 : 0.36 * metrics.body} />
            <Stop offset="100%" stopColor={SKY_PALETTE.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx="60" cy="60" r={metrics.glow} fill={`url(#${uid}-halo)`} />

        {metrics.rayLen > 0
          ? [0, 45, 90, 135].map((angle) => (
              <G key={angle} rotation={angle} originX={60} originY={60}>
                <Line
                  x1="60"
                  y1="60"
                  x2="60"
                  y2={60 - metrics.rayLen}
                  stroke={coreColor}
                  strokeOpacity={muted ? 0.14 : 0.24 * metrics.body}
                  strokeWidth={metrics.rayWidth}
                  strokeLinecap="round"
                />
              </G>
            ))
          : null}

        <G scale={metrics.starScale} originX={60} originY={60}>
          <Path
            d="M60 18 L70 50 L102 60 L70 70 L60 102 L50 70 L18 60 L50 50 Z"
            fill={coreColor}
            opacity={muted ? 0.55 : 0.72 * metrics.body}
          />
          <Circle cx="60" cy="60" r={metrics.core} fill={SKY_PALETTE.accent} opacity={muted ? 0.45 : 0.7} />
        </G>
      </Svg>
    </View>
  );
};
