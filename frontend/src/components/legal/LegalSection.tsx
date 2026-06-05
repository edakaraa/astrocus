import React, { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { useSettingsSpacing } from "../settings/settingsSpacing";
import theme from "../../theme";

type LegalSectionProps = {
  title?: string;
  titleColor?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** One titled or body-only block inside a legal document card. */
export const LegalSection: React.FC<LegalSectionProps> = ({
  title,
  titleColor = theme.colors.accent,
  children,
  style,
}) => {
  const spacing = useSettingsSpacing();
  const hasTitle = Boolean(title);

  return (
    <View
      style={[
        {
          gap: hasTitle ? spacing.contentGap : 0,
          paddingVertical: spacing.blockInsetY,
          width: "100%",
        },
        style,
      ]}
    >
      {title ? (
        <AppText variant="card" color={titleColor}>
          {title}
        </AppText>
      ) : null}
      {typeof children === "string" ? (
        <AppText variant="body" color={theme.colors.textSecondary}>
          {children}
        </AppText>
      ) : (
        children
      )}
    </View>
  );
};
