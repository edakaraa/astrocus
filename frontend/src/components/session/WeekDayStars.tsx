import React from "react";
import { StyleSheet, View } from "react-native";
import type { Language } from "../../shared/types";
import { getWeekDayLabels } from "../../shared/formatLocale";
import { AppText } from "../ui/AppText";
import { MAX_FONT_SCALE } from "../../shared/responsive";
import theme from "../../theme";

type WeekDayStarsProps = {
  minutesByDay: number[];
  language: Language;
};

/** Seven ★/☆ slots (Mon→Sun), equal columns, day labels, legacy star look (slightly larger). */
export const WeekDayStars: React.FC<WeekDayStarsProps> = ({ minutesByDay, language }) => {
  const dayLabels = getWeekDayLabels(language);

  return (
    <View style={styles.row}>
      {Array.from({ length: 7 }, (_, index) => {
        const focused = (minutesByDay[index] ?? 0) > 0;
        return (
          <View key={dayLabels[index]} style={styles.dayCell}>
            <AppText
              variant="sessionWeekStars"
              style={styles.starGlyph}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {focused ? "★" : "☆"}
            </AppText>
            <AppText
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.dayLabel}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {dayLabels[index]}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dayCell: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
  },
  starGlyph: {
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: "center",
    width: "100%",
  },
  dayLabel: {
    fontSize: 10,
    textAlign: "center",
  },
});
