import { getApiUrl } from "../shared/config";
import type { Language } from "../shared/types";

export type GalacticAdviceRequest = {
  language: Language;
  durationMinutes: number;
  categoryId: string;
  currentStreak: number;
  todayTotalMinutes: number;
  totalStardust: number;
};

export const fetchGalacticAdvice = async (
  accessToken: string,
  input: GalacticAdviceRequest,
): Promise<string> => {
  const base = getApiUrl();
  if (!base) {
    throw new Error("API URL not configured");
  }

  const response = await fetch(`${base}/ai/galactic-advice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Galactic advice failed");
  }

  const data = (await response.json()) as { advice?: string };
  return data.advice?.trim() ?? "";
};

