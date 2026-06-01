import React, { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useResponsive } from "../shared/responsive";

type ScreenContentColumnProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Shared horizontal bounds for tab screens: top bars, cards, and footers
 * share the same left/right edges on every device size.
 */
export const ScreenContentColumn = ({ children, style }: ScreenContentColumnProps) => {
  const { edgePadding, maxContentWidth } = useResponsive();

  return (
    <View
      style={[
        {
          alignSelf: "center",
          maxWidth: maxContentWidth,
          paddingHorizontal: edgePadding,
          width: "100%",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
