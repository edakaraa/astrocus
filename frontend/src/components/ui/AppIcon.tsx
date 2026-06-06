import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AppIconName } from "../../shared/appIcons";
import theme from "../../theme";

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = theme.colors.textPrimary,
}) => <MaterialCommunityIcons name={name} size={size} color={color} />;
