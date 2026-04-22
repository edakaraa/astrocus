import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { colors, spacing } from "../shared/theme";

export const OnboardingScreen = () => {
  const { completeOnboarding, language, stars } = useAppContext();
  const [step, setStep] = useState(0);
  const [selectedStarId, setSelectedStarId] = useState(stars[0].id);

  const steps = useMemo(
    () => [
      { title: t(language, "onboardingWelcome"), body: "Astrocus odak seanslarını görünür ilerlemeye dönüştürür." },
      { title: t(language, "onboardingSelectStar"), body: "Bu yıldız seans ekranında sana eşlik edecek." },
      { title: t(language, "onboardingStart"), body: "İlk kategorini seç, süre ayarla ve galaksini büyüt." },
    ],
    [language],
  );

  const handleContinue = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    await completeOnboarding(selectedStarId);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>{`0${step + 1} / 03`}</Text>
      <Text style={styles.title}>{steps[step].title}</Text>
      <Text style={styles.body}>{steps[step].body}</Text>

      {step === 1 ? (
        <View style={styles.starGrid}>
          {stars.map((star) => (
            <Pressable
              accessibilityRole="button"
              key={star.id}
              onPress={() => setSelectedStarId(star.id)}
              style={[
                styles.starCard,
                selectedStarId === star.id ? styles.starCardActive : null,
              ]}
            >
              <Text style={styles.starName}>{star.name}</Text>
              <Text style={styles.starDescription}>{star.description}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>
          {step === steps.length - 1 ? t(language, "completeOnboarding") : t(language, "continue")}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: spacing.xl,
  },
  stepLabel: {
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  starGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  starCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  starCardActive: {
    borderColor: colors.primaryStrong,
  },
  starName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  starDescription: {
    color: colors.textMuted,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryStrong,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
