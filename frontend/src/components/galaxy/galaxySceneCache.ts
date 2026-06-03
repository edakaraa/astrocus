import type { GalaxyMetrics } from "./galaxyTypes";

export type ScreenDot = {
  cx: number;
  cy: number;
  r: number;
  color: string;
};

export type BackgroundStar = {
  cx: number;
  cy: number;
  r: number;
  color: string;
  isCross: boolean;
};

export type CoreLayer = {
  r: number;
  color: string;
  opacity: number;
  blur: number;
};

export type GalaxyScene = {
  arms: ScreenDot[];
  filaments: ScreenDot[];
  stars: BackgroundStar[];
  coreLayers: CoreLayer[];
};

const sceneKeyFor = (metrics: GalaxyMetrics) => `${metrics.screenW}x${metrics.screenH}`;

let cachedSceneKey = "";
let cachedScene: GalaxyScene | null = null;

let cachedBackdropKey = "";
let cachedBackdropStars: BackgroundStar[] | null = null;

export const getBackdropStars = (
  metrics: GalaxyMetrics,
  build: () => BackgroundStar[],
): BackgroundStar[] => {
  const key = sceneKeyFor(metrics);
  if (cachedBackdropKey === key && cachedBackdropStars) {
    return cachedBackdropStars;
  }
  const stars = build();
  cachedBackdropStars = stars;
  cachedBackdropKey = key;
  return stars;
};

export const peekBackdropStars = (metrics: GalaxyMetrics): BackgroundStar[] | null => {
  const key = sceneKeyFor(metrics);
  if (cachedBackdropKey === key && cachedBackdropStars) {
    return cachedBackdropStars;
  }
  return null;
};

export const getGalaxyScene = (
  metrics: GalaxyMetrics,
  centerX: number,
  centerY: number,
  base: number,
  build: () => GalaxyScene,
): GalaxyScene => {
  const key = sceneKeyFor(metrics);
  if (cachedSceneKey === key && cachedScene) {
    return cachedScene;
  }
  const scene = build();
  cachedScene = scene;
  cachedSceneKey = key;
  cachedBackdropStars = scene.stars;
  cachedBackdropKey = key;
  return cachedScene;
};

export const peekGalaxyScene = (): GalaxyScene | null => cachedScene;
