import React from "react";
import { StyleSheet, View } from "react-native";
import { SkyStarVisual } from "./SkyStarVisual";
import { getStarMagnitudeTier } from "./starVisuals";

type StarVisualProps = {
  starSortOrder: number;
  size?: number;
  isUnlocked?: boolean;
};

export const StarVisual: React.FC<StarVisualProps> = ({
  starSortOrder,
  size = 72,
  isUnlocked = true,
}) => {
  const tier = getStarMagnitudeTier(starSortOrder);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <SkyStarVisual tier={tier} size={size} muted={!isUnlocked} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
});
