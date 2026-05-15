import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { CelestialVisual } from "../components/CelestialVisual";

export const GalaxyScreen = () => {
  const { stars, unlockedStarIds, user } = useAppContext();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedStarId, setSelectedStarId] = useState(unlockedStarIds[unlockedStarIds.length - 1] ?? stars[0]?.id);
  const totalStardust = user?.totalStardust ?? 0;
  const nextLockedStar = stars.find((star) => star.requiredStardust > totalStardust) ?? null;
  const remaining = nextLockedStar ? Math.max(nextLockedStar.requiredStardust - totalStardust, 0) : 0;
  const progress = nextLockedStar
    ? Math.min(totalStardust / Math.max(nextLockedStar.requiredStardust, 1), 1)
    : 1;

  const filteredStars = useMemo(() => {
    if (filter === "unlocked") {
      return stars.filter((star) => unlockedStarIds.includes(star.id));
    }

    if (filter === "locked") {
      return stars.filter((star) => !unlockedStarIds.includes(star.id));
    }

    return stars;
  }, [filter, stars, unlockedStarIds]);

  const selectedStar = stars.find((star) => star.id === selectedStarId) ?? stars[0];
  const selectedStarUnlocked = Boolean(selectedStar && unlockedStarIds.includes(selectedStar.id));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={38} />

      <View style={styles.top}>
        <View>
          <Text style={styles.eyebrow}>Gökyüzü</Text>
          <Text style={styles.title}>Açılan Yıldızlar</Text>
        </View>
        <View style={styles.balancePill}>
          <MaterialCommunityIcons name="star-four-points" size={13} color={colors.warmOffWhite} />
          <Text style={styles.balanceText}>{totalStardust.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {[
          { id: "all", label: "Tümü" },
          { id: "unlocked", label: "Açılanlar" },
          { id: "locked", label: "Kilitliler" },
        ].map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.label} yıldızları göster`}
            key={item.id}
            onPress={() => setFilter(item.id as typeof filter)}
            style={[styles.filterChip, filter === item.id ? styles.filterChipActive : null]}
          >
            <Text style={[styles.filterText, filter === item.id ? styles.filterTextActive : null]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SurfaceCard style={styles.infoBar} borderVariant="strong">
        <View style={styles.infoTop}>
          <View>
            <Text style={styles.infoLabel}>Takımyıldızları</Text>
            <Text style={styles.infoText}>
              {nextLockedStar
                ? `${remaining.toLocaleString()} ✦ sonra ${nextLockedStar.name}`
                : "Tüm yıldızlar gökyüzünde açık"}
            </Text>
          </View>
          <Text style={styles.progressCount}>{`${unlockedStarIds.length} / ${stars.length}`}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </SurfaceCard>

      <View style={styles.grid}>
        {filteredStars.map((star, index) => {
          const isUnlocked = unlockedStarIds.includes(star.id);
          const remainingStardust = Math.max(star.requiredStardust - totalStardust, 0);
          const variant = index % 3 === 0 ? "galaxy" : index % 3 === 1 ? "star" : "planet";

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${star.name} yıldızını görüntüle`}
              key={star.id}
              onPress={() => setSelectedStarId(star.id)}
              style={[styles.starCard, selectedStarId === star.id ? styles.starCardSelected : null]}
            >
              <CelestialVisual variant={variant} size={78} muted={!isUnlocked} />
              <Text style={styles.starName}>{star.name}</Text>
              <Text style={styles.starMeta}>{isUnlocked ? "Açık" : `${remainingStardust.toLocaleString()} ✦`}</Text>
              {!isUnlocked ? (
                <View style={styles.lockBadge}>
                  <MaterialCommunityIcons name="lock-outline" size={13} color={colors.textFaint} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {selectedStar ? (
        <SurfaceCard style={styles.detailCard} borderVariant="strong">
          <CelestialVisual variant={selectedStarUnlocked ? "galaxy" : "star"} size={154} muted={!selectedStarUnlocked} />
          <Text style={styles.detailTitle}>{selectedStar.name}</Text>
          <Text style={styles.detailState}>{selectedStarUnlocked ? "Açık" : "Kilitli"}</Text>
          <Text style={styles.detailDescription}>{selectedStar.description}</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardPill}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.primary} />
              <Text style={styles.rewardText}>{selectedStarUnlocked ? "Kazanıldı" : `${selectedStar.requiredStardust.toLocaleString()} ✦ gerekli`}</Text>
            </View>
            <View style={styles.rewardPill}>
              <MaterialCommunityIcons name="timer-outline" size={14} color={colors.primary} />
              <Text style={styles.rewardText}>{selectedStarUnlocked ? "Rozet aktif" : "Odaklanarak açılır"}</Text>
            </View>
          </View>
        </SurfaceCard>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 104,
    paddingTop: 44,
  },
  top: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginTop: 4,
  },
  balancePill: {
    alignItems: "center",
    backgroundColor: "rgba(131,135,195,0.16)",
    borderRadius: radii.pill,
    borderColor: "rgba(232,230,200,0.14)",
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  balanceText: {
    color: colors.text,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 12,
    fontWeight: "800",
  },
  filterRow: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  filterChip: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: "800",
  },
  filterTextActive: {
    color: colors.warmOffWhite,
  },
  infoBar: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  progressCount: {
    color: colors.text,
    fontFamily: fontFamilies.mono,
    fontSize: 16,
    fontWeight: "800",
  },
  progressBg: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  starCard: {
    alignItems: "center",
    backgroundColor: "rgba(13, 11, 43, 0.88)",
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: 158,
    padding: 12,
    position: "relative",
    width: "48.5%",
  },
  starCardSelected: {
    backgroundColor: "rgba(131,135,195,0.15)",
    borderColor: "rgba(232,230,200,0.22)",
  },
  starName: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center",
  },
  starMeta: {
    color: colors.textFaint,
    fontWeight: "800",
    fontSize: 10,
    marginTop: 4,
  },
  lockBadge: {
    alignItems: "center",
    backgroundColor: "rgba(5,7,23,0.72)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 9,
    top: 9,
    width: 26,
  },
  detailCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  detailTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: "center",
  },
  detailState: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "800",
  },
  detailDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  rewardRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 4,
    width: "100%",
  },
  rewardPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  rewardText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "800",
  },
});
