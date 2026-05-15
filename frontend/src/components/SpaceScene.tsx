import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, Line, RadialGradient, Stop } from "react-native-svg";
import { colors } from "../shared/theme";

type OnboardingSceneVariant = "birth" | "expansion" | "control" | "start";

type SpaceSceneProps = {
  variant: OnboardingSceneVariant | "onboarding-1" | "onboarding-2" | "onboarding-3" | "auth-login" | "auth-register";
};

type Particle = {
  top: number;
  left: number;
  size: number;
  opacity: number;
};

const fill = StyleSheet.absoluteFillObject;

const createParticles = (count: number, offset = 0): Particle[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = (index + 1) * (12.9898 + offset);
    const vertical = Math.abs(Math.sin(seed) * 100) % 100;
    const horizontal = Math.abs(Math.cos(seed * 1.3) * 100) % 100;

    return {
      top: vertical,
      left: horizontal,
      size: 0.8 + (Math.abs(Math.sin(seed * 2.1)) % 1) * 1.9,
      opacity: 0.18 + (Math.abs(Math.cos(seed * 0.72)) % 1) * 0.55,
    };
  });

const normalizeVariant = (variant: SpaceSceneProps["variant"]): OnboardingSceneVariant => {
  if (variant === "onboarding-1" || variant === "auth-login") return "control";
  if (variant === "onboarding-2" || variant === "auth-register") return "expansion";
  if (variant === "onboarding-3") return "start";
  return variant;
};

export const SpaceScene = ({ variant }: SpaceSceneProps) => {
  const { width } = useWindowDimensions();
  const scene = normalizeVariant(variant);
  const height = Math.min(470, Math.max(320, Math.round(width * 1.08)));

  const stars = useMemo(() => createParticles(84, 2), []);
  const dust = useMemo(() => createParticles(34, 8), []);
  const pulse = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 2100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 42000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    ];

    Animated.timing(reveal, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [drift, float, pulse, reveal, rotate]);

  const starTranslateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-6, 8] });
  const starTranslateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-3, 6] });
  const mediumTranslateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-12, 15] });
  const foregroundTranslateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const galaxyRotate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const birthStarScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.22] });
  const birthStarOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1] });
  const sceneOpacity = reveal.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const sceneScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [1.035, 1] });

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={[colors.chineseBlack, "#080E1E", colors.chineseBlack]}
        locations={[0, 0.58, 1]}
        style={fill}
      />

      <View style={styles.topLeftLight} />
      <View style={styles.volumetricHaze} />

      <Animated.View
        pointerEvents="none"
        style={[fill, { transform: [{ translateX: starTranslateX }, { translateY: starTranslateY }] }]}
      >
        {stars.map((star, index) => (
          <View
            key={`star-${index}`}
            style={[
              styles.star,
              {
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity * (scene === "birth" ? 0.62 : 0.78),
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[fill, { opacity: sceneOpacity, transform: [{ scale: sceneScale }, { translateX: mediumTranslateX }] }]}
      >
        {scene === "birth" ? (
          <BirthScene width={width} height={height} scale={birthStarScale} opacity={birthStarOpacity} particles={dust} />
        ) : null}

        {scene === "expansion" ? (
          <GalaxyScene width={width} height={height} rotate={galaxyRotate} particles={dust} />
        ) : null}

        {scene === "control" ? (
          <PlanetScene width={width} height={height} translateY={foregroundTranslateY} ringDrift={mediumTranslateX} />
        ) : null}

        {scene === "start" ? (
          <HorizonScene width={width} height={height} translateY={foregroundTranslateY} />
        ) : null}
      </Animated.View>

      <View pointerEvents="none" style={styles.grain}>
        {dust.slice(0, 22).map((particle, index) => (
          <View
            key={`grain-${index}`}
            style={[
              styles.grainDot,
              {
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                opacity: particle.opacity * 0.18,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

type AnimatedSceneProps = {
  width: number;
  height: number;
};

const BirthScene = ({
  width,
  height,
  scale,
  opacity,
  particles,
}: AnimatedSceneProps & {
  scale: Animated.AnimatedInterpolation<number>;
  opacity: Animated.AnimatedInterpolation<number>;
  particles: Particle[];
}) => (
  <>
    {particles.map((particle, index) => (
      <View
        key={`birth-particle-${index}`}
        style={[
          styles.particle,
          {
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity * 0.45,
          },
        ]}
      />
    ))}
    <Animated.View
      style={[
        styles.birthStar,
        {
          left: width * 0.5 - 42,
          top: height * 0.47 - 42,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Svg width={84} height={84} viewBox="0 0 84 84">
        <Defs>
          <RadialGradient id="birthGlow" cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.95} />
            <Stop offset="34%" stopColor={colors.ube} stopOpacity={0.38} />
            <Stop offset="100%" stopColor={colors.ube} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={42} cy={42} r={40} fill="url(#birthGlow)" />
        <Line x1={42} y1={12} x2={42} y2={72} stroke={colors.warmOffWhite} strokeOpacity={0.55} strokeWidth={1.2} />
        <Line x1={12} y1={42} x2={72} y2={42} stroke={colors.warmOffWhite} strokeOpacity={0.36} strokeWidth={1.2} />
        <Circle cx={42} cy={42} r={3.2} fill={colors.warmOffWhite} />
      </Svg>
    </Animated.View>
  </>
);

const GalaxyScene = ({
  width,
  height,
  rotate,
  particles,
}: AnimatedSceneProps & {
  rotate: Animated.AnimatedInterpolation<string>;
  particles: Particle[];
}) => (
  <Animated.View
    style={[
      styles.galaxyWrap,
      {
        left: width * 0.12,
        top: height * 0.1,
        width: width * 0.78,
        height: height * 0.56,
        transform: [{ rotate }, { scale: 1.02 }],
      },
    ]}
  >
    <Svg width="100%" height="100%" viewBox="0 0 320 220">
      <Defs>
        <RadialGradient id="galaxyCore" cx="50%" cy="50%" r="62%">
          <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.7} />
          <Stop offset="26%" stopColor={colors.ube} stopOpacity={0.32} />
          <Stop offset="64%" stopColor={colors.americanBlue} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={160} cy={110} rx={128} ry={48} fill="url(#galaxyCore)" />
      <G rotation="-16" origin="160,110">
        <Ellipse cx={160} cy={110} rx={118} ry={30} stroke={colors.ube} strokeOpacity={0.34} strokeWidth={2} fill="transparent" />
        <Ellipse cx={160} cy={110} rx={82} ry={19} stroke={colors.warmOffWhite} strokeOpacity={0.2} strokeWidth={1.2} fill="transparent" />
      </G>
      <G rotation="22" origin="160,110">
        <Ellipse cx={160} cy={110} rx={154} ry={36} stroke={colors.americanBlue} strokeOpacity={0.3} strokeWidth={2.6} fill="transparent" />
      </G>
      {particles.map((particle, index) => (
        <Circle
          key={`galaxy-dot-${index}`}
          cx={80 + (particle.left / 100) * 160}
          cy={76 + (particle.top / 100) * 72}
          r={particle.size * 0.7}
          fill={index % 5 === 0 ? colors.warmOffWhite : colors.ube}
          opacity={particle.opacity * 0.76}
        />
      ))}
    </Svg>
  </Animated.View>
);

const PlanetScene = ({
  width,
  height,
  translateY,
  ringDrift,
}: AnimatedSceneProps & {
  translateY: Animated.AnimatedInterpolation<number>;
  ringDrift: Animated.AnimatedInterpolation<number>;
}) => (
  <Animated.View
    style={[
      styles.planetWrap,
      {
        left: width * 0.14,
        top: height * 0.1,
        width: width * 0.82,
        height: height * 0.66,
        transform: [{ translateY }],
      },
    ]}
  >
    <Animated.View pointerEvents="none" style={[styles.ringLayer, { transform: [{ translateX: ringDrift }] }]}>
      <Svg width="100%" height="100%" viewBox="0 0 340 260">
        <G rotation="-12" origin="184,124">
          <Ellipse cx={184} cy={124} rx={146} ry={34} stroke={colors.warmOffWhite} strokeOpacity={0.28} strokeWidth={3} fill="transparent" />
          <Ellipse cx={184} cy={124} rx={118} ry={24} stroke={colors.ube} strokeOpacity={0.28} strokeWidth={2} fill="transparent" />
        </G>
      </Svg>
    </Animated.View>

    <Svg width="100%" height="100%" viewBox="0 0 340 260">
      <Defs>
        <RadialGradient id="planetGlow" cx="35%" cy="26%" r="76%">
          <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.5} />
          <Stop offset="40%" stopColor={colors.ube} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0.12} />
        </RadialGradient>
        <RadialGradient id="planetBloom" cx="42%" cy="36%" r="62%">
          <Stop offset="0%" stopColor={colors.ube} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={colors.ube} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={184} cy={124} r={106} fill="url(#planetBloom)" />
      <Circle cx={184} cy={124} r={72} fill="url(#planetGlow)" />
      <Circle cx={152} cy={88} r={20} fill={colors.warmOffWhite} opacity={0.06} />
    </Svg>
  </Animated.View>
);

const HorizonScene = ({
  width,
  height,
  translateY,
}: AnimatedSceneProps & {
  translateY: Animated.AnimatedInterpolation<number>;
}) => (
  <Animated.View
    style={[
      styles.horizonWrap,
      {
        left: -width * 0.25,
        top: height * 0.26,
        width: width * 1.5,
        height: height * 0.72,
        transform: [{ translateY }, { scale: 1.04 }],
      },
    ]}
  >
    <Svg width="100%" height="100%" viewBox="0 0 520 360">
      <Defs>
        <RadialGradient id="horizonGlow" cx="50%" cy="18%" r="75%">
          <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.28} />
          <Stop offset="28%" stopColor={colors.ube} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="horizonPlanet" cx="42%" cy="16%" r="80%">
          <Stop offset="0%" stopColor={colors.warmOffWhite} stopOpacity={0.26} />
          <Stop offset="46%" stopColor={colors.americanBlue} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={colors.chineseBlack} stopOpacity={0.9} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={260} cy={154} rx={220} ry={96} fill="url(#horizonGlow)" />
      <Ellipse cx={260} cy={268} rx={236} ry={118} fill="url(#horizonPlanet)" />
      <Line x1={64} y1={174} x2={456} y2={174} stroke={colors.warmOffWhite} strokeOpacity={0.22} strokeWidth={1.5} />
    </Svg>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
  },
  topLeftLight: {
    position: "absolute",
    top: -150,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: "rgba(131,135,195,0.12)",
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
  volumetricHaze: {
    position: "absolute",
    top: 80,
    left: -24,
    right: -24,
    height: 210,
    borderRadius: 999,
    backgroundColor: "rgba(58,62,108,0.1)",
    transform: [{ rotate: "-18deg" }],
  },
  star: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.warmOffWhite,
    shadowColor: colors.warmOffWhite,
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  birthStar: {
    position: "absolute",
    width: 84,
    height: 84,
  },
  galaxyWrap: {
    position: "absolute",
  },
  planetWrap: {
    position: "absolute",
  },
  ringLayer: {
    ...fill,
  },
  horizonWrap: {
    position: "absolute",
  },
  grain: {
    ...fill,
    opacity: 0.55,
  },
  grainDot: {
    position: "absolute",
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: "rgba(232,230,200,0.56)",
  },
});
