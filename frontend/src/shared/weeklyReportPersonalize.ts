import type { WeeklyReport } from "./types";

const replaceStoredName = (text: string, storedName: string, currentName: string): string => {
  if (!text || storedName === currentName) {
    return text;
  }
  return text.split(storedName).join(currentName);
};

/** Rapor üretildiğinde kayıtlı isim ile güncel kullanıcı adı farklıysa metni günceller. */
export const personalizeWeeklyReport = (
  report: WeeklyReport,
  currentUsername: string | undefined | null,
): WeeklyReport => {
  const current = currentUsername?.trim();
  if (!current) {
    return report;
  }

  const stored = report.stats.user_name?.trim();
  if (!stored || stored === current) {
    return report;
  }

  return {
    ...report,
    stats: { ...report.stats, user_name: current },
    reportText: {
      tr: replaceStoredName(report.reportText.tr, stored, current),
      en: replaceStoredName(report.reportText.en, stored, current),
    },
  };
};
