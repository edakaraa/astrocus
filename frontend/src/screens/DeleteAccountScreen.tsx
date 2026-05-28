import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { colors, spacing, typography } from "../shared/theme";
import { t } from "../shared/i18n";
import { GradientButton } from "../components/GradientButton";
import { StarfieldBackground } from "../components/StarfieldBackground";

export const DeleteAccountScreen = () => {
  const router = useRouter();
  const { deleteAccount, language } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(t(language, "deleteAccountConfirm"), t(language, "deleteAccountMessage"), [
      { text: t(language, "cancel"), style: "cancel" },
      {
        text: t(language, "deleteAction"),
        style: "destructive",
        onPress: () => {
          void (async () => {
            setIsDeleting(true);
            try {
              await deleteAccount();
              router.replace("/(auth)");
            } catch (error) {
              Alert.alert(
                t(language, "appName"),
                error instanceof Error ? error.message : t(language, "deleteFailed"),
              );
            } finally {
              setIsDeleting(false);
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={24} />
      <Text style={styles.title}>{t(language, "deleteAccountTitle")}</Text>
      <Text style={styles.body}>{t(language, "deleteAccountBody")}</Text>
      <GradientButton
        label={t(language, "permanentlyDelete")}
        onPress={handleDelete}
        disabled={isDeleting}
        accessibilityLabel={t(language, "deleteAccount")}
      />
      <View style={styles.spacer} />
      <GradientButton
        label={t(language, "cancelAction")}
        onPress={() => router.back()}
        variant="soft"
        accessibilityLabel={t(language, "cancel")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    ...typography.title,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing.md,
  },
});
