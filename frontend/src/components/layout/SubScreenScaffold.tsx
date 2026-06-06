import React, { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicScreenBackground } from "../CosmicScreenBackground";
import { ScreenContentColumn } from "../ScreenContentColumn";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";

/** Stack sub-screens (settings, legal): session starfield backdrop. */
export const SubScreenScaffold: React.FC<PropsWithChildren> = ({ children }) => (
  <CosmicScreenBackground>{children}</CosmicScreenBackground>
);

type SubScreenScrollLayoutProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  columnStyle?: StyleProp<ViewStyle>;
}>;

/**
 * Alt ekran scroll kabuğu — tab ekranlarıyla aynı üst boşluk (`screenTopPadding`).
 */
export const SubScreenScrollLayout: React.FC<SubScreenScrollLayoutProps> = ({
  children,
  contentContainerStyle,
  columnStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { screenTopPadding } = useResponsive();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: screenTopPadding,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenContentColumn style={[styles.contentColumn, columnStyle]}>{children}</ScreenContentColumn>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  contentColumn: {
    marginTop: theme.spacing.xs,
  },
});
