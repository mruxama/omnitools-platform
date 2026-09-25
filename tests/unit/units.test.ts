import { describe, it, expect } from "vitest";
import { convertUnits } from "@/lib/tools/calculators/units";

describe("Unit Converter", () => {
  it("converts length correctly", () => {
    // 1 km = 1000 m
    expect(convertUnits("length", 1, "kilometer", "meter")).toBe(1000);
    // 1 mile ~ 1609.344 meters
    expect(convertUnits("length", 1, "mile", "meter")).toBeCloseTo(1609.344, 2);
    // 1 meter to centimeters
    expect(convertUnits("length", 2.5, "meter", "centimeter")).toBe(250);
  });

  it("converts temperature accurately across Celsius, Fahrenheit, and Kelvin", () => {
    // 0 C = 32 F
    expect(convertUnits("temperature", 0, "celsius", "fahrenheit")).toBe(32);
    // 100 C = 212 F
    expect(convertUnits("temperature", 100, "celsius", "fahrenheit")).toBe(212);
    // 0 C = 273.15 K
    expect(convertUnits("temperature", 0, "celsius", "kelvin")).toBeCloseTo(273.15, 2);
  });

  it("converts digital storage correctly", () => {
    // 1 GB = 1000 MB (decimal)
    expect(convertUnits("digital", 1, "gigabyte", "megabyte")).toBe(1000);
    // 1 GiB = 1024 MiB (binary)
    expect(convertUnits("digital", 1, "gibibyte", "mebibyte")).toBe(1024);
  });

  it("converts weight accurately", () => {
    // 1 kg = 1000 g
    expect(convertUnits("weight", 1, "kilogram", "gram")).toBe(1000);
    // 1 lb = 0.45359237 kg
    expect(convertUnits("weight", 1, "pound", "kilogram")).toBeCloseTo(0.45359, 3);
  });
});
