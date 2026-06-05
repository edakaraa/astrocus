import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useModalLayout } from "../shared/responsive";
import { colors, radii, spacing } from "../shared/theme";
import { GradientButton } from "./GradientButton";
import { AppText } from "./ui/AppText";

export type AstroAlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onClose: () => void;
};

export const AstroAlertModal = ({
  visible,
  title,
  message,
  confirmLabel = "OK",
  icon,
  onClose,
}: AstroAlertModalProps) => {
  const modal = useModalLayout();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss alert"
        onPress={onClose}
        style={[styles.backdrop, { justifyContent: modal.backdropJustify, paddingHorizontal: modal.horizontalPad }]}
      >
        <Pressable
          accessibilityRole="alert"
          onPress={() => {}}
          style={[
            styles.cardWrap,
            modal.isSheet ? styles.cardSheet : null,
            { maxWidth: modal.cardMaxWidth, width: modal.isSheet ? "100%" : modal.cardWidth },
          ]}
        >
          <BlurView intensity={42} tint="dark" style={[styles.blur, modal.isSheet ? styles.blurSheet : null]}>
            <View style={styles.glassTint} />
            {modal.isSheet ? <View style={styles.sheetHandle} accessibilityElementsHidden /> : null}
            <View style={styles.content}>
              {icon ? (
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons color={colors.warmOffWhite} name={icon} size={28} />
                </View>
              ) : null}
              <AppText variant="modalTitle" style={icon ? styles.titleCentered : undefined}>
                {title}
              </AppText>
              <AppText variant="modalMessage" style={[styles.message, icon ? styles.messageCentered : null]}>
                {message}
              </AppText>
              <GradientButton label={confirmLabel} onPress={onClose} style={styles.button} fullWidth={modal.isSheet} />
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5, 8, 18, 0.62)",
    flex: 1,
  },
  cardWrap: {
    borderColor: colors.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  blur: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  blurSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.borderStrong,
    borderRadius: radii.pill,
    height: 4,
    marginTop: spacing.sm,
    width: 40,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(232,228,192,0.12)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 56,
  },
  titleCentered: {
    textAlign: "center",
  },
  message: {
    marginTop: spacing.sm,
  },
  messageCentered: {
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
  },
});
