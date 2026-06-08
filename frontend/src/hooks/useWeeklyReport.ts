import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Language, WeeklyReport, WeeklyReportStats } from "../shared/types";
import { personalizeWeeklyReport } from "../shared/weeklyReportPersonalize";

type WeeklyReportRow = {
  id: string;
  user_id: string;
  week_start: string;
  stats_json: WeeklyReportStats;
  report_text: { tr?: string; en?: string };
  fallback_used: boolean;
  created_at: string;
};

const mapRow = (row: WeeklyReportRow): WeeklyReport => ({
  id: row.id,
  userId: row.user_id,
  weekStart: row.week_start,
  stats: row.stats_json,
  reportText: {
    tr: row.report_text?.tr ?? "",
    en: row.report_text?.en ?? "",
  },
  fallbackUsed: row.fallback_used,
  createdAt: row.created_at,
});

export function useWeeklyReport(
  userId: string | undefined,
  language: Language,
  currentUsername?: string | null,
) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) {
      setReport(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_reports")
      .select("id, user_id, week_start, stats_json, report_text, fallback_used, created_at")
      .eq("user_id", userId)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && __DEV__ && !/relation.*weekly_reports|schema cache/i.test(error.message)) {
      console.warn("[useWeeklyReport]", error.message);
    }

    setReport(data ? mapRow(data as WeeklyReportRow) : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const displayReport = useMemo(
    () => (report ? personalizeWeeklyReport(report, currentUsername) : null),
    [currentUsername, report],
  );

  const reportText = displayReport?.reportText[language] ?? null;
  const weekLabel =
    language === "tr"
      ? displayReport?.stats.week_label_tr ?? null
      : displayReport?.stats.week_label_en ?? null;

  return { report: displayReport, reportText, weekLabel, loading, refetch };
}
