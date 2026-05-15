import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { colors, spacing, typography } from "../shared/theme";
import { GradientButton } from "../components/GradientButton";
import { StarfieldBackground } from "../components/StarfieldBackground";

export const DeleteAccountScreen = () => {
  const router = useRouter();
  const { deleteAccount, language } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      language === "en" ? "Delete account?" : "Hesabı sil?",
      language === "en"
        ? "This permanently removes your profile, sessions, and stardust data."
        : "Profil, seans ve yıldız tozu verileriniz kalıcı olarak silinir.",
      [
        { text: language === "en" ? "Cancel" : "İptal", style: "cancel" },
        {
          text: language === "en" ? "Delete" : "Sil",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await deleteAccount();
                router.replace("/(auth)");
              } catch (error) {
                Alert.alert(
                  "Astrocus",
                  error instanceof Error ? error.message : "Delete failed",
                );
              } finally {
                setIsDeleting(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={24} />
      <Text style={styles.title}>{language === "en" ? "Delete Account" : "Hesabı Sil"}</Text>
      <Text style={styles.body}>
        {language === "en"
          ? "Required for App Store and Play Store. Deletion is immediate and cannot be undone."
          : "App Store ve Play Store gereksinimi. Silme işlemi geri alınamaz."}
      </Text>
      <GradientButton
        label={language === "en" ? "Permanently delete my account" : "Hesabımı kalıcı olarak sil"}
        onPress={handleDelete}
        disabled={isDeleting}
        accessibilityLabel={language === "en" ? "Delete account" : "Hesabı sil"}
      />
      <View style={styles.spacer} />
      <GradientButton
        label={language === "en" ? "Cancel" : "Vazgeç"}
        onPress={() => router.back()}
        variant="soft"
        accessibilityLabel={language === "en" ? "Cancel" : "Vazgeç"}
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
