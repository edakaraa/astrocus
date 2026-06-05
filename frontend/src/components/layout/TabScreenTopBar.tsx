import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsive } from "../../shared/responsive";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { StarDustChip } from "../ui/StarDustChip";

type TabScreenTopBarProps = {
  stardustAmount: number;
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

type SubScreenTitleRowProps = {
  title: string;
  onBack: () => void;
  backAccessibilityLabel: string;
  titleColor?: string;
  rightMeta?: string;
  /** No top margin — sits flush under safe area or stardust row. */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Geri + ortalanmış başlık — kartın hemen üstünde kullanım için. */
export const SubScreenTitleRow: React.FC<SubScreenTitleRowProps> = ({
  title,
  onBack,
  backAccessibilityLabel,
  titleColor,
  rightMeta,
  flush = false,
  style,
}) => (
  <View style={[styles.navRow, flush ? styles.navRowFlush : null, style]}>
    <TopBarActionButton
      icon="arrow-left"
      accessibilityLabel={backAccessibilityLabel}
      onPress={onBack}
    />
    <AppText variant="title" color={titleColor} style={styles.screenTitle}>
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
);

export const TabScreenTopBar: React.FC<TabScreenTopBarProps> = ({ stardustAmount }) => {
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
          <View style={styles.actionPlaceholder} />
          <StarDustChip amount={stardustAmount} />
        </View>
      </View>
    </View>
  );
};

type SubScreenTopBarProps = {
  title: string;
  onBack: () => void;
  backAccessibilityLabel: string;
  /** When set, shows the stardust chip row above the nav bar (e.g. badges). */
  stardustAmount?: number;
  rightMeta?: string;
  titleColor?: string;
  /** Parent scroll already applied `screenTopPadding` — omit safe-area top inset. */
  embedded?: boolean;
};

/** Alt ekranlar: geri + başlık; isteğe bağlı yıldız tozu satırı. */
export const SubScreenTopBar: React.FC<SubScreenTopBarProps> = ({
  title,
  onBack,
  backAccessibilityLabel,
  stardustAmount,
  rightMeta,
  titleColor,
  embedded = false,
}) => {
  const { topInset, edgePadding, maxContentWidth } = useResponsive();
  const showStardust = stardustAmount !== undefined;

  const nav = (
    <>
      {showStardust ? (
        <View style={styles.row}>
          <View style={styles.actionPlaceholder} />
          <StarDustChip amount={stardustAmount} />
        </View>
      ) : null}
      <SubScreenTitleRow
        title={title}
        onBack={onBack}
        backAccessibilityLabel={backAccessibilityLabel}
        titleColor={titleColor}
        rightMeta={rightMeta}
        flush={!showStardust}
      />
    </>
  );

  if (embedded) {
    return <View style={[styles.inner, { maxWidth: maxContentWidth, width: "100%" }]}>{nav}</View>;
  }

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
      <View style={[styles.inner, { maxWidth: maxContentWidth }]}>{nav}</View>
    </View>
  );
};

/** @deprecated Use SubScreenTopBar */
export const SettingsScreenTopBar = SubScreenTopBar;

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
  navRowFlush: {
    marginTop: 0,
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
