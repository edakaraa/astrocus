import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Line,
  Skia,
  vec,
} from "@shopify/react-native-skia";

import { buildBackgroundStars, buildGalaxyScene, buildMetrics } from "./galaxy/buildGalaxyScene";
import { getBackdropStars, getGalaxyScene } from "./galaxy/galaxySceneCache";
import type { BackgroundStar } from "./galaxy/galaxySceneCache";

const SHOOTING_STAR_INTERVAL_S = 6.5;
/** ±15° swing from center. */
const SWING_RAD = (15 * Math.PI) / 180;
const SWING_PERIOD_S = 16;

const clampDeltaSeconds = (ms: number | null | undefined) => {
  "worklet";
  if (ms == null || ms <= 0) {
    return 1 / 60;
  }
  return Math.min(ms, 48) / 1000;
};

export const GALAXY_BACKDROP_COLOR = "#03040f";

type GalaxyBackgroundProps = {
  centerYRatio?: number;
  /** When false, only backdrop (fill + field stars); no spiral galaxy. */
  showGalaxy?: boolean;
  /** When false, swing/twinkle pause (galaxy stays mounted for instant session reveal). */
  animate?: boolean;
};

const CrossStar = ({ star }: { star: BackgroundStar }) => (
  <Group>
    <Line
      p1={vec(star.cx, star.cy - star.r * 2.2)}
      p2={vec(star.cx, star.cy + star.r * 2.2)}
      color={star.color}
      strokeWidth={0.55}
    />
    <Line
      p1={vec(star.cx - star.r * 2.2, star.cy)}
      p2={vec(star.cx + star.r * 2.2, star.cy)}
      color={star.color}
      strokeWidth={0.55}
    />
    <Circle cx={star.cx} cy={star.cy} r={star.r * 0.45} color={star.color} />
  </Group>
);

export const GalaxyBackground = ({
  centerYRatio = 0.58,
  showGalaxy = true,
  animate = true,
}: GalaxyBackgroundProps) => {
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
  const CENTER_X = SCREEN_W / 2;
  const CENTER_Y = SCREEN_H * centerYRatio;

  const metrics = useMemo(() => buildMetrics(SCREEN_W, SCREEN_H), [SCREEN_W, SCREEN_H]);

  const backdropStars = useMemo(
    () => getBackdropStars(metrics, () => buildBackgroundStars(metrics)),
    [metrics],
  );

  const scene = useMemo(
    () =>
      showGalaxy
        ? getGalaxyScene(metrics, CENTER_X, CENTER_Y, metrics.base, () =>
            buildGalaxyScene(metrics, CENTER_X, CENTER_Y),
          )
        : null,
    [metrics, CENTER_X, CENTER_Y, showGalaxy],
  );

  const fieldStars = showGalaxy && scene ? scene.stars : backdropStars;

  const pivotX = useSharedValue(CENTER_X);
  const pivotY = useSharedValue(CENTER_Y);
  const swingPhase = useSharedValue(0);
  const time = useSharedValue(0);
  const shootT = useSharedValue(0);
  const shootX0 = useSharedValue(0);
  const shootY0 = useSharedValue(0);
  const shootX1 = useSharedValue(0);
  const shootY1 = useSharedValue(0);
  const shootCooldown = useSharedValue(0);

  useEffect(() => {
    pivotX.value = CENTER_X;
    pivotY.value = CENTER_Y;
  }, [CENTER_X, CENTER_Y, pivotX, pivotY]);

  useEffect(() => {
    if (!showGalaxy || !animate) {
      cancelAnimation(swingPhase);
      swingPhase.value = 0;
      return;
    }

    swingPhase.value = 0;
    swingPhase.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: SWING_PERIOD_S * 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(swingPhase);
    };
  }, [animate, showGalaxy, swingPhase]);

  useFrameCallback((frameInfo) => {
    "worklet";
    const dt = clampDeltaSeconds(frameInfo.timeSincePreviousFrame);
    time.value += dt;

    if (shootT.value < 1) {
      shootT.value = Math.min(1, shootT.value + dt * 1.75);
    } else {
      shootCooldown.value += dt;
      if (shootCooldown.value >= SHOOTING_STAR_INTERVAL_S) {
        shootCooldown.value = 0;
        shootT.value = 0;
        const startY = SCREEN_H * (0.08 + Math.random() * 0.55);
        shootX0.value = -SCREEN_W * 0.05;
        shootY0.value = startY;
        shootX1.value = SCREEN_W * (0.35 + Math.random() * 0.45);
        shootY1.value = startY + SCREEN_H * (0.06 + Math.random() * 0.08);
      }
    }
  });

  const galaxyMatrix = useDerivedValue(() => {
    "worklet";
    const swing = SWING_RAD * Math.sin(swingPhase.value);
    const matrix = Skia.Matrix();
    matrix.translate(pivotX.value, pivotY.value);
    matrix.rotate(swing);
    matrix.translate(-pivotX.value, -pivotY.value);
    return matrix;
  });

  const shootingStar = useDerivedValue(() => {
    "worklet";
    const t = shootT.value;
    if (t <= 0 || t >= 1) {
      return null;
    }
    const x = shootX0.value + (shootX1.value - shootX0.value) * t;
    const y = shootY0.value + (shootY1.value - shootY0.value) * t;
    const tail = 28 + t * 42;
    const angle = Math.atan2(shootY1.value - shootY0.value, shootX1.value - shootX0.value);
    return {
      headX: x,
      headY: y,
      tailX: x - Math.cos(angle) * tail,
      tailY: y - Math.sin(angle) * tail,
      opacity: (1 - t) * 0.85,
    };
  });

  const shootOpacity = useDerivedValue(() => shootingStar.value?.opacity ?? 0);
  const shootP1 = useDerivedValue(() => {
    const s = shootingStar.value;
    return s ? vec(s.tailX, s.tailY) : vec(-120, -120);
  });
  const shootP2 = useDerivedValue(() => {
    const s = shootingStar.value;
    return s ? vec(s.headX, s.headY) : vec(-120, -120);
  });
  const shootHeadX = useDerivedValue(() => shootingStar.value?.headX ?? -120);
  const shootHeadY = useDerivedValue(() => shootingStar.value?.headY ?? -120);

  const twinkleOpacity = useDerivedValue(() => {
    "worklet";
    return 0.72 + 0.28 * Math.sin(time.value * 0.85);
  });

  const starTwinkleOpacity = useDerivedValue(() => {
    "worklet";
    return 0.68 + 0.32 * Math.sin(time.value * 0.55 + 1.2);
  });

  return (
    <Canvas
      style={[styles.canvas, { width: SCREEN_W, height: SCREEN_H }]}
      pointerEvents="none"
    >
      <Fill color={GALAXY_BACKDROP_COLOR} />

      <Group opacity={starTwinkleOpacity}>
        {fieldStars.map((s, i) =>
          s.isCross ? (
            <CrossStar key={`bg-star-${i}`} star={s} />
          ) : (
            <Circle key={`bg-star-${i}`} cx={s.cx} cy={s.cy} r={s.r} color={s.color} />
          ),
        )}
      </Group>

      <Group opacity={shootOpacity}>
        <Line
          p1={shootP1}
          p2={shootP2}
          color="rgba(220,235,255,0.9)"
          strokeWidth={1.2}
        />
        <Circle cx={shootHeadX} cy={shootHeadY} r={1.4} color="rgba(255,248,230,0.95)" />
      </Group>

      {showGalaxy && scene ? (
        <Group matrix={galaxyMatrix}>
          <Group>
            {scene.filaments.map((f, i) => (
              <Circle key={`fil-${i}`} cx={f.cx} cy={f.cy} r={f.r} color={f.color} />
            ))}
          </Group>

          <Group opacity={twinkleOpacity}>
            {scene.arms.map((p, i) => (
              <Circle key={`arm-${i}`} cx={p.cx} cy={p.cy} r={p.r} color={p.color} />
            ))}
          </Group>

          {scene.coreLayers.map((layer, i) => (
            <Circle
              key={`core-${i}`}
              cx={CENTER_X}
              cy={CENTER_Y}
              r={layer.r}
              color={layer.color}
              opacity={layer.opacity}
            >
              <Blur blur={layer.blur} />
            </Circle>
          ))}
        </Group>
      ) : null}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

export {
  preloadCosmicBackdrop,
  preloadGalaxyScene,
  scheduleGalaxyScenePreload,
} from "./galaxy/preloadGalaxyScene";
