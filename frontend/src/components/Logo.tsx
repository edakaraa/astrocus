import React, { useMemo } from "react";
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { brandAssets, brandSizes, type LogoSize } from "../shared/brandAssets";

type LogoProps = {
  size?: LogoSize;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export const Logo = ({
  size = "md",
  style,
  imageStyle,
  accessibilityLabel = "Astrocus",
}: LogoProps) => {
  const edge = useMemo(() => brandSizes[size], [size]);

  return (
    <View style={[styles.wrap, style]} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Image
        source={brandAssets.logo}
        style={[styles.image, { width: edge, height: edge }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  image: {
    width: brandSizes.md,
    height: brandSizes.md,
  },
});
