import React from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { formatNumber } from "../../shared/formatLocale";
import { colors } from "../../shared/theme";
import { t } from "../../shared/i18n";
import type { StarWithProgress } from "../../shared/types";
import { CelestialVisual } from "../CelestialVisual";
import { AppText } from "../ui/AppText";
import { CELESTIAL_VARIANTS, galaxyCardStyles as styles } from "./shared";
import { starDisplayName, starUnlockCost } from "../../services/constellationCatalog";

export type StarCardProps = {
  star: StarWithProgress;
  isNextToUnlock: boolean;
  totalStardust: number;
  isActiveConstellation: boolean;
  onPress: (star: StarWithProgress) => void;
  cardIndex: number;
};

export const StarCard = React.memo(
  ({
    star,
    isNextToUnlock,
    totalStardust,
    isActiveConstellation,
    onPress,
    cardIndex,
  }: StarCardProps) => {
    const { language } = useAppContext();
    const variant = CELESTIAL_VARIANTS[cardIndex % 3];
    const unlockCost = starUnlockCost(star);
    const canAfford = totalStardust >= unlockCost;
    const tappable = isActiveConstellation && isNextToUnlock && canAfford;
    const remaining = Math.max(unlockCost - totalStardust, 0);
    const starName = starDisplayName(star, language);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${starName} — ${star.isUnlocked ? t(language, "starA11yUnlocked") : `${unlockCost} ✦ ${t(language, "starA11yRequired")}`}`}
        onPress={() => onPress(star)}
        style={({ pressed }) => [
          styles.starCard,
          star.isUnlocked && styles.starCardUnlocked,
          tappable && styles.starCardAffordable,
          pressed && styles.starCardPressed,
        ]}
      >
        {star.isUnlocked ? <View style={styles.starGlow} /> : null}

        <CelestialVisual variant={variant} size={72} muted={!star.isUnlocked} />

        <AppText
          variant="galaxyStarName"
          color={star.isUnlocked ? colors.text : undefined}
        >
          {starName}
        </AppText>

        {star.isUnlocked ? (
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name="check-circle" size={11} color={colors.success} />
            <AppText variant="galaxyStatusText" color={colors.success}>
              {t(language, "starOpen")}
            </AppText>
          </View>
        ) : isNextToUnlock && isActiveConstellation ? (
          <View style={[styles.statusPill, canAfford ? styles.pillAffordable : styles.pillLocked]}>
            <MaterialCommunityIcons
              name={canAfford ? "star-four-points" : "lock-outline"}
              size={11}
              color={canAfford ? colors.warning : colors.textFaint}
            />
            <AppText variant="galaxyStatusText" color={canAfford ? colors.warning : colors.textFaint}>
              {canAfford
                ? `${unlockCost} ✦`
                : `${formatNumber(language, remaining)} ✦ ${t(language, "starShortfallSuffix")}`}
            </AppText>
          </View>
        ) : (
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name="lock-outline" size={11} color={colors.textFaint} />
            <AppText variant="galaxyStatusText" color={colors.textFaint}>
              {t(language, "starLockedLabel")}
            </AppText>
          </View>
        )}
      </Pressable>
    );
  },
);

StarCard.displayName = "StarCard";
