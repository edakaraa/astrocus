import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { StarDustChip } from "../ui/StarDustChip";

type TabScreenTopBarProps = {
  stardustAmount: number;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  settingsAccessibilityLabel?: string;
};

export const getTabScreenTopBarOffset = (topInset: number) =>
  Math.max(theme.spacing.sm, topInset) +
  theme.layout.topBarMinHeight +
  theme.layout.topBarBottomGap;

const TopBarActionButton = ({
  onPress,
  accessibilityLabel,
  icon,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  icon: "cog-outline" | "arrow-left";
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    hitSlop={8}
    style={({ pressed }) => [styles.actionBtn, pressed ? styles.actionPressed : null]}
  >
    <MaterialCommunityIcons
      name={icon}
      size={theme.layout.settingsIconSize}
      color={theme.colors.textPrimary}
    />
  </Pressable>
);

export const TabScreenTopBar: React.FC<TabScreenTopBarProps> = ({
  stardustAmount,
  showSettings = false,
  onSettingsPress,
  settingsAccessibilityLabel,
}) => {
  const { topInset, edgePadding, maxContentWidth } = useResponsive();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(theme.spacing.sm, topInset),
          paddingHorizontal: edgePadding,
        },
      ]}
    >
      <View style={[styles.inner, { maxWidth: maxContentWidth }]}>
        <View style={styles.row}>
          <StarDustChip amount={stardustAmount} />
          {showSettings && onSettingsPress ? (
            <View style={styles.settingsSlot}>
              <TopBarActionButton
                icon="cog-outline"
                accessibilityLabel={settingsAccessibilityLabel ?? "Settings"}
                onPress={onSettingsPress}
              />
            </View>
          ) : (
            <View style={styles.actionPlaceholder} />
          )}
        </View>
      </View>
    </View>
  );
};

type SettingsScreenTopBarProps = {
  title: string;
  onBack: () => void;
  backAccessibilityLabel: string;
  stardustAmount: number;
  rightMeta?: string;
};

/** Ayarlar / rozetler — tab ekranlarıyla aynı yıldız tozu hizası + geri + başlık. */
export const SettingsScreenTopBar: React.FC<SettingsScreenTopBarProps> = ({
  title,
  onBack,
  backAccessibilityLabel,
  stardustAmount,
  rightMeta,
}) => {
  const { topInset, edgePadding, maxContentWidth } = useResponsive();

  return (
    <View
      style={[
        styles.wrap,
        styles.subscreenWrap,
        {
          paddingTop: Math.max(theme.spacing.sm, topInset),
          paddingHorizontal: edgePadding,
        },
      ]}
    >
      <View style={[styles.inner, { maxWidth: maxContentWidth }]}>
        <View style={styles.row}>
          <StarDustChip amount={stardustAmount} />
          <View style={styles.actionPlaceholder} />
        </View>
        <View style={styles.navRow}>
          <TopBarActionButton
            icon="arrow-left"
            accessibilityLabel={backAccessibilityLabel}
            onPress={onBack}
          />
          <AppText variant="title" style={styles.screenTitle}>
            {title}
          </AppText>
          {rightMeta ? (
            <AppText variant="caption" style={styles.rightMeta}>
              {rightMeta}
            </AppText>
          ) : (
            <View style={styles.actionPlaceholder} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  subscreenWrap: {
    paddingBottom: theme.spacing.sm,
  },
  inner: {
    alignSelf: "center",
    width: "100%",
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: theme.layout.topBarMinHeight,
    width: "100%",
  },
  settingsSlot: {
    marginTop: theme.layout.topBarSettingsOffsetTop,
  },
  actionBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    height: theme.layout.topBarActionSize,
    justifyContent: "center",
    width: theme.layout.topBarActionSize,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionPlaceholder: {
    height: theme.layout.topBarActionSize,
    width: theme.layout.topBarActionSize,
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    width: "100%",
  },
  screenTitle: {
    flex: 1,
    textAlign: "center",
  },
  rightMeta: {
    minWidth: theme.layout.topBarActionSize,
    textAlign: "right",
  },
});
