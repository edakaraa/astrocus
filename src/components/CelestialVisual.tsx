import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Stop } from "react-native-svg";
import { colors } from "../shared/theme";

type CelestialVisualProps = {
  variant: "planet" | "galaxy" | "badge" | "star";
  size?: number;
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const CelestialVisual = ({ variant, size = 180, muted = false, style }: CelestialVisualProps) => {
  const opacity = muted ? 0.42 : 1;

  return (
    <View style={[{ width: size, height: size, opacity }, style]}>
      {variant === "planet" ? <Planet size={size} /> : null}
      {variant === "galaxy" ? <Galaxy size={size} /> : null}
      {variant === "badge" ? <Badge size={size} /> : null}
      {variant === "star" ? <Star size={size} /> : null}
    </View>
  );
};

const Planet = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <RadialGradient id="planetBody" cx="35%" cy="28%" r="78%">
        <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.56} />
        <Stop offset="42%" stopColor={colors.ube} stopOpacity={0.44} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0.2} />
      </RadialGradient>
      <RadialGradient id="planetGlow" cx="50%" cy="50%" r="58%">
        <Stop offset="0%" stopColor={colors.ube} stopOpacity={0.34} />
        <Stop offset="100%" stopColor={colors.ube} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="100" cy="104" r="76" fill="url(#planetGlow)" />
    <G rotation="-12" origin="100,102">
      <Ellipse cx="100" cy="102" rx="86" ry="24" stroke={colors.warmOffWhite} strokeOpacity={0.28} strokeWidth="2.6" fill="transparent" />
      <Ellipse cx="100" cy="102" rx="67" ry="17" stroke={colors.ube} strokeOpacity={0.3} strokeWidth="2" fill="transparent" />
    </G>
    <Circle cx="100" cy="102" r="48" fill="url(#planetBody)" />
    <Circle cx="82" cy="82" r="12" fill={colors.warmOffWhite} opacity={0.08} />
  </Svg>
);

const Galaxy = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 220 220">
    <Defs>
      <RadialGradient id="galaxyCoreSmall" cx="50%" cy="50%" r="65%">
        <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.78} />
        <Stop offset="28%" stopColor={colors.ube} stopOpacity={0.48} />
        <Stop offset="68%" stopColor={colors.americanBlue} stopOpacity={0.2} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <G rotation="-16" origin="110,110">
      <Ellipse cx="110" cy="110" rx="86" ry="36" fill="url(#galaxyCoreSmall)" />
      <Ellipse cx="110" cy="110" rx="78" ry="22" stroke={colors.ube} strokeOpacity={0.45} strokeWidth="2.4" fill="transparent" />
      <Ellipse cx="110" cy="110" rx="54" ry="14" stroke={colors.warmOffWhite} strokeOpacity={0.2} strokeWidth="1.4" fill="transparent" />
    </G>
    <G rotation="18" origin="110,110">
      <Ellipse cx="110" cy="110" rx="98" ry="26" stroke={colors.americanBlue} strokeOpacity={0.32} strokeWidth="2.6" fill="transparent" />
    </G>
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <Circle
        key={index}
        cx={58 + index * 21}
        cy={92 + (index % 2 === 0 ? 4 : 22)}
        r={index % 3 === 0 ? 1.8 : 1.2}
        fill={index % 2 === 0 ? colors.warmOffWhite : colors.ube}
        opacity={0.72}
      />
    ))}
  </Svg>
);

const Badge = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 160 160">
    <Defs>
      <RadialGradient id="badgeGlow" cx="50%" cy="42%" r="58%">
        <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.76} />
        <Stop offset="42%" stopColor={colors.ube} stopOpacity={0.42} />
        <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="80" cy="74" r="52" fill="url(#badgeGlow)" />
    <Path d="M80 22 L94 54 L129 58 L103 80 L111 116 L80 98 L49 116 L57 80 L31 58 L66 54 Z" fill={colors.ube} opacity={0.78} />
    <Path d="M80 40 L90 62 L114 66 L96 82 L101 106 L80 94 L59 106 L64 82 L46 66 L70 62 Z" fill={colors.warmOffWhite} opacity={0.58} />
    <Line x1="80" y1="6" x2="80" y2="28" stroke={colors.warmOffWhite} strokeOpacity={0.3} strokeWidth="1.4" />
    <Line x1="80" y1="124" x2="80" y2="150" stroke={colors.ube} strokeOpacity={0.32} strokeWidth="1.4" />
  </Svg>
);

const Star = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <RadialGradient id="starGlow" cx="50%" cy="50%" r="52%">
        <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.72} />
        <Stop offset="50%" stopColor={colors.ube} stopOpacity={0.36} />
        <Stop offset="100%" stopColor={colors.ube} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx="60" cy="60" r="48" fill="url(#starGlow)" />
    <Path d="M60 18 L70 50 L102 60 L70 70 L60 102 L50 70 L18 60 L50 50 Z" fill={colors.warmOffWhite} opacity={0.72} />
    <Circle cx="60" cy="60" r="6" fill={colors.ube} opacity={0.7} />
  </Svg>
);
