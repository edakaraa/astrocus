import React, { useMemo } from "react";
import { View } from "react-native";
import { colors } from "../shared/theme";

type StarfieldBackgroundProps = {
  density?: number;
  opacity?: number;
};

type Star = {
  top: number;
  left: number;
  size: number;
  alpha: number;
};

const createStars = (count: number): Star[] => {
  const stars: Star[] = [];

  for (let index = 0; index < count; index += 1) {
    stars.push({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1 + Math.random() * 1.6,
      alpha: 0.22 + Math.random() * 0.55,
    });
  }

  return stars;
};

export const StarfieldBackground = ({ density = 42, opacity = 1 }: StarfieldBackgroundProps) => {
  const stars = useMemo(() => createStars(density), [density]);

  return (
    <View
      pointerEvents="none"
      style={{
        ...StyleSheetFill,
        backgroundColor: colors.background,
        opacity,
      }}
    >
      {stars.map((star, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            borderRadius: 999,
            backgroundColor: "white",
            opacity: star.alpha,
          }}
        />
      ))}

      <View
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: "transparent",
          shadowColor: colors.primary,
          shadowOpacity: 0.25,
          shadowRadius: 48,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
};

const StyleSheetFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

