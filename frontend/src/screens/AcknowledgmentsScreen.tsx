import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { AvatarAttribution } from "../components/AvatarAttribution";
import { GradientButton } from "../components/GradientButton";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { colors, spacing, typography } from "../shared/theme";
import { t } from "../shared/i18n";

export const AcknowledgmentsScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={28} />
      <Text style={styles.title}>{t(language, "openSourceCredits")}</Text>
      <Text style={styles.intro}>{t(language, "openSourceCreditsIntro")}</Text>

      <View style={styles.block}>
        <Text style={styles.heading}>{t(language, "creditsAvatarsTitle")}</Text>
        <AvatarAttribution />
      </View>

      <GradientButton
        label={t(language, "back")}
        onPress={() => router.back()}
        accessibilityLabel={t(language, "goBack")}
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
    color: colors.text,
    marginBottom: spacing.sm,
  },
  intro: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
});
