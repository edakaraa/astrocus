import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import {
  BACKGROUND_TOLERANCE_SECONDS,
  WARNING_THRESHOLD_SECONDS,
} from "../../shared/constants";
import {
  clearFocusBackgroundAwayTimeouts,
  scheduleFocusBackgroundAwayTimeouts,
  shouldHaveFiredAwayWarning,
  shouldResumeAwaySession,
} from "./focusBackgroundAway";

describe("focusBackgroundAway", () => {
  it("fires warning at 10s and fail at 20s away", () => {
    mock.timers.enable({ apis: ["setTimeout"] });

    const events: string[] = [];
    const handles = scheduleFocusBackgroundAwayTimeouts({
      onWarning: () => events.push("warning"),
      onFail: () => events.push("fail"),
    });

    assert.deepEqual(events, []);

    mock.timers.tick(WARNING_THRESHOLD_SECONDS * 1000);
    assert.deepEqual(events, ["warning"]);

    mock.timers.tick(
      (BACKGROUND_TOLERANCE_SECONDS - WARNING_THRESHOLD_SECONDS) * 1000,
    );
    assert.deepEqual(events, ["warning", "fail"]);

    clearFocusBackgroundAwayTimeouts(handles);
    mock.timers.reset();
  });

  it("15s foreground return resumes session (under 20s fail threshold)", () => {
    assert.equal(shouldResumeAwaySession(15), true);
    assert.equal(shouldHaveFiredAwayWarning(15), true);
  });

  it("20s away should fail, not resume", () => {
    assert.equal(shouldResumeAwaySession(20), false);
    assert.equal(shouldHaveFiredAwayWarning(20), true);
  });

  it("clearing away timeouts prevents pending warning and fail", () => {
    mock.timers.enable({ apis: ["setTimeout"] });

    const events: string[] = [];
    const handles = scheduleFocusBackgroundAwayTimeouts({
      onWarning: () => events.push("warning"),
      onFail: () => events.push("fail"),
    });

    clearFocusBackgroundAwayTimeouts(handles);
    mock.timers.tick(BACKGROUND_TOLERANCE_SECONDS * 1000);
    assert.deepEqual(events, []);

    mock.timers.reset();
  });

  it("away → lock transition clears pending timeouts (simulated)", () => {
    mock.timers.enable({ apis: ["setTimeout"] });

    const events: string[] = [];
    const handles = scheduleFocusBackgroundAwayTimeouts({
      onWarning: () => events.push("warning"),
      onFail: () => events.push("fail"),
    });

    mock.timers.tick(5_000);
    clearFocusBackgroundAwayTimeouts(handles);
    mock.timers.tick(BACKGROUND_TOLERANCE_SECONDS * 1000);
    assert.deepEqual(events, []);

    mock.timers.reset();
  });
});
