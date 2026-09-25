import { describe, it, expect } from "vitest";
import { calculatePercentage } from "@/lib/tools/calculators/percentage";

describe("Percentage Calculator", () => {
  it("calculates percent of a number accurately", () => {
    const res = calculatePercentage("percent_of_number", 20, 150);
    expect(res.result).toBe(30);
  });

  it("calculates what percent X is of Y", () => {
    const res = calculatePercentage("is_what_percent", 25, 200);
    expect(res.result).toBe(12.5);
  });

  it("throws error when dividing by zero in is_what_percent", () => {
    expect(() => calculatePercentage("is_what_percent", 50, 0)).toThrow();
  });

  it("calculates percent increase", () => {
    const res = calculatePercentage("percent_increase", 100, 15);
    expect(res.result).toBe(115);
  });

  it("calculates percent decrease", () => {
    const res = calculatePercentage("percent_decrease", 200, 25);
    expect(res.result).toBe(150);
  });

  it("calculates percentage difference", () => {
    const res = calculatePercentage("percent_difference", 50, 60);
    expect(Number(res.result.toFixed(2))).toBe(18.18);
  });

  it("calculates original value from percentage", () => {
    // 30 is 20% of what? -> 150
    const res = calculatePercentage("original_value", 30, 20);
    expect(res.result).toBe(150);
  });
});
