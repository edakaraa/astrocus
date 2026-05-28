import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, spacing } from "../shared/theme";
import { SpaceScene } from "../components/SpaceScene";
import { TextField } from "../components/TextField";
import { GradientButton } from "../components/GradientButton";
import { AstroAlertModal } from "../components/AstroAlertModal";
import { isEmailConfirmationRequiredError } from "../lib/authErrors";
import { oauthUserMessage } from "../lib/authErrors";
import { isAppleSignInAvailable } from "../lib/appleAuth";
import { t } from "../shared/i18n";

export const AuthScreen = () => {
  const router = useRouter();
  const {
    authMode,
    setAuthMode,
    register,
    login,
    continueWithGoogle,
    continueWithApple,
    resetPassword,
    language,
  } = useAppContext();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [astroAlert, setAstroAlert] = useState<{ title: string; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const showAstroAlert = useCallback((title: string, message: string) => {
    setAstroAlert({ title, message });
  }, []);

  const isLogin = authMode === "login";

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          Alert.alert(t(language, "appName"), t(language, "fieldsRequired"));
          return;
        }
        setIsSubmitting(true);
        await login({ email, password }, language);
        return;
      }

      if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
        Alert.alert(t(language, "appName"), t(language, "registerFieldsRequired"));
        return;
      }

      if (password.length < 8) {
        Alert.alert(t(language, "appName"), t(language, "weakPassword"));
        return;
      }

      if (!acceptedTerms) {
        Alert.alert(t(language, "appName"), t(language, "termsRequired"));
        return;
      }

      setIsSubmitting(true);
      await register(
        {
          email,
          password,
          username: username.trim(),
          displayName: fullName.trim(),
        },
        language,
      );
    } catch (error) {
      if (isEmailConfirmationRequiredError(error)) {
        Alert.alert(t(language, "appName"), `${error.email} ${error.message}`, [
          { text: t(language, "goToLogin"), onPress: () => setAuthMode("login") },
        ]);
        return;
      }
      Alert.alert(
        t(language, "appName"),
        error instanceof Error ? error.message : t(language, "errorGeneric"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) {
      return;
    }
    setIsGoogleLoading(true);
    try {
      await continueWithGoogle();
    } catch (error) {
      const { title, message } = oauthUserMessage(error, language, "google");
      showAstroAlert(title, message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isAppleLoading) {
      return;
    }
    setIsAppleLoading(true);
    try {
      await continueWithApple();
    } catch (error) {
      const { title, message } = oauthUserMessage(error, language, "apple");
      showAstroAlert(title, message);
    } finally {
      setIsAppleLoading(false);
    }
  };

  const horizontalPadding = Math.max(spacing.lg, Math.min(spacing.xl, Math.round(width * 0.08)));
  const titleSize = Math.max(26, Math.min(30, Math.round(width * 0.075)));
  const titleLineHeight = Math.round(titleSize * 1.14);

  const passwordToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? t(language, "hidePassword") : t(language, "showPassword")}
      onPress={() => setIsPasswordVisible((current) => !current)}
      style={styles.iconBtn}
    >
      <MaterialCommunityIcons
        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
        size={18}
        color={colors.textMuted}
      />
    </Pressable>
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(18, insets.bottom + 14) }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.topBar, { paddingTop: Math.max(14, insets.top + 10), paddingHorizontal: horizontalPadding }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "back")}
          onPress={() => setAuthMode("login")}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.sceneWrap}>
        <SpaceScene variant={isLogin ? "auth-login" : "auth-register"} />
      </View>

      <View style={[styles.sheet, { paddingHorizontal: horizontalPadding }]}>
        {isLogin ? (
          <>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
              {t(language, "authWelcomeBack")}
            </Text>
            <Text style={styles.subtitle}>{t(language, "authLoginSubtitle")}</Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t(language, "email")}</Text>
              <TextField
                accessibilityLabel={t(language, "email")}
                placeholder={t(language, "emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>{t(language, "password")}</Text>
              <TextField
                accessibilityLabel={t(language, "password")}
                placeholder={t(language, "passwordPlaceholder")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                right={passwordToggle}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "forgotPassword")}
                style={styles.forgot}
                onPress={async () => {
                  if (!email.trim()) {
                    Alert.alert(t(language, "appName"), t(language, "enterEmailFirst"));
                    return;
                  }
                  try {
                    await resetPassword(email);
                    Alert.alert(t(language, "appName"), t(language, "passwordResetSent"));
                  } catch (error) {
                    Alert.alert(
                      t(language, "appName"),
                      error instanceof Error ? error.message : t(language, "requestFailed"),
                    );
                  }
                }}
              >
                <Text style={styles.forgotText}>{t(language, "forgotPassword")}</Text>
              </Pressable>
            </View>

            <GradientButton
              label={isSubmitting ? t(language, "loginSubmitting") : t(language, "login")}
              onPress={handleSubmit}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t(language, "orContinueWith")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "continueWithGoogle")}
              style={[styles.googleBtn, isGoogleLoading ? styles.googleBtnDisabled : null]}
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading || isAppleLoading}
            >
              <MaterialCommunityIcons name="google" size={20} color={colors.text} />
              <Text style={styles.googleBtnText}>
                {isGoogleLoading ? t(language, "googleConnecting") : t(language, "continueWithGoogle")}
              </Text>
            </Pressable>

            {appleAvailable ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "continueWithApple")}
                style={[styles.appleBtn, isAppleLoading ? styles.googleBtnDisabled : null]}
                onPress={handleAppleLogin}
                disabled={isAppleLoading || isGoogleLoading}
              >
                <MaterialCommunityIcons name="apple" size={20} color={colors.text} />
                <Text style={styles.googleBtnText}>
                  {isAppleLoading ? t(language, "appleConnecting") : t(language, "continueWithApple")}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "register")}
              onPress={() => setAuthMode("register")}
            >
              <Text style={styles.bottomLink}>
                {t(language, "dontHaveAccount")}{" "}
                <Text style={styles.bottomLinkStrong}>{t(language, "register")}</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
              {t(language, "createAccount")}
            </Text>
            <Text style={styles.subtitle}>{t(language, "createAccountSubtitle")}</Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t(language, "name")}</Text>
              <TextField
                accessibilityLabel={t(language, "name")}
                placeholder={t(language, "namePlaceholder")}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>{t(language, "username")}</Text>
              <TextField
                accessibilityLabel={t(language, "username")}
                placeholder={t(language, "usernamePlaceholder")}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>{t(language, "email")}</Text>
              <TextField
                accessibilityLabel={t(language, "email")}
                placeholder={t(language, "emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>{t(language, "password")}</Text>
              <TextField
                accessibilityLabel={t(language, "password")}
                placeholder={t(language, "passwordMinPlaceholder")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                right={passwordToggle}
              />

              <View style={styles.termsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel={t(language, "acceptTerms")}
                  accessibilityState={{ checked: acceptedTerms }}
                  onPress={() => setAcceptedTerms((current) => !current)}
                  style={[styles.checkbox, acceptedTerms ? styles.checkboxChecked : null]}
                >
                  {acceptedTerms ? <MaterialCommunityIcons name="check" size={14} color={colors.chineseBlack} /> : null}
                </Pressable>
                <Text style={styles.termsText}>
                  {t(language, "acceptTerms")}{" "}
                  <Text style={styles.termsLink} onPress={() => router.push("/legal/privacy-policy")}>
                    {t(language, "privacyPolicyLink")}
                  </Text>
                </Text>
              </View>
            </View>

            <GradientButton
              label={isSubmitting ? t(language, "registerSubmitting") : t(language, "createAccount")}
              onPress={handleSubmit}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "login")}
              onPress={() => setAuthMode("login")}
            >
              <Text style={styles.bottomLink}>
                {t(language, "alreadyHaveAccount")}{" "}
                <Text style={styles.bottomLinkStrong}>{t(language, "login")}</Text>
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <AstroAlertModal
        visible={astroAlert !== null}
        title={astroAlert?.title ?? t(language, "appName")}
        message={astroAlert?.message ?? ""}
        confirmLabel={t(language, "ok")}
        onClose={() => setAstroAlert(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  topBar: {
    paddingTop: 46,
    paddingHorizontal: spacing.xl,
    paddingBottom: 6,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneWrap: {
    paddingHorizontal: 0,
  },
  sheet: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.text,
    letterSpacing: -0.3,
    fontFamily: fontFamilies.display,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12.5,
    fontFamily: fontFamilies.bodyRegular,
  },
  form: {
    marginTop: 18,
  },
  label: {
    marginBottom: 6,
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 8,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fontFamilies.body,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 10,
  },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  googleBtnDisabled: {
    opacity: 0.55,
  },
  googleBtnText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fontFamilies.body,
  },
  bottomLink: {
    marginTop: 12,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontFamilies.bodyRegular,
  },
  bottomLinkStrong: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
  },
  termsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 14,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.16)",
  },
  termsText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamilies.bodyRegular,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
  },
});
