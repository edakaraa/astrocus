import React from "react";
import { ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { colors, screenBlock } from "../../shared/theme";
import { t } from "../../shared/i18n";
import type { ConstellationProgress, StarWithProgress } from "../../shared/types";
import { SurfaceCard } from "../SurfaceCard";
import { AppText } from "../ui/AppText";
import { AppIcon } from "../ui/AppIcon";
import { StarCard } from "./StarCard";
import { galaxyCardStyles as styles } from "./shared";
import { getConstellationIcon } from "./constellationIcons";
import { constellationLabel, type ConstellationProgressEnriched } from "../../services/constellationCatalog";

export type ConstellationCardProps = {
  progress: ConstellationProgressEnriched;
  totalStardust: number;
  onStarPress: (star: StarWithProgress, constellation: ConstellationProgress) => void;
};

export const ConstellationCard = React.memo(({ progress, totalStardust, onStarPress }: ConstellationCardProps) => {
  const { language } = useAppContext();
  const { constellation, stars, isActive, isCompleted, isNext, isLocked, unlockedCount, unlockOrder, isStarter } =
    progress;
  const progressFraction = stars.length > 0 ? unlockedCount / stars.length : 0;
  const astronomicalName = constellation.nameAstronomical;
  const nextStarIndex = stars.findIndex((s) => !s.isUnlocked);

  return (
    <SurfaceCard
      style={[
        screenBlock,
        styles.constellationCard,
        isActive && styles.constellationCardActive,
        isNext && styles.constellationCardNext,
        isCompleted && styles.constellationCardCompleted,
        isLocked && styles.constellationCardLocked,
      ]}
      borderVariant={isActive || isNext ? "strong" : "subtle"}
    >
      <View style={styles.constHeader}>
        <View style={styles.constSymbolWrap}>
          <AppIcon name={getConstellationIcon(constellation.id)} size={22} color={colors.primary} />
        </View>
        <View style={styles.constHeaderText}>
          <AppText variant="galaxyConstName">{astronomicalName}</AppText>
          <AppText variant="galaxyConstSubname">
            {constellation.genitiveEn} · {stars.length} {t(language, "starsCount")}
          </AppText>
        </View>
        <View style={styles.constBadge}>
          {isCompleted ? (
            <MaterialCommunityIcons name="check-decagram" size={22} color={colors.success} />
          ) : isActive ? (
            <View style={styles.activePill}>
              <AppText variant="galaxyActivePillText">{t(language, "active")}</AppText>
            </View>
          ) : isNext ? (
            <View style={styles.nextPill}>
              <AppText variant="galaxyNextPillText">{t(language, "nextLabel")}</AppText>
            </View>
          ) : isLocked ? (
            <View style={styles.lockedPill}>
              <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textFaint} />
              <AppText variant="galaxyLockedPillText">
                {isStarter ? t(language, "starterTier") : `#${unlockOrder}`}
              </AppText>
            </View>
          ) : (
            <AppText variant="galaxyConstCount">{`${unlockedCount}/${stars.length}`}</AppText>
          )}
        </View>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.round(progressFraction * 100)}%` }]} />
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.starsRow}
        keyboardShouldPersistTaps="handled"
      >
        {stars.map((star, idx) => (
          <StarCard
            key={star.id}
            star={star}
            unlockOrder={unlockOrder}
            isNextToUnlock={idx === nextStarIndex}
            totalStardust={totalStardust}
            isActiveConstellation={isActive}
            onPress={(s) => onStarPress(s, progress)}
          />
        ))}
      </ScrollView>

      {isCompleted ? (
        <View style={styles.completedBanner}>
          <MaterialCommunityIcons name="trophy-variant" size={13} color={colors.warning} />
          <AppText variant="galaxyCompletedBannerText">
            {t(language, "badgeTrophy")} — {astronomicalName}
          </AppText>
        </View>
      ) : isLocked ? (
        <AppText variant="galaxyLockedHint">{t(language, "unlockRequirement")}</AppText>
      ) : isActive || isNext ? (
        <AppText variant="galaxyConstDesc">{constellationLabel(constellation, language)}</AppText>
      ) : null}
    </SurfaceCard>
  );
});

ConstellationCard.displayName = "ConstellationCard";
