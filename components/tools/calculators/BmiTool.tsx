"use client";

import React, { useState } from "react";
import {
  calculateBmiMetric,
  calculateBmiImperial,
  BmiResult,
} from "@/lib/tools/calculators/health";
import { Heart, Info } from "lucide-react";

export function BmiTool() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Metric
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  // Imperial
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weightLbs, setWeightLbs] = useState(154);

  let result: BmiResult | null = null;
  try {
    if (unitSystem === "metric") {
      result = calculateBmiMetric(heightCm, weightKg);
    } else {
      result = calculateBmiImperial(heightFt, heightIn, weightLbs);
    }
  } catch {
    result = null;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Unit switch */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setUnitSystem("metric")}
          className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
            unitSystem === "metric"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Metric (cm, kg)
        </button>
        <button
          onClick={() => setUnitSystem("imperial")}
          className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
            unitSystem === "imperial"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Imperial (feet, inches, lbs)
        </button>
      </div>

      {/* Inputs */}
      {unitSystem === "metric" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Height (cm)</label>
            <input
              type="number"
              min={50}
              max={260}
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Weight (kg)</label>
            <input
              type="number"
              min={20}
              max={400}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Height (Feet)</label>
            <input
              type="number"
              min={2}
              max={8}
              value={heightFt}
              onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Height (Inches)</label>
            <input
              type="number"
              min={0}
              max={11}
              value={heightIn}
              onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Weight (Pounds)</label>
            <input
              type="number"
              min={40}
              max={800}
              value={weightLbs}
              onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-6 bg-muted/40 border border-border rounded-2xl text-center space-y-4">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Your Body Mass Index (BMI)
            </span>
            <div className="text-4xl sm:text-5xl font-black text-foreground font-mono mt-1">
              {result.bmi}
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${result.categoryColor} bg-card border border-border`}>
              {result.category}
            </span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-xs text-muted-foreground max-w-md mx-auto">
            Healthy weight range for your height:{" "}
            <strong className="text-foreground">
              {unitSystem === "metric"
                ? `${result.healthyWeightMinKg} kg - ${result.healthyWeightMaxKg} kg`
                : `${Math.round(result.healthyWeightMinKg * 2.20462)} lbs - ${Math.round(
                    result.healthyWeightMaxKg * 2.20462
                  )} lbs`}
            </strong>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="p-3.5 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          <strong>Informational Disclaimer:</strong> BMI is a general population screening metric based on height and weight. It does not measure body composition, muscle mass, bone density, or individual fitness. Consult a healthcare professional for personalized medical guidance.
        </span>
      </div>
    </div>
  );
}
