import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../src/lib/supabase";
import { GradientButton } from "../src/components/GradientButton";
import { CosmicScreenBackground } from "../src/components/CosmicScreenBackground";
import { colors, fontFamilies, layout, radii, spacing, typography } from "../src/shared/theme";
import { toastTone, useAppContext } from "../src/context/AppContext";
import { loadAuthPayloadFromSession } from "../src/shared/api";
import { t } from "../src/shared/i18n";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, applyAuthPayload, showAlert } = useAppContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (password.length < 8) {
      void showAlert({
        title: t(language, "appName"),
        message: t(language, "weakPassword"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.warning.icon,
      });
      return;
    }
    if (password !== confirmPassword) {
      void showAlert({
        title: t(language, "appName"),
        message: t(language, "passwordMismatch"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.warning.icon,
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const payload = await loadAuthPayloadFromSession(sessionData.session);
        await applyAuthPayload(payload);
        router.replace(
          payload.user.onboardingCompleted ? "/(tabs)/session" : "/(onboarding)/star-pick",
        );
        return;
      }

      void showAlert({
        title: t(language, "appName"),
        message: t(language, "passwordUpdated"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.success.icon,
      });
      router.replace("/(auth)");
    } catch (error) {
      void showAlert({
        title: t(language, "appName"),
        message: error instanceof Error ? error.message : t(language, "requestFailed"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.error.icon,
      });
    } finally {
      setSubmitting(false);
    }
  }, [applyAuthPayload, confirmPassword, language, password, router, showAlert]);

  return (
    <CosmicScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.flex, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "back")}
            hitSlop={layout.hitSlop}
            onPress={() => router.replace("/(auth)")}
            style={styles.backButton}
          >
            <MaterialCommunityIcons color={colors.textMuted} name="arrow-left" size={24} />
          </Pressable>

          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons color={colors.warmOffWhite} name="lock-reset" size={48} />
          </View>

          <Text style={styles.title}>{t(language, "resetPasswordTitle")}</Text>
          <Text style={styles.subtitle}>{t(language, "resetPasswordSubtitle")}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t(language, "password")}</Text>
            <View style={styles.inputRow}>
              <TextInput
                autoCapitalize="none"
                autoComplete="new-password"
                placeholder={t(language, "passwordMinPlaceholder")}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                accessibilityRole="button"
                hitSlop={layout.hitSlop}
                onPress={() => setIsPasswordVisible((v) => !v)}
              >
                <MaterialCommunityIcons
                  color={colors.textMuted}
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={22}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t(language, "confirmPassword")}</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              placeholder={t(language, "passwordPlaceholder")}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!isPasswordVisible}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <GradientButton
            disabled={submitting || !password || !confirmPassword}
            fullWidth
            label={submitting ? t(language, "resetPasswordSubmitting") : t(language, "resetPasswordSubmit")}
            onPress={() => void handleSubmit()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </CosmicScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  headerIconWrap: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.displayBold,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: fontFamilies.body,
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.warmOffWhite,
    flex: 1,
    fontFamily: fontFamilies.body,
    paddingVertical: spacing.md,
  },
});
