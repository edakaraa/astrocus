import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import { useResponsive } from "../shared/responsive";
import { colors, motion, radii, spacing } from "../shared/theme";
import theme from "../theme";
import { GradientButton } from "./GradientButton";
import { StatBox } from "./profile/StatBox";
import { SurfaceCard } from "./SurfaceCard";
import { AppIcon } from "./ui/AppIcon";
import { AppText } from "./ui/AppText";
import { StardustAmount } from "./ui/StardustMark";
import { getBadgeIcon } from "./badges/badgeIcons";

const CARD_MAX_WIDTH = 400;

type CelebrationBadge = {
  id: string;
  title: string;
  description: string;
};

type CelebrationModalProps = {
  visible: boolean;
  stardustEarned: number;
  pendingSync?: boolean;
  isFirstSession?: boolean;
  unlockedStarLabel?: string | null;
  newBadgeLabels?: string[];
  firstBadge?: CelebrationBadge | null;
  durationMinutes: number;
  currentStreak: number;
  todayTotalMinutes: number;
  onClose: () => void;
};

const CelebrationBadgeCard = ({ badge }: { badge: CelebrationBadge }) => {
  const icon = getBadgeIcon(badge.id);

  return (
    <SurfaceCard borderVariant="strong" contentPadding={spacing.md} style={styles.badgeCard}>
      <View style={styles.badgeSymbol}>
        <AppIcon name={icon.icon} size={44} color={theme.colors.accent} />
      </View>
      <AppText variant="card" style={styles.badgeTitle}>
        {badge.title}
      </AppText>
      <AppText variant="caption" style={styles.badgeDescription}>
        {badge.description}
      </AppText>
    </SurfaceCard>
  );
};

export const CelebrationModal = ({
  visible,
  stardustEarned,
  pendingSync = false,
  isFirstSession = false,
  unlockedStarLabel,
  newBadgeLabels,
  firstBadge,
  durationMinutes,
  currentStreak,
  todayTotalMinutes,
  onClose,
}: CelebrationModalProps) => {
  const { language } = useAppContext();
  const { width, contentPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const cardWidth = Math.min(CARD_MAX_WIDTH, width - contentPadding * 2);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(0.9)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;

  const headline = useMemo(() => {
    if (pendingSync) {
      return t(language, "celebrationQueued");
    }
    if (isFirstSession) {
      return t(language, "celebrationFirstSessionTitle");
    }
    return unlockedStarLabel ? t(language, "unlockedStar") : t(language, "celebrationTitle");
  }, [isFirstSession, language, pendingSync, unlockedStarLabel]);

  const subtitle = useMemo(() => {
    if (pendingSync) {
      return t(language, "celebrationPendingSync");
    }
    if (isFirstSession) {
      return t(language, "celebrationFirstSessionSubtitle");
    }
    return t(language, "celebrationSubtitle");
  }, [isFirstSession, language, pendingSync]);

  const primaryLabel = isFirstSession && !pendingSync ? t(language, "continueJourney") : t(language, "ok");
  const heroIcon = isFirstSession ? "star-four-points" : unlockedStarLabel ? "star-shooting" : "check-circle-outline";

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      cardScale.setValue(0.94);
      cardOpacity.setValue(0);
      rewardScale.setValue(0.9);
      iconPulse.setValue(0);
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

    rewardScale.setValue(0.9);
    Animated.spring(rewardScale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      delay: 120,
      useNativeDriver: true,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [visible, backdropOpacity, cardOpacity, cardScale, iconPulse, rewardScale]);

  const iconGlowOpacity = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const showExtraBadges =
    newBadgeLabels && newBadgeLabels.length > 0 && !pendingSync && !isFirstSession && !firstBadge;

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View
        style={[
          styles.backdropHost,
          {
            paddingHorizontal: contentPadding,
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
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
            styles.cardWrap,
            {
              width: cardWidth,
              maxWidth: CARD_MAX_WIDTH,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <BlurView intensity={42} tint="dark" style={styles.blur}>
            <View style={styles.glassTint} />

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <Animated.View style={[styles.iconWrap, { opacity: iconGlowOpacity }]}>
                <View style={styles.iconInner}>
                  <AppIcon name={heroIcon} size={28} color={colors.warmOffWhite} />
                </View>
              </Animated.View>

              <AppText variant="modalTitle" style={styles.title}>
                {headline}
              </AppText>
              <AppText variant="modalMessage" style={styles.subtitle}>
                {subtitle}
              </AppText>

              {isFirstSession && firstBadge && !pendingSync ? (
                <View style={styles.section}>
                  <AppText variant="focusSectionLabel" style={styles.sectionLabel}>
                    {t(language, "celebrationNewBadge")}
                  </AppText>
                  <CelebrationBadgeCard badge={firstBadge} />
                </View>
              ) : null}

              {!pendingSync && unlockedStarLabel ? (
                <SurfaceCard contentPadding={spacing.sm} style={styles.starChip}>
                  <View style={styles.starChipRow}>
                    <AppIcon name="star-circle" size={16} color={colors.warning} />
                    <AppText variant="body" color={colors.warning}>
                      {`${unlockedStarLabel} ${t(language, "celebrationStarYours")}`}
                    </AppText>
                  </View>
                </SurfaceCard>
              ) : null}

              <SurfaceCard borderVariant="strong" contentPadding={spacing.md} style={styles.rewardCard}>
                {pendingSync ? (
                  <View style={styles.rewardCenter}>
                    <AppText variant="numeric" color={theme.colors.muted} style={styles.rewardMuted}>
                      —
                    </AppText>
                    <AppText variant="caption" style={styles.rewardLabel}>
                      {t(language, "celebrationStardustPending")}
                    </AppText>
                  </View>
                ) : (
                  <Animated.View style={[styles.rewardCenter, { transform: [{ scale: rewardScale }] }]}>
                    <StardustAmount
                      amount={`+${formatNumber(language, stardustEarned)}`}
                      iconSize={20}
                      variant="numeric"
                      style={styles.rewardAmount}
                    />
                    <AppText variant="caption" style={styles.rewardLabel}>
                      {t(language, "celebrationStardustEarned")}
                    </AppText>
                  </Animated.View>
                )}
              </SurfaceCard>

              {isFirstSession && !pendingSync ? (
                <AppText variant="caption" style={styles.hint}>
                  {t(language, "celebrationFirstSessionHint")}
                </AppText>
              ) : null}

              {showExtraBadges ? (
                <SurfaceCard contentPadding={spacing.md} style={styles.section}>
                  <AppText variant="focusSectionLabel" style={styles.sectionLabel}>
                    {t(language, "celebrationNewBadge")}
                  </AppText>
                  <AppText variant="body">{newBadgeLabels.join(" · ")}</AppText>
                </SurfaceCard>
              ) : null}

              <View style={[styles.statsRow, isFirstSession ? styles.statsRowCompact : null]}>
                <StatBox value={formatDuration(language, durationMinutes)} label={t(language, "celebrationSessionDuration")} />
                {!isFirstSession ? (
                  <>
                    <StatBox value={String(currentStreak)} label={t(language, "celebrationStreak")} />
                    <StatBox
                      value={formatDuration(language, todayTotalMinutes)}
                      label={t(language, "celebrationTodayTotal")}
                    />
                  </>
                ) : null}
              </View>

              <GradientButton label={primaryLabel} onPress={onClose} fullWidth style={styles.okBtn} />
            </ScrollView>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropHost: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 18, 0.62)",
  },
  cardWrap: {
    borderColor: colors.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxHeight: "92%",
    overflow: "hidden",
    zIndex: 2,
  },
  blur: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  iconInner: {
    alignItems: "center",
    backgroundColor: "rgba(232,228,192,0.12)",
    borderColor: theme.colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  section: {
    marginTop: spacing.md,
    width: "100%",
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  badgeCard: {
    alignItems: "center",
    borderColor: theme.colors.accent,
  },
  badgeSymbol: {
    marginBottom: spacing.sm,
  },
  badgeTitle: {
    fontSize: 15,
    textAlign: "center",
  },
  badgeDescription: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  starChip: {
    marginTop: spacing.md,
  },
  starChipRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  rewardCard: {
    marginTop: spacing.md,
  },
  rewardCenter: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },
  rewardAmount: {
    gap: spacing.xs,
  },
  rewardMuted: {
    fontSize: 36,
  },
  rewardLabel: {
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  hint: {
    color: theme.colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  statsRowCompact: {
    marginTop: spacing.md,
  },
  okBtn: {
    marginTop: spacing.xxs,
  },
});
