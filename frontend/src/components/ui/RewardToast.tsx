import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import theme from "../../theme";
import { AppText } from "./AppText";

type RewardToastProps = {
  message: string;
  icon?: string;
  visible: boolean;
};

export const RewardToast: React.FC<RewardToastProps> = ({
  message,
  icon = "✦",
  visible,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }, theme.layout.rewardToastDurationMs);

    return () => clearTimeout(hideTimer);
  }, [visible, opacity, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toast}>
        <AppText variant="card">{`${icon} ${message}`}</AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    bottom: theme.layout.rewardToastBottom,
    position: "absolute",
    zIndex: 20,
  },
  toast: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
});
