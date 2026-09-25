import { describe, it, expect } from "vitest";
import { parsePageRange } from "@/lib/tools/pdf/split";

describe("PDF Page Range Parser", () => {
  it("parses combined ranges and individual pages", () => {
    const pages = parsePageRange("1-3, 5, 8-10", 20);
    expect(pages).toEqual([1, 2, 3, 5, 8, 9, 10]);
  });

  it("handles single page inputs", () => {
    const pages = parsePageRange("4", 10);
    expect(pages).toEqual([4]);
  });

  it("handles whitespace gracefully", () => {
    const pages = parsePageRange("  1 - 2 ,  4  ", 10);
    expect(pages).toEqual([1, 2, 4]);
  });

  it("caps ranges at totalPages", () => {
    const pages = parsePageRange("1-15", 5);
    expect(pages).toEqual([1, 2, 3, 4, 5]);
  });

  it("throws error for invalid syntax or out of bounds", () => {
    expect(() => parsePageRange("abc", 10)).toThrow();
    expect(() => parsePageRange("12", 10)).toThrow();
    expect(() => parsePageRange("5-2", 10)).toThrow();
  });
});
