export const STORAGE_KEYS = {
  authToken: "astrocus.authToken",
  language: "astrocus.language",
  onboardingSeen: "astrocus.onboardingSeen",
  pendingSessions: "astrocus.pendingSessions",
  analyticsEvents: "astrocus.analyticsEvents",
  demoAuthPayload: "astrocus.demoAuthPayload",
  oauthPending: "astrocus.oauthPending",
  /** Google OAuth code/hash — Expo Go Metro reload sonrası tamamlama */
  oauthReturnUrl: "astrocus.oauthReturnUrl",
  dailyGoalMinutes: "dailyGoalMinutes",
  /** Local calendar day (en-CA) when the user last confirmed today's goal. */
  dailyGoalChosenDate: "astrocus.dailyGoalChosenDate",
  dailyGoalRewardDate: "astrocus.dailyGoalRewardDate",
} as const;
