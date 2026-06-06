import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import type { Language } from "../../shared/types";
import { t } from "../../shared/i18n";
import { MAX_FONT_SCALE } from "../../shared/responsive";
import { colors, radii, spacing } from "../../shared/theme";
import { useUniverseMessage } from "../../hooks/useUniverseMessage";
import { FocusSectionCard } from "./FocusSectionCard";
import { AppText } from "../ui/AppText";

type UniverseMessageCardProps = {
  language: Language;
  sectionLabelSize: number;
};

const UniverseMessageSkeleton = () => {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.75,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.skeletonWrap}>
      <Animated.View style={[styles.skeletonLine, styles.skeletonLineFull, { opacity: pulse }]} />
      <Animated.View style={[styles.skeletonLine, styles.skeletonLineMid, { opacity: pulse }]} />
      <Animated.View style={[styles.skeletonLine, styles.skeletonLineShort, { opacity: pulse }]} />
    </View>
  );
};

export const UniverseMessageCard: React.FC<UniverseMessageCardProps> = ({
  language,
  sectionLabelSize,
}) => {
  const { text, author, loading, error } = useUniverseMessage(language);

  if (error) {
    return null;
  }

  return (
    <FocusSectionCard
      title={t(language, "cosmicMessageTitle")}
      titleIcon="star-four-points-outline"
      sectionLabelSize={sectionLabelSize}
    >
      {loading ? (
        <UniverseMessageSkeleton />
      ) : (
        <View style={styles.messageBody}>
          <AppText
            variant="sessionCosmicQuote"
            style={styles.quoteText}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            "{text}"
          </AppText>
          <AppText
            variant="sessionCosmicAttribution"
            style={styles.attributionText}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {`— ${author}`}
          </AppText>
        </View>
      )}
    </FocusSectionCard>
  );
};

const styles = StyleSheet.create({
  messageBody: {
    alignSelf: "stretch",
    gap: spacing.xs,
  },
  quoteText: {
    alignSelf: "stretch",
    textAlign: "left",
  },
  attributionText: {
    alignSelf: "flex-start",
    textAlign: "left",
  },
  skeletonWrap: {
    alignSelf: "stretch",
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  skeletonLine: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
    height: 12,
  },
  skeletonLineFull: {
    width: "100%",
  },
  skeletonLineMid: {
    alignSelf: "flex-start",
    width: "82%",
  },
  skeletonLineShort: {
    alignSelf: "flex-start",
    height: 10,
    marginTop: spacing.xxs,
    width: "36%",
  },
});
