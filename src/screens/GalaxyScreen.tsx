import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { colors, spacing } from "../shared/theme";

export const GalaxyScreen = () => {
  const { stars, unlockedStarIds, user } = useAppContext();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gökyüzü Haritası</Text>
      <Text style={styles.subtitle}>
        {`${user?.totalStardust ?? 0} stardust ile ${unlockedStarIds.length} yıldız açıldı.`}
      </Text>

      {stars.map((star) => {
        const isUnlocked = unlockedStarIds.includes(star.id);
        const remainingStardust = Math.max(star.requiredStardust - (user?.totalStardust ?? 0), 0);

        return (
          <View key={star.id} style={[styles.starCard, isUnlocked ? styles.starCardUnlocked : null]}>
            <Text style={styles.starName}>{star.name}</Text>
            <Text style={styles.starDescription}>{star.description}</Text>
            <Text style={styles.starMeta}>
              {isUnlocked ? "Acildi" : `${remainingStardust} stardust kaldi`}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  starCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg,
  },
  starCardUnlocked: {
    borderColor: colors.warning,
  },
  starName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  starDescription: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  starMeta: {
    color: colors.primary,
    fontWeight: "700",
  },
});
