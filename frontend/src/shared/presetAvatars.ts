import { buildDiceBearAvatarUriForAvatarId } from "./dicebearAvatars";

/**
 * Hazır profil avatarları — DiceBear Lorelei (PNG, HTTP API).
 * DB'de yalnızca id saklanır; görsel api.dicebear.com üzerinden gelir.
 */
export const PRESET_AVATAR_IDS = [
  "moon",
  "planet",
  "comet",
  "shooting-star",
  "sparkle",
  "orbit",
  "nova",
  "eclipse",
  "pulsar",
  "meteor",
  "asteroid",
  "aurora",
  "nebula",
  "cosmos",
  "quasar",
  "zenith",
  "horizon",
  "flare",
  "prism",
  "saturn",
] as const;

export type PresetAvatarId = (typeof PRESET_AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: PresetAvatarId = "moon";

type PresetAvatarDefinition = {
  id: PresetAvatarId;
  labelKey: `avatar_${string}`;
  legacyEmoji: string | null;
};

const labelKeyForId = (id: PresetAvatarId): PresetAvatarDefinition["labelKey"] =>
  `avatar_${id.replace(/-/g, "_")}` as PresetAvatarDefinition["labelKey"];

const LEGACY_EMOJI_BY_ID: Partial<Record<PresetAvatarId, string>> = {
  moon: "🌙",
  planet: "🪐",
  comet: "☄️",
  "shooting-star": "🌠",
  sparkle: "✨",
};

export const PRESET_AVATARS: readonly PresetAvatarDefinition[] = PRESET_AVATAR_IDS.map((id) => ({
  id,
  labelKey: labelKeyForId(id),
  legacyEmoji: LEGACY_EMOJI_BY_ID[id] ?? null,
}));

const byId = new Map(PRESET_AVATARS.map((item) => [item.id, item]));
const byLegacyEmoji = new Map(
  PRESET_AVATARS.filter((item) => item.legacyEmoji).map((item) => [item.legacyEmoji as string, item]),
);

export const resolveAvatarId = (stored: string | null | undefined): PresetAvatarId => {
  const value = stored?.trim();
  if (!value) {
    return DEFAULT_AVATAR_ID;
  }
  if (byId.has(value as PresetAvatarId)) {
    return value as PresetAvatarId;
  }
  return byLegacyEmoji.get(value)?.id ?? DEFAULT_AVATAR_ID;
};

export const getPresetAvatarUri = (stored: string | null | undefined, sizePx: number): string => {
  const id = resolveAvatarId(stored);
  return buildDiceBearAvatarUriForAvatarId(id, sizePx);
};

export const isPresetAvatarId = (value: string): value is PresetAvatarId =>
  PRESET_AVATAR_IDS.includes(value as PresetAvatarId);
