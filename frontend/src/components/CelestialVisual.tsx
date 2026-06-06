import React, { useId, useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Stop } from "react-native-svg";
import { colors } from "../shared/theme";

export type CelestialVariant =
  | "planet"
  | "galaxy"
  | "badge"
  | "star"
  | "supergiant"
  | "binary"
  | "cluster"
  | "nebula"
  | "radiant";

export type CelestialHue = "warm" | "cool" | "violet" | "gold" | "crimson" | "pearl";
export type CelestialIntensity = "bright" | "medium" | "dim";

type CelestialVisualProps = {
  variant: CelestialVariant;
  size?: number;
  muted?: boolean;
  hue?: CelestialHue;
  intensity?: CelestialIntensity;
  style?: StyleProp<ViewStyle>;
};

type Palette = {
  core: string;
  mid: string;
  rim: string;
  accent: string;
  spark: string;
};

const HUE_PALETTES: Record<CelestialHue, Palette> = {
  warm: {
    core: "#FFE8C8",
    mid: "#E8A86C",
    rim: colors.ube,
    accent: colors.warmOffWhite,
    spark: "#FFD4A8",
  },
  cool: {
    core: "#D8EEFF",
    mid: "#6BA8D4",
    rim: colors.americanBlue,
    accent: colors.warmOffWhite,
    spark: "#A8D4FF",
  },
  violet: {
    core: colors.warmOffWhite,
    mid: colors.ube,
    rim: colors.americanBlue,
    accent: "#C8CAF0",
    spark: colors.ube,
  },
  gold: {
    core: "#FFF0B8",
    mid: "#D4AF5A",
    rim: colors.ube,
    accent: colors.warmOffWhite,
    spark: "#FFE08A",
  },
  crimson: {
    core: "#FFD0C8",
    mid: "#C44B4B",
    rim: "#5A2020",
    accent: colors.warmOffWhite,
    spark: "#FF8A78",
  },
  pearl: {
    core: colors.warmOffWhite,
    mid: colors.ube,
    rim: colors.cadetGrey,
    accent: "#E8E4F0",
    spark: colors.ube,
  },
};

const INTENSITY_SCALE: Record<CelestialIntensity, { glow: number; body: number }> = {
  bright: { glow: 1.12, body: 1 },
  medium: { glow: 0.92, body: 0.88 },
  dim: { glow: 0.72, body: 0.74 },
};

export const CelestialVisual = ({
  variant,
  size = 180,
  muted = false,
  hue = "violet",
  intensity = "medium",
  style,
}: CelestialVisualProps) => {
  const opacity = muted ? 0.42 : 1;
  const uid = useId().replace(/:/g, "");
  const palette = HUE_PALETTES[hue];
  const scale = INTENSITY_SCALE[intensity];

  const visual = useMemo(() => {
    const shared = { size, palette, scale, uid };
    switch (variant) {
      case "planet":
        return <Planet {...shared} />;
      case "galaxy":
        return <Galaxy {...shared} />;
      case "badge":
        return <Badge {...shared} />;
      case "star":
        return <ClassicStar {...shared} />;
      case "supergiant":
        return <Supergiant {...shared} />;
      case "binary":
        return <BinaryStar {...shared} />;
      case "cluster":
        return <StarCluster {...shared} />;
      case "nebula":
        return <Nebula {...shared} />;
      case "radiant":
        return <RadiantStar {...shared} />;
      default:
        return <ClassicStar {...shared} />;
    }
  }, [variant, size, palette, scale, uid]);

  return (
    <View style={[{ width: size, height: size, opacity }, style]}>
      {visual}
    </View>
  );
};

type SvgPartProps = {
  size: number;
  palette: Palette;
  scale: { glow: number; body: number };
  uid: string;
};

const Planet = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <RadialGradient id={`${uid}-planetBody`} cx="35%" cy="28%" r="78%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.62 * scale.body} />
        <Stop offset="42%" stopColor={palette.mid} stopOpacity={0.46 * scale.body} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0.22} />
      </RadialGradient>
      <RadialGradient id={`${uid}-planetGlow`} cx="50%" cy="50%" r="58%">
        <Stop offset="0%" stopColor={palette.mid} stopOpacity={0.36 * scale.glow} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="100" cy="104" r={76 * scale.glow} fill={`url(#${uid}-planetGlow)`} />
    <G rotation={-12} originX={100} originY={102}>
      <Ellipse cx="100" cy="102" rx="86" ry="24" stroke={palette.accent} strokeOpacity={0.28} strokeWidth="2.6" fill="transparent" />
      <Ellipse cx="100" cy="102" rx="67" ry="17" stroke={palette.mid} strokeOpacity={0.32} strokeWidth="2" fill="transparent" />
    </G>
    <Circle cx="100" cy="102" r="48" fill={`url(#${uid}-planetBody)`} />
    <Circle cx="82" cy="82" r="12" fill={palette.core} opacity={0.1} />
  </Svg>
);

const Galaxy = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 220 220">
    <Defs>
      <RadialGradient id={`${uid}-galaxyCore`} cx="50%" cy="50%" r="65%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.78 * scale.body} />
        <Stop offset="28%" stopColor={palette.mid} stopOpacity={0.48 * scale.body} />
        <Stop offset="68%" stopColor={palette.rim} stopOpacity={0.22} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <G rotation={-16} originX={110} originY={110}>
      <Ellipse cx="110" cy="110" rx={86 * scale.glow} ry={36 * scale.glow} fill={`url(#${uid}-galaxyCore)`} />
      <Ellipse cx="110" cy="110" rx="78" ry="22" stroke={palette.mid} strokeOpacity={0.45} strokeWidth="2.4" fill="transparent" />
      <Ellipse cx="110" cy="110" rx="54" ry="14" stroke={palette.accent} strokeOpacity={0.22} strokeWidth="1.4" fill="transparent" />
    </G>
    <G rotation={18} originX={110} originY={110}>
      <Ellipse cx="110" cy="110" rx="98" ry="26" stroke={palette.rim} strokeOpacity={0.32} strokeWidth="2.6" fill="transparent" />
    </G>
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <Circle
        key={index}
        cx={58 + index * 21}
        cy={92 + (index % 2 === 0 ? 4 : 22)}
        r={index % 3 === 0 ? 1.8 : 1.2}
        fill={index % 2 === 0 ? palette.accent : palette.spark}
        opacity={0.72}
      />
    ))}
  </Svg>
);

const Badge = ({ size, palette, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 160 160">
    <Defs>
      <RadialGradient id={`${uid}-badgeGlow`} cx="50%" cy="42%" r="58%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.76} />
        <Stop offset="42%" stopColor={palette.mid} stopOpacity={0.42} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="80" cy="74" r="52" fill={`url(#${uid}-badgeGlow)`} />
    <Path d="M80 22 L94 54 L129 58 L103 80 L111 116 L80 98 L49 116 L57 80 L31 58 L66 54 Z" fill={palette.mid} opacity={0.78} />
    <Path d="M80 40 L90 62 L114 66 L96 82 L101 106 L80 94 L59 106 L64 82 L46 66 L70 62 Z" fill={palette.core} opacity={0.58} />
    <Line x1="80" y1="6" x2="80" y2="28" stroke={palette.accent} strokeOpacity={0.3} strokeWidth="1.4" />
    <Line x1="80" y1="124" x2="80" y2="150" stroke={palette.mid} strokeOpacity={0.32} strokeWidth="1.4" />
  </Svg>
);

const ClassicStar = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <RadialGradient id={`${uid}-starGlow`} cx="50%" cy="50%" r="52%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.72 * scale.glow} />
        <Stop offset="50%" stopColor={palette.mid} stopOpacity={0.36 * scale.glow} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="60" cy="60" r={48 * scale.glow} fill={`url(#${uid}-starGlow)`} />
    <Path d="M60 18 L70 50 L102 60 L70 70 L60 102 L50 70 L18 60 L50 50 Z" fill={palette.accent} opacity={0.72 * scale.body} />
    <Circle cx="60" cy="60" r="6" fill={palette.mid} opacity={0.72} />
  </Svg>
);

const Supergiant = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 160 160">
    <Defs>
      <RadialGradient id={`${uid}-sgCore`} cx="44%" cy="38%" r="55%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.95 * scale.body} />
        <Stop offset="35%" stopColor={palette.spark} stopOpacity={0.72 * scale.body} />
        <Stop offset="72%" stopColor={palette.mid} stopOpacity={0.44 * scale.body} />
        <Stop offset="100%" stopColor={palette.rim} stopOpacity={0.08} />
      </RadialGradient>
      <RadialGradient id={`${uid}-sgHalo`} cx="50%" cy="50%" r="62%">
        <Stop offset="0%" stopColor={palette.mid} stopOpacity={0.38 * scale.glow} />
        <Stop offset="55%" stopColor={palette.rim} stopOpacity={0.14 * scale.glow} />
        <Stop offset="100%" stopColor={palette.rim} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="80" cy="80" r={68 * scale.glow} fill={`url(#${uid}-sgHalo)`} />
    <G rotation={-18} originX={80} originY={80}>
      <Ellipse cx="80" cy="80" rx="74" ry="18" stroke={palette.spark} strokeOpacity={0.22} strokeWidth="1.6" fill="transparent" />
    </G>
    <G rotation={24} originX={80} originY={80}>
      <Ellipse cx="80" cy="80" rx="62" ry="12" stroke={palette.accent} strokeOpacity={0.16} strokeWidth="1.2" fill="transparent" />
    </G>
    <Circle cx="80" cy="80" r={34 * scale.body} fill={`url(#${uid}-sgCore)`} />
    <Circle cx="68" cy="68" r="8" fill={palette.core} opacity={0.18} />
  </Svg>
);

const BinaryStar = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 160 160">
    <Defs>
      <RadialGradient id={`${uid}-binGlow`} cx="50%" cy="50%" r="58%">
        <Stop offset="0%" stopColor={palette.mid} stopOpacity={0.28 * scale.glow} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={`${uid}-binA`} cx="40%" cy="36%" r="62%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.88 * scale.body} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0.32} />
      </RadialGradient>
      <RadialGradient id={`${uid}-binB`} cx="40%" cy="36%" r="62%">
        <Stop offset="0%" stopColor={palette.spark} stopOpacity={0.82 * scale.body} />
        <Stop offset="100%" stopColor={palette.rim} stopOpacity={0.28} />
      </RadialGradient>
    </Defs>
    <Circle cx="80" cy="80" r={58 * scale.glow} fill={`url(#${uid}-binGlow)`} />
    <Ellipse cx="80" cy="80" rx="46" ry="20" stroke={palette.accent} strokeOpacity={0.18} strokeWidth="1.4" fill="transparent" />
    <Circle cx="58" cy="74" r={16 * scale.body} fill={`url(#${uid}-binA)`} />
    <Circle cx="98" cy="86" r={13 * scale.body} fill={`url(#${uid}-binB)`} />
    <Line x1="58" y1="74" x2="98" y2="86" stroke={palette.accent} strokeOpacity={0.14} strokeWidth="1.2" />
  </Svg>
);

const StarCluster = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 180 180">
    <Defs>
      <RadialGradient id={`${uid}-clNeb`} cx="50%" cy="50%" r="62%">
        <Stop offset="0%" stopColor={palette.mid} stopOpacity={0.32 * scale.glow} />
        <Stop offset="55%" stopColor={palette.rim} stopOpacity={0.12 * scale.glow} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={`${uid}-clStar`} cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.9} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0.2} />
      </RadialGradient>
    </Defs>
    <Circle cx="90" cy="90" r={62 * scale.glow} fill={`url(#${uid}-clNeb)`} />
    {[
      { cx: 90, cy: 62, r: 10 },
      { cx: 68, cy: 88, r: 7 },
      { cx: 112, cy: 84, r: 8 },
      { cx: 82, cy: 112, r: 6 },
      { cx: 106, cy: 108, r: 5 },
    ].map((node, index) => (
      <Circle
        key={index}
        cx={node.cx}
        cy={node.cy}
        r={node.r * scale.body}
        fill={`url(#${uid}-clStar)`}
        opacity={0.72 + index * 0.04}
      />
    ))}
  </Svg>
);

const Nebula = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 180 180">
    <Defs>
      <RadialGradient id={`${uid}-nebCore`} cx="50%" cy="48%" r="48%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.82 * scale.body} />
        <Stop offset="45%" stopColor={palette.mid} stopOpacity={0.38 * scale.body} />
        <Stop offset="100%" stopColor={palette.rim} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={`${uid}-nebCloud`} cx="50%" cy="50%" r="68%">
        <Stop offset="0%" stopColor={palette.mid} stopOpacity={0.26 * scale.glow} />
        <Stop offset="60%" stopColor={palette.rim} stopOpacity={0.1 * scale.glow} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <G rotation={-22} originX={90} originY={90}>
      <Ellipse cx="90" cy="90" rx={72 * scale.glow} ry={34 * scale.glow} fill={`url(#${uid}-nebCloud)`} />
    </G>
    <G rotation={16} originX={90} originY={90}>
      <Ellipse cx="90" cy="90" rx={58 * scale.glow} ry={26 * scale.glow} stroke={palette.spark} strokeOpacity={0.16} strokeWidth="1.6" fill="transparent" />
    </G>
    <Circle cx="90" cy="88" r={14 * scale.body} fill={`url(#${uid}-nebCore)`} />
    <Circle cx="102" cy="78" r="2.2" fill={palette.accent} opacity={0.55} />
    <Circle cx="74" cy="98" r="1.6" fill={palette.spark} opacity={0.45} />
  </Svg>
);

const RadiantStar = ({ size, palette, scale, uid }: SvgPartProps) => (
  <Svg width={size} height={size} viewBox="0 0 140 140">
    <Defs>
      <RadialGradient id={`${uid}-radCore`} cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={palette.core} stopOpacity={0.96 * scale.body} />
        <Stop offset="40%" stopColor={palette.spark} stopOpacity={0.62 * scale.body} />
        <Stop offset="100%" stopColor={palette.mid} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="70" cy="70" r={52 * scale.glow} fill={`url(#${uid}-radCore)`} />
    {[0, 45, 90, 135].map((angle) => (
      <G key={angle} rotation={angle} originX={70} originY={70}>
        <Line x1="70" y1="70" x2="70" y2="16" stroke={palette.accent} strokeOpacity={0.34} strokeWidth="1.4" />
        <Line x1="70" y1="70" x2="70" y2="28" stroke={palette.spark} strokeOpacity={0.22} strokeWidth="2.6" />
      </G>
    ))}
    <Path
      d="M70 24 L76 54 L106 70 L76 86 L70 116 L64 86 L34 70 L64 54 Z"
      fill={palette.accent}
      opacity={0.78 * scale.body}
    />
    <Circle cx="70" cy="70" r={8 * scale.body} fill={palette.core} opacity={0.88} />
    <Circle cx="70" cy="70" r={4} fill={palette.spark} opacity={0.72} />
  </Svg>
);
