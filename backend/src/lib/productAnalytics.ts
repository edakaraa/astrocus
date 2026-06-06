import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export const initProductAnalytics = (): void => {
  const apiKey = process.env.POSTHOG_API_KEY?.trim();
  if (!apiKey || client) {
    return;
  }

  const host = process.env.POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  client = new PostHog(apiKey, {
    host,
    flushAt: 10,
    flushInterval: 5_000,
  });
};

export const captureServerEvent = (
  distinctId: string,
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): void => {
  if (!client) {
    return;
  }

  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $lib: "astrocus-api",
    },
  });
};

export const shutdownProductAnalytics = async (): Promise<void> => {
  if (!client) {
    return;
  }
  await client.shutdown();
  client = null;
};
