import React from "react";
import { View } from "react-native";
import type { ConstellationProgress, StarWithProgress } from "../../shared/types";
import type { ConstellationProgressEnriched } from "../../services/constellationCatalog";
import { AppText } from "../ui/AppText";
import { ConstellationCard } from "./ConstellationCard";
import { galaxyCardStyles as styles } from "./shared";

type SkySectionProps = {
  title: string;
  items: ConstellationProgressEnriched[];
  totalStardust: number;
  onStarPress: (star: StarWithProgress, constellation: ConstellationProgress) => void;
};

export const SkySection: React.FC<SkySectionProps> = ({ title, items, totalStardust, onStarPress }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="galaxySectionTitle">{title}</AppText>
      {items.map((progress) => (
        <ConstellationCard
          key={progress.constellation.id}
          progress={progress}
          totalStardust={totalStardust}
          onStarPress={onStarPress}
        />
      ))}
    </View>
  );
};
