import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import type { Language } from "../shared/types";
import { useResponsive } from "../shared/responsive";
import { colors, fontFamilies } from "../shared/theme";

const VISUALS = [
  require("../../assets/onboarding/visual_01_star.png"),
  require("../../assets/onboarding/visual_02_galaxy.png"),
  require("../../assets/onboarding/visual_03_saturn.png"),
  require("../../assets/onboarding/visual_04_horizon.png"),
] as const;

const ONBOARDING_BG = "#050311";

type OnboardingPageData = {
  titleKey: "onboardingPhase1Title" | "onboardingPhase2Title" | "onboardingPhase3Title" | "onboardingPhase4Title";
  subtitleKey:
    | "onboardingPhase1Subtitle"
    | "onboardingPhase2Subtitle"
    | "onboardingPhase3Subtitle"
    | "onboardingPhase4Subtitle";
};

const PAGES: OnboardingPageData[] = [
  { titleKey: "onboardingPhase1Title", subtitleKey: "onboardingPhase1Subtitle" },
  { titleKey: "onboardingPhase2Title", subtitleKey: "onboardingPhase2Subtitle" },
  { titleKey: "onboardingPhase3Title", subtitleKey: "onboardingPhase3Subtitle" },
  { titleKey: "onboardingPhase4Title", subtitleKey: "onboardingPhase4Subtitle" },
];

/** Upper visual only — keeps twinkles out of the text/button zone below. */
const TWINKLE_COUNT = 28;
const TWINKLE_DATA = Array.from({ length: TWINKLE_COUNT }, (_, i) => {
  const seed = (i + 1) * 23.7;
  return {
    cx: Math.abs(Math.sin(seed) * 10000) % 100,
    cy: Math.abs(Math.cos(seed * 1.4) * 10000) % 58,
    r: i % 3 === 0 ? 1.6 : i % 3 === 1 ? 1.1 : 0.7,
    delay: (i * 137) % 2800,
    duration: 1800 + ((i * 113) % 1400),
    gold: i % 5 === 0,
  };
});

/** Sparse bottom blend stars — pages 1–3 only, kept in the lower fade band. */
const BOTTOM_BLEND_STARS = Array.from({ length: 36 }, (_, i) => {
  const seed = (i + 1) * 31.1;
  const edgeBias = i % 3 === 0 ? 12 : i % 3 === 1 ? 88 : Math.abs(Math.sin(seed) * 10000) % 100;
  return {
    cx: edgeBias,
    cy: 58 + (Math.abs(Math.cos(seed * 1.15) * 10000) % 42),
    r: i % 4 === 0 ? 0.95 : i % 4 === 1 ? 0.75 : 0.55,
    opacity: 0.2 + (Math.abs(Math.sin(seed * 0.85)) % 1) * 0.28,
    gold: i % 8 === 0,
  };
});

function BottomBlendStars({
  width,
  stripHeight,
  avoidCenter,
}: {
  width: number;
  stripHeight: number;
  avoidCenter?: boolean;
}) {
  const stars = BOTTOM_BLEND_STARS.filter((s) => {
    if (!avoidCenter) {
      return true;
    }
    const inPlanetZone = s.cx > 30 && s.cx < 70 && s.cy < 78;
    return !inPlanetZone;
  });

  return (
    <View style={[styles.bottomBlendStrip, { width, height: stripHeight }]} pointerEvents="none">
      <Svg width={width} height={stripHeight}>
        {stars.map((s, i) => {
          const yRatio = s.cy / 100;
          const edgeFade = 0.4 + yRatio * 0.5;
          return (
            <Circle
              key={`blend-${i}`}
              cx={(s.cx / 100) * width}
              cy={yRatio * stripHeight}
              r={s.r}
              fill={s.gold ? "#ffe8a0" : "#e0d7ff"}
              opacity={Math.min(0.65, s.opacity * edgeFade)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

function TwinkleStars({ width, height }: { width: number; height: number }) {
  const twinkleHeight = height * 0.62;
  const anims = useRef(Array.from({ length: TWINKLE_COUNT }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(TWINKLE_DATA[i].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: TWINKLE_DATA[i].duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: TWINKLE_DATA[i].duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  return (
    <View style={[StyleSheet.absoluteFillObject, { height: twinkleHeight }]} pointerEvents="none">
      {TWINKLE_DATA.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: (s.cx / 100) * width - s.r,
            top: (s.cy / 100) * twinkleHeight - s.r,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: s.r,
            backgroundColor: s.gold ? "#ffe8a0" : "#e0d7ff",
            opacity: anims[i],
          }}
        />
      ))}
    </View>
  );
}

// ─── Timeline progress dots (instant paging) ──────────────────────────────────

function TimelineDots({ activePage, count }: { activePage: number; count: number }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: count }, (_, i) => (
        <View key={`dot-${i}`} style={[styles.dot, i === activePage ? styles.dotActive : null]} />
      ))}
    </View>
  );
}

// ─── A single full-screen onboarding page ─────────────────────────────────────

type OnboardingPageProps = {
  page: OnboardingPageData;
  index: number;
  activePage: number;
  width: number;
  visualHeight: number;
  contentHeight: number;
  insets: ReturnType<typeof useSafeAreaInsets>;
  language: Language;
  copyOpacity: Animated.Value;
  copyTranslateY: Animated.Value;
  titleFontSize: number;
  titleLineHeight: number;
  subtitleFontSize: number;
  logoTitleFontSize: number;
  onComplete?: () => void;
};

function OnboardingPage({
  page,
  index,
  activePage,
  width,
  visualHeight,
  contentHeight,
  insets,
  language,
  copyOpacity,
  copyTranslateY,
  titleFontSize,
  titleLineHeight,
  subtitleFontSize,
  logoTitleFontSize,
  onComplete,
}: OnboardingPageProps) {
  const isLast = index === PAGES.length - 1;
  const isEarlyVisual = index < 3;
  const blendStripHeight = Math.round(visualHeight * (isEarlyVisual ? 0.44 : 0.52));

  return (
    <View style={[styles.page, { width }]}>
      <View style={[styles.visualArea, { height: visualHeight }]}>
        <Image source={VISUALS[index]} style={styles.visualImage} resizeMode="cover" />
        <TwinkleStars width={width} height={visualHeight} />
        <LinearGradient colors={["transparent", ONBOARDING_BG]} style={styles.visualFade} pointerEvents="none" />
        {isEarlyVisual ? (
          <BottomBlendStars width={width} stripHeight={blendStripHeight} avoidCenter={index === 2} />
        ) : null}
      </View>

      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + 16, 36),
            minHeight: contentHeight,
            justifyContent: index === 3 ? "space-between" : "center",
            gap: index === 3 ? 0 : 24,
          },
        ]}
      >
        <View style={[styles.textBlock, isLast && styles.textBlockCenter]}>
          <Animated.View
            style={[
              styles.textInner,
              isLast && styles.textInnerCenter,
              { opacity: copyOpacity, transform: [{ translateY: copyTranslateY }] },
            ]}
          >
            {isLast ? (
              <Text style={[styles.logoTitle, { fontSize: logoTitleFontSize }]}>{t(language, page.titleKey)}</Text>
            ) : (
              <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}>
                {t(language, page.titleKey)}
              </Text>
            )}
            <Text style={[isLast ? styles.logoSub : styles.subtitle, { fontSize: subtitleFontSize }]}>
              {t(language, page.subtitleKey)}
            </Text>
          </Animated.View>
        </View>

        <TimelineDots activePage={activePage} count={PAGES.length} />

        <View style={styles.ctaArea}>
          {isLast ? (
            <>
              <TouchableOpacity style={styles.startButton} onPress={() => onComplete?.()} activeOpacity={0.82}>
                <Text style={styles.startButtonText}>{t(language, "onboardingStart")}</Text>
              </TouchableOpacity>
              <Text style={styles.startSub}>{t(language, "onboardingStartSub")}</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type OnboardingScreenProps = {
  onComplete?: () => void;
};

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const { language } = useAppContext();
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const { width, height } = useWindowDimensions();

  const visualHeight = height * 0.55;
  const contentHeight = height - visualHeight;

  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyTranslateY = useRef(new Animated.Value(28)).current;

  const [activePage, setActivePage] = useState(0);

  const animateCopyIn = useCallback(() => {
    copyOpacity.setValue(0);
    copyTranslateY.setValue(28);

    Animated.parallel([
      Animated.timing(copyOpacity, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(copyTranslateY, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [copyOpacity, copyTranslateY]);

  useEffect(() => {
    animateCopyIn();
  }, [animateCopyIn]);

  const viewableHandlerRef = useRef<(info: { viewableItems: ViewToken[] }) => void>(() => {});
  viewableHandlerRef.current = ({ viewableItems }) => {
    const first = viewableItems[0];
    if (first?.index == null) {
      return;
    }
    if (first.index !== activePage) {
      setActivePage(first.index);
      animateCopyIn();
    }
  };
  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    viewableHandlerRef.current(info);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const titleFontSize = responsive.font(33);
  const titleLineHeight = responsive.font(41);
  const subtitleFontSize = responsive.font(14);
  const logoTitleFontSize = responsive.font(28);

  const nebula1Size = width * 0.85;
  const nebula2Size = width * 0.72;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View
        style={[
          styles.nebula1,
          {
            width: nebula1Size,
            height: nebula1Size,
            borderRadius: nebula1Size / 2,
            top: -width * 0.22,
            left: -width * 0.22,
          },
        ]}
      />
      <View
        style={[
          styles.nebula2,
          {
            width: nebula2Size,
            height: nebula2Size,
            borderRadius: nebula2Size / 2,
            bottom: -width * 0.12,
            right: -width * 0.18,
          },
        ]}
      />

      <FlatList
        data={PAGES}
        keyExtractor={(item) => item.titleKey}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <OnboardingPage
            page={item}
            index={index}
            activePage={activePage}
            width={width}
            visualHeight={visualHeight}
            contentHeight={contentHeight}
            insets={insets}
            language={language}
            copyOpacity={copyOpacity}
            copyTranslateY={copyTranslateY}
            titleFontSize={titleFontSize}
            titleLineHeight={titleLineHeight}
            subtitleFontSize={subtitleFontSize}
            logoTitleFontSize={logoTitleFontSize}
            onComplete={onComplete}
          />
        )}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
    overflow: "hidden",
  },
  nebula1: {
    position: "absolute",
    backgroundColor: "#3b0764",
    opacity: 0.1,
  },
  nebula2: {
    position: "absolute",
    backgroundColor: "#1e1b4b",
    opacity: 0.14,
  },
  page: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: ONBOARDING_BG,
  },
  visualArea: {
    width: "100%",
    overflow: "hidden",
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  bottomBlendStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    elevation: 3,
  },
  visualFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },
  content: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 8,
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  textBlock: {
    width: "100%",
    overflow: "hidden",
  },
  textBlockCenter: {
    alignItems: "center",
  },
  textInner: {
    width: "100%",
  },
  textInnerCenter: {
    alignItems: "center",
  },
  title: {
    fontFamily: fontFamilies.display,
    color: "#c4b5fd",
    letterSpacing: -0.6,
    marginBottom: 11,
  },
  subtitle: {
    fontFamily: fontFamilies.bodyRegular,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 21,
    letterSpacing: 0.15,
    marginTop: 10,
  },
  logoTitle: {
    fontFamily: fontFamilies.display,
    color: "#ffffff",
    letterSpacing: 12,
    marginBottom: 6,
    textAlign: "center",
    width: "100%",
  },
  logoSub: {
    fontFamily: fontFamilies.bodyRegular,
    color: "rgba(196,181,253,0.65)",
    letterSpacing: 1.6,
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  dotRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(196,181,253,0.22)",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#a78bfa",
  },
  ctaArea: {
    width: "100%",
    alignItems: "center",
    minHeight: 54,
    justifyContent: "center",
  },
  startButton: {
    width: "100%",
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    elevation: 12,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: fontFamilies.displayBold,
    letterSpacing: 0.4,
  },
  startSub: {
    marginTop: 12,
    color: "rgba(196,181,253,0.7)",
    fontSize: 12,
    fontFamily: fontFamilies.bodyRegular,
    letterSpacing: 0.4,
  },
});
