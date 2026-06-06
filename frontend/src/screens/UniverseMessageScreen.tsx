import React from "react";
import { useRouter } from "expo-router";
import { SubScreenScaffold, SubScreenScrollLayout } from "../components/layout/SubScreenScaffold";
import { SubScreenTopBar } from "../components/layout/TabScreenTopBar";
import { UniverseMessageCard } from "../components/session/UniverseMessageCard";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import { useResponsive } from "../shared/responsive";

export const UniverseMessageScreen = () => {
  const router = useRouter();
  const { language } = useAppContext();
  const { font } = useResponsive();
  const sectionLabelSize = font(10);

  return (
    <SubScreenScaffold>
      <SubScreenScrollLayout>
        <SubScreenTopBar
          title={t(language, "cosmicMessageTitle")}
          onBack={() => router.back()}
          backAccessibilityLabel={t(language, "back")}
        />
        <UniverseMessageCard language={language} sectionLabelSize={sectionLabelSize} />
      </SubScreenScrollLayout>
    </SubScreenScaffold>
  );
};
