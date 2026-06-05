import React from "react";
import { Linking, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useAppContext } from "../context/AppContext";
import { DICEBEAR_GLYPHS_ATTRIBUTION } from "../shared/dicebearGlyphs";
import { t } from "../shared/i18n";
import { AppText } from "./ui/AppText";

type AvatarAttributionProps = {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export const AvatarAttribution = ({ style, compact = false }: AvatarAttributionProps) => {
  const { language } = useAppContext();

  const openStylePage = () => {
    void Linking.openURL(DICEBEAR_GLYPHS_ATTRIBUTION.styleUrl);
  };

  const openLicense = () => {
    void Linking.openURL(DICEBEAR_GLYPHS_ATTRIBUTION.licenseUrl);
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
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={t(language, "avatarAttributionA11y")}
      onPress={openStylePage}
      style={style}
    >
      <AppText variant="bodyMuted" style={styles.text}>
        {t(language, "avatarAttributionBody")}
      </AppText>
      <AppText variant="link" style={styles.link}>
        {t(language, "avatarAttributionLink")}
      </AppText>
      <Pressable accessibilityRole="link" onPress={openLicense} hitSlop={8}>
        <AppText variant="caption" style={styles.license}>
          {DICEBEAR_GLYPHS_ATTRIBUTION.license}
        </AppText>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  compactText: {
    textAlign: "center",
  },
  text: {
    lineHeight: 16,
  },
  link: {
    marginTop: 4,
  },
  license: {
    marginTop: 2,
    textDecorationLine: "underline",
  },
});
