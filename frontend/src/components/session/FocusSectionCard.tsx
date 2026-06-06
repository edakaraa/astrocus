import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SurfaceCard } from "../SurfaceCard";
import { AppText } from "../ui/AppText";
import { AppIcon } from "../ui/AppIcon";
import { MAX_FONT_SCALE } from "../../shared/responsive";
import type { AppIconName } from "../../shared/appIcons";
import { screenBlock, spacing } from "../../shared/theme";
import theme from "../../theme";

type FocusSectionCardProps = PropsWithChildren<{
  title: string;
  titleIcon?: AppIconName;
  sectionLabelSize: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Session idle setup section: SurfaceCard + uppercase section label. */
export const FocusSectionCard: React.FC<FocusSectionCardProps> = ({
  children,
  title,
  titleIcon,
  sectionLabelSize,
  style,
}) => (
  <SurfaceCard contentPadding={spacing.md} style={[screenBlock, styles.sectionCard, style]}>
    <View style={styles.titleRow}>
      {titleIcon ? (
        <AppIcon name={titleIcon} size={sectionLabelSize + 4} color={theme.colors.accent} />
      ) : null}
      <AppText
        variant="focusSectionLabel"
        style={{ fontSize: sectionLabelSize }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {title}
      </AppText>
    </View>
    {children}
  </SurfaceCard>
);

const styles = StyleSheet.create({
  sectionCard: {
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
});
