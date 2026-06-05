import React, { type PropsWithChildren, type ReactNode } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { CosmicScreenBackground } from "../CosmicScreenBackground";
import { ScreenContentColumn } from "../ScreenContentColumn";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";

type TabScreenScaffoldProps = PropsWithChildren<{
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

/** Shared shell for tab screens: cosmic backdrop, responsive top inset, scroll + content column. */
export const TabScreenScaffold: React.FC<TabScreenScaffoldProps> = ({
  children,
  scrollStyle,
  scrollContentStyle,
  columnStyle,
  paddingBottom,
  footer,
  overlay,
}) => {
  const { tabBarClearance, screenTopPadding } = useResponsive();

  return (
    <CosmicScreenBackground>
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: screenTopPadding,
            paddingBottom: paddingBottom ?? tabBarClearance,
          },
          scrollContentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
    marginTop: theme.spacing.xs,
  },
});
