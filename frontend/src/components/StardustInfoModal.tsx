import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import { useModalLayout } from "../shared/responsive";
import {
  STARDUST_NO_PAUSE_BONUS,
  STARDUST_PER_MINUTE,
  STARDUST_STREAK_BONUS_MAX,
  STARDUST_STREAK_BONUS_PER_DAY,
  STAR_COST_EASY,
  STAR_COST_MASTERY,
  STAR_COST_MEDIUM,
  formatBonusPercent,
} from "../shared/stardustEconomy";
import { colors, radii, spacing } from "../shared/theme";
import theme from "../theme";
import { GradientButton } from "./GradientButton";
import { AppText } from "./ui/AppText";
import { StardustMark } from "./ui/StardustMark";

type StardustInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <AppText variant="card">{title}</AppText>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const BulletRow = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletRow}>
    <StardustMark size={12} />
    <AppText variant="body" style={styles.bulletText}>
      {children}
    </AppText>
  </View>
);

export const StardustInfoModal: React.FC<StardustInfoModalProps> = ({ visible, onClose }) => {
  const { language } = useAppContext();
  const modal = useModalLayout();

  const streakMaxPct = formatBonusPercent(STARDUST_STREAK_BONUS_MAX);
  const streakDayPct = formatBonusPercent(STARDUST_STREAK_BONUS_PER_DAY);
  const pausePct = formatBonusPercent(STARDUST_NO_PAUSE_BONUS);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "stardustInfoClose")}
        onPress={onClose}
        style={[
          styles.backdrop,
          { justifyContent: modal.backdropJustify, paddingHorizontal: modal.horizontalPad },
        ]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => {}}
          style={[
            styles.cardWrap,
            modal.isSheet ? styles.cardSheet : null,
            {
              maxWidth: modal.cardMaxWidth,
              width: modal.isSheet ? "100%" : modal.cardWidth,
              maxHeight: modal.isSheet ? modal.sheetMaxHeight : "88%",
            },
          ]}
        >
          <BlurView intensity={42} tint="dark" style={[styles.blur, modal.isSheet ? styles.blurSheet : null]}>
            <View style={styles.glassTint} />
            {modal.isSheet ? <View style={styles.sheetHandle} accessibilityElementsHidden /> : null}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.content,
                modal.isSheet
                  ? { paddingBottom: modal.bottomSafePadding + spacing.lg }
                  : null,
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons color={colors.warmOffWhite} name="alert-circle-outline" size={28} />
              </View>
              <AppText variant="modalTitle" style={styles.title}>
                {t(language, "stardustInfoTitle")}
              </AppText>

              <InfoSection title={t(language, "stardustInfoBaseTitle")}>
                <BulletRow>
                  {t(language, "stardustInfoBaseBody").replace(
                    "{rate}",
                    formatNumber(language, STARDUST_PER_MINUTE),
                  )}
                </BulletRow>
              </InfoSection>

              <InfoSection title={t(language, "stardustInfoBonusesTitle")}>
                <BulletRow>
                  {t(language, "stardustInfoStreakBonus")
                    .replace("{dayPct}", String(streakDayPct))
                    .replace("{maxPct}", String(streakMaxPct))}
                </BulletRow>
                <BulletRow>
                  {t(language, "stardustInfoPauseBonus").replace("{pct}", String(pausePct))}
                </BulletRow>
              </InfoSection>

              <InfoSection title={t(language, "stardustInfoPartialTitle")}>
                <BulletRow>
                  {t(language, "stardustInfoPartialBody").replace(
                    "{rate}",
                    formatNumber(language, STARDUST_PER_MINUTE),
                  )}
                </BulletRow>
              </InfoSection>

              <InfoSection title={t(language, "stardustInfoDailyGoalTitle")}>
                <BulletRow>{t(language, "stardustInfoDailyGoalBody")}</BulletRow>
              </InfoSection>

              <InfoSection title={t(language, "stardustInfoUnlockTitle")}>
                <BulletRow>{t(language, "stardustInfoUnlockIntro")}</BulletRow>
                <BulletRow>
                  {t(language, "stardustInfoUnlockTierEasy").replace(
                    "{cost}",
                    formatNumber(language, STAR_COST_EASY),
                  )}
                </BulletRow>
                <BulletRow>
                  {t(language, "stardustInfoUnlockTierMedium").replace(
                    "{cost}",
                    formatNumber(language, STAR_COST_MEDIUM),
                  )}
                </BulletRow>
                <BulletRow>
                  {t(language, "stardustInfoUnlockTierMastery").replace(
                    "{cost}",
                    formatNumber(language, STAR_COST_MASTERY),
                  )}
                </BulletRow>
              </InfoSection>

              <GradientButton
                label={t(language, "stardustInfoClose")}
                onPress={onClose}
                style={styles.button}
                fullWidth={modal.isSheet}
              />
            </ScrollView>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5, 8, 18, 0.62)",
    flex: 1,
  },
  cardWrap: {
    borderColor: colors.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxHeight: "88%",
    overflow: "hidden",
  },
  cardSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  blur: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  blurSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.borderStrong,
    borderRadius: radii.pill,
    height: 4,
    marginTop: spacing.sm,
    width: 40,
  },
  scroll: {
    maxHeight: "100%",
  },
  content: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(232,228,192,0.12)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 56,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionBody: {
    gap: spacing.sm,
  },
  bulletRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  bulletText: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  button: {
    marginTop: spacing.sm,
  },
});
