import React from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { formatNumber } from "../../shared/formatLocale";
import { colors } from "../../shared/theme";
import { t } from "../../shared/i18n";
import type { StarWithProgress } from "../../shared/types";
import { AppText } from "../ui/AppText";
import { StardustMark } from "../ui/StardustMark";
import { galaxyCardStyles as styles } from "./shared";
import { StarVisual } from "./StarVisual";
import { starDisplayName, starUnlockCost } from "../../services/constellationCatalog";

export type StarCardProps = {
  star: StarWithProgress;
  unlockOrder: number;
  isNextToUnlock: boolean;
  totalStardust: number;
  isActiveConstellation: boolean;
  onPress: (star: StarWithProgress) => void;
};

export const StarCard = React.memo(
  ({
    star,
    unlockOrder,
    isNextToUnlock,
    totalStardust,
    isActiveConstellation,
    onPress,
  }: StarCardProps) => {
    const { language } = useAppContext();
    const unlockCost = starUnlockCost(unlockOrder);
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
        {star.isUnlocked || tappable ? (
          <View style={[styles.starGlow, tappable ? styles.starCardAffordableGlow : null]} />
        ) : null}

        <StarVisual
          starSortOrder={star.starSortOrder}
          isUnlocked={star.isUnlocked}
        />

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
            {!canAfford ? (
              <MaterialCommunityIcons name="lock-outline" size={11} color={colors.textFaint} />
            ) : null}
            <StardustMark size={11} color={canAfford ? colors.warmOffWhite : colors.textFaint} />
            <AppText variant="galaxyStatusText" color={canAfford ? colors.warmOffWhite : colors.textFaint}>
              {canAfford
                ? formatNumber(language, unlockCost)
                : `${formatNumber(language, remaining)} ${t(language, "starShortfallSuffix")}`}
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
