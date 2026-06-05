import React, { type PropsWithChildren } from "react";
import { useMemo } from "react";
import { Card } from "../ui/Card";
import { useSettingsSpacing } from "../settings/settingsSpacing";

/** Grouped card shell for legal / policy scroll content — matches settings card rhythm. */
export const LegalDocumentCard: React.FC<PropsWithChildren> = ({ children }) => {
  const spacing = useSettingsSpacing();

  const cardStyle = useMemo(
    () => ({
      gap: 0,
      paddingHorizontal: spacing.cardPaddingX,
      paddingVertical: spacing.cardPaddingY,
    }),
    [spacing.cardPaddingX, spacing.cardPaddingY],
  );

  return (
    <Card padding={0} style={cardStyle}>
      {children}
    </Card>
  );
};
