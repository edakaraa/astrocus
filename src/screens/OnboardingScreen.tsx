import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { colors, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { GradientButton } from "../components/GradientButton";
import { SurfaceCard } from "../components/SurfaceCard";

export const OnboardingScreen = () => {
  const { completeOnboarding, language, stars, user } = useAppContext();
  const [step, setStep] = useState(0);
  const [selectedStarId, setSelectedStarId] = useState(stars[0].id);

  const steps = useMemo(
    () => [
      { title: t(language, "onboardingWelcome"), body: "Odak seanslarını görünür bir galaksiye dönüştür." },
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

  const selectedStar = useMemo(() => stars.find((item) => item.id === selectedStarId) ?? stars[0], [selectedStarId, stars]);
  const totalStardust = user?.totalStardust ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={32} />

      <View style={styles.top}>
        <Text style={styles.stepLabel}>{`0${step + 1} / 03`}</Text>
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.body}>{steps[step].body}</Text>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.starGrid}>
            {stars.map((star) => {
              const locked = star.requiredStardust > totalStardust;
              const active = selectedStarId === star.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${star.name} yıldızını seç`}
                  disabled={locked}
                  key={star.id}
                  onPress={() => setSelectedStarId(star.id)}
                  style={[
                    styles.starCard,
                    active ? styles.starCardActive : null,
                    locked ? styles.starCardLocked : null,
                  ]}
                >
                  {active ? <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View> : null}
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.starName}>{star.name}</Text>
                  <Text style={[styles.starReq, !locked ? styles.starReqFree : null]}>
                    {!locked ? "ÜCRETSİZ" : `${star.requiredStardust} ✦`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SurfaceCard style={styles.selectedCard} borderVariant="strong">
            <Text style={styles.selectedIcon}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selectedStar.name}</Text>
              <Text style={styles.selectedDesc}>{selectedStar.description}</Text>
            </View>
          </SurfaceCard>
        </>
      ) : null}

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View key={index} style={[styles.dot, index === step ? styles.dotActive : null]} />
          ))}
        </View>

        <GradientButton
          label={step === 1 ? "Bu yıldızı seçtim →" : step === steps.length - 1 ? t(language, "completeOnboarding") : t(language, "continue")}
          onPress={handleContinue}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingBottom: 28,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  stepLabel: {
    color: colors.periwinkle,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  starGrid: {
    paddingHorizontal: spacing.xl,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  starCard: {
    width: "31%",
    minHeight: 106,
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderColor: "rgba(179, 191, 255, 0.10)",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  starCardActive: {
    borderColor: "rgba(179, 191, 255, 0.38)",
    backgroundColor: "rgba(88, 102, 255, 0.14)",
  },
  starCardLocked: {
    opacity: 0.45,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.mediumSlateBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
  },
  starIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  starName: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 3,
  },
  starReq: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: "700",
  },
  starReqFree: {
    color: colors.celadon,
  },
  selectedCard: {
    marginHorizontal: spacing.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing.lg,
  },
  selectedIcon: {
    fontSize: 30,
  },
  selectedName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  selectedDesc: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  bottom: {
    marginTop: "auto",
    paddingHorizontal: spacing.xl,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(179, 191, 255, 0.18)",
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
    backgroundColor: colors.periwinkle,
  },
});
