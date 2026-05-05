import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { colors, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";

export const GalaxyScreen = () => {
  const { stars, unlockedStarIds, user } = useAppContext();
  const totalStardust = user?.totalStardust ?? 0;
  const nextLockedStar = stars.find((star) => star.requiredStardust > totalStardust) ?? null;
  const remaining = nextLockedStar ? Math.max(nextLockedStar.requiredStardust - totalStardust, 0) : 0;
  const progress = nextLockedStar
    ? Math.min(totalStardust / Math.max(nextLockedStar.requiredStardust, 1), 1)
    : 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={26} />

      <View style={styles.top}>
        <Text style={styles.title}>✦ Galaksin</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{`${totalStardust.toLocaleString()} ✦`}</Text>
        </View>
      </View>

      <SurfaceCard style={styles.infoBar}>
        <Text style={styles.infoText}>
          {nextLockedStar
            ? `${unlockedStarIds.length} yıldız açık · Sonraki: ${remaining.toLocaleString()} ✦ daha gerekiyor`
            : `${unlockedStarIds.length} yıldızın tamamı açık`}
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </SurfaceCard>

      {stars.map((star) => {
        const isUnlocked = unlockedStarIds.includes(star.id);
        const remainingStardust = Math.max(star.requiredStardust - totalStardust, 0);

        return (
          <SurfaceCard key={star.id} style={[styles.starCard, isUnlocked ? styles.starCardUnlocked : null]}>
            <View style={styles.starRow}>
              <Text style={styles.starEmoji}>{isUnlocked ? "⭐" : "🔒"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.starName}>{star.name}</Text>
                <Text style={styles.starDescription}>{star.description}</Text>
              </View>
              <Text style={styles.starMeta}>
                {isUnlocked ? "Açık" : `${remainingStardust.toLocaleString()} ✦`}
              </Text>
            </View>
          </SurfaceCard>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: 54,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  balancePill: {
    backgroundColor: "rgba(179, 191, 255, 0.10)",
    borderColor: "rgba(179, 191, 255, 0.20)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  balanceText: {
    color: colors.periwinkle,
    fontSize: 12,
    fontWeight: "800",
  },
  infoBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressBg: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(179, 191, 255, 0.10)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.mediumSlateBlue,
  },
  starCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  starCardUnlocked: {
    borderColor: "rgba(255, 209, 102, 0.30)",
  },
  starRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  starEmoji: { fontSize: 18 },
  starName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  starDescription: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  starMeta: {
    color: colors.periwinkle,
    fontWeight: "800",
    fontSize: 11,
  },
});
