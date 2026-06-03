import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toastTone, useAppContext } from "../../src/context/AppContext";
import { constellationLabel } from "../../src/services/constellationCatalog";
import { loadSkyCatalog } from "../../src/services/skyCatalog";
import { t } from "../../src/shared/i18n";
import type { Constellation, Language } from "../../src/shared/types";
import { colors, fontFamilies, radii, spacing } from "../../src/shared/theme";
import { GradientButton } from "../../src/components/GradientButton";
import { StarfieldBackground } from "../../src/components/StarfieldBackground";

export default function StarPickRoute() {
  const { user, completeOnboarding, language, setLanguage, showAlert } = useAppContext();
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadSkyCatalog()
      .then((catalog) => {
        setConstellations(catalog.constellations);
        setSelectedId((prev) => prev ?? catalog.constellations[0]?.id ?? null);
      })
      .catch(() => {
        setCatalogError(t(language, "catalogLoadError"));
      });
  }, [language]);

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (user.onboardingCompleted) {
    return <Redirect href="/(tabs)/session" />;
  }

  if (catalogError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{catalogError}</Text>
      </View>
    );
  }

  if (constellations.length === 0 || !selectedId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>{t(language, "loading")}</Text>
      </View>
    );
  }

  const selectedConstellation = constellations.find((c) => c.id === selectedId) ?? constellations[0];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await completeOnboarding(selectedId);
    } catch (error) {
      void showAlert({
        title: t(language, "toastErrorGeneric"),
        message: error instanceof Error ? error.message : t(language, "saveFailed"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.error.icon,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={30} />

      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{t(language, "selectLanguage")}</Text>
        <View style={styles.langChips}>
          {(["tr", "en"] as Language[]).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`${t(language, "selectLanguageA11y")} ${item.toUpperCase()}`}
              onPress={() => setLanguage(item)}
              style={[styles.langChip, language === item && styles.langChipActive]}
            >
              <Text style={[styles.langChipText, language === item && styles.langChipTextActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.eyebrow}>{t(language, "onboardingWelcome")}</Text>
      <Text style={styles.title}>{t(language, "onboardingSelectConstellation")}</Text>
      <Text style={styles.subtitle}>{t(language, "onboardingSubtitle")}</Text>

      <View style={styles.hintCard}>
        <MaterialCommunityIcons name="information-outline" size={15} color={colors.primary} />
        <Text style={styles.hintText}>{t(language, "onboardingConstellationHint")}</Text>
      </View>

      <View style={styles.selectedPreview}>
        <MaterialCommunityIcons name="star-circle-outline" size={36} color={colors.primary} />
        <View style={styles.selectedPreviewText}>
          <Text style={styles.selectedName}>{selectedConstellation.nameAstronomical}</Text>
          <Text style={styles.selectedGenitive}>{selectedConstellation.genitiveEn}</Text>
          <Text style={styles.selectedDesc}>
            {constellationLabel(selectedConstellation, language)} · {selectedConstellation.starCount}{" "}
            {t(language, "starsCount")}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {[...constellations].sort((a, b) => a.sortOrder - b.sortOrder).map((constellation) => {
          const selected = constellation.id === selectedId;
          const label = constellation.nameAstronomical;
          return (
            <Pressable
              key={constellation.id}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => setSelectedId(constellation.id)}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <MaterialCommunityIcons name="star-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {constellation.starCount} {t(language, "starsCount")}
              </Text>
              {selected ? (
                <View style={styles.checkMark}>
                  <MaterialCommunityIcons name="check" size={11} color={colors.warmOffWhite} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <GradientButton
        label={
          loading
            ? t(language, "loading")
            : `${selectedConstellation.nameAstronomical} ${t(language, "startWithConstellation")}`
        }
        onPress={handleConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 56,
    paddingBottom: 48,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  errorText: {
    color: colors.textMuted,
    padding: spacing.lg,
    textAlign: "center",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  langLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fontFamilies.body,
  },
  langChips: {
    flexDirection: "row",
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(131,135,195,0.18)",
  },
  langChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  langChipTextActive: {
    color: colors.text,
  },
  eyebrow: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 28,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(131,135,195,0.10)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(131,135,195,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  selectedPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(13,11,43,0.88)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(131,135,195,0.30)",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  selectedPreviewText: {
    flex: 1,
  },
  selectedName: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: "800",
  },
  selectedGenitive: {
    color: colors.textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    marginTop: 2,
  },
  selectedDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "22%",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    position: "relative",
    minHeight: 80,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(131,135,195,0.14)",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
    fontWeight: "700",
  },
  cardSub: {
    color: colors.textFaint,
    fontSize: 8,
    marginTop: 2,
    textAlign: "center",
  },
  checkMark: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
