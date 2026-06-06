import React, { useMemo } from "react";
import { Image, PixelRatio, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { getPresetAvatarUri, resolveAvatarId } from "../shared/presetAvatars";

type UserAvatarProps = {
  /** Profilde saklanan değer (preset id veya eski emoji). */
  avatar: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** When true, touches pass through to a parent pressable (e.g. avatar picker). */
  decorative?: boolean;
};

export const UserAvatar = ({
  avatar,
  size = 48,
  style,
  accessibilityLabel,
  decorative = false,
}: UserAvatarProps) => {
  const resolvedId = resolveAvatarId(avatar);
  const label = accessibilityLabel ?? `Avatar ${resolvedId}`;
  const rasterSize = useMemo(
    () => Math.ceil(size * Math.max(2, PixelRatio.get())),
    [size],
  );
  const uri = useMemo(() => getPresetAvatarUri(avatar, rasterSize), [avatar, rasterSize]);

  return (
    <View
      style={[
        styles.shell,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      pointerEvents={decorative ? "none" : "auto"}
      accessibilityRole={decorative ? undefined : "image"}
      accessibilityLabel={decorative ? undefined : label}
      importantForAccessibility={decorative ? "no-hide-descendants" : "auto"}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    backgroundColor: "rgba(5,7,23,0.78)",
    borderWidth: 1,
    borderColor: "rgba(232,230,200,0.24)",
  },
});
