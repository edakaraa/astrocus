import React, { type PropsWithChildren, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SubScreenScaffold, SubScreenScrollLayout } from "./SubScreenScaffold";
import { SubScreenTopBar, SubScreenTitleRow } from "./TabScreenTopBar";
import theme from "../../theme";

type LegalDocumentLayoutProps = PropsWithChildren<{
  title: string;
  onBack: () => void;
  backAccessibilityLabel: string;
  titleColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  /** Geri + ortalanmış başlık kartın hemen üstünde; üst barda değil. */
  titleAboveCard?: boolean;
}>;

/**
 * Legal / policy scroll screens: cosmic backdrop, back nav, unified card rhythm.
 */
export const LegalDocumentLayout: React.FC<LegalDocumentLayoutProps> = ({
  children,
  title,
  onBack,
  backAccessibilityLabel,
  titleColor,
  contentContainerStyle,
  footer,
  titleAboveCard = false,
}) => {
  return (
    <SubScreenScaffold>
      <SubScreenScrollLayout contentContainerStyle={contentContainerStyle} columnStyle={styles.column}>
        {titleAboveCard ? (
          <View style={styles.titleAboveCard}>
            <SubScreenTitleRow
              title={title}
              onBack={onBack}
              backAccessibilityLabel={backAccessibilityLabel}
              titleColor={titleColor}
              flush
            />
            {children}
          </View>
        ) : (
          <>
            <SubScreenTopBar
              embedded
              title={title}
              onBack={onBack}
              backAccessibilityLabel={backAccessibilityLabel}
              titleColor={titleColor}
            />
            {children}
          </>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SubScreenScrollLayout>
    </SubScreenScaffold>
  );
};

const styles = StyleSheet.create({
  column: {
    gap: theme.spacing.lg,
  },
  titleAboveCard: {
    gap: theme.spacing.sm,
    width: "100%",
  },
  footer: {
    gap: theme.spacing.md,
  },
});
