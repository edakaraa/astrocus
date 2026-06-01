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
import { colors, fontFamilies, motion, radii, shadows, spacing, typography } from "../shared/theme";
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

const PARTICLE_COUNT = 20;
const CARD_MAX_WIDTH = 360;

type ParticleSpec = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
};

const buildParticles = (): ParticleSpec[] => {
  const palette = [colors.warning, colors.primary, colors.warmOffWhite, colors.success, colors.ube];
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    angle: (index / PARTICLE_COUNT) * Math.PI * 2 + (index % 3) * 0.12,
    distance: 52 + (index % 5) * 24,
    size: 2.5 + (index % 4) * 1.5,
    color: palette[index % palette.length],
    delay: index * 24,
  }));
};

const StarBurst = ({ active }: { active: boolean }) => {
  const particles = useMemo(() => buildParticles(), []);
  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((anim) => anim.setValue(0));
      return;
    }

    const burst = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 780,
        delay: particles[index].delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    Animated.stagger(14, burst).start();
  }, [active, anims, particles]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.burstHost}>
      {particles.map((particle, index) => {
        const progress = anims[index];
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(particle.angle) * particle.distance],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(particle.angle) * particle.distance],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 0.65, 1],
          outputRange: [0, 1, 0.7, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.18, 1],
          outputRange: [0.15, 1.15, 0.35],
        });

        return (
          <Animated.View
            key={`burst-${index}`}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size,
                backgroundColor: particle.color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          />
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
    <MaterialCommunityIcons name={icon} size={14} color={colors.primary} style={styles.statIcon} />
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

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
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
      cardScale.setValue(0.9);
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
        Animated.timing(glowPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [visible, backdropOpacity, cardOpacity, cardScale, glowPulse, rewardScale]);

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
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
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
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

          <LinearGradient
            colors={["rgba(131,135,195,0.28)", "rgba(58,62,108,0.96)", "rgba(10,17,35,0.98)"]}
            locations={[0, 0.45, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.cardGradient}
          >
            <LinearGradient
              colors={["rgba(255,209,102,0.55)", "rgba(131,135,195,0.35)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topAccent}
            />

            <View style={styles.orbLeft} />
            <View style={styles.orbRight} />

            <StarBurst active={visible && !pendingSync} />

            <View style={styles.iconRingOuter}>
              <LinearGradient
                colors={["rgba(255,209,102,0.35)", "rgba(131,135,195,0.5)", "rgba(58,62,108,0.8)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconRingGradient}
              >
                <View style={styles.iconRingInner}>
                  <MaterialCommunityIcons
                    name={unlockedStarLabel ? "star-shooting" : "star-four-points"}
                    size={30}
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
              <LinearGradient
                colors={["rgba(131,135,195,0.18)", "rgba(255,255,255,0.04)"]}
                style={styles.rewardGradient}
              >
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
              </LinearGradient>
            </View>

            {newBadgeLabels && newBadgeLabels.length > 0 && !pendingSync ? (
              <View style={styles.extraBox}>
                <Text style={styles.extraLabel}>{t(language, "celebrationNewBadge")}</Text>
                <Text style={styles.extraText}>{newBadgeLabels.join(" · ")}</Text>
              </View>
            ) : null}

            {galacticAdvice && !pendingSync ? (
              <View style={styles.adviceBox}>
                <MaterialCommunityIcons name="telescope" size={16} color={colors.primary} />
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
          </LinearGradient>
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
    backgroundColor: "rgba(10, 17, 35, 0.82)",
  },
  cardOuter: {
    maxWidth: CARD_MAX_WIDTH,
    zIndex: 2,
    ...shadows.glow,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    borderRadius: radii.xl + 4,
    margin: -3,
    opacity: 0.4,
  },
  cardGradient: {
    borderColor: "rgba(232,230,200,0.14)",
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  topAccent: {
    height: 2,
    left: spacing.lg,
    position: "absolute",
    right: spacing.lg,
    top: 0,
  },
  orbLeft: {
    backgroundColor: "rgba(131,135,195,0.12)",
    borderRadius: 80,
    height: 120,
    left: -40,
    position: "absolute",
    top: 20,
    width: 120,
  },
  orbRight: {
    backgroundColor: "rgba(255,209,102,0.08)",
    borderRadius: 60,
    height: 90,
    position: "absolute",
    right: -24,
    top: 64,
    width: 90,
  },
  burstHost: {
    alignItems: "center",
    height: 1,
    justifyContent: "center",
    left: "50%",
    position: "absolute",
    top: 58,
    width: 1,
    zIndex: 2,
  },
  particle: {
    position: "absolute",
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
    backgroundColor: "rgba(10,17,35,0.55)",
    borderRadius: radii.pill,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  headline: {
    ...typography.h2,
    color: colors.warmOffWhite,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  highlightChip: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,209,102,0.1)",
    borderColor: "rgba(255,209,102,0.22)",
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
  rewardGradient: {
    alignItems: "center",
    borderColor: "rgba(131,135,195,0.28)",
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: 88,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  rewardValue: {
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.mono,
    fontSize: 46,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
  rewardSpark: {
    color: colors.warning,
    fontSize: 34,
  },
  rewardMuted: {
    color: colors.textFaint,
    fontFamily: fontFamilies.mono,
    fontSize: 36,
    fontWeight: "700",
  },
  rewardLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  extraBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
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
    borderColor: "rgba(131,135,195,0.22)",
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
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  extraText: {
    ...typography.body,
    color: colors.text,
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
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
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
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  statLabel: {
    ...typography.label,
    color: colors.textFaint,
    fontSize: 7,
    marginTop: 4,
    textAlign: "center",
  },
  okBtn: {
    marginTop: spacing.xxs,
  },
});
