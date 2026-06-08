import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toastTone, useAppContext } from "../../src/context/AppContext";
import { constellationLabel } from "../../src/services/constellationCatalog";
import { loadSkyCatalog } from "../../src/services/skyCatalog";
import { formatNumber } from "../../src/shared/formatLocale";
import { t } from "../../src/shared/i18n";
import {
  DEFAULT_DURATION_MINUTES,
  STARDUST_PER_MINUTE,
  STAR_COST_EASY,
  STAR_COST_MASTERY,
  STAR_COST_MEDIUM,
} from "../../src/shared/constants";
import type { Constellation, Language } from "../../src/shared/types";
import { colors, radii, screenBlock, spacing } from "../../src/shared/theme";
import { useResponsive } from "../../src/shared/responsive";
import { GradientButton } from "../../src/components/GradientButton";
import { CosmicScreenBackground } from "../../src/components/CosmicScreenBackground";
import { ScreenContentColumn } from "../../src/components/ScreenContentColumn";
import { SurfaceCard } from "../../src/components/SurfaceCard";
import { AppText } from "../../src/components/ui/AppText";
import { AppIcon } from "../../src/components/ui/AppIcon";
import { StardustMark } from "../../src/components/ui/StardustMark";
import { getConstellationIcon } from "../../src/components/galaxy/constellationIcons";
import { galaxyCardStyles } from "../../src/components/galaxy/shared";
import theme from "../../src/theme";

const EconomyBullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.economyBullet}>
    <StardustMark size={12} color={theme.colors.textSecondary} />
    <AppText variant="body" color={theme.colors.textSecondary} style={styles.economyBulletText}>
      {children}
    </AppText>
  </View>
);

export default function StarPickRoute() {
  const { user, completeOnboarding, language, setLanguage, showAlert } = useAppContext();
  const { screenTopPadding } = useResponsive();
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const exampleEarn = formatNumber(language, STARDUST_PER_MINUTE * DEFAULT_DURATION_MINUTES);
  const rateLabel = formatNumber(language, STARDUST_PER_MINUTE);

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
      <CosmicScreenBackground>
        <View style={styles.centered}>
          <AppText variant="body" color={colors.textMuted}>
            {catalogError}
          </AppText>
        </View>
      </CosmicScreenBackground>
    );
  }

  if (constellations.length === 0 || !selectedId) {
    return (
      <CosmicScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <AppText variant="body" color={colors.textMuted}>
            {t(language, "loading")}
          </AppText>
        </View>
      </CosmicScreenBackground>
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
    <CosmicScreenBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: screenTopPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenContentColumn style={styles.column}>
          <View style={styles.langRow}>
            <AppText variant="caption" color={colors.textMuted}>
              {t(language, "selectLanguage")}
            </AppText>
            <View style={styles.langChips}>
              {(["tr", "en"] as Language[]).map((item) => {
                const active = language === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`${t(language, "selectLanguageA11y")} ${item.toUpperCase()}`}
                    onPress={() => setLanguage(item)}
                    style={[styles.langChip, active && styles.langChipActive]}
                  >
                    <AppText
                      variant="caption"
                      color={active ? colors.text : colors.textMuted}
                      style={styles.langChipText}
                    >
                      {item.toUpperCase()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <AppText variant="label">{t(language, "onboardingWelcome")}</AppText>
          <AppText variant="hero">{t(language, "onboardingSelectConstellation")}</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            {t(language, "onboardingSubtitle")}
          </AppText>

          <SurfaceCard style={styles.economyCard} borderVariant="strong">
            <AppText variant="card">{t(language, "onboardingStardustSectionTitle")}</AppText>
            <View style={styles.economyBody}>
              <EconomyBullet>
                {t(language, "onboardingStardustEarnLine")
                  .replace("{rate}", rateLabel)
                  .replace("{exampleEarn}", exampleEarn)}
              </EconomyBullet>
              <EconomyBullet>{t(language, "stardustInfoUnlockIntro")}</EconomyBullet>
              <EconomyBullet>
                {t(language, "stardustInfoUnlockTierEasy").replace(
                  "{cost}",
                  formatNumber(language, STAR_COST_EASY),
                )}
              </EconomyBullet>
              <EconomyBullet>
                {t(language, "stardustInfoUnlockTierMedium").replace(
                  "{cost}",
                  formatNumber(language, STAR_COST_MEDIUM),
                )}
              </EconomyBullet>
              <EconomyBullet>
                {t(language, "stardustInfoUnlockTierMastery").replace(
                  "{cost}",
                  formatNumber(language, STAR_COST_MASTERY),
                )}
              </EconomyBullet>
            </View>
          </SurfaceCard>

          <SurfaceCard style={[screenBlock, galaxyCardStyles.constellationCardActive]} borderVariant="strong">
            <View style={galaxyCardStyles.constHeader}>
              <View style={galaxyCardStyles.constSymbolWrap}>
                <AppIcon
                  name={getConstellationIcon(selectedConstellation.id)}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={galaxyCardStyles.constHeaderText}>
                <AppText variant="galaxyConstName">{selectedConstellation.nameAstronomical}</AppText>
                <AppText variant="galaxyConstSubname">
                  {selectedConstellation.genitiveEn} · {selectedConstellation.starCount}{" "}
                  {t(language, "starsCount")}
                </AppText>
              </View>
            </View>
            <AppText variant="galaxyConstDesc">
              {constellationLabel(selectedConstellation, language)}
            </AppText>
          </SurfaceCard>

          <View style={styles.grid}>
            {[...constellations].sort((a, b) => a.sortOrder - b.sortOrder).map((constellation) => {
              const selected = constellation.id === selectedId;
              return (
                <Pressable
                  key={constellation.id}
                  accessibilityRole="button"
                  accessibilityLabel={constellation.nameAstronomical}
                  onPress={() => setSelectedId(constellation.id)}
                  style={[styles.gridCell, selected && styles.gridCellSelected]}
                >
                  <SurfaceCard
                    style={[styles.pickCard, selected && styles.pickCardSelected]}
                    borderVariant={selected ? "strong" : "subtle"}
                  >
                    <View style={styles.pickIconWrap}>
                      <AppIcon
                        name={getConstellationIcon(constellation.id)}
                        size={20}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                    </View>
                    <AppText
                      variant="galaxyStarName"
                      numberOfLines={2}
                      style={styles.pickTitle}
                    >
                      {constellation.nameAstronomical}
                    </AppText>
                    <AppText variant="caption" color={colors.textFaint} numberOfLines={1}>
                      {constellation.starCount} {t(language, "starsCount")}
                    </AppText>
                    {selected ? (
                      <View style={styles.checkMark}>
                        <MaterialCommunityIcons name="check" size={11} color={colors.warmOffWhite} />
                      </View>
                    ) : null}
                  </SurfaceCard>
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
            style={styles.cta}
          />
        </ScreenContentColumn>
      </ScrollView>
    </CosmicScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  column: {
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langChips: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  langChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(131,135,195,0.18)",
  },
  langChipText: {
    fontWeight: "700",
  },
  subtitle: {
    marginTop: -spacing.xs,
    lineHeight: 20,
  },
  economyCard: {
    gap: spacing.sm,
  },
  economyBody: {
    gap: spacing.sm,
  },
  economyBullet: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  economyBulletText: {
    flex: 1,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gridCell: {
    width: "31%",
    flexGrow: 1,
    minWidth: 96,
    maxWidth: "33%",
  },
  gridCellSelected: {},
  pickCard: {
    alignItems: "center",
    gap: 4,
    minHeight: 96,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    position: "relative",
  },
  pickCardSelected: {
    backgroundColor: "rgba(131,135,195,0.14)",
  },
  pickIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(131, 135, 195, 0.08)",
    borderColor: "rgba(131, 135, 195, 0.14)",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  pickTitle: {
    textAlign: "center",
  },
  checkMark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    marginTop: spacing.xs,
  },
});
