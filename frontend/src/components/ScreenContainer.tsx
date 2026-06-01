import React, { PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../shared/theme";
import { useResponsive } from "../shared/responsive";

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom space above tab bar */
  withTabBarInset?: boolean;
  edges?: ("top" | "bottom")[];
}>;

export const ScreenContainer = ({
  children,
  scroll = false,
  style,
  contentStyle,
  withTabBarInset = true,
  edges = ["top"],
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  const { edgePadding, maxContentWidth, tabBarClearance } = useResponsive();

  const padTop = edges.includes("top") ? Math.max(spacing.sm, insets.top) : 0;
  const padBottom = withTabBarInset && edges.includes("bottom") ? tabBarClearance : spacing.lg;

  const inner = (
    <View
      style={[
        styles.inner,
        {
          maxWidth: maxContentWidth,
          paddingHorizontal: edgePadding,
          paddingTop: padTop,
          paddingBottom: padBottom,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, style]}
        contentContainerStyle={styles.scrollGrow}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    );
  }

  return <View style={[styles.root, style]}>{inner}</View>;
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollGrow: {
    flexGrow: 1,
  },
  inner: {
    alignItems: "stretch",
    alignSelf: "stretch",
    width: "100%",
  },
});
