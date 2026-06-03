import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { getPrivacyPolicyBlocks } from "../features/legal/privacyPolicyContent";
import { t } from "../shared/i18n";
import { AppText } from "../components/ui/AppText";
import { LegalDocumentLayout, legalDocumentStyles } from "../components/layout/LegalDocumentLayout";
import theme from "../theme";

export const PrivacyPolicyScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();
  const blocks = getPrivacyPolicyBlocks(language);

  return (
    <LegalDocumentLayout
      title={t(language, "privacyPolicy")}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
    >
      {blocks.map((block) => (
        <View key={block.title} style={legalDocumentStyles.block}>
          <AppText variant="card" color={theme.colors.accent}>
            {block.title}
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            {block.body}
          </AppText>
        </View>
      ))}
    </LegalDocumentLayout>
  );
};
