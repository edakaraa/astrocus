import { Dimensions, InteractionManager } from "react-native";

import { buildBackgroundStars, buildGalaxyScene, buildMetrics } from "./buildGalaxyScene";
import { getBackdropStars, getGalaxyScene, peekBackdropStars } from "./galaxySceneCache";

let fullScenePreloadScheduled = false;

/** Fast path: ~420 field stars only (tab / settings backdrop). */
export const preloadCosmicBackdrop = (
  _centerYRatio = 0.5,
  screenW = Dimensions.get("window").width,
  screenH = Dimensions.get("window").height,
) => {
  const metrics = buildMetrics(screenW, screenH);
  if (peekBackdropStars(metrics)) {
    return metrics;
  }
  getBackdropStars(metrics, () => buildBackgroundStars(metrics));
  return metrics;
};

/** Full spiral galaxy — defer to after interactions when possible. */
export const preloadGalaxyScene = (
  centerYRatio = 0.5,
  screenW = Dimensions.get("window").width,
  screenH = Dimensions.get("window").height,
) => {
  const metrics = preloadCosmicBackdrop(centerYRatio, screenW, screenH);
  const centerX = metrics.screenW / 2;
  const centerY = metrics.screenH * centerYRatio;

  getGalaxyScene(metrics, centerX, centerY, metrics.base, () =>
    buildGalaxyScene(metrics, centerX, centerY),
  );
};

/** Backdrop immediately; full galaxy after transitions (session tab warm-up). */
export const scheduleGalaxyScenePreload = (centerYRatio = 0.5) => {
  preloadCosmicBackdrop(centerYRatio);
  if (fullScenePreloadScheduled) {
    return;
  }
  fullScenePreloadScheduled = true;
  InteractionManager.runAfterInteractions(() => {
    preloadGalaxyScene(centerYRatio);
  });
};
