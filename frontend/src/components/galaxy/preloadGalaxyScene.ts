import { Dimensions } from "react-native";

import { buildGalaxyScene, buildMetrics } from "./buildGalaxyScene";
import { getGalaxyScene } from "./galaxySceneCache";

/** Builds the galaxy particle cache off the UI thread timing (idle tab). */
export const preloadGalaxyScene = (
  centerYRatio = 0.5,
  screenW = Dimensions.get("window").width,
  screenH = Dimensions.get("window").height,
) => {
  const metrics = buildMetrics(screenW, screenH);
  const centerX = screenW / 2;
  const centerY = screenH * centerYRatio;

  getGalaxyScene(metrics, centerX, centerY, metrics.base, () =>
    buildGalaxyScene(metrics, centerX, centerY),
  );
};
