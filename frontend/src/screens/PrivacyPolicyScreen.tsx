import React, { Fragment } from "react";
import { useRouter } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { getPrivacyPolicyBlocks } from "../features/legal/privacyPolicyContent";
import { t } from "../shared/i18n";
import { LegalDocumentCard } from "../components/legal/LegalDocumentCard";
import { LegalSection } from "../components/legal/LegalSection";
import { LegalDocumentLayout } from "../components/layout/LegalDocumentLayout";
import { SettingsDivider } from "../components/settings/SettingsDivider";

export const PrivacyPolicyScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();
  const blocks = getPrivacyPolicyBlocks(language);

  return (
    <LegalDocumentLayout
      title={t(language, "privacyPolicy")}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
      titleAboveCard
    >
      <LegalDocumentCard>
        {blocks.map((block, index) => (
          <Fragment key={block.title}>
            {index > 0 ? <SettingsDivider /> : null}
            <LegalSection title={block.title}>{block.body}</LegalSection>
          </Fragment>
        ))}
      </LegalDocumentCard>
    </LegalDocumentLayout>
  );
};
