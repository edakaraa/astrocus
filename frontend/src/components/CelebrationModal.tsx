import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "./StarfieldBackground";
import { GradientButton } from "./GradientButton";

type CelebrationModalProps = {
  visible: boolean;
  stardustEarned: number;
  xpEarned?: number;
  pendingSync?: boolean;
  unlockedStarLabel?: string | null;
  galacticAdvice?: string | null;
  durationMinutes: number;
  currentStreak: number;
  todayTotalMinutes: number;
  onClose: () => void;
};

const formatToday = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}s` : `${hours}s ${remainder}dk`;
};

export const CelebrationModal = ({
  visible,
  stardustEarned,
  xpEarned = 0,
  pendingSync = false,
  unlockedStarLabel,
  galacticAdvice,
  durationMinutes,
  currentStreak,
  todayTotalMinutes,
  onClose,
}: CelebrationModalProps) => {
  const headline = useMemo(() => {
    if (pendingSync) {
      return "Kuyruğa alındı";
    }
    return unlockedStarLabel ? "✨ Yeni yıldız açıldı!" : "Seans tamamlandı";
  }, [pendingSync, unlockedStarLabel]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <StarfieldBackground density={36} opacity={1} />

        <View style={styles.card}>
          <View style={styles.burst} pointerEvents="none" />
          <Text style={styles.bigStar}>{unlockedStarLabel ? "🌟" : "⭐"}</Text>
          <Text style={styles.headline}>{headline}</Text>
          {pendingSync ? (
            <Text style={styles.sub}>
              Bağlantı gelince sunucuya iletilecek; ödüller yalnızca senkron sonrası hesaplanır.
            </Text>
          ) : null}
          {!pendingSync && unlockedStarLabel ? <Text style={styles.sub}>{unlockedStarLabel} artık senin</Text> : null}

          {pendingSync ? (
            <>
              <Text style={styles.earnedMuted}>—</Text>
              <Text style={styles.earnedLabel}>Yıldız tozu (beklemede)</Text>
            </>
          ) : (
            <>
              <Text style={styles.earned}>{`+${stardustEarned} ✦`}</Text>
              <Text style={styles.earnedLabel}>Yıldız Tozu Kazandın</Text>
              {xpEarned > 0 ? <Text style={styles.xpLine}>{`+${xpEarned} XP`}</Text> : null}
            </>
          )}

          {galacticAdvice && !pendingSync ? (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>Galaktik Tavsiye</Text>
              <Text style={styles.adviceText}>{galacticAdvice}</Text>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{`${durationMinutes} dk`}</Text>
              <Text style={styles.statLabel}>Seans Süresi</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{`🔥 ${currentStreak}`}</Text>
              <Text style={styles.statLabel}>Seri</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{pendingSync ? "—" : formatToday(todayTotalMinutes)}</Text>
              <Text style={styles.statLabel}>Bugün Toplam</Text>
            </View>
          </View>

          <GradientButton label="Devam et →" onPress={onClose} />

          <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: "rgba(7, 5, 26, 0.98)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.16)",
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
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
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
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
  xpLine: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.3,
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
    gap: 8,
    marginTop: 18,
    marginBottom: 18,
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
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.14)",
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.textMuted,
    fontWeight: "800",
  },
});
