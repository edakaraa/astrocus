import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SubScreenScaffold } from "../components/layout/SubScreenScaffold";
import { SubScreenTopBar } from "../components/layout/TabScreenTopBar";
import { toastTone, useAppContext } from "../context/AppContext";
import { PRESET_AVATARS, resolveAvatarId } from "../shared/constants";
import { t, type TranslationKey } from "../shared/i18n";
import { formatNumber } from "../shared/formatLocale";
import { ScreenContentColumn } from "../components/ScreenContentColumn";
import { UserAvatar } from "../components/UserAvatar";
import { Card } from "../components/ui/Card";
import { AppText } from "../components/ui/AppText";
import { LanguageToggle } from "../components/ui/LanguageToggle";
import { SettingsDivider } from "../components/settings/SettingsDivider";
import { SettingsRow } from "../components/settings/SettingsRow";
import { SettingsNavLink } from "../components/settings/SettingsNavLink";
import { OfflineSyncButton } from "../components/settings/OfflineSyncButton";
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
    showAlert,
    showToast,
  } = useAppContext();

  if (!user) {
    return null;
  }

  const pendingCount = pendingSessions.length;
  const hasPending = pendingCount > 0;

  const handleSync = async () => {
    if (!hasPending) {
      return;
    }
    try {
      await syncOfflineSessions();
      void refreshAnalytics();
      showToast({
        title: t(language, "toastSuccess"),
        subtitle: t(language, "syncSuccess"),
        ...toastTone.success,
      });
    } catch (error) {
      void showAlert({
        title: t(language, "toastErrorGeneric"),
        message: error instanceof Error ? error.message : t(language, "syncFailed"),
        confirmLabel: t(language, "ok"),
        icon: toastTone.error.icon,
      });
    }
  };

  return (
    <SubScreenScaffold>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SubScreenTopBar
          title={t(language, "settingsScreenTitle")}
          backAccessibilityLabel={t(language, "back")}
          onBack={() => router.back()}
        />
        <ScreenContentColumn style={styles.column}>
          <Card style={styles.section}>
            <SettingsRow
              label={t(language, "language")}
              caption={t(language, "appLanguageSubtitle")}
              control={<LanguageToggle language={language} onSelect={setLanguage} />}
            />

            <SettingsDivider />

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

            <SettingsDivider />

            <View style={styles.offlineBlock}>
              <View style={styles.offlineLabels}>
                <AppText variant="card">{t(language, "offlineSessions")}</AppText>
                <AppText variant="caption">
                  <AppText variant="numericCompact">{formatNumber(language, pendingCount)}</AppText>
                  {` ${t(language, "pendingRecords")}`}
                </AppText>
              </View>
              <OfflineSyncButton
                label={t(language, "syncNow")}
                accessibilityLabel={t(language, "syncOffline")}
                disabled={!hasPending}
                onPress={() => void handleSync()}
              />
            </View>

            <SettingsDivider />

            <View style={styles.legalSection}>
              <AppText variant="caption" color={theme.colors.muted}>
                {t(language, "settingsLegalSection")}
              </AppText>
              <View style={styles.legalLinks}>
                <SettingsNavLink
                  label={t(language, "privacyPolicy")}
                  accessibilityLabel={t(language, "privacyPolicy")}
                  onPress={() => router.push("/legal/privacy-policy")}
                />
                <SettingsNavLink
                  label={t(language, "openSourceCredits")}
                  accessibilityLabel={t(language, "openSourceCredits")}
                  onPress={() => router.push("/legal/acknowledgments")}
                  isLast
                />
              </View>
            </View>

            <SettingsDivider />

            <SettingsNavLink
              label={t(language, "deleteAccount")}
              accessibilityLabel={t(language, "deleteAccount")}
              onPress={() => router.push("/legal/delete-account")}
              variant="destructive"
              isLast
            />
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
    </SubScreenScaffold>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  column: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.lg,
  },
  block: {
    gap: theme.spacing.sm,
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
  offlineBlock: {
    gap: theme.spacing.md,
  },
  offlineLabels: {
    gap: theme.spacing.xs,
  },
  legalSection: {
    gap: theme.spacing.sm,
  },
  legalLinks: {
    backgroundColor: theme.colors.overlay,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
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
