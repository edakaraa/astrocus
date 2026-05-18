import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAppContext } from "../../src/context/AppContext";
import { STARS } from "../../src/shared/constants";
import { colors, fontFamilies, radii, spacing } from "../../src/shared/theme";
import { GradientButton } from "../../src/components/GradientButton";
import { StarfieldBackground } from "../../src/components/StarfieldBackground";
import { CelestialVisual } from "../../src/components/CelestialVisual";

export default function StarPickRoute() {
  const { user, completeOnboarding } = useAppContext();
  const [selectedId, setSelectedId] = useState(STARS[0].id);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (user.onboardingCompleted) {
    return <Redirect href="/(tabs)/session" />;
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await completeOnboarding(selectedId);
    } catch (error) {
      Alert.alert("Astrocus", error instanceof Error ? error.message : "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={30} />
      <Text style={styles.title}>İlk yıldızını seç</Text>
      <Text style={styles.subtitle}>Hedef yıldızın profilinde görünür; gökyüzünü onunla büyütürsün.</Text>

      <View style={styles.grid}>
        {STARS.map((star, index) => {
          const selected = star.id === selectedId;
          const variant = index % 3 === 0 ? "galaxy" : index % 3 === 1 ? "star" : "planet";
          return (
            <Pressable
              key={star.id}
              accessibilityRole="button"
              accessibilityLabel={star.name}
              onPress={() => setSelectedId(star.id)}
              style={[styles.card, selected ? styles.cardSelected : null]}
            >
              <CelestialVisual variant={variant} size={72} />
              <Text style={styles.cardTitle}>{star.name}</Text>
              <Text style={styles.cardMeta}>{`${star.requiredStardust} ✦`}</Text>
            </Pressable>
          );
        })}
      </View>

      <GradientButton label={loading ? "Kaydediliyor…" : "Galaksiye başla"} onPress={handleConfirm} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 56,
    paddingBottom: 40,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 28,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  card: {
    width: "47%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(131,135,195,0.12)",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
