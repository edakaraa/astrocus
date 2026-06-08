import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

type AstrocusFocusTimerModule = {
  start(endTimeMs: number, title: string, subtitle: string): Promise<void>;
  stop(): Promise<void>;
};

let nativeModule: AstrocusFocusTimerModule | null | undefined;

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
  return true;
};

export const stopFocusTimerNotification = async (): Promise<void> => {
  const mod = getModule();
  if (!mod) {
    return;
  }
  await mod.stop();
};
