import React from "react";
import { Linking, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { useAppContext } from "../context/AppContext";
import { DICEBEAR_GLYPHS_ATTRIBUTION } from "../shared/dicebearGlyphs";
import { t } from "../shared/i18n";
import { colors, fontFamilies } from "../shared/theme";

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
        <Text style={styles.compactText}>{t(language, "avatarAttributionCompact")}</Text>
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
      <Text style={styles.text}>{t(language, "avatarAttributionBody")}</Text>
      <Text style={styles.link}>{t(language, "avatarAttributionLink")}</Text>
      <Pressable accessibilityRole="link" onPress={openLicense} hitSlop={8}>
        <Text style={styles.license}>{DICEBEAR_GLYPHS_ATTRIBUTION.license}</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  compactText: {
    color: colors.textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  text: {
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  link: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  license: {
    color: colors.textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 10,
    marginTop: 2,
    textDecorationLine: "underline",
  },
});
