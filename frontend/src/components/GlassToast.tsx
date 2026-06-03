import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppText } from "./ui/AppText";
import theme from "../theme";

export type GlassToastPlacement = "top" | "bottom";

type GlassToastProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  iconBackground?: string;
  placement?: GlassToastPlacement;
  onHide?: () => void;
  durationMs?: number;
};

export const GlassToast = ({
  visible,
  title,
  subtitle,
  icon = "star-four-points",
  iconColor = theme.colors.accent,
  iconBackground = "rgba(131,135,195,0.18)",
  placement = "top",
  onHide,
  durationMs = theme.layout.rewardToastDurationMs,
}: GlassToastProps) => {
  const insets = useSafeAreaInsets();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(placement === "top" ? -24 : 24)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenOffset = placement === "top" ? -24 : 24;

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (visible) {
      Animated.parallel([
        Animated.spring(opacityAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.spring(translateYAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
      ]).start();

      hideTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(translateYAnim, { toValue: hiddenOffset, duration: 400, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, durationMs);
    } else {
      opacityAnim.setValue(0);
      translateYAnim.setValue(hiddenOffset);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [visible, durationMs, hiddenOffset, onHide, opacityAnim, translateYAnim]);

  if (!visible) {
    return null;
  }

  const edgeStyle =
    placement === "top"
      ? { top: Math.max(insets.top, theme.spacing.sm) + theme.layout.topBarMinHeight }
      : { bottom: Math.max(insets.bottom, theme.spacing.md) + theme.layout.rewardToastBottom };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        edgeStyle,
        { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] },
      ]}
      pointerEvents="none"
    >
      <BlurView intensity={36} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
          </View>
          <View style={styles.textWrap}>
            <AppText variant="card" numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 9999,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(232,230,200,0.16)",
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  blur: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
  },
  inner: {
    alignItems: "center",
    backgroundColor: "rgba(10, 17, 35, 0.55)",
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
