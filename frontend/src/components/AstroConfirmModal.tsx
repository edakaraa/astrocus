import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useModalLayout } from "../shared/responsive";
import { colors, radii, spacing } from "../shared/theme";
import { GradientButton } from "./GradientButton";
import { AppText } from "./ui/AppText";

export type AstroConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  destructive?: boolean;
};

export const AstroConfirmModal = ({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  destructive = false,
}: AstroConfirmModalProps) => {
  const modal = useModalLayout();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
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
              <AppText variant="modalTitle">{title}</AppText>
              <AppText variant="modalMessage" style={styles.message}>{message}</AppText>
              <View style={styles.actions}>
                <GradientButton
                  label={cancelLabel}
                  onPress={onCancel}
                  variant="soft"
                  style={styles.actionButton}
                  fullWidth={modal.isSheet}
                />
                <GradientButton
                  label={confirmLabel}
                  onPress={onConfirm}
                  style={[styles.actionButton, destructive ? styles.destructiveButton : null]}
                  fullWidth={modal.isSheet}
                />
              </View>
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
  message: {
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    alignSelf: "stretch",
  },
  destructiveButton: {
    opacity: 0.92,
  },
});
