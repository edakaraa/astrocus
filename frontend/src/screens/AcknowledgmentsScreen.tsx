import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { AvatarAttribution } from "../components/AvatarAttribution";
import { LegalDocumentLayout, legalDocumentStyles } from "../components/layout/LegalDocumentLayout";
import { AppText } from "../components/ui/AppText";
import theme from "../theme";
import { t } from "../shared/i18n";

export const AcknowledgmentsScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();

  return (
    <LegalDocumentLayout
      title={t(language, "openSourceCredits")}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
    >
      <AppText variant="body" color={theme.colors.textSecondary} style={legalDocumentStyles.intro}>
        {t(language, "openSourceCreditsIntro")}
      </AppText>

      <View style={legalDocumentStyles.blockSpacious}>
        <AppText variant="card" color={theme.colors.accent}>
          {t(language, "creditsAvatarsTitle")}
        </AppText>
        <AvatarAttribution />
      </View>
    </LegalDocumentLayout>
  );
};
