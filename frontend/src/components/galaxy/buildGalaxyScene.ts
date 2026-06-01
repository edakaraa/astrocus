import type { GalaxyMetrics } from "./galaxyTypes";
import type { BackgroundStar, CoreLayer, GalaxyScene, ScreenDot } from "./galaxySceneCache";

const ARMS = 3;
const ARM_PARTICLES_PER_ARM = 380;
const FILAMENT_PARTICLES = 1400;
const STAR_COUNT = 420;
const REFERENCE_WIDTH = 390;
const REFERENCE_BLUR = 280;

const TILT_Y = 0.38;
const TILT_ROTATE = 0.22;
const TILT_COS = Math.cos(TILT_ROTATE);
const TILT_SIN = Math.sin(TILT_ROTATE);

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const scaleBlur = (blur: number, base: number) => (blur / REFERENCE_BLUR) * base;

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const lerpColor = (from: string, to: string, t: number, alpha: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
};

const toScreen = (x: number, y: number, centerX: number, centerY: number) => ({
  cx: centerX + (x * TILT_COS - y * TILT_SIN),
  cy: centerY + (x * TILT_SIN + y * TILT_COS) * TILT_Y,
});

export const buildMetrics = (screenW: number, screenH: number): GalaxyMetrics => {
  const base = Math.min(screenW, screenH);
  const sizeScale = base / REFERENCE_WIDTH;

  return {
    base,
    maxRadius: base * 0.34,
    innerRadius: 11 * sizeScale,
    sizeScale,
    particleScale: 1.14,
    screenW,
    screenH,
  };
};

export const buildLiteStars = (metrics: GalaxyMetrics, count = 160): BackgroundStar[] => {
  const { screenW, screenH, sizeScale } = metrics;

  return Array.from({ length: count }, () => {
    const tier = Math.random();
    const r = (tier < 0.65 ? 0.45 : tier < 0.9 ? 0.75 : 1.05) * sizeScale;
    const alpha = rand(0.25, 0.75);
    const gold = Math.random() < 0.12;
    return {
      cx: Math.random() * screenW,
      cy: Math.random() * screenH,
      r,
      color: gold ? `rgba(255,230,170,${alpha.toFixed(3)})` : `rgba(210,220,255,${alpha.toFixed(3)})`,
      isCross: false,
    };
  });
};

export const buildGalaxyScene = (
  metrics: GalaxyMetrics,
  centerX: number,
  centerY: number,
): GalaxyScene => {
  const { maxRadius, innerRadius, sizeScale, particleScale } = metrics;
  const sizeMul = sizeScale * particleScale;
  const arms: ScreenDot[] = [];
  const filaments: ScreenDot[] = [];

  for (let arm = 0; arm < ARMS; arm += 1) {
    const armOffset = (arm / ARMS) * Math.PI * 2;

    for (let i = 0; i < ARM_PARTICLES_PER_ARM; i += 1) {
      const t = Math.pow(Math.random(), 0.5);
      const radius = innerRadius + t * maxRadius;
      const spin = t * Math.PI * 3.0;
      const angle = armOffset + spin;
      let spread = (Math.random() - 0.5) * radius * 0.65;
      if (t < 0.3) {
        spread *= 1 + Math.random() * 0.8;
      }
      const perpAngle = angle + Math.PI / 2;
      const x = Math.cos(angle) * radius + Math.cos(perpAngle) * spread;
      const y = Math.sin(angle) * radius + Math.sin(perpAngle) * spread * 0.55;

      let color: string;
      let size: number;
      if (t < 0.15) {
        color = lerpColor("#fff0c0", "#ffcc60", t / 0.15, rand(0.85, 1));
        size = rand(1.5, 2.35) * sizeMul;
      } else if (t < 0.45) {
        color = lerpColor("#e0d0ff", "#b090ff", (t - 0.15) / 0.3, rand(0.55, 0.85));
        size = rand(1.0, 1.75) * sizeMul;
      } else {
        color = lerpColor("#90b0ff", "#4060c0", (t - 0.45) / 0.55, rand(0.25, 0.6));
        size = rand(0.55, 1.2) * sizeMul;
      }

      const screen = toScreen(x, y, centerX, centerY);
      arms.push({ ...screen, r: size, color });
    }
  }

  const filamentsPerArm = Math.ceil(FILAMENT_PARTICLES / ARMS);
  for (let arm = 0; arm < ARMS; arm += 1) {
    const armOffset = (arm / ARMS) * Math.PI * 2;

    for (let i = 0; i < filamentsPerArm; i += 1) {
      const t = Math.pow(Math.random(), 0.5);
      const radius = innerRadius + t * maxRadius;
      const spin = t * Math.PI * 3.0;
      const angle = armOffset + spin;
      const spread = (Math.random() - 0.5) * radius * 0.9;
      const perpAngle = angle + Math.PI / 2;
      const x = Math.cos(angle) * radius + Math.cos(perpAngle) * spread;
      const y = Math.sin(angle) * radius + Math.sin(perpAngle) * spread * 0.55;
      const screen = toScreen(x, y, centerX, centerY);

      filaments.push({
        ...screen,
        r: rand(0.55, 1.05) * sizeMul,
        color: `rgba(112,144,224,${rand(0.15, 0.4).toFixed(3)})`,
      });
    }
  }

  const stars: BackgroundStar[] = Array.from({ length: STAR_COUNT }, () => {
    const tier = Math.random();
    const r = (tier < 0.6 ? 0.4 : tier < 0.9 ? 0.7 : 1.05) * sizeScale;
    const colorRoll = Math.random();
    const alpha = rand(0.2, 0.9);
    let color: string;
    if (colorRoll < 0.7) {
      color = `rgba(200,210,255,${alpha.toFixed(3)})`;
    } else if (colorRoll < 0.9) {
      color = `rgba(255,240,200,${alpha.toFixed(3)})`;
    } else {
      color = `rgba(180,200,255,${alpha.toFixed(3)})`;
    }
    return {
      cx: Math.random() * metrics.screenW,
      cy: Math.random() * metrics.screenH,
      r,
      color,
      isCross: Math.random() < 0.18,
    };
  });

  const base = metrics.base;
  const coreLayers: CoreLayer[] = [
    {
      r: base * 0.36,
      color: "#201060",
      opacity: 0.07,
      blur: scaleBlur(38, base) * 1.5,
    },
    { r: base * 0.24, color: "#6040c0", opacity: 0.16, blur: scaleBlur(18, base) },
    { r: base * 0.13, color: "#d4a0ff", opacity: 0.34, blur: scaleBlur(10, base) },
    { r: base * 0.055, color: "#ffe4a0", opacity: 0.72, blur: scaleBlur(4, base) },
    { r: base * 0.024, color: "#fff8e0", opacity: 0.95, blur: scaleBlur(2, base) },
  ];

  return { arms, filaments, stars, coreLayers };
};
