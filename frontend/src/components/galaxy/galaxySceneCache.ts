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

let cachedKey = "";
let cachedScene: GalaxyScene | null = null;

export const getGalaxyScene = (
  metrics: GalaxyMetrics,
  centerX: number,
  centerY: number,
  base: number,
  build: () => GalaxyScene,
): GalaxyScene => {
  const key = `${metrics.screenW}x${metrics.screenH}`;
  if (cachedKey === key && cachedScene) {
    return cachedScene;
  }
  cachedScene = build();
  cachedKey = key;
  return cachedScene;
};

export const peekGalaxyScene = (): GalaxyScene | null => cachedScene;
