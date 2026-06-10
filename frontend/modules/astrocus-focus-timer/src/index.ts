import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

type AstrocusFocusTimerModule = {
  start(endTimeMs: number, title: string, subtitle: string): Promise<void>;
  update(endTimeMs: number, title: string, subtitle: string): Promise<void>;
  stop(): Promise<void>;
};

let nativeModule: AstrocusFocusTimerModule | null | undefined;
let serviceActive = false;

const getModule = (): AstrocusFocusTimerModule | null => {
  if (Platform.OS !== "android") {
    return null;
  }
  if (nativeModule !== undefined) {
    return nativeModule;
  }
  try {
    nativeModule = requireNativeModule<AstrocusFocusTimerModule>("AstrocusFocusTimer");
  } catch {
    nativeModule = null;
  }
  return nativeModule;
};

export const isFocusTimerServiceAvailable = (): boolean => getModule() !== null;

export const startFocusTimerNotification = async (
  endTimeMs: number,
  title: string,
  subtitle: string,
): Promise<boolean> => {
  const mod = getModule();
  if (!mod) {
    return false;
  }
  await mod.start(endTimeMs, title, subtitle);
  serviceActive = true;
  return true;
};

export const updateFocusTimerNotification = async (
  endTimeMs: number,
  title: string,
  subtitle: string,
): Promise<boolean> => {
  const mod = getModule();
  if (!mod) {
    return false;
  }
  if (serviceActive) {
    await mod.update(endTimeMs, title, subtitle);
  } else {
    await mod.start(endTimeMs, title, subtitle);
    serviceActive = true;
  }
  return true;
};

export const stopFocusTimerNotification = async (): Promise<void> => {
  const mod = getModule();
  if (!mod) {
    serviceActive = false;
    return;
  }
  await mod.stop();
  serviceActive = false;
};

/** Test-only reset for notification orchestration unit tests. */
export const __resetFocusTimerServiceStateForTests = (): void => {
  serviceActive = false;
};
