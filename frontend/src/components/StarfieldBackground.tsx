import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { colors } from "../shared/theme";

type StarfieldBackgroundProps = {
  density?: number;
  opacity?: number;
  twinkle?: boolean;
};

type StaticStar = {
  cx: number;
  cy: number;
  sizePx: number;
  opacity: number;
  gold: boolean;
};

type TwinkleStar = StaticStar & {
  baseOpacity: number;
  delay: number;
  duration: number;
  isCross: boolean;
};

const createStaticStars = (count: number): StaticStar[] =>
  Array.from({ length: count }, (_, i) => {
    const seed = (i + 1) * 31.1;
    const lowerBias =
      i % 3 === 0
        ? 55 + (Math.abs(Math.sin(seed * 1.2) * 10000) % 45)
        : Math.abs(Math.cos(seed * 1.15) * 10000) % 100;
    return {
      cx: Math.abs(Math.sin(seed) * 10000) % 100,
      cy: lowerBias,
      sizePx: i % 5 === 0 ? 1.8 : i % 5 === 1 ? 1.2 : 0.9,
      opacity: 0.22 + (Math.abs(Math.sin(seed * 0.85)) % 1) * 0.38,
      gold: i % 9 === 0,
    };
  });

const createTwinkleStars = (count: number): TwinkleStar[] =>
  Array.from({ length: count }, (_, i) => {
    const seed = (i + 1) * 19.3;
    return {
      cx: Math.abs(Math.sin(seed) * 10000) % 100,
      cy: Math.abs(Math.cos(seed * 1.4) * 10000) % 100,
      sizePx: i % 4 === 0 ? 2.6 : i % 4 === 1 ? 2 : i % 4 === 2 ? 1.4 : 1,
      baseOpacity: 0.32 + (Math.abs(Math.cos(seed * 0.7)) % 1) * 0.55,
      delay: (i * 173) % 3200,
      duration: 2200 + (i * 97) % 1600,
      isCross: i % 8 === 0,
      gold: i % 7 === 0,
      opacity: 0.32 + (Math.abs(Math.cos(seed * 0.7)) % 1) * 0.55,
    };
  });

export const StarfieldBackground = ({ density = 42, opacity = 1, twinkle = true }: StarfieldBackgroundProps) => {
  const { width, height } = useWindowDimensions();
  const staticStars = useMemo(() => createStaticStars(Math.round(density * 0.85)), [density]);
  const twinkleStars = useMemo(() => createTwinkleStars(density), [density]);
  const animsRef = useRef<Animated.Value[]>([]);

  const starCount = twinkleStars.length;
  if (animsRef.current.length < starCount) {
    for (let i = animsRef.current.length; i < starCount; i += 1) {
      animsRef.current.push(new Animated.Value(0));
    }
  } else if (animsRef.current.length > starCount) {
    animsRef.current.length = starCount;
  }
  const anims = animsRef.current;

  useEffect(() => {
    if (!twinkle) {
      return undefined;
    }

    const loops = twinkleStars
      .map((star, i) => {
        const anim = anims[i];
        if (!anim) {
          return null;
        }

        return Animated.loop(
          Animated.sequence([
            Animated.delay(star.delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: star.duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        );
      })
      .filter((loop): loop is Animated.CompositeAnimation => loop !== null);

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [anims, starCount, twinkle, twinkleStars]);

  const starColor = (gold: boolean) => (gold ? "#E8C97A" : colors.warmOffWhite);

  return (
    <View pointerEvents="none" style={[styles.fill, { backgroundColor: colors.background, opacity }]}>
      {staticStars.map((star, i) => {
        const left = (star.cx / 100) * width;
        const top = (star.cy / 100) * height;
        return (
          <View
            key={`static-${i}`}
            style={{
              position: "absolute",
              left: left - star.sizePx / 2,
              top: top - star.sizePx / 2,
              width: star.sizePx,
              height: star.sizePx,
              borderRadius: star.sizePx / 2,
              backgroundColor: starColor(star.gold),
              opacity: star.opacity,
            }}
          />
        );
      })}

      {twinkle
        ? twinkleStars.map((star, i) => {
            const anim = anims[i];
            if (!anim) {
              return null;
            }

            const left = (star.cx / 100) * width;
            const top = (star.cy / 100) * height;
            const animOpacity = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [star.baseOpacity * 0.45, star.baseOpacity],
            });
            const color = starColor(star.gold);

            if (star.isCross) {
              return (
                <Animated.View
                  key={`twinkle-${i}`}
                  style={{
                    position: "absolute",
                    left: left - 5,
                    top: top - 5,
                    width: 10,
                    height: 10,
                    opacity: animOpacity,
                  }}
                >
                  <Svg width={10} height={10} viewBox="0 0 10 10">
                    <Line x1={5} y1={1} x2={5} y2={9} stroke={color} strokeWidth={0.9} strokeOpacity={0.85} />
                    <Line x1={1} y1={5} x2={9} y2={5} stroke={color} strokeWidth={0.9} strokeOpacity={0.65} />
                    <Circle cx={5} cy={5} r={1.1} fill={color} />
                  </Svg>
                </Animated.View>
              );
            }

            return (
              <Animated.View
                key={`twinkle-${i}`}
                style={{
                  position: "absolute",
                  left: left - star.sizePx / 2,
                  top: top - star.sizePx / 2,
                  width: star.sizePx,
                  height: star.sizePx,
                  borderRadius: star.sizePx / 2,
                  backgroundColor: color,
                  opacity: animOpacity,
                }}
              />
            );
          })
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
