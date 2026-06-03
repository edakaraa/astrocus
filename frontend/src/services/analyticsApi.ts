import type { AnalyticsSummary, DailyGoalHistoryDay } from "../shared/types";

const buildUrl = (apiUrl: string, timezone: string) => {
  const base = apiUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ timezone });
  return `${base}/analytics/summary?${params.toString()}`;
};

export async function fetchAnalyticsSummary(apiUrl: string, accessToken: string): Promise<AnalyticsSummary> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(buildUrl(apiUrl, timezone), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `analytics ${response.status}`);
  }

  return response.json() as Promise<AnalyticsSummary>;
}

export async function fetchDailyGoalHistory(
  apiUrl: string,
  accessToken: string,
  days = 30,
): Promise<DailyGoalHistoryDay[]> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const base = apiUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ timezone, days: String(days) });
  const response = await fetch(`${base}/analytics/daily-goals?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `daily-goals ${response.status}`);
  }

  const body = (await response.json()) as { history: DailyGoalHistoryDay[] };
  return body.history ?? [];
}
