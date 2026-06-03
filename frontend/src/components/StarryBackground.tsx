import React, { type PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

type StarConfig = {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const pick = (min: number, max: number) => min + Math.random() * (max - min);

const buildStars = (): StarConfig[] => {
  const stars: StarConfig[] = [];
  const { starCountNormal, starCount, starDelayMaxMs } = theme.layout;
  const normalColors = [theme.colors.accent, theme.colors.textSecondary];

  for (let i = 0; i < starCountNormal; i += 1) {
    stars.push({
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H,
      size: pick(theme.layout.starSizeNormalMin, theme.layout.starSizeNormalMax),
      color: normalColors[i % normalColors.length] ?? theme.colors.accent,
      delay: Math.random() * starDelayMaxMs,
    });
  }

  for (let i = starCountNormal; i < starCount; i += 1) {
    stars.push({
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H,
      size: pick(theme.layout.starSizeHeroMin, theme.layout.starSizeHeroMax),
      color: theme.colors.textPrimary,
      delay: Math.random() * starDelayMaxMs,
    });
  }

  return stars;
};

const TwinkleStar = ({ star }: { star: StarConfig }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    const timer = setTimeout(() => loop.start(), star.delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [opacity, star.delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: star.color,
        opacity,
      }}
    />
  );
};

export const StarryBackground: React.FC<PropsWithChildren> = ({ children }) => {
  const stars = useMemo(() => buildStars(), []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.bg, theme.colors.starGradientMid, theme.colors.bg]}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {stars.map((star, index) => (
          <TwinkleStar key={`star-${index}`} star={star} />
        ))}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.bg,
    flex: 1,
  },
});
