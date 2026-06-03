import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
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
}) => {
  const tokenStyle = theme.typography[variant] as TextStyle;

  return (
    <Text style={[tokenStyle, color ? { color } : null, style]} {...rest}>
      {children}
    </Text>
  );
};
