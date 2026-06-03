import React from "react";
import { Text, type TextProps } from "react-native";
import theme, { type ThemeTypographyVariant } from "../../theme";

type AppTextProps = TextProps & {
  variant?: ThemeTypographyVariant;
  color?: string;
};

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color,
  style,
  children,
  ...rest
}) => (
  <Text style={[theme.typography[variant], color ? { color } : null, style]} {...rest}>
    {children}
  </Text>
);
