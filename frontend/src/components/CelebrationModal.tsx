import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import { colors, motion, numericTypography, radii, shadows, spacing, typography } from "../shared/theme";
import theme from "../theme";
import { GradientButton } from "./GradientButton";

type CelebrationModalProps = {
  visible: boolean;
  stardustEarned: number;
  pendingSync?: boolean;
  unlockedStarLabel?: string | null;
  newBadgeLabels?: string[];
  galacticAdvice?: string | null;
  durationMinutes: number;
  currentStreak: number;
  todayTotalMinutes: number;
  onClose: () => void;
};

const CARD_MAX_WIDTH = 360;
const BURST_STAR_COUNT = 16;

type StarSpec = {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  opacity: number;
};

type BurstStarSpec = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
};

/** Deterministic ambient stars — matches StarryBackground palette. */
const AMBIENT_STARS: StarSpec[] = [
  { x: 0.08, y: 0.12, size: 2, color: theme.colors.accent, delay: 0, opacity: 0.55 },
  { x: 0.22, y: 0.06, size: 3, color: theme.colors.textPrimary, delay: 400, opacity: 0.7 },
  { x: 0.78, y: 0.1, size: 2.5, color: theme.colors.textSecondary, delay: 800, opacity: 0.5 },
  { x: 0.92, y: 0.18, size: 2, color: theme.colors.accent, delay: 200, opacity: 0.45 },
  { x: 0.06, y: 0.38, size: 3.5, color: theme.colors.textPrimary, delay: 1200, opacity: 0.65 },
  { x: 0.88, y: 0.42, size: 2, color: theme.colors.accent, delay: 600, opacity: 0.5 },
  { x: 0.14, y: 0.72, size: 2, color: theme.colors.textSecondary, delay: 300, opacity: 0.4 },
  { x: 0.72, y: 0.78, size: 3, color: theme.colors.accent, delay: 1000, opacity: 0.55 },
  { x: 0.48, y: 0.88, size: 2.5, color: theme.colors.textPrimary, delay: 500, opacity: 0.5 },
  { x: 0.36, y: 0.24, size: 1.5, color: theme.colors.textSecondary, delay: 900, opacity: 0.35 },
  { x: 0.58, y: 0.16, size: 2, color: colors.warning, delay: 1500, opacity: 0.45 },
  { x: 0.82, y: 0.62, size: 1.5, color: theme.colors.accent, delay: 700, opacity: 0.4 },
];

const buildBurstStars = (): BurstStarSpec[] => {
  const palette = [colors.warning, theme.colors.accent, theme.colors.textPrimary, colors.success];
  return Array.from({ length: BURST_STAR_COUNT }, (_, index) => ({
    angle: (index / BURST_STAR_COUNT) * Math.PI * 2 + (index % 3) * 0.15,
    distance: 48 + (index % 5) * 22,
    size: 8 + (index % 3) * 3,
    color: palette[index % palette.length] ?? theme.colors.accent,
    delay: index * 28,
  }));
};

const FourPointStar = ({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: object;
}) => {
  const arm = Math.max(1, size * 0.28);
  const span = size;

  return (
    <View style={[{ width: span, height: span, alignItems: "center", justifyContent: "center" }, style]}>
      <View
        style={{
          position: "absolute",
          width: arm,
          height: span,
          borderRadius: arm / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: span,
          height: arm,
          borderRadius: arm / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

const TwinkleStar = ({ star, cardWidth, cardHeight }: { star: StarSpec; cardWidth: number; cardHeight: number }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: star.opacity * 0.25, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: star.opacity, duration: 1400, useNativeDriver: true }),
      ]),
    );
    const timer = setTimeout(() => loop.start(), star.delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [opacityAnim, star.delay, star.opacity]);

  const isHero = star.size >= 3;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: star.x * cardWidth - star.size / 2,
        top: star.y * cardHeight - star.size / 2,
        opacity: opacityAnim,
      }}
    >
      {isHero ? (
        <FourPointStar size={star.size * 3.2} color={star.color} />
      ) : (
        <View
          style={{
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: star.color,
          }}
        />
      )}
    </Animated.View>
  );
};

const CardStarField = ({ width, height }: { width: number; height: number }) => (
  <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.starField]}>
    {AMBIENT_STARS.map((star, index) => (
      <TwinkleStar key={`ambient-${index}`} star={star} cardWidth={width} cardHeight={height} />
    ))}
  </View>
);

const StarBurst = ({ active }: { active: boolean }) => {
  const stars = useMemo(() => buildBurstStars(), []);
  const anims = useRef(stars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((anim) => anim.setValue(0));
      return;
    }

    const burst = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 820,
        delay: stars[index].delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    Animated.stagger(16, burst).start();
  }, [active, anims, stars]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.burstHost}>
      {stars.map((star, index) => {
        const progress = anims[index];
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(star.angle) * star.distance],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(star.angle) * star.distance],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.1, 0.55, 1],
          outputRange: [0, 1, 0.75, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.2, 1.1, 0.4],
        });
        const rotation = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${(index % 2 === 0 ? 1 : -1) * 45}deg`],
        });

        return (
          <Animated.View
            key={`burst-${index}`}
            style={{
              position: "absolute",
              opacity,
              transform: [{ translateX }, { translateY }, { scale }, { rotate: rotation }],
            }}
          >
            <FourPointStar size={star.size} color={star.color} />
          </Animated.View>
        );
      })}
    </View>
  );
};

const StatPill = ({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string;
  label: string;
}) => (
  <View style={styles.statPill}>
    <MaterialCommunityIcons name={icon} size={14} color={theme.colors.accent} style={styles.statIcon} />
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const CelebrationModal = ({
  visible,
  stardustEarned,
  pendingSync = false,
  unlockedStarLabel,
  newBadgeLabels,
  galacticAdvice,
  durationMinutes,
  currentStreak,
  todayTotalMinutes,
  onClose,
}: CelebrationModalProps) => {
  const { language } = useAppContext();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(CARD_MAX_WIDTH, width - spacing.lg * 2);
  const cardHeight = 520;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(0.85)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const headline = useMemo(() => {
    if (pendingSync) {
      return t(language, "celebrationQueued");
    }
    return unlockedStarLabel ? t(language, "unlockedStar") : t(language, "celebrationTitle");
  }, [language, pendingSync, unlockedStarLabel]);

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      cardScale.setValue(0.92);
      cardOpacity.setValue(0);
      rewardScale.setValue(0.85);
      glowPulse.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: motion.durationNormal,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 95,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: motion.durationFast,
        useNativeDriver: true,
      }),
    ]).start();

    rewardScale.setValue(0.85);
    Animated.spring(rewardScale, {
      toValue: 1,
      friction: 5,
      tension: 130,
      delay: 140,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  }, [visible, backdropOpacity, cardOpacity, cardScale, glowPulse, rewardScale]);

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "close")}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <LinearGradient
              colors={["rgba(10,17,35,0.94)", "rgba(10,17,35,0.88)"]}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </Pressable>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.cardOuter,
            {
              width: cardWidth,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

          <View style={[styles.cardShell, { minHeight: cardHeight }]}>
            <LinearGradient
              colors={[theme.colors.bg, theme.colors.starGradientMid, "rgba(58,62,108,0.72)"]}
              locations={[0, 0.55, 1]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <CardStarField width={cardWidth} height={cardHeight} />
            <StarBurst active={visible && !pendingSync} />

            <View style={styles.cardContent}>
              <LinearGradient
                colors={["rgba(131,135,195,0.45)", "rgba(131,135,195,0.08)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topAccent}
              />

              <View style={styles.iconRingOuter}>
                <LinearGradient
                  colors={["rgba(131,135,195,0.55)", "rgba(58,62,108,0.85)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconRingGradient}
                >
                  <View style={styles.iconRingInner}>
                    <MaterialCommunityIcons
                      name={unlockedStarLabel ? "star-shooting" : "star-four-points"}
                      size={28}
                      color={colors.warning}
                    />
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.headline}>{headline}</Text>
              <Text style={styles.subtitle}>
                {pendingSync ? t(language, "celebrationPendingSync") : t(language, "celebrationSubtitle")}
              </Text>

              {!pendingSync && unlockedStarLabel ? (
                <View style={styles.highlightChip}>
                  <MaterialCommunityIcons name="star-circle" size={16} color={colors.warning} />
                  <Text style={styles.highlightText}>
                    {`${unlockedStarLabel} ${t(language, "celebrationStarYours")}`}
                  </Text>
                </View>
              ) : null}

              <View style={styles.rewardShell}>
                <View style={styles.rewardPanel}>
                  {pendingSync ? (
                    <>
                      <Text style={styles.rewardMuted}>—</Text>
                      <Text style={styles.rewardLabel}>{t(language, "celebrationStardustPending")}</Text>
                    </>
                  ) : (
                    <>
                      <Animated.Text style={[styles.rewardValue, { transform: [{ scale: rewardScale }] }]}>
                        {`+${formatNumber(language, stardustEarned)}`}
                        <Text style={styles.rewardSpark}> ✦</Text>
                      </Animated.Text>
                      <Text style={styles.rewardLabel}>{t(language, "celebrationStardustEarned")}</Text>
                    </>
                  )}
                </View>
              </View>

              {newBadgeLabels && newBadgeLabels.length > 0 && !pendingSync ? (
                <View style={styles.extraBox}>
                  <Text style={styles.extraLabel}>{t(language, "celebrationNewBadge")}</Text>
                  <Text style={styles.extraText}>{newBadgeLabels.join(" · ")}</Text>
                </View>
              ) : null}

              {galacticAdvice && !pendingSync ? (
                <View style={styles.adviceBox}>
                  <MaterialCommunityIcons name="telescope" size={16} color={theme.colors.accent} />
                  <View style={styles.adviceCopy}>
                    <Text style={styles.extraLabel}>{t(language, "celebrationGalacticAdvice")}</Text>
                    <Text style={styles.extraText}>{galacticAdvice}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.statsRow}>
                <StatPill
                  icon="timer-outline"
                  value={formatDuration(language, durationMinutes)}
                  label={t(language, "celebrationSessionDuration")}
                />
                <StatPill
                  icon="fire"
                  value={String(currentStreak)}
                  label={t(language, "celebrationStreak")}
                />
                <StatPill
                  icon="calendar-today"
                  value={formatDuration(language, todayTotalMinutes)}
                  label={t(language, "celebrationTodayTotal")}
                />
              </View>

              <GradientButton label={t(language, "ok")} onPress={onClose} fullWidth style={styles.okBtn} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOuter: {
    maxWidth: CARD_MAX_WIDTH,
    zIndex: 2,
    ...shadows.glow,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.accent,
    borderRadius: radii.xl + 4,
    margin: -2,
  },
  cardShell: {
    borderColor: theme.colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  starField: {
    zIndex: 0,
  },
  cardContent: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    zIndex: 1,
  },
  topAccent: {
    height: 1,
    left: spacing.lg,
    position: "absolute",
    right: spacing.lg,
    top: 0,
  },
  burstHost: {
    alignItems: "center",
    height: 1,
    justifyContent: "center",
    left: "50%",
    position: "absolute",
    top: 72,
    width: 1,
    zIndex: 2,
  },
  iconRingOuter: {
    alignSelf: "center",
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
    padding: 1.5,
  },
  iconRingGradient: {
    borderRadius: radii.pill,
    padding: 1,
  },
  iconRingInner: {
    alignItems: "center",
    backgroundColor: "rgba(10,17,35,0.72)",
    borderColor: theme.colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  headline: {
    ...typography.h2,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  highlightChip: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,209,102,0.08)",
    borderColor: "rgba(255,209,102,0.2)",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  highlightText: {
    ...typography.body,
    color: colors.warning,
  },
  rewardShell: {
    marginTop: spacing.md,
    width: "100%",
  },
  rewardPanel: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 88,
    paddingVertical: spacing.sm,
  },
  rewardValue: {
    ...numericTypography,
    color: theme.colors.textPrimary,
    fontSize: 46,
    letterSpacing: -1.2,
  },
  rewardSpark: {
    color: colors.warning,
    fontSize: 34,
  },
  rewardMuted: {
    ...numericTypography,
    color: theme.colors.muted,
    fontSize: 36,
  },
  rewardLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginTop: spacing.xxs,
  },
  extraBox: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  adviceBox: {
    alignItems: "flex-start",
    backgroundColor: "rgba(131,135,195,0.1)",
    borderColor: theme.colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  adviceCopy: {
    flex: 1,
  },
  extraLabel: {
    ...typography.label,
    color: theme.colors.accent,
    marginBottom: spacing.xxs,
  },
  extraText: {
    ...typography.body,
    color: theme.colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    width: "100%",
  },
  statPill: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.sm,
  },
  statIcon: {
    marginBottom: 4,
    opacity: 0.9,
  },
  statVal: {
    ...numericTypography,
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: "center",
  },
  statLabel: {
    ...typography.label,
    color: theme.colors.muted,
    fontSize: 7,
    marginTop: 4,
    textAlign: "center",
  },
  okBtn: {
    marginTop: spacing.xxs,
  },
});
