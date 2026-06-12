import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SubScreenScaffold, SubScreenScrollLayout } from "../components/layout/SubScreenScaffold";
import { SubScreenTopBar } from "../components/layout/TabScreenTopBar";
import { toastTone, useAppContext } from "../context/AppContext";
import { PRESET_AVATARS, resolveAvatarId } from "../shared/constants";
import { t, type TranslationKey } from "../shared/i18n";
import { UserAvatar } from "../components/UserAvatar";
import { Card } from "../components/ui/Card";
import { AppText } from "../components/ui/AppText";
import { LanguageToggle } from "../components/ui/LanguageToggle";
import { SettingsBlock } from "../components/settings/SettingsBlock";
import { SettingsDivider } from "../components/settings/SettingsDivider";
import { SettingsNavLink } from "../components/settings/SettingsNavLink";
import { SettingsRow } from "../components/settings/SettingsRow";
import { useSettingsSpacing } from "../components/settings/settingsSpacing";
import { UsernameSettingsBlock } from "../components/settings/UsernameSettingsBlock";
import { useResponsive } from "../shared/responsive";
import { layout } from "../shared/theme";
import theme from "../theme";

export const SettingsScreen = () => {
  const router = useRouter();
  const spacing = useSettingsSpacing();
  const { scale, isCompact } = useResponsive();
  const avatarSize = scale(isCompact ? 48 : 52);
  const avatarOptionSize = Math.max(scale(isCompact ? 52 : 56), layout.touchTargetMin);
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null>(null);

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
    refreshAnalytics,
    showAlert,
    showToast,
  } = useAppContext();

  if (!user) {
    return null;
  }

  const handleAvatarSelect = useCallback(
    (avatarId: string) => {
      setPendingAvatarId(avatarId);
      void updateProfile({ avatar: avatarId }).finally(() => {
        setPendingAvatarId((current) => (current === avatarId ? null : current));
      });
    },
    [updateProfile],
  );

  return (
    <SubScreenScaffold>
      <SubScreenScrollLayout columnStyle={styles.column}>
        <SubScreenTopBar
          embedded
          title={t(language, "settingsScreenTitle")}
          backAccessibilityLabel={t(language, "back")}
          onBack={() => router.back()}
        />
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
              title={t(language, "usernameChangeTitle")}
              caption={t(language, "usernameChangeCaption")}
            >
              <UsernameSettingsBlock currentUsername={user.username} userId={user.id} />
            </SettingsBlock>

            <SettingsDivider />

            <SettingsBlock
              title={t(language, "avatar")}
              caption={t(language, "avatarSwipeHint")}
            >
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.avatarScroll}
              >
                {PRESET_AVATARS.map((preset) => {
                  const activeAvatar = pendingAvatarId ?? user.avatar;
                  const selected = resolveAvatarId(activeAvatar) === preset.id;
                  return (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`${t(language, preset.labelKey as TranslationKey)} ${t(language, "selectAvatarA11y")}`}
                      accessibilityState={{ selected }}
                      activeOpacity={0.75}
                      delayPressIn={0}
                      hitSlop={layout.hitSlop}
                      key={preset.id}
                      style={[
                        styles.avatarOption,
                        avatarOptionStyle,
                        selected ? styles.avatarOptionActive : null,
                      ]}
                      onPress={() => handleAvatarSelect(preset.id)}
                    >
                      <UserAvatar
                        avatar={preset.id}
                        size={avatarSize}
                        style={styles.avatarImage}
                        decorative
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
      </SubScreenScrollLayout>
    </SubScreenScaffold>
  );
};

const styles = StyleSheet.create({
  column: {
    gap: theme.spacing.lg,
  },
  avatarScroll: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  avatarOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: layout.touchTargetMin,
    minWidth: layout.touchTargetMin,
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
