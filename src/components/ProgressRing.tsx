import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../shared/theme";

type ProgressRingProps = {
  size: number;
  strokeWidth: number;
  progress: number; // 0..1
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
};

export const ProgressRing = ({
  size,
  strokeWidth,
  progress,
  trackColor = "rgba(179, 191, 255, 0.10)",
  progressColor = colors.periwinkle,
  children,
}: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(progress, 1));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const dashOffset = useMemo(() => circumference * (1 - clamped), [circumference, clamped]);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {children}
    </View>
  );
};

