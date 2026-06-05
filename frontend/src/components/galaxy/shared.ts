import { StyleSheet } from "react-native";
import { colors, radii, spacing } from "../../shared/theme";

export const CELESTIAL_VARIANTS = ["galaxy", "star", "planet"] as const;

export const galaxyCardStyles = StyleSheet.create({
  constellationCard: {
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  constellationCardActive: {
    borderColor: "rgba(131,135,195,0.36)",
    backgroundColor: "rgba(13,11,50,0.92)",
  },
  constellationCardCompleted: {
    borderColor: "rgba(185,240,215,0.22)",
    backgroundColor: "rgba(10,30,20,0.60)",
  },
  constellationCardNext: {
    borderColor: "rgba(255,209,102,0.28)",
    backgroundColor: "rgba(18,16,40,0.90)",
  },
  constellationCardLocked: {
    opacity: 0.72,
    backgroundColor: "rgba(10,10,24,0.85)",
  },
  constHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  constSymbolWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(131,135,195,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  constHeaderText: {
    flex: 1,
  },
  constBadge: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  activePill: {
    backgroundColor: "rgba(131,135,195,0.24)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nextPill: {
    backgroundColor: "rgba(255,209,102,0.12)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lockedPill: {
    alignItems: "center",
    backgroundColor: "rgba(149,155,181,0.08)",
    borderColor: "rgba(149,155,181,0.18)",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressBg: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.10)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  starsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  completedBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(185,240,215,0.06)",
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  starCard: {
    alignItems: "center",
    backgroundColor: "rgba(13,11,43,0.78)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 140,
    padding: 10,
    position: "relative",
    overflow: "hidden",
    width: 100,
  },
  starCardUnlocked: {
    backgroundColor: "rgba(22,18,70,0.86)",
    borderColor: "rgba(131,135,195,0.28)",
  },
  starCardAffordable: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  starCardPressed: {
    opacity: 0.72,
  },
  starGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 999,
    backgroundColor: "rgba(131,135,195,0.10)",
  },
  statusPill: {
    alignItems: "center",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  pillAffordable: {
    backgroundColor: "rgba(255,209,102,0.10)",
  },
  pillLocked: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  section: {
    gap: spacing.sm,
  },
  summaryCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  summaryTextColumn: {
    flex: 1,
    gap: 2,
  },
  progressBgMain: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.12)",
    overflow: "hidden",
  },
  progressFillMain: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
});
