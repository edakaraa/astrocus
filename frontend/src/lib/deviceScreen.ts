import { isRunningInExpoGo } from "expo";

type ScreenDetectorModule = {
  isScreenLocked: () => Promise<boolean>;
  isScreenOff: () => Promise<boolean>;
  isScreenUnavailable: () => Promise<boolean>;
};

let detectorCache: ScreenDetectorModule | null | undefined;

const isScreenDetectorModule = (value: unknown): value is ScreenDetectorModule => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const mod = value as ScreenDetectorModule;
  return (
    typeof mod.isScreenLocked === "function" &&
    typeof mod.isScreenOff === "function" &&
    typeof mod.isScreenUnavailable === "function"
  );
};

const resolveScreenDetector = (mod: unknown): ScreenDetectorModule | null => {
  if (isScreenDetectorModule(mod)) {
    return mod;
  }
  if (mod && typeof mod === "object" && "default" in mod) {
    const inner = (mod as { default: unknown }).default;
    if (isScreenDetectorModule(inner)) {
      return inner;
    }
  }
  return null;
};

const loadScreenDetector = async (): Promise<ScreenDetectorModule | null> => {
  if (detectorCache !== undefined) {
    return detectorCache;
  }

  if (isRunningInExpoGo()) {
    detectorCache = null;
    return null;
  }

  const tryLoad = (mod: unknown): ScreenDetectorModule | null => resolveScreenDetector(mod);

  try {
    const mod = await import("expo-screen-detector");
    const detector = tryLoad(mod);
    if (detector) {
      detectorCache = detector;
      return detector;
    }
  } catch {
    /* fall through */
  }

  try {
    const mod = require("expo-screen-detector") as unknown;
    const detector = tryLoad(mod);
    if (detector) {
      detectorCache = detector;
      return detector;
    }
  } catch {
    /* unavailable */
  }

  detectorCache = null;
  return null;
};

/**
 * Power-button lock or display off — session should continue (Forest / Pomodoro pattern).
 * Do not treat `isScreenUnavailable` alone as lock: on many devices it is true during
 * app-switch background transitions while the keyguard is still off.
 */
export const isFocusSessionScreenLock = async (): Promise<boolean> => {
  const detector = await loadScreenDetector();
  if (!detector) {
    return false;
  }

  const [locked, off] = await Promise.all([
    detector.isScreenLocked(),
    detector.isScreenOff(),
  ]);

  return locked || off;
};

/**
 * App switched away while the display is still on — 20s background tolerance applies.
 */
export const isFocusSessionAppSwitchAway = async (): Promise<boolean> => {
  return !(await isFocusSessionScreenLock());
};
