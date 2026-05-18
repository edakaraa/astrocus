import { describe, expect, it } from "vitest";
import { parseGalacticAdviceInput } from "./galacticAdvice";

describe("parseGalacticAdviceInput", () => {
  it("accepts valid payload", () => {
    const input = parseGalacticAdviceInput({
      language: "tr",
      durationMinutes: 25,
      categoryId: "work",
      currentStreak: 2,
      todayTotalMinutes: 40,
      totalStardust: 100,
    });

    expect(input.language).toBe("tr");
    expect(input.durationMinutes).toBe(25);
  });

  it("rejects invalid language", () => {
    expect(() =>
      parseGalacticAdviceInput({
        language: "de",
        durationMinutes: 25,
        categoryId: "work",
        currentStreak: 0,
        todayTotalMinutes: 0,
        totalStardust: 0,
      }),
    ).toThrow();
  });
});
