import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";
import { GradientButton } from "./GradientButton";

export type AstroAlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
};

export const AstroAlertModal = ({
  visible,
  title,
  message,
  confirmLabel = "OK",
  onClose,
}: AstroAlertModalProps) => {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss alert" onPress={onClose} style={styles.backdrop}>
        <Pressable accessibilityRole="alert" onPress={() => {}} style={styles.cardWrap}>
          <BlurView intensity={42} tint="dark" style={styles.blur}>
            <View style={styles.glassTint} />
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <GradientButton label={confirmLabel} onPress={onClose} style={styles.button} />
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 8, 18, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  blur: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.25,
    fontFamily: fontFamilies.displayBold,
  },
  message: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamilies.bodyRegular,
  },
  button: {
    marginTop: spacing.lg,
  },
});
