import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { getPrivacyPolicyBlocks } from "../features/legal/privacyPolicyContent";
import { colors, spacing, typography } from "../shared/theme";
import { GradientButton } from "../components/GradientButton";
import { StarfieldBackground } from "../components/StarfieldBackground";

export const PrivacyPolicyScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();
  const blocks = getPrivacyPolicyBlocks(language);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={28} />
      <Text style={styles.title}>{language === "en" ? "Privacy Policy" : "Gizlilik Politikası"}</Text>
      {blocks.map((block) => (
        <View key={block.title} style={styles.block}>
          <Text style={styles.heading}>{block.title}</Text>
          <Text style={styles.body}>{block.body}</Text>
        </View>
      ))}
      <GradientButton
        label={language === "en" ? "Back" : "Geri"}
        onPress={() => router.back()}
        accessibilityLabel={language === "en" ? "Go back" : "Geri dön"}
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
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
});
