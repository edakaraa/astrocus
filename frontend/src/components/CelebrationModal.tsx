import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import { useModalLayout } from "../shared/responsive";
import { colors, layout, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "./StarfieldBackground";
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
  const modal = useModalLayout();

  const headline = useMemo(() => {
    if (pendingSync) {
      return t(language, "celebrationQueued");
    }
    return unlockedStarLabel ? `✨ ${t(language, "unlockedStar")}!` : t(language, "celebrationTitle");
  }, [language, pendingSync, unlockedStarLabel]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { justifyContent: modal.backdropJustify, padding: modal.isSheet ? 0 : spacing.xl }]}>
        <StarfieldBackground density={36} opacity={1} />

        <View
          style={[
            styles.card,
            modal.isSheet ? styles.cardSheet : null,
            { maxWidth: modal.cardMaxWidth, width: modal.isSheet ? "100%" : "100%" },
          ]}
        >
          {modal.isSheet ? <View style={styles.sheetHandle} accessibilityElementsHidden /> : null}
          <View style={styles.burst} pointerEvents="none" />
          <Text style={styles.bigStar}>{unlockedStarLabel ? "🌟" : "⭐"}</Text>
          <Text style={styles.headline}>{headline}</Text>
          {pendingSync ? <Text style={styles.sub}>{t(language, "celebrationPendingSync")}</Text> : null}
          {!pendingSync && unlockedStarLabel ? (
            <Text style={styles.sub}>{`${unlockedStarLabel} ${t(language, "celebrationStarYours")}`}</Text>
          ) : null}

          {pendingSync ? (
            <>
              <Text style={styles.earnedMuted}>—</Text>
              <Text style={styles.earnedLabel}>{t(language, "celebrationStardustPending")}</Text>
            </>
          ) : (
            <>
              <Text style={styles.earned}>{`+${formatNumber(language, stardustEarned)} ✦`}</Text>
              <Text style={styles.earnedLabel}>{t(language, "celebrationStardustEarned")}</Text>
            </>
          )}

          {newBadgeLabels && newBadgeLabels.length > 0 && !pendingSync ? (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>{t(language, "celebrationNewBadge")}</Text>
              <Text style={styles.adviceText}>{newBadgeLabels.join(" · ")}</Text>
            </View>
          ) : null}

          {galacticAdvice && !pendingSync ? (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>{t(language, "celebrationGalacticAdvice")}</Text>
              <Text style={styles.adviceText}>{galacticAdvice}</Text>
            </View>
          ) : null}

          <View style={[styles.statsRow, modal.isSheet ? styles.statsRowStack : null]}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{formatDuration(language, durationMinutes)}</Text>
              <Text style={styles.statLabel}>{t(language, "celebrationSessionDuration")}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{`🔥 ${currentStreak}`}</Text>
              <Text style={styles.statLabel}>{t(language, "celebrationStreak")}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>
                {pendingSync ? "—" : formatDuration(language, todayTotalMinutes)}
              </Text>
              <Text style={styles.statLabel}>{t(language, "celebrationTodayTotal")}</Text>
            </View>
          </View>

          <GradientButton
            label={t(language, "continueJourney")}
            onPress={onClose}
            fullWidth={modal.isSheet}
            style={styles.continueBtn}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "close")}
            hitSlop={layout.hitSlop}
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
    flex: 1,
  },
  card: {
    alignItems: "center",
    backgroundColor: "rgba(7, 5, 26, 0.98)",
    borderColor: "rgba(179, 191, 255, 0.16)",
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cardSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "92%",
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.borderStrong,
    borderRadius: radii.pill,
    height: 4,
    marginBottom: spacing.sm,
    width: 40,
  },
  burst: {
    position: "absolute",
    top: 30,
    left: "50%",
    transform: [{ translateX: -150 }],
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "rgba(255, 209, 102, 0.10)",
  },
  bigStar: {
    fontSize: 76,
    marginTop: 6,
  },
  headline: {
    ...typography.h2,
    color: colors.warning,
    textAlign: "center",
    marginTop: 10,
  },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
  },
  earned: {
    marginTop: 14,
    fontSize: 54,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -1,
  },
  earnedMuted: {
    marginTop: 14,
    fontSize: 44,
    fontWeight: "800",
    color: colors.textFaint,
    letterSpacing: -1,
  },
  earnedLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  adviceBox: {
    marginTop: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(131, 135, 195, 0.35)",
    backgroundColor: "rgba(131, 135, 195, 0.12)",
    maxWidth: "100%",
  },
  adviceLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  adviceText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    width: "100%",
  },
  statsRowStack: {
    flexWrap: "wrap",
    justifyContent: "center",
  },
  continueBtn: {
    width: "100%",
  },
  stat: {
    flex: 1,
    backgroundColor: "rgba(13, 11, 43, 0.90)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    marginTop: 3,
    fontSize: 9,
    color: colors.textFaint,
    textAlign: "center",
  },
  close: {
    alignItems: "center",
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderColor: "rgba(179, 191, 255, 0.14)",
    borderRadius: radii.pill,
    borderWidth: 1,
    height: layout.touchTargetMin,
    justifyContent: "center",
    minWidth: layout.touchTargetMin,
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
  },
  closeText: {
    color: colors.textMuted,
    fontWeight: "800",
  },
});
