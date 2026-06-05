import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { AvatarAttribution } from "../components/AvatarAttribution";
import { LegalDocumentCard } from "../components/legal/LegalDocumentCard";
import { LegalSection } from "../components/legal/LegalSection";
import { LegalDocumentLayout } from "../components/layout/LegalDocumentLayout";
import { SettingsDivider } from "../components/settings/SettingsDivider";
import { useSettingsSpacing } from "../components/settings/settingsSpacing";
import { t } from "../shared/i18n";

export const AcknowledgmentsScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();
  const spacing = useSettingsSpacing();

  return (
    <LegalDocumentLayout
      title={t(language, "openSourceCredits")}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
      titleAboveCard
    >
      <LegalDocumentCard>
        <LegalSection>{t(language, "openSourceCreditsIntro")}</LegalSection>

        <SettingsDivider />

        <LegalSection title={t(language, "creditsAvatarsTitle")}>
          <View style={{ gap: spacing.contentGap }}>
            <AvatarAttribution />
          </View>
        </LegalSection>
      </LegalDocumentCard>
    </LegalDocumentLayout>
  );
};
