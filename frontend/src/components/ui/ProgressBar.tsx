import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../theme";

type ProgressBarProps = {
  progress: number;
  height?: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8 }) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const widthAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  const fillWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { height, borderRadius: theme.radii.sm }]}>
      <Animated.View style={[styles.fillWrap, { width: fillWidth, height }]}>
        <LinearGradient
          colors={[theme.colors.accent, theme.colors.surface]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { height, borderRadius: theme.radii.sm }]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: theme.colors.overlay,
    overflow: "hidden",
    width: "100%",
  },
  fillWrap: {
    overflow: "hidden",
  },
  fill: {
    width: "100%",
  },
});
