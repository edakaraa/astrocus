import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
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
import { SettingsBlock } from "../components/settings/SettingsBlock";
import { SettingsDivider } from "../components/settings/SettingsDivider";
import { SettingsNavLink } from "../components/settings/SettingsNavLink";
import { SettingsRow } from "../components/settings/SettingsRow";
import { useSettingsSpacing } from "../components/settings/settingsSpacing";
import { OfflineSyncButton } from "../components/settings/OfflineSyncButton";
import { useResponsive } from "../shared/responsive";
import theme from "../theme";

export const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const spacing = useSettingsSpacing();
  const { scale, isCompact, screenTopPadding } = useResponsive();
  const avatarSize = scale(isCompact ? 48 : 52);
  const avatarOptionSize = scale(isCompact ? 52 : 56);

  const cardStyle = useMemo(
    () => ({
      gap: 0,
      paddingHorizontal: spacing.cardPaddingX,
      paddingVertical: spacing.cardPaddingY,
    }),
    [spacing.cardPaddingX, spacing.cardPaddingY],
  );

  const avatarOptionStyle = useMemo(
    () => ({
      height: avatarOptionSize,
      width: avatarOptionSize,
    }),
    [avatarOptionSize],
  );

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
        <ScreenContentColumn style={[styles.column, { marginTop: screenTopPadding }]}>
          <Card padding={0} style={cardStyle}>
            <SettingsBlock
              header={
                <SettingsRow
                  label={t(language, "language")}
                  caption={t(language, "appLanguageSubtitle")}
                  control={<LanguageToggle language={language} onSelect={setLanguage} />}
                  labelsFlex
                />
              }
            />

            <SettingsDivider />

            <SettingsBlock
              title={t(language, "avatar")}
              caption={t(language, "avatarSwipeHint")}
            >
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
                      style={[
                        styles.avatarOption,
                        avatarOptionStyle,
                        selected ? styles.avatarOptionActive : null,
                      ]}
                      onPress={() => updateProfile({ avatar: preset.id })}
                    >
                      <UserAvatar avatar={preset.id} size={avatarSize} style={styles.avatarImage} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </SettingsBlock>

            <SettingsDivider />

            <SettingsBlock
              title={t(language, "offlineSessions")}
              caption={
                <>
                  <AppText variant="numericCompact">{formatNumber(language, pendingCount)}</AppText>
                  {` ${t(language, "pendingRecords")}`}
                </>
              }
            >
              <OfflineSyncButton
                label={t(language, "syncNow")}
                accessibilityLabel={t(language, "syncOffline")}
                disabled={!hasPending}
                onPress={() => void handleSync()}
              />
            </SettingsBlock>

            <SettingsDivider />

            <SettingsBlock variant="links">
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
            </SettingsBlock>

            <SettingsDivider />

            <SettingsBlock variant="links">
              <SettingsNavLink
                label={t(language, "deleteAccount")}
                accessibilityLabel={t(language, "deleteAccount")}
                onPress={() => router.push("/legal/delete-account")}
                variant="destructive"
                isLast
              />
            </SettingsBlock>
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
  },
  avatarScroll: {
    gap: theme.spacing.md,
  },
  avatarOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
  },
  avatarOptionActive: {
    borderColor: theme.colors.accent,
  },
  avatarImage: {
    backgroundColor: "transparent",
    borderWidth: 0,
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
