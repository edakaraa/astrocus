import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { MAX_FONT_SCALE } from "../../shared/responsive";
import type { AppIconName } from "../../shared/appIcons";
import { colors, fontFamilies, layout, numericTypography, radii, spacing } from "../../shared/theme";
import { AppIcon } from "./AppIcon";

export type PillChipVariant = "duration" | "activity";

type PillChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  variant: PillChipVariant;
  accessibilityLabel: string;
  leadingIcon?: AppIconName;
  /** Duration chips in a row — equal flex. */
  flex?: boolean;
  /** Duration chips in a grid (custom duration sheet). */
  gridCell?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PillChip: React.FC<PillChipProps> = ({
  label,
  active,
  onPress,
  variant,
  accessibilityLabel,
  flex = false,
  gridCell = false,
  style,
  leadingIcon,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    style={[
      styles.base,
      variant === "duration" ? styles.duration : styles.activity,
      flex ? styles.durationFlex : null,
      gridCell ? styles.durationGridCell : null,
      active ? (variant === "duration" ? styles.durationActive : styles.activityActive) : null,
      style,
    ]}
  >
    <View style={leadingIcon ? styles.labelRow : null}>
      {leadingIcon ? (
        <AppIcon
          name={leadingIcon}
          size={16}
          color={active ? colors.text : colors.textMuted}
        />
      ) : null}
      <Text
        style={[
          variant === "duration" ? styles.durationText : styles.activityText,
          gridCell ? styles.durationGridText : null,
          flex ? styles.durationTextFlex : null,
          active
            ? variant === "duration"
              ? styles.durationTextActive
              : styles.activityTextActive
            : null,
        ]}
        numberOfLines={flex ? 1 : undefined}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

const CHIP_IDLE_BG = "rgba(255,255,255,0.04)";
const DURATION_ACTIVE_BORDER = "rgba(232,230,200,0.28)";
const ACTIVITY_ACTIVE_BG = "rgba(131,135,195,0.22)";

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    backgroundColor: CHIP_IDLE_BG,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
  },
  duration: {
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  durationFlex: {
    flex: 1,
  },
  durationGridCell: {
    minWidth: "30%",
    paddingHorizontal: spacing.md,
  },
  durationActive: {
    backgroundColor: colors.primary,
    borderColor: DURATION_ACTIVE_BORDER,
  },
  activity: {
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activityActive: {
    backgroundColor: ACTIVITY_ACTIVE_BG,
    borderColor: DURATION_ACTIVE_BORDER,
  },
  durationText: {
    ...numericTypography,
    color: colors.textMuted,
    fontSize: 13,
  },
  durationTextFlex: {
    flexShrink: 1,
  },
  durationGridText: {
    ...numericTypography,
    fontSize: 14,
  },
  durationTextActive: {
    color: colors.warmOffWhite,
  },
  activityText: {
    color: colors.text,
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: "700",
  },
  activityTextActive: {
    color: colors.text,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
});
