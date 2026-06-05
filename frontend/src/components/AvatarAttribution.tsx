import React from "react";
import { Linking, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useAppContext } from "../context/AppContext";
import { DICEBEAR_AVATAR_ATTRIBUTION } from "../shared/dicebearAvatars";
import { t } from "../shared/i18n";
import { AppText } from "./ui/AppText";
import theme from "../theme";

type AvatarAttributionProps = {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export const AvatarAttribution = ({ style, compact = false }: AvatarAttributionProps) => {
  const { language } = useAppContext();

  const openStylePage = () => {
    void Linking.openURL(DICEBEAR_AVATAR_ATTRIBUTION.styleUrl);
  };

  const openLicense = () => {
    void Linking.openURL(DICEBEAR_AVATAR_ATTRIBUTION.licenseUrl);
  };

  if (compact) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t(language, "avatarAttributionA11y")}
        onPress={openStylePage}
        style={style}
      >
        <AppText variant="caption" style={styles.compactText}>
          {t(language, "avatarAttributionCompact")}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.stack, style]}>
      <AppText variant="body" color={theme.colors.textSecondary}>
        {t(language, "avatarAttributionBody")}
      </AppText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t(language, "avatarAttributionA11y")}
        onPress={openStylePage}
        hitSlop={4}
      >
        <AppText variant="link">{t(language, "avatarAttributionLink")}</AppText>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={openLicense} hitSlop={8}>
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.license}>
          {DICEBEAR_AVATAR_ATTRIBUTION.license}
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.xs,
  },
  compactText: {
    textAlign: "center",
  },
  license: {
    textDecorationLine: "underline",
  },
});
