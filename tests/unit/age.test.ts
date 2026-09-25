import { describe, it, expect } from "vitest";
import { calculateAge } from "@/lib/tools/calculators/age";

describe("Age Calculator", () => {
  it("calculates exact years, months, and days", () => {
    const birth = new Date(2000, 0, 15); // Jan 15, 2000
    const target = new Date(2025, 0, 15); // Jan 15, 2025
    const res = calculateAge(birth, target);

    expect(res.years).toBe(25);
    expect(res.months).toBe(0);
    expect(res.days).toBe(0);
  });

  it("handles month and day offsets properly", () => {
    const birth = new Date(2000, 0, 15); // Jan 15, 2000
    const target = new Date(2025, 2, 20); // Mar 20, 2025
    const res = calculateAge(birth, target);

    expect(res.years).toBe(25);
    expect(res.months).toBe(2);
    expect(res.days).toBe(5);
  });

  it("throws error for future birth dates", () => {
    const birth = new Date(2030, 0, 1);
    const target = new Date(2025, 0, 1);
    expect(() => calculateAge(birth, target)).toThrow();
  });
});
