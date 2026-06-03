import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "../src/components/GradientButton";
import { CosmicScreenBackground } from "../src/components/CosmicScreenBackground";
import { colors, fontFamilies, spacing, typography } from "../src/shared/theme";
import { useAppContext } from "../src/context/AppContext";
import { t } from "../src/shared/i18n";

export default function VerifySuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useAppContext();

  const handleContinue = useCallback(() => {
    if (user?.onboardingCompleted) {
      router.replace("/(tabs)/session");
      return;
    }
    if (user) {
      router.replace("/(onboarding)/star-pick");
      return;
    }
    router.replace("/(auth)");
  }, [router, user]);

  return (
    <CosmicScreenBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={colors.warmOffWhite} name="email-check-outline" size={56} />
        </View>
        <Text style={styles.title}>{t(language, "verifySuccessTitle")}</Text>
        <Text style={styles.subtitle}>{t(language, "verifySuccessSubtitle")}</Text>
        <GradientButton
          fullWidth
          label={t(language, "verifySuccessContinue")}
          onPress={handleContinue}
        />
      </View>
    </CosmicScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
  },
  title: {
    ...typography.h2,
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.displayBold,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center",
  },
});
