import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { colors, spacing } from "../shared/theme";

export const AuthScreen = () => {
  const { authMode, setAuthMode, register, login, continueWithProvider, language } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [galaxyName, setGalaxyName] = useState("Astrocus");

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t(language, "authTitle")}</Text>
      <Text style={styles.subtitle}>{t(language, "authSubtitle")}</Text>

      {authMode === "register" ? (
        <>
          <TextInput
            accessibilityLabel={t(language, "username")}
            placeholder={t(language, "username")}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            accessibilityLabel={t(language, "galaxyName")}
            placeholder={t(language, "galaxyName")}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={galaxyName}
            onChangeText={setGalaxyName}
          />
        </>
      ) : null}

      <TextInput
        accessibilityLabel={t(language, "email")}
        placeholder={t(language, "email")}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        accessibilityLabel={t(language, "password")}
        placeholder={t(language, "password")}
        secureTextEntry
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>
          {authMode === "register" ? t(language, "register") : t(language, "login")}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={() => continueWithProvider("google")}
      >
        <Text style={styles.secondaryButtonText}>{t(language, "continueWithGoogle")}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={() => continueWithProvider("apple")}
      >
        <Text style={styles.secondaryButtonText}>{t(language, "continueWithApple")}</Text>
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {authMode === "register" ? t(language, "switchToLogin") : t(language, "switchToRegister")}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setAuthMode(authMode === "register" ? "login" : "register")}
        >
          <Text style={styles.switchAction}>
            {authMode === "register" ? t(language, "login") : t(language, "register")}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  switchLabel: {
    color: colors.textMuted,
  },
  switchAction: {
    color: colors.primary,
    fontWeight: "700",
  },
});
