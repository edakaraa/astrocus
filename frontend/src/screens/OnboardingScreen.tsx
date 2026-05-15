import React, { useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, spacing } from "../shared/theme";
import { GradientButton } from "../components/GradientButton";
import { SpaceScene } from "../components/SpaceScene";

type OnboardingScreenProps = {
  onComplete?: () => void;
};

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const { completeOnboarding } = useAppContext();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(
    () => [
      {
        key: "birth",
        number: "01",
        stage: "BIRTH",
        title: "Her şey bir odakla başlar",
        description: "Every journey begins with a single focus",
        cta: "İleri",
        variant: "birth" as const,
      },
      {
        key: "expansion",
        number: "02",
        stage: "EXPANSION",
        title: "Çalıştıkça evrenin büyür",
        description: "The more you focus, the bigger your universe",
        cta: "İleri",
        variant: "expansion" as const,
      },
      {
        key: "control",
        number: "03",
        stage: "CONTROL",
        title: "Kendi galaksini inşa et",
        description: "Build your galaxy your way",
        cta: "İleri",
        variant: "control" as const,
      },
      {
        key: "start",
        number: "04",
        stage: "START",
        title: "ASTROCUS",
        description: "Focus. Build. Grow.",
        cta: "Başla",
        variant: "start" as const,
      },
    ],
    [],
  );

  const handleNext = async () => {
    if (pageIndex < pages.length - 1) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      return;
    }

    if (onComplete) {
      onComplete();
      return;
    }

    await completeOnboarding("luna");
  };

  const horizontalPadding = Math.max(spacing.lg, Math.min(spacing.xl, Math.round(width * 0.08)));
  const titleSize = Math.max(30, Math.min(38, Math.round(width * 0.088)));
  const titleLineHeight = Math.round(titleSize * 1.08);
  const descSize = Math.max(12.5, Math.min(14.5, width * 0.036));

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setPageIndex(nextIndex);
        }}
        renderItem={({ item }) => (
          <View style={{ width, paddingTop: Math.max(18, insets.top + 8) }}>
            <View style={[styles.stageRow, { paddingHorizontal: horizontalPadding }]}>
              <Text style={styles.stageNumber}>{item.number}</Text>
              <Text style={styles.stageLabel}>{item.stage}</Text>
            </View>
            <SpaceScene variant={item.variant} />
            <View
              style={[
                styles.textBlock,
                item.key === "start" ? styles.textBlockCenter : null,
                { paddingHorizontal: horizontalPadding, paddingTop: Math.max(10, height * 0.012) },
              ]}
            >
              {item.key === "start" ? <AstrocusMark /> : null}
              <Text
                style={[
                  styles.title,
                  item.key === "start" ? styles.logoTitle : null,
                  { fontSize: item.key === "start" ? Math.max(24, titleSize - 5) : titleSize, lineHeight: titleLineHeight },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.desc,
                  item.key === "start" ? styles.descCenter : null,
                  { fontSize: descSize, lineHeight: Math.round(descSize * 1.45) },
                ]}
              >
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingHorizontal: horizontalPadding, paddingBottom: Math.max(18, insets.bottom + 14) }]}>
        <View style={styles.dots}>
          {pages.map((_, index) => (
            <View key={index} style={[styles.dot, index === pageIndex ? styles.dotActive : null]} />
          ))}
        </View>

        <GradientButton label={pages[pageIndex].cta} onPress={handleNext} accessibilityLabel={pages[pageIndex].cta} />
      </View>
    </View>
  );
};

const AstrocusMark = () => (
  <View style={styles.mark}>
    <Svg width={44} height={44} viewBox="0 0 44 44">
      <Line x1={22} y1={5} x2={22} y2={39} stroke={colors.warmOffWhite} strokeOpacity={0.72} strokeWidth={1.5} />
      <Line x1={5} y1={22} x2={39} y2={22} stroke={colors.warmOffWhite} strokeOpacity={0.42} strokeWidth={1.5} />
      <Circle cx={22} cy={22} r={3.2} fill={colors.warmOffWhite} />
      <Circle cx={22} cy={22} r={17} fill="transparent" stroke={colors.primary} strokeOpacity={0.18} strokeWidth={1} />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  textBlock: {
    paddingTop: 14,
  },
  textBlockCenter: {
    alignItems: "center",
  },
  title: {
    color: colors.text,
    letterSpacing: -0.65,
    fontFamily: fontFamilies.display,
  },
  logoTitle: {
    marginTop: 12,
    letterSpacing: 5.8,
    textAlign: "center",
  },
  desc: {
    marginTop: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  descCenter: {
    textAlign: "center",
  },
  footer: {
    paddingBottom: 28,
  },
  stageRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stageNumber: {
    color: "rgba(232,230,200,0.82)",
    fontFamily: fontFamilies.monoRegular,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  stageLabel: {
    color: "rgba(149,155,181,0.54)",
    fontFamily: fontFamilies.body,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.22)",
  },
  dotActive: {
    backgroundColor: colors.warmOffWhite,
    width: 18,
  },
  mark: {
    alignItems: "center",
    justifyContent: "center",
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232,230,200,0.08)",
    backgroundColor: "rgba(131,135,195,0.08)",
    shadowColor: colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
});
