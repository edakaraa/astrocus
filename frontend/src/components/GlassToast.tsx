import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";

type GlassToastProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  onHide?: () => void;
  durationMs?: number;
};

export const GlassToast = ({
  visible,
  title,
  subtitle,
  icon = "star-four-points",
  iconColor = colors.warning,
  onHide,
  durationMs = 3000,
}: GlassToastProps) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-24)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          Animated.timing(translateYAnim, { toValue: -24, duration: 400, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, durationMs);
    } else {
      opacityAnim.setValue(0);
      translateYAnim.setValue(-24);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [visible, durationMs, onHide, opacityAnim, translateYAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }]}
      pointerEvents="none"
    >
      <BlurView intensity={36} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
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
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(232,230,200,0.16)",
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  blur: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,209,102,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    marginTop: 2,
  },
});
