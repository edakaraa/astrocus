import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SettingsScreenTopBar } from "../components/layout/TabScreenTopBar";
import { useAppContext } from "../context/AppContext";
import { PRESET_AVATARS, resolveAvatarId } from "../shared/constants";
import { t, type TranslationKey } from "../shared/i18n";
import { formatNumber } from "../shared/formatLocale";
import { StarryBackground } from "../components/StarryBackground";
import { ScreenContentColumn } from "../components/ScreenContentColumn";
import { UserAvatar } from "../components/UserAvatar";
import { GradientButton } from "../components/GradientButton";
import { Card } from "../components/ui/Card";
import { AppText } from "../components/ui/AppText";
import theme from "../theme";

export const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    language,
    setLanguage,
    logout,
    updateProfile,
    user,
    pendingSessions,
    syncOfflineSessions,
    refreshAnalytics,
  } = useAppContext();

  if (!user) {
    return null;
  }

  const handleSync = async () => {
    try {
      await syncOfflineSessions();
      void refreshAnalytics();
      Alert.alert(t(language, "appName"), t(language, "syncSuccess"));
    } catch (error) {
      Alert.alert(
        t(language, "appName"),
        error instanceof Error ? error.message : t(language, "syncFailed"),
      );
    }
  };

  return (
    <StarryBackground>
      <SettingsScreenTopBar
        title={t(language, "settingsScreenTitle")}
        stardustAmount={user.totalStardust}
        backAccessibilityLabel={t(language, "back")}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: theme.spacing.sm,
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenContentColumn style={styles.column}>
          <Card style={styles.section}>
            <View style={styles.settingRow}>
              <View>
                <AppText variant="card">{t(language, "language")}</AppText>
                <AppText variant="caption">{t(language, "appLanguageSubtitle")}</AppText>
              </View>
              <View style={styles.languageSelector}>
                {(["tr", "en"] as const).map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t(language, "selectLanguageA11y")} ${item.toUpperCase()}`}
                    key={item}
                    style={[styles.languageChip, language === item ? styles.languageChipActive : null]}
                    onPress={() => setLanguage(item)}
                  >
                    <AppText
                      variant="micro"
                      color={language === item ? theme.colors.bg : theme.colors.textSecondary}
                    >
                      {item.toUpperCase()}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.block}>
              <AppText variant="card">{t(language, "avatar")}</AppText>
              <AppText variant="caption">{t(language, "avatarSwipeHint")}</AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarScroll}
              >
                {PRESET_AVATARS.map((preset) => {
                  const selected = resolveAvatarId(user.avatar) === preset.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${t(language, preset.labelKey as TranslationKey)} ${t(language, "selectAvatarA11y")}`}
                      key={preset.id}
                      style={[styles.avatarOption, selected ? styles.avatarOptionActive : null]}
                      onPress={() => updateProfile({ avatar: preset.id })}
                    >
                      <UserAvatar avatar={preset.id} size={52} style={styles.avatarImage} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.flex}>
                <AppText variant="card">{t(language, "offlineSessions")}</AppText>
                <AppText variant="caption">
                  {`${formatNumber(language, pendingSessions.length)} ${t(language, "pendingRecords")}`}
                </AppText>
              </View>
              <GradientButton
                label={t(language, "syncNow")}
                onPress={() => void handleSync()}
                variant="soft"
                style={styles.syncBtn}
                accessibilityLabel={t(language, "syncOffline")}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.legal}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "privacyPolicy")}
                onPress={() => router.push("/legal/privacy-policy")}
              >
                <AppText variant="body" color={theme.colors.accent}>
                  {t(language, "privacyPolicy")}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "openSourceCredits")}
                onPress={() => router.push("/legal/acknowledgments")}
              >
                <AppText variant="caption">{t(language, "openSourceCredits")}</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "deleteAccount")}
                onPress={() => router.push("/legal/delete-account")}
              >
                <AppText variant="body" color={theme.colors.badgeScorpio}>
                  {t(language, "deleteAccount")}
                </AppText>
              </Pressable>
            </View>
          </Card>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.signOut, pressed ? styles.pressed : null]}
            onPress={() => void logout()}
          >
            <AppText variant="card">{t(language, "signOut")}</AppText>
          </Pressable>
        </ScreenContentColumn>
      </ScrollView>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  column: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.lg,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  flex: {
    flex: 1,
  },
  block: {
    gap: theme.spacing.sm,
  },
  divider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
  languageSelector: {
    backgroundColor: theme.colors.overlay,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    padding: theme.spacing.xs,
  },
  languageChip: {
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  languageChipActive: {
    backgroundColor: theme.colors.accent,
  },
  avatarScroll: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarOptionActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  avatarImage: {
    borderWidth: 0,
  },
  syncBtn: {
    minWidth: 78,
  },
  legal: {
    gap: theme.spacing.md,
  },
  signOut: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    paddingVertical: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
});
