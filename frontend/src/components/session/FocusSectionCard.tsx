import React, { type PropsWithChildren } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { SurfaceCard } from "../SurfaceCard";
import { AppText } from "../ui/AppText";
import { MAX_FONT_SCALE } from "../../shared/responsive";
import { screenBlock, spacing } from "../../shared/theme";

type FocusSectionCardProps = PropsWithChildren<{
  title: string;
  sectionLabelSize: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Session idle setup section: SurfaceCard + uppercase section label. */
export const FocusSectionCard: React.FC<FocusSectionCardProps> = ({
  children,
  title,
  sectionLabelSize,
  style,
}) => (
  <SurfaceCard contentPadding={spacing.md} style={[screenBlock, styles.sectionCard, style]}>
    <AppText
      variant="focusSectionLabel"
      style={{ fontSize: sectionLabelSize }}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
    >
      {title}
    </AppText>
    {children}
  </SurfaceCard>
);

const styles = StyleSheet.create({
  sectionCard: {
    gap: spacing.sm,
  },
});
