import React, { useState } from "react";
import { useRouter } from "expo-router";
import { toastTone, useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { GradientButton } from "../components/GradientButton";
import { LegalDocumentLayout } from "../components/layout/LegalDocumentLayout";
import { AppText } from "../components/ui/AppText";
import theme from "../theme";

export const DeleteAccountScreen = () => {
  const router = useRouter();
  const { deleteAccount, language, showAlert, showConfirm } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    void showConfirm({
      title: t(language, "deleteAccountConfirm"),
      message: t(language, "deleteAccountMessage"),
      cancelLabel: t(language, "cancel"),
      confirmLabel: t(language, "deleteAction"),
      destructive: true,
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      void (async () => {
        setIsDeleting(true);
        try {
          await deleteAccount();
          router.replace("/(auth)");
        } catch (error) {
          void showAlert({
            title: t(language, "toastErrorGeneric"),
            message: error instanceof Error ? error.message : t(language, "deleteFailed"),
            confirmLabel: t(language, "ok"),
            icon: toastTone.error.icon,
          });
        } finally {
          setIsDeleting(false);
        }
      })();
    });
  };

  return (
    <LegalDocumentLayout
      title={t(language, "deleteAccountTitle")}
      titleColor={theme.colors.badgeScorpio}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
      titleAboveCard
      footer={
        <>
          <GradientButton
            label={t(language, "permanentlyDelete")}
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityLabel={t(language, "deleteAccount")}
            fullWidth
            hideHighlight
          />
          <GradientButton
            label={t(language, "cancelAction")}
            onPress={() => router.back()}
            variant="soft"
            accessibilityLabel={t(language, "cancel")}
            fullWidth
            hideHighlight
          />
        </>
      }
    >
      <AppText variant="body" color={theme.colors.textSecondary}>
        {t(language, "deleteAccountBody")}
      </AppText>
    </LegalDocumentLayout>
  );
};
