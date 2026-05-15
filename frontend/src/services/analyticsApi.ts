import type { AnalyticsSummary } from "../shared/types";

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
