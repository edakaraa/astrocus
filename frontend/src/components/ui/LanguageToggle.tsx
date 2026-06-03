import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Language } from "../../shared/types";
import { t } from "../../shared/i18n";
import { AppText } from "./AppText";
import theme from "../../theme";

type LanguageToggleProps = {
  language: Language;
  onSelect: (language: Language) => void;
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onSelect }) => (
  <View style={styles.selector}>
    {(["tr", "en"] as const).map((item) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t(language, "selectLanguageA11y")} ${item.toUpperCase()}`}
        key={item}
        style={[styles.chip, language === item ? styles.chipActive : null]}
        onPress={() => onSelect(item)}
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
);

const styles = StyleSheet.create({
  selector: {
    backgroundColor: theme.colors.overlay,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    padding: theme.spacing.xs,
  },
  chip: {
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
  },
});
