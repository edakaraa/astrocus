import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFocusSessionCelebrationBody,
  onFocusSessionTimerCompleted,
} from "./focusSessionNotifications";
import type { SessionCompletionSnapshot } from "./sessionTimer";

const sampleSnapshot = (overrides?: Partial<SessionCompletionSnapshot>): SessionCompletionSnapshot => ({
  plannedDurationMinutes: 15,
  focusedSeconds: 15 * 60,
  categoryId: "general",
  pauseCount: 0,
  startedAt: new Date("2026-06-08T10:00:00.000Z").toISOString(),
  completedAt: new Date("2026-06-08T10:15:00.000Z").toISOString(),
  completedNaturally: true,
  ...overrides,
});

describe("focusSessionNotifications", () => {
  it("stops ongoing notification and presents celebration when timer completes", async () => {
    const calls: string[] = [];
    let presented: { durationMinutes: number; stardustEarned: number } | null = null;

    await onFocusSessionTimerCompleted(sampleSnapshot(), "tr", 150, {
      clearOngoingNotificationInterval: () => {
        calls.push("clearInterval");
      },
      stopFocusSessionNotification: async () => {
        calls.push("stopOngoing");
      },
      cancelFocusSessionCompletedNotification: async () => {
        calls.push("cancelScheduledComplete");
      },
      presentFocusSessionCompletedNotification: async (input) => {
        calls.push("presentCelebration");
        presented = input;
      },
    });

    assert.deepEqual(calls, [
      "clearInterval",
      "stopOngoing",
      "cancelScheduledComplete",
      "presentCelebration",
    ]);
    assert.deepEqual(presented, { durationMinutes: 15, stardustEarned: 150, language: "tr" });
  });

  it("caps celebration duration at plan for RPC-style snapshots", async () => {
    let presented: { durationMinutes: number; stardustEarned: number } | null = null;

    await onFocusSessionTimerCompleted(
      sampleSnapshot({ focusedSeconds: 20 * 60, completedNaturally: false }),
      "tr",
      150,
      {
        clearOngoingNotificationInterval: () => undefined,
        stopFocusSessionNotification: async () => undefined,
        cancelFocusSessionCompletedNotification: async () => undefined,
        presentFocusSessionCompletedNotification: async (input) => {
          presented = input;
        },
      },
    );

    assert.equal(presented?.durationMinutes, 15);
  });

  it("formats celebration body with duration and stardust", () => {
    assert.equal(
      buildFocusSessionCelebrationBody(15, 150, "tr"),
      "15 dk odaklandın, 150 ✦ kazandın",
    );
    assert.equal(
      buildFocusSessionCelebrationBody(15, 150, "en"),
      "You focused for 15 min and earned 150 ✦",
    );
  });
});
