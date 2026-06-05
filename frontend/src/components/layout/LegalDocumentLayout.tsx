import React, { type PropsWithChildren, type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicScreenBackground } from "../CosmicScreenBackground";
import { ScreenContentColumn } from "../ScreenContentColumn";
import { SubScreenTopBar } from "./TabScreenTopBar";
import theme from "../../theme";

type LegalDocumentLayoutProps = PropsWithChildren<{
  title: string;
  onBack: () => void;
  backAccessibilityLabel: string;
  titleColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
}>;

/**
 * Legal / policy scroll screens: cosmic backdrop, back nav, unified typography.
 */
export const LegalDocumentLayout: React.FC<LegalDocumentLayoutProps> = ({
  children,
  title,
  onBack,
  backAccessibilityLabel,
  titleColor,
  contentContainerStyle,
  footer,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <CosmicScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SubScreenTopBar
          title={title}
          onBack={onBack}
          backAccessibilityLabel={backAccessibilityLabel}
          titleColor={titleColor}
        />
        <ScreenContentColumn style={styles.column}>
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScreenContentColumn>
      </ScrollView>
    </CosmicScreenBackground>
  );
};

export const legalDocumentStyles = StyleSheet.create({
  block: {
    marginBottom: theme.spacing.md,
  },
  blockSpacious: {
    marginBottom: theme.spacing.lg,
  },
  heading: {
    ...theme.typography.legalHeading,
    marginBottom: theme.spacing.xs,
  },
  headingSpacious: {
    ...theme.typography.legalHeading,
    marginBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.legalBody,
  },
  intro: {
    ...theme.typography.legalBody,
    marginBottom: theme.spacing.lg,
  },
  spacer: {
    height: theme.spacing.md,
    width: "100%",
  },
});

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  column: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  footer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
