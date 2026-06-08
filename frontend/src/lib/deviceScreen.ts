import { isRunningInExpoGo } from "expo";

type ScreenDetectorModule = {
  isScreenLocked: () => Promise<boolean>;
  isScreenOff: () => Promise<boolean>;
};

let detectorCache: ScreenDetectorModule | null | undefined;

const isScreenDetectorModule = (value: unknown): value is ScreenDetectorModule => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const mod = value as ScreenDetectorModule;
  return typeof mod.isScreenLocked === "function" && typeof mod.isScreenOff === "function";
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
    if (__DEV__) {
      console.warn("[deviceScreen] expo-screen-detector import succeeded but API is missing");
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[deviceScreen] expo-screen-detector dynamic import failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  try {
    // Some production bundles resolve the native module via require but not import().
    const mod = require("expo-screen-detector") as unknown;
    const detector = tryLoad(mod);
    if (detector) {
      detectorCache = detector;
      return detector;
    }
    if (__DEV__) {
      console.warn("[deviceScreen] expo-screen-detector require succeeded but API is missing");
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[deviceScreen] expo-screen-detector require failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  detectorCache = null;
  return null;
};

/**
 * True when the device keyguard is engaged (power-button lock).
 * Returns false in Expo Go or when the native module is unavailable.
 */
export const isDeviceScreenLocked = async (): Promise<boolean> => {
  const detector = await loadScreenDetector();
  if (!detector) {
    return false;
  }

  return detector.isScreenLocked();
};

/**
 * Distinguish power-button lock from switching to another app (screen stays on).
 * Strict: keyguard + display off. Lenient (later retries): keyguard only.
 */
export const isFocusSessionScreenLock = async (lenient = false): Promise<boolean> => {
  const detector = await loadScreenDetector();
  if (!detector) {
    return false;
  }

  const [locked, off] = await Promise.all([
    detector.isScreenLocked(),
    detector.isScreenOff(),
  ]);

  if (locked && off) {
    return true;
  }

  return lenient && locked;
};
