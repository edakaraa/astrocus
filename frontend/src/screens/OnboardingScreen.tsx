import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import type { Language } from "../shared/types";
import { fontFamilies, radii, spacing, colors } from "../shared/theme";

const { width, height } = Dimensions.get("window");
const VISUAL_SIZE = Math.min(width * 0.86, 340);
const TIMELINE_MS = 24000;

// Text switches at these timeline thresholds — never overlap
const COPY_THRESHOLDS = [0.24, 0.5, 0.76] as const;

const getCopyPhases = (language: Language) => [
  { id: "01", title: t(language, "onboardingPhase1Title"), isLogo: false },
  { id: "02", title: t(language, "onboardingPhase2Title"), isLogo: false },
  { id: "03", title: t(language, "onboardingPhase3Title"), isLogo: false },
  {
    id: "04",
    title: t(language, "onboardingPhase4Title"),
    subtitle: t(language, "onboardingPhase4Subtitle"),
    isLogo: true,
  },
];

const STAR_FIELD = Array.from({ length: 48 }, (_, i) => {
  const seed = (i + 1) * 17.3;
  return {
    cx: Math.abs(Math.sin(seed) * 10000) % 100,
    cy: Math.abs(Math.cos(seed * 1.3) * 10000) % 100,
    r: i % 4 === 0 ? 1.4 : i % 4 === 1 ? 1.0 : i % 4 === 2 ? 0.7 : 0.5,
    opacity: 0.18 + (Math.abs(Math.cos(seed * 0.7)) % 1) * 0.52,
  };
});

function phaseFromTimeline(value: number) {
  if (value >= COPY_THRESHOLDS[2]) return 3;
  if (value >= COPY_THRESHOLDS[1]) return 2;
  if (value >= COPY_THRESHOLDS[0]) return 1;
  return 0;
}

// ─── Continuous morphing cosmic visual ───────────────────────────────────────

function CosmicMorphVisual({ t }: { t: Animated.Value }) {
  const S = VISUAL_SIZE;
  const cx = S / 2;
  const cy = S / 2;
  const PR = S * 0.24;
  const RX = S * 0.44;
  const RY = S * 0.1;

  const starFieldOpacity = t.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0, 1, 1],
    extrapolate: "clamp",
  });

  const starOpacity = t.interpolate({
    inputRange: [0, 0.06, 0.26, 0.38],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const galaxyOpacity = t.interpolate({
    inputRange: [0.22, 0.34, 0.5, 0.58],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const saturnOpacity = t.interpolate({
    inputRange: [0.46, 0.56, 0.72, 0.8],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const horizonOpacity = t.interpolate({
    inputRange: [0.68, 0.8, 1],
    outputRange: [0, 1, 1],
    extrapolate: "clamp",
  });

  const starCoreScale = t.interpolate({
    inputRange: [0, 0.08, 0.26, 0.36],
    outputRange: [0.15, 1.1, 4.2, 6],
    extrapolate: "clamp",
  });

  const starRayOpacity = t.interpolate({
    inputRange: [0.06, 0.18, 0.32],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const galaxyScale = t.interpolate({
    inputRange: [0.22, 0.34, 0.5, 0.58],
    outputRange: [0.2, 0.82, 1.08, 0.92],
    extrapolate: "clamp",
  });

  const galaxyRotate = t.interpolate({
    inputRange: [0.22, 0.58],
    outputRange: ["0deg", "280deg"],
    extrapolate: "clamp",
  });

  const saturnScale = t.interpolate({
    inputRange: [0.46, 0.56, 0.72, 0.78],
    outputRange: [0.4, 0.95, 1.08, 1.25],
    extrapolate: "clamp",
  });

  const ringOpacity = t.interpolate({
    inputRange: [0.52, 0.6, 0.76, 0.84],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const ringDriftY = t.interpolate({
    inputRange: [0.56, 0.64, 0.72, 0.8],
    outputRange: [0, 10, -2, -8],
    extrapolate: "clamp",
  });

  const zoomScale = t.interpolate({
    inputRange: [0.68, 0.84, 1],
    outputRange: [0.85, 1.85, 1.55],
    extrapolate: "clamp",
  });

  const zoomTranslateY = t.interpolate({
    inputRange: [0.68, 0.84, 1],
    outputRange: [0, S * 0.28, S * 0.2],
    extrapolate: "clamp",
  });

  const cameraPulse = t.interpolate({
    inputRange: [0.2, 0.26, 0.46, 0.52, 0.68, 0.74],
    outputRange: [1, 1.06, 1, 1.05, 1, 1.08],
    extrapolate: "clamp",
  });

  const logoMarkOpacity = t.interpolate({
    inputRange: [0.82, 0.92, 1],
    outputRange: [0, 1, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={{ width: S, height: S, transform: [{ scale: cameraPulse }] }}>
      {/* Persistent star field — fades in at birth */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: starFieldOpacity }]}>
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {STAR_FIELD.map((s, i) => (
            <Circle
              key={i}
              cx={(s.cx / 100) * S}
              cy={(s.cy / 100) * S}
              r={s.r}
              fill="#e0d7ff"
              opacity={s.opacity}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* ── Phase 1: Birth star ── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: starOpacity, alignItems: "center", justifyContent: "center" }]}
      >
        <Animated.View style={{ transform: [{ scale: starCoreScale }] }}>
          <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
            <Defs>
              <RadialGradient id="morphBirthGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
                <Stop offset="22%" stopColor="#c4b5fd" stopOpacity={0.4} />
                <Stop offset="55%" stopColor="#7c3aed" stopOpacity={0.14} />
                <Stop offset="100%" stopColor="#050311" stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="morphBirthOuter" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                <Stop offset="100%" stopColor="#050311" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r={S * 0.38} fill="url(#morphBirthOuter)" />
            <Circle cx={cx} cy={cy} r={S * 0.22} fill="url(#morphBirthGlow)" />
            <Circle cx={cx} cy={cy} r={5} fill="#ffffff" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { alignItems: "center", justifyContent: "center", opacity: starRayOpacity },
          ]}
        >
          <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
            <Rect x={cx - 0.8} y={cy - S * 0.28} width={1.6} height={S * 0.56} rx={0.8} fill="#ffffff" opacity={0.6} />
            <Rect x={cx - S * 0.28} y={cy - 0.8} width={S * 0.56} height={1.6} rx={0.8} fill="#ffffff" opacity={0.45} />
            <Line x1={cx - S * 0.16} y1={cy - S * 0.16} x2={cx + S * 0.16} y2={cy + S * 0.16} stroke="#c4b5fd" strokeWidth={1} strokeOpacity={0.35} />
            <Line x1={cx + S * 0.16} y1={cy - S * 0.16} x2={cx - S * 0.16} y2={cy + S * 0.16} stroke="#c4b5fd" strokeWidth={1} strokeOpacity={0.35} />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* ── Phase 2: Galaxy (star expands into spiral) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: galaxyOpacity, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: galaxyScale }, { rotate: galaxyRotate }] }}>
          <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
            <Defs>
              <RadialGradient id="morphGalaxyCore" cx="50%" cy="50%" r="52%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <Stop offset="18%" stopColor="#c4b5fd" stopOpacity={0.48} />
                <Stop offset="44%" stopColor="#7c3aed" stopOpacity={0.24} />
                <Stop offset="100%" stopColor="#050311" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r={S * 0.42} fill="url(#morphGalaxyCore)" />
            <G rotation="0" origin={`${cx},${cy}`}>
              <Ellipse cx={cx} cy={cy} rx={S * 0.4} ry={S * 0.14} stroke="#a78bfa" strokeOpacity={0.42} strokeWidth={2.5} fill="transparent" />
            </G>
            <G rotation="32" origin={`${cx},${cy}`}>
              <Ellipse cx={cx} cy={cy} rx={S * 0.34} ry={S * 0.1} stroke="#818cf8" strokeOpacity={0.32} strokeWidth={2} fill="transparent" />
            </G>
            <G rotation="-24" origin={`${cx},${cy}`}>
              <Ellipse cx={cx} cy={cy} rx={S * 0.46} ry={S * 0.17} stroke="#7c3aed" strokeOpacity={0.26} strokeWidth={3} fill="transparent" />
            </G>
            <G rotation="58" origin={`${cx},${cy}`}>
              <Ellipse cx={cx} cy={cy} rx={S * 0.28} ry={S * 0.08} stroke="#c4b5fd" strokeOpacity={0.22} strokeWidth={1.5} fill="transparent" />
            </G>
            {STAR_FIELD.slice(0, 18).map((s, i) => (
              <Circle
                key={`g-${i}`}
                cx={cx - S * 0.26 + (s.cx / 100) * S * 0.52}
                cy={cy - S * 0.09 + (s.cy / 100) * S * 0.18}
                r={s.r * 0.85}
                fill={i % 3 === 0 ? "#e0d7ff" : "#a78bfa"}
                opacity={s.opacity * 0.8}
              />
            ))}
            <Circle cx={cx} cy={cy} r={7} fill="#ffffff" opacity={0.92} />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* ── Phase 3: Saturn (galaxy condenses into planet + rings) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: saturnOpacity, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: saturnScale }] }}>
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { opacity: ringOpacity, transform: [{ translateY: ringDriftY }] }]}
          >
            <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
              <Ellipse cx={cx} cy={cy} rx={RX} ry={RY} stroke="#a78bfa" strokeOpacity={0.32} strokeWidth={3} fill="transparent" />
              <Ellipse cx={cx} cy={cy} rx={RX * 0.82} ry={RY * 0.75} stroke="#c4b5fd" strokeOpacity={0.22} strokeWidth={2} fill="transparent" />
              <Ellipse cx={cx} cy={cy} rx={RX * 1.1} ry={RY * 1.15} stroke="#7c3aed" strokeOpacity={0.14} strokeWidth={1.5} fill="transparent" />
            </Svg>
          </Animated.View>

          <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
            <Defs>
              <RadialGradient id="morphSaturn" cx="38%" cy="32%" r="70%">
                <Stop offset="0%" stopColor="#d8b4fe" stopOpacity={0.58} />
                <Stop offset="38%" stopColor="#4c1d95" stopOpacity={0.48} />
                <Stop offset="100%" stopColor="#1e1b4b" stopOpacity={0.88} />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r={PR} fill="url(#morphSaturn)" />
            {[0.35, 0.52, 0.68, 0.82].map((band, i) => (
              <Ellipse
                key={i}
                cx={cx}
                cy={cy - PR + PR * 2 * band}
                rx={Math.sqrt(Math.max(0, PR * PR - (PR - PR * 2 * band) ** 2)) * 0.95}
                ry={2.5}
                fill="#a78bfa"
                opacity={0.1 + i * 0.04}
              />
            ))}
            <Ellipse cx={cx - PR * 0.28} cy={cy - PR * 0.28} rx={PR * 0.32} ry={PR * 0.2} fill="#ffffff" opacity={0.07} />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* ── Phase 4: Horizon zoom (planet fills frame, logo appears) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: horizonOpacity,
            transform: [{ scale: zoomScale }, { translateY: zoomTranslateY }],
          },
        ]}
      >
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          <Defs>
            <RadialGradient id="morphHorizonGlow" cx="50%" cy="22%" r="72%">
              <Stop offset="0%" stopColor="#a78bfa" stopOpacity={0.58} />
              <Stop offset="40%" stopColor="#7c3aed" stopOpacity={0.3} />
              <Stop offset="100%" stopColor="#050311" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="morphPlanetBody" cx="42%" cy="38%" r="72%">
              <Stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.34} />
              <Stop offset="35%" stopColor="#4c1d95" stopOpacity={0.58} />
              <Stop offset="100%" stopColor="#0f0a23" stopOpacity={0.96} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={cx} cy={S * 0.58} rx={S * 0.5} ry={S * 0.26} fill="url(#morphHorizonGlow)" />
          <Ellipse cx={cx} cy={S * 0.78} rx={S * 0.48} ry={S * 0.52} fill="url(#morphPlanetBody)" />
          <Ellipse cx={cx} cy={S * 0.62} rx={S * 0.38} ry={S * 0.058} fill="#7c3aed" opacity={0.58} />
          <Line x1={cx - S * 0.38} y1={S * 0.62} x2={cx + S * 0.38} y2={S * 0.62} stroke="#c4b5fd" strokeOpacity={0.78} strokeWidth={1.5} />
        </Svg>

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: S * 0.08,
              opacity: logoMarkOpacity,
            },
          ]}
        >
          <Svg width={48} height={48} viewBox="0 0 48 48">
            <Line x1={24} y1={6} x2={24} y2={42} stroke="#e0d7ff" strokeOpacity={0.72} strokeWidth={1.6} />
            <Line x1={6} y1={24} x2={42} y2={24} stroke="#e0d7ff" strokeOpacity={0.45} strokeWidth={1.6} />
            <Circle cx={24} cy={24} r={3.4} fill="#ffffff" />
            <Circle cx={24} cy={24} r={18} fill="transparent" stroke="#8387C3" strokeOpacity={0.2} strokeWidth={1} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Single copy block — one text visible at a time ──────────────────────────

type CopyPhase = {
  id: string;
  title: string;
  subtitle?: string;
  isLogo?: boolean;
};

function CinematicCopy({
  phase,
  opacity,
  translateY,
}: {
  phase: CopyPhase;
  opacity: Animated.Value;
  translateY: Animated.Value;
}) {
  const isLogo = "isLogo" in phase && phase.isLogo;

  return (
    <Animated.View
      style={[
        styles.textInner,
        isLogo && styles.textInnerCenter,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {isLogo ? (
        <>
          <Text style={styles.logoTitle}>{phase.title}</Text>
          <Text style={styles.logoSub}>{phase.subtitle}</Text>
        </>
      ) : (
        <Text style={styles.title}>{phase.title}</Text>
      )}
    </Animated.View>
  );
}

// ─── Timeline progress dots ───────────────────────────────────────────────────

const DOT_SEGMENTS: [number, number][] = [
  [0, COPY_THRESHOLDS[0]],
  [COPY_THRESHOLDS[0], COPY_THRESHOLDS[1]],
  [COPY_THRESHOLDS[1], COPY_THRESHOLDS[2]],
  [COPY_THRESHOLDS[2], 1],
];

function TimelineDots({ t, phaseCount }: { t: Animated.Value; phaseCount: number }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: phaseCount }, (_, i) => {
        const [start, end] = DOT_SEGMENTS[i];
        const width = t.interpolate({
          inputRange: [start, end, Math.min(end + 0.001, 1)],
          outputRange: [6, 20, 20],
          extrapolate: "clamp",
        });
        const shellOpacity = t.interpolate({
          inputRange: [start - 0.001, start, end - 0.001, end],
          outputRange: [0, 1, 1, 0],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={`dot-${i}`}
            style={[
              styles.dot,
              {
                width,
                backgroundColor: shellOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["rgba(196,181,253,0.22)", "#a78bfa"],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type OnboardingScreenProps = {
  onComplete?: () => void;
};

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const { language, setLanguage } = useAppContext();
  const insets = useSafeAreaInsets();
  const copyPhases = getCopyPhases(language);
  const timeline = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyTranslateY = useRef(new Animated.Value(28)).current;
  const slideNumOpacity = useRef(new Animated.Value(0)).current;

  const [copyPhase, setCopyPhase] = useState(0);
  const [finished, setFinished] = useState(false);
  const copyPhaseRef = useRef(0);
  const isAnimatingCopyRef = useRef(false);

  const animateCopyIn = useCallback(() => {
    copyOpacity.setValue(0);
    copyTranslateY.setValue(28);
    slideNumOpacity.setValue(0);

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
      Animated.timing(slideNumOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [copyOpacity, copyTranslateY, slideNumOpacity]);

  const switchCopyPhase = useCallback(
    (next: number) => {
      if (next === copyPhaseRef.current || isAnimatingCopyRef.current) {
        return;
      }

      isAnimatingCopyRef.current = true;

      Animated.parallel([
        Animated.timing(copyOpacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(copyTranslateY, {
          toValue: -18,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideNumOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        copyPhaseRef.current = next;
        setCopyPhase(next);
        isAnimatingCopyRef.current = false;
        animateCopyIn();
      });
    },
    [animateCopyIn, copyOpacity, copyTranslateY, slideNumOpacity],
  );

  useEffect(() => {
    animateCopyIn();

    const listenerId = timeline.addListener(({ value }) => {
      switchCopyPhase(phaseFromTimeline(value));
    });

    return () => {
      timeline.removeListener(listenerId);
    };
  }, [animateCopyIn, switchCopyPhase, timeline]);

  useEffect(() => {
    Animated.timing(timeline, {
      toValue: 1,
      duration: TIMELINE_MS,
      easing: Easing.bezier(0.38, 0, 0.12, 1),
      useNativeDriver: false,
    }).start(({ finished: done }) => {
      if (done) {
        setFinished(true);
        Animated.timing(ctaFade, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });
  }, [ctaFade, timeline]);

  const paddingTop = Math.max(insets.top + 8, 52);
  const paddingBottom = Math.max(insets.bottom + 16, 36);
  const activeCopy = copyPhases[copyPhase];

  return (
    <View style={[styles.container, { paddingTop, paddingBottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.nebula1} />
      <View style={styles.nebula2} />

      <Animated.Text style={[styles.slideNum, { opacity: slideNumOpacity }]}>
        {activeCopy.id}
      </Animated.Text>

      <View style={styles.visualArea}>
        <CosmicMorphVisual t={timeline} />
      </View>

      <View style={styles.textBlock}>
        <CinematicCopy
          phase={activeCopy}
          opacity={copyOpacity}
          translateY={copyTranslateY}
        />
      </View>

      <TimelineDots t={timeline} phaseCount={copyPhases.length} />

      <View style={styles.langRow}>
        {(["tr", "en"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            accessibilityRole="button"
            onPress={() => setLanguage(item)}
            style={[styles.langChip, language === item && styles.langChipActive]}
          >
            <Text style={[styles.langChipText, language === item && styles.langChipTextActive]}>
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ctaArea}>
        <Animated.View style={{ width: "100%", opacity: ctaFade }}>
          <TouchableOpacity
            style={[styles.startButton, !finished && styles.startButtonHidden]}
            onPress={() => onComplete?.()}
            activeOpacity={0.82}
            disabled={!finished}
          >
            <Text style={styles.startButtonText}>{t(language, "onboardingStart")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050311",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  nebula1: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: "#3b0764",
    opacity: 0.1,
    top: -width * 0.22,
    left: -width * 0.22,
  },
  nebula2: {
    position: "absolute",
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    backgroundColor: "#1e1b4b",
    opacity: 0.14,
    bottom: -width * 0.12,
    right: -width * 0.18,
  },
  slideNum: {
    alignSelf: "flex-start",
    color: "rgba(255,255,255,0.32)",
    fontSize: 14,
    fontFamily: fontFamilies.monoRegular,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  visualArea: {
    width: VISUAL_SIZE,
    height: VISUAL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 6,
    minHeight: 120,
    overflow: "hidden",
  },
  textInner: {
    width: "100%",
  },
  textInnerCenter: {
    alignItems: "center",
  },
  title: {
    fontSize: height < 700 ? 28 : 33,
    fontFamily: fontFamilies.display,
    color: "#c4b5fd",
    lineHeight: height < 700 ? 35 : 41,
    letterSpacing: -0.6,
    marginBottom: 11,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.bodyRegular,
    color: "rgba(255,255,255,0.46)",
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  logoTitle: {
    fontSize: height < 700 ? 22 : 26,
    fontFamily: fontFamilies.display,
    color: "#ffffff",
    letterSpacing: 6.5,
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
  },
  logoSub: {
    fontSize: 13,
    fontFamily: fontFamilies.bodyRegular,
    color: "rgba(196,181,253,0.65)",
    letterSpacing: 1.6,
    textAlign: "center",
    width: "100%",
  },
  langRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  langChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(131,135,195,0.2)",
  },
  langChipText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "700",
  },
  langChipTextActive: {
    color: "#fff",
  },
  dotRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(196,181,253,0.22)",
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
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.52,
    shadowRadius: 22,
    elevation: 12,
  },
  startButtonHidden: {
    opacity: 0,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: fontFamilies.displayBold,
    letterSpacing: 0.4,
  },
});
