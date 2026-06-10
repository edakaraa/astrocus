import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCompletionSnapshot,
  completeFocusTimer,
  createIdleFocusTimerState,
  freezeFocusTimer,
  heartbeatTick,
  isFocusTimerFrozenForAway,
  materializeFocusTimer,
  snapshotFocusedMinutes,
  startFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  syncFocusTimer,
  unfreezeFocusTimer,
  type SessionCompletionSnapshot,
} from "./sessionTimer";

const start15 = (t0: number) =>
  startFocusSession(
    { ...createIdleFocusTimerState(15), selectedDurationMinutes: 15 },
    t0,
  );

describe("sessionTimer", () => {
  it("counts exactly 15 minutes of active focus for a 15-minute plan", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    for (let sec = 1; sec <= 15 * 60; sec += 1) {
      state = heartbeatTick(state, t0 + sec * 1000);
    }

    assert.equal(state.status, "completed");
    assert.equal(state.focusedSeconds, 15 * 60);
    assert.equal(state.remainingSeconds, 0);

    const snapshot = buildCompletionSnapshot(state, t0 + 15 * 60 * 1000, true);
    assert.ok(snapshot);
    assert.equal(snapshotFocusedMinutes(snapshot), 15);
    assert.equal(snapshot.focusedSeconds, 15 * 60);
  });

  it("does not double-count when heartbeat materializes every second", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    for (let sec = 1; sec <= 120; sec += 1) {
      const next = heartbeatTick(state, t0 + sec * 1000);
      assert.equal(next.focusedSeconds, sec);
      assert.equal(next.accumulatedFocusSeconds, sec);
      state = next;
    }

    assert.equal(state.focusedSeconds, 120);
  });

  it("does not count app-switch away time toward focus", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    state = heartbeatTick(state, t0 + 5 * 60 * 1000);
    assert.equal(state.focusedSeconds, 5 * 60);

    state = freezeFocusTimer(state, t0 + 5 * 60 * 1000);
    const awayMs = 10 * 60 * 1000;
    const syncedWhileAway = syncFocusTimer(state, t0 + 5 * 60 * 1000 + awayMs);
    assert.equal(syncedWhileAway.focusedSeconds, 5 * 60);

    const returnMs = t0 + 5 * 60 * 1000 + awayMs;
    state = unfreezeFocusTimer(state, returnMs);
    state = heartbeatTick(state, returnMs + 10 * 60 * 1000);
    assert.equal(state.status, "completed");
    assert.equal(state.focusedSeconds, 15 * 60);
  });

  it("pauses and resumes without losing or duplicating focus time", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    state = heartbeatTick(state, t0 + 3 * 60 * 1000);
    state = pauseFocusSession(state, t0 + 3 * 60 * 1000);
    assert.equal(state.focusedSeconds, 3 * 60);

    state = resumeFocusSession(state, t0 + 8 * 60 * 1000);
    state = heartbeatTick(state, t0 + 20 * 60 * 1000);

    assert.equal(state.status, "completed");
    assert.equal(state.focusedSeconds, 15 * 60);
  });

  it("caps saved minutes at the planned duration on early cancel", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);
    state = heartbeatTick(state, t0 + 10 * 60 * 1000);

    const snapshot = buildCompletionSnapshot(state, t0 + 10 * 60 * 1000, false);
    assert.ok(snapshot);
    assert.equal(snapshotFocusedMinutes(snapshot), 10);
  });

  it("records completion time at focus end, not a late sync instant", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);
    state = completeFocusTimer(syncFocusTimer(state, t0 + 15 * 60 * 1000), t0 + 30 * 60 * 1000);

    const snapshot = buildCompletionSnapshot(state, t0 + 30 * 60 * 1000, true);
    assert.ok(snapshot);
    assert.equal(new Date(snapshot.completedAt).getTime(), t0 + 15 * 60 * 1000);
    assert.equal(snapshotFocusedMinutes(snapshot), 15);
  });

  it("materialize after foreground sync prevents segment overlap", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    const atFive = syncFocusTimer(state, t0 + 5 * 60 * 1000);
    state = materializeFocusTimer(atFive, t0 + 5 * 60 * 1000);
    state = materializeFocusTimer(syncFocusTimer(state, t0 + 10 * 60 * 1000), t0 + 10 * 60 * 1000);

    assert.equal(state.focusedSeconds, 10 * 60);
  });

  it("caps RPC duration at plan when user stays past the countdown (15 plan, 20 min wall)", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);

    for (let sec = 1; sec <= 15 * 60; sec += 1) {
      state = heartbeatTick(state, t0 + sec * 1000);
    }
    assert.equal(state.status, "completed");

    const snapshot = buildCompletionSnapshot(state, t0 + 20 * 60 * 1000, true);
    assert.ok(snapshot);
    assert.equal(snapshot.focusedSeconds, 15 * 60);
    assert.equal(snapshotFocusedMinutes(snapshot), 15);

    const runningPastPlan = syncFocusTimer(start15(t0), t0 + 20 * 60 * 1000);
    assert.equal(runningPastPlan.focusedSeconds, 15 * 60);
    assert.equal(snapshotFocusedMinutes({ ...snapshot, focusedSeconds: 20 * 60 }), 15);
  });

  it("snapshotFocusedMinutes caps even if focusedSeconds exceeds plan in snapshot", () => {
    const snapshot: SessionCompletionSnapshot = {
      plannedDurationMinutes: 15,
      focusedSeconds: 20 * 60,
      categoryId: "general",
      pauseCount: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completedNaturally: false,
    };
    assert.equal(snapshotFocusedMinutes(snapshot), 15);
  });

  it("freeze and unfreeze are idempotent (no double-freeze / double-unfreeze drift)", () => {
    const t0 = 1_700_000_000_000;
    let state = start15(t0);
    state = heartbeatTick(state, t0 + 60 * 1000);

    const frozenOnce = freezeFocusTimer(state, t0 + 60 * 1000);
    const frozenTwice = freezeFocusTimer(frozenOnce, t0 + 120 * 1000);
    assert.equal(frozenTwice.focusedSeconds, 60);
    assert.ok(isFocusTimerFrozenForAway(frozenTwice));

    const unfrozenOnce = unfreezeFocusTimer(frozenTwice, t0 + 180 * 1000);
    const unfrozenTwice = unfreezeFocusTimer(unfrozenOnce, t0 + 240 * 1000);
    assert.equal(unfrozenTwice.runningSinceMs, t0 + 180 * 1000);

    state = heartbeatTick(unfrozenTwice, t0 + 240 * 1000);
    assert.equal(state.focusedSeconds, 120);
  });
});
