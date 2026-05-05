import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { colors, fontFamilies, radii, shadows, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { TextField } from "../components/TextField";
import { GradientButton } from "../components/GradientButton";

export const AuthScreen = () => {
  const { authMode, setAuthMode, register, login, continueWithProvider, language } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [galaxyName, setGalaxyName] = useState("Astrocus");

  const activeTab = useMemo(() => (authMode === "login" ? "login" : "register"), [authMode]);

  const handleSubmit = async () => {
    try {
      if (authMode === "register") {
        await register({ email, password, username, galaxyName });
        return;
      }

      await login({ email, password });
    } catch (error) {
      Alert.alert("Astrocus", error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <StarfieldBackground density={26} opacity={1} />
        <View style={styles.nebulaPrimary} pointerEvents="none" />
        <View style={styles.nebulaSecondary} pointerEvents="none" />

        <View style={styles.logoMark}>
          <View style={styles.logoDotLarge} />
          <View style={styles.logoDotTop} />
          <View style={styles.logoDotRight} />
          <View style={styles.logoDotBottom} />
          <View style={styles.logoDotLeft} />
        </View>

        <Text style={styles.appName}>{t(language, "appTitle")}</Text>
        <Text style={styles.tagline}>{t(language, "authSubtitle")}</Text>
      </View>

      <View style={styles.sheet}>
        <View style={styles.tabRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "login")}
            onPress={() => setAuthMode("login")}
            style={[styles.tab, activeTab === "login" ? styles.tabActive : null]}
          >
            <Text style={[styles.tabText, activeTab === "login" ? styles.tabTextActive : null]}>
              {t(language, "login")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "register")}
            onPress={() => setAuthMode("register")}
            style={[styles.tab, activeTab === "register" ? styles.tabActive : null]}
          >
            <Text style={[styles.tabText, activeTab === "register" ? styles.tabTextActive : null]}>
              {t(language, "register")}
            </Text>
          </Pressable>
        </View>

        {authMode === "register" ? (
          <View style={styles.formGroup}>
            <TextField
              accessibilityLabel={t(language, "username")}
              placeholder={t(language, "username")}
              value={username}
              onChangeText={setUsername}
            />
            <TextField
              accessibilityLabel={t(language, "galaxyName")}
              placeholder={t(language, "galaxyName")}
              value={galaxyName}
              onChangeText={setGalaxyName}
            />
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <TextField
            accessibilityLabel={t(language, "email")}
            placeholder={t(language, "email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            accessibilityLabel={t(language, "password")}
            placeholder={t(language, "password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <GradientButton
          label={authMode === "register" ? t(language, "register") : t(language, "login")}
          onPress={handleSubmit}
          style={styles.primaryCta}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "continueWithGoogle")}
            onPress={() => continueWithProvider("google")}
            style={styles.socialButton}
          >
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "continueWithApple")}
            onPress={() => continueWithProvider("apple")}
            style={styles.socialButton}
          >
            <Text style={styles.socialIcon}></Text>
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.legalText}>
          Devam ederek Gizlilik Politikası'nı ve{"\n"}Kullanım Şartları'nı kabul edersiniz.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    overflow: "hidden",
  },
  nebulaPrimary: {
    position: "absolute",
    top: -40,
    left: -70,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(88, 102, 255, 0.14)",
    ...shadows.glow,
  },
  nebulaSecondary: {
    position: "absolute",
    top: 10,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(255, 107, 157, 0.10)",
    shadowColor: colors.danger,
    shadowOpacity: 0.22,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.18)",
    backgroundColor: "rgba(13, 11, 43, 0.55)",
  },
  logoDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.periwinkle,
    opacity: 0.75,
  },
  logoDotTop: {
    position: "absolute",
    top: 10,
    left: 30,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.periwinkle,
    opacity: 0.9,
  },
  logoDotRight: {
    position: "absolute",
    top: 24,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.mediumSlateBlue,
    opacity: 0.9,
  },
  logoDotBottom: {
    position: "absolute",
    bottom: 10,
    left: 30,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.danger,
    opacity: 0.9,
  },
  logoDotLeft: {
    position: "absolute",
    top: 24,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.mediumSlateBlue,
    opacity: 0.9,
  },
  appName: {
    ...typography.title,
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  sheet: {
    marginTop: 10,
    backgroundColor: "rgba(7, 5, 26, 0.98)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    borderBottomWidth: 0,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(179, 191, 255, 0.10)",
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.periwinkle,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
  },
  tabTextActive: {
    color: colors.periwinkle,
  },
  formGroup: {
    gap: 10,
    marginBottom: spacing.md,
  },
  primaryCta: {
    marginTop: 6,
    ...shadows.soft,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(179, 191, 255, 0.10)",
  },
  dividerText: {
    fontSize: 11,
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(13, 11, 43, 0.45)",
  },
  socialIcon: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  socialText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: fontFamilies.body,
  },
  legalText: {
    fontSize: 10,
    color: colors.textFaint,
    textAlign: "center",
    lineHeight: 14,
    fontFamily: fontFamilies.bodyRegular,
  },
});
