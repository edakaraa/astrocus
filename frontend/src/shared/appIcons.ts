import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/** MaterialCommunityIcons — uygulama genelinde standart ikon seti. */
export type AppIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export const STARDUST_ICON: AppIconName = "star-four-points";

export const CATEGORY_ICON: Record<string, AppIconName> = {
  work: "briefcase-outline",
  reading: "book-open-variant",
  project: "hammer-wrench",
  creativity: "palette-outline",
  sports: "run",
  meditation: "yoga",
  coding: "code-tags",
  general: "star-four-points-outline",
};

export const FOCUS_PRESET_ICON: Record<string, AppIconName> = {
  presetBreath: "weather-windy",
  presetPomodoro: "timer-outline",
  presetFlow: "lightning-bolt-outline",
  presetDeep: "moon-waning-crescent",
};

export const getCategoryIcon = (categoryId: string): AppIconName =>
  CATEGORY_ICON[categoryId] ?? "star-four-points-outline";

export const getFocusPresetIcon = (titleKey: string): AppIconName =>
  FOCUS_PRESET_ICON[titleKey] ?? "star-outline";
