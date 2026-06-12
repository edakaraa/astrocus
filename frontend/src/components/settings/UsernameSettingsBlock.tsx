import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../shared/api";
import { t } from "../../shared/i18n";
import { colors, layout, typography } from "../../shared/theme";
import { validateUsername } from "../../shared/username";
import theme from "../../theme";
import { AppText } from "../ui/AppText";

type UsernameSettingsBlockProps = {
  currentUsername: string;
  userId: string;
};

export const UsernameSettingsBlock: React.FC<UsernameSettingsBlockProps> = ({
  currentUsername,
  userId,
}) => {
  const { language, showAlert, showToast, updateProfile } = useAppContext();
  const [draft, setDraft] = useState(currentUsername);
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(currentUsername);
  }, [currentUsername]);

  useEffect(() => {
    const validation = validateUsername(draft);
    const normalizedCurrent = currentUsername.trim();

    if (!validation.ok) {
      setAvailability("idle");
      return;
    }

    if (validation.normalized === normalizedCurrent) {
      setAvailability("available");
      return;
    }

    setAvailability("checking");
    const timer = setTimeout(() => {
      void api
        .isUsernameAvailable(validation.normalized, userId)
        .then((available) => {
          setAvailability(available ? "available" : "taken");
        })
        .catch(() => {
          setAvailability("idle");
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [currentUsername, draft, userId]);

  const showUsernameAlert = (messageKey: Parameters<typeof t>[1]) => {
    void showAlert({
      title: t(language, "usernameChangeTitle"),
      message: t(language, messageKey),
      confirmLabel: t(language, "ok"),
    });
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const validation = validateUsername(draft);
    if (!validation.ok) {
      const messageKey =
        validation.reason === "empty"
          ? "usernameRequired"
          : validation.reason === "invalid"
            ? "usernameInvalid"
            : validation.reason === "tooShort"
              ? "usernameTooShort"
              : "usernameTooLong";
      showUsernameAlert(messageKey);
      return;
    }

    if (validation.normalized === currentUsername.trim()) {
      showUsernameAlert("usernameUnchanged");
      return;
    }

    setSaving(true);
    try {
      const available = await api.isUsernameAvailable(validation.normalized, userId);
      if (!available) {
        setAvailability("taken");
        showUsernameAlert("usernameTaken");
        return;
      }

      await updateProfile({ username: validation.normalized });
      showToast({
        title: t(language, "usernameSaved"),
        placement: "bottom",
        avoidTabBar: false,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message === "username_taken"
          ? t(language, "usernameTaken")
          : error instanceof Error
            ? error.message
            : t(language, "usernameSaveFailed");
      void showAlert({
        title: t(language, "toastErrorGeneric"),
        message,
        confirmLabel: t(language, "ok"),
      });
    } finally {
      setSaving(false);
    }
  };

  const validation = validateUsername(draft);
  const statusMessage =
    !validation.ok && draft.trim().length > 0
      ? t(
          language,
          validation.reason === "invalid"
            ? "usernameInvalid"
            : validation.reason === "tooShort"
              ? "usernameTooShort"
              : validation.reason === "tooLong"
                ? "usernameTooLong"
                : "usernameRequired",
        )
      : availability === "taken"
        ? t(language, "usernameTaken")
        : null;

  return (
    <View style={styles.stack}>
      <TextInput
        accessibilityLabel={t(language, "usernameChangeLabel")}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!saving}
        maxLength={20}
        returnKeyType="done"
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => void handleSave()}
        placeholder={t(language, "usernamePlaceholder")}
        placeholderTextColor={colors.textFaint}
        style={[styles.input, statusMessage ? styles.inputInvalid : null]}
      />
      {statusMessage || availability === "checking" ? (
        <View style={styles.statusRow}>
          <AppText
            variant="caption"
            color={statusMessage ? colors.danger : theme.colors.textSecondary}
          >
            {statusMessage ?? t(language, "usernameChecking")}
          </AppText>
          {availability === "checking" ? (
            <ActivityIndicator color={theme.colors.accent} size="small" />
          ) : null}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "usernameSaveButton")}
        accessibilityState={{ disabled: saving }}
        disabled={saving}
        onPress={() => void handleSave()}
        style={({ pressed }) => [
          styles.saveButton,
          saving ? styles.saveButtonDisabled : null,
          pressed && !saving ? styles.saveButtonPressed : null,
        ]}
      >
        <AppText variant="card" color={saving ? theme.colors.muted : theme.colors.bg}>
          {saving ? t(language, "usernameSaving") : t(language, "usernameSaveButton")}
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.sm,
  },
  input: {
    ...typography.body,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    minHeight: layout.touchTargetMin,
    paddingHorizontal: theme.spacing.md,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.md,
    justifyContent: "center",
    minHeight: layout.touchTargetMin,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.7,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
});
