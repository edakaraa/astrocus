import {
  addCalendarDays,
  getLastCompletedWeekMondayKey,
  getWeekDateKeys,
  getWeekMondayKeyForLocalDate,
  getWeeksToProcessForUser,
} from "./weekTimezone.ts";

const assertEqual = (actual: string, expected: string, label: string) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
};

// 2026-06-30 12:00 UTC → Tuesday in Istanbul and UTC
const tuesdayJune30 = new Date("2026-06-30T12:00:00.000Z");

assertEqual(
  getLastCompletedWeekMondayKey("Europe/Istanbul", tuesdayJune30),
  "2026-06-22",
  "Istanbul last completed week on Tue Jun 30",
);

assertEqual(
  getLastCompletedWeekMondayKey("UTC", tuesdayJune30),
  "2026-06-22",
  "UTC last completed week on Tue Jun 30",
);

// 2026-07-06 is Monday in Istanbul — last completed week is Jun 29 – Jul 5
const mondayJuly6Istanbul = new Date("2026-07-06T09:00:00.000Z");
assertEqual(
  getLastCompletedWeekMondayKey("Europe/Istanbul", mondayJuly6Istanbul),
  "2026-06-29",
  "Istanbul last completed week on Mon Jul 6",
);

const weekKeys = getWeekDateKeys("2026-06-22", "Europe/Istanbul");
assertEqual(weekKeys[0], "2026-06-22", "week start");
assertEqual(weekKeys[6], "2026-06-28", "week end");

assertEqual(
  getWeekMondayKeyForLocalDate("2026-06-25", "Europe/Istanbul"),
  "2026-06-22",
  "Wednesday maps to same Monday week",
);

const normalWeeks = getWeeksToProcessForUser("Europe/Istanbul", tuesdayJune30, null, false);
if (normalWeeks.length !== 1 || normalWeeks[0] !== "2026-06-22") {
  throw new Error(`normal cron should only target latest week: ${JSON.stringify(normalWeeks)}`);
}

const explicit = getWeeksToProcessForUser("Europe/Istanbul", tuesdayJune30, "2026-06-15", false);
assertEqual(explicit[0], "2026-06-15", "explicit week_start honored");

assertEqual(
  addCalendarDays("2026-06-22", 7, "Europe/Istanbul"),
  "2026-06-29",
  "add 7 calendar days",
);

console.log("weekTimezone.test.ts: all assertions passed");
