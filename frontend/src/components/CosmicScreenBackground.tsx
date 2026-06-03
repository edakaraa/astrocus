import React, { type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { GalaxyBackground, GALAXY_BACKDROP_COLOR } from "./GalaxyBackground";

/**
 * Session tab backdrop: deep space fill + field stars (no spiral galaxy).
 * Scene data is preloaded from the tab shell — no per-screen build on mount.
 */
export const CosmicScreenBackground: React.FC<PropsWithChildren> = ({ children }) => (
  <View style={styles.root}>
    <GalaxyBackground centerYRatio={0.5} showGalaxy={false} animate={false} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    backgroundColor: GALAXY_BACKDROP_COLOR,
    flex: 1,
  },
});
