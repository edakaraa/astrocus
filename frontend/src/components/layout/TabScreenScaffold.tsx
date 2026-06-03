import React, { type PropsWithChildren, type ReactNode } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { CosmicScreenBackground } from "../CosmicScreenBackground";
import { ScreenContentColumn } from "../ScreenContentColumn";
import { TabScreenTopBar } from "./TabScreenTopBar";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";

type TabScreenScaffoldProps = PropsWithChildren<{
  stardustAmount: number;
  scrollStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  columnStyle?: StyleProp<ViewStyle>;
  /** Defaults to tab bar clearance from responsive layout. */
  paddingBottom?: number;
  /** Fixed footer below scroll (e.g. primary CTA on session idle). */
  footer?: ReactNode;
  /** Modals, bottom sheets, etc. — rendered outside the scroll view. */
  overlay?: ReactNode;
}>;

/**
 * Shared shell for tab screens: session starfield backdrop, stardust top bar, scroll + content column.
 */
export const TabScreenScaffold: React.FC<TabScreenScaffoldProps> = ({
  children,
  stardustAmount,
  scrollStyle,
  scrollContentStyle,
  columnStyle,
  paddingBottom,
  footer,
  overlay,
}) => {
  const { tabBarClearance } = useResponsive();

  return (
    <CosmicScreenBackground>
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: paddingBottom ?? tabBarClearance,
          },
          scrollContentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TabScreenTopBar stardustAmount={stardustAmount} />
        <ScreenContentColumn style={[styles.contentColumn, columnStyle]}>{children}</ScreenContentColumn>
      </ScrollView>
      {footer}
      {overlay}
    </CosmicScreenBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  contentColumn: {
    marginTop: theme.layout.topBarBottomGap,
  },
});
