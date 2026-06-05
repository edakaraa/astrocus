import React, { type PropsWithChildren, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { useSettingsSpacing } from "./settingsSpacing";

type SettingsBlockProps = PropsWithChildren<{
  title?: string;
  caption?: ReactNode;
  /** Full-width custom header (e.g. language row). */
  header?: ReactNode;
  /** Tight vertical stack for nav rows — no title/content gap. */
  variant?: "default" | "links";
  style?: StyleProp<ViewStyle>;
}>;

/**
 * One visual group inside the settings card.
 * Vertical inset is split around dividers so adjacent blocks do not double-pad.
 */
export const SettingsBlock: React.FC<SettingsBlockProps> = ({
  children,
  title,
  caption,
  header,
  variant = "default",
  style,
}) => {
  const spacing = useSettingsSpacing();
  const isLinks = variant === "links";
  const hasHeader = Boolean(header || title || caption);
  const hasBody = Boolean(children);

  return (
    <View
      style={[
        styles.block,
        {
          paddingVertical: isLinks ? 0 : spacing.blockInsetY,
          gap: hasHeader && hasBody && !isLinks ? spacing.contentGap : 0,
        },
        isLinks ? styles.linksBlock : null,
        style,
      ]}
    >
      {header ? (
        header
      ) : hasHeader ? (
        <View style={[styles.labelStack, { gap: spacing.labelGap }]}>
          {title ? <AppText variant="card">{title}</AppText> : null}
          {caption ? <AppText variant="caption">{caption}</AppText> : null}
        </View>
      ) : null}
      {isLinks ? (
        <View style={{ paddingVertical: spacing.blockInsetY }}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    width: "100%",
  },
  linksBlock: {
    gap: 0,
  },
  labelStack: {},
});
