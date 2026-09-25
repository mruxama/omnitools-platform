"use client";

import React, { useState } from "react";
import {
  calculateDateDifference,
  addDurationToDate,
  DateDiffResult,
} from "@/lib/tools/calculators/date";
import { CalendarDays, Plus, Minus, ArrowRight } from "lucide-react";

export function DateTool() {
  const [activeTab, setActiveTab] = useState<"diff" | "add">("diff");

  // Difference inputs
  const [startDateStr, setStartDateStr] = useState("2025-01-01");
  const [endDateStr, setEndDateStr] = useState("2025-12-31");
  const [inclusive, setInclusive] = useState(false);

  // Add / Subtract inputs
  const [baseDateStr, setBaseDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState(30);
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [unit, setUnit] = useState<"days" | "weeks" | "months" | "years">("days");

  const diffResult: DateDiffResult = calculateDateDifference(
    new Date(startDateStr + "T00:00:00"),
    new Date(endDateStr + "T00:00:00"),
    inclusive
  );

  const calculatedTargetDate = addDurationToDate(
    new Date(baseDateStr + "T00:00:00"),
    direction === "add" ? amount : -amount,
    unit
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Mode switcher */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab("diff")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
            activeTab === "diff"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Days Between Two Dates
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
            activeTab === "add"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Add / Subtract Time to Date
        </button>
      </div>

      {activeTab === "diff" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Start Date</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">End Date</label>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={inclusive}
              onChange={(e) => setInclusive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Include end day in calculation (+1 day)</span>
          </label>

          {/* Results Grid */}
          <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-4">
            <div className="text-center">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Calendar Duration
              </span>
              <div className="text-4xl font-extrabold text-primary font-mono mt-1">
                {diffResult.calendarDays} {diffResult.calendarDays === 1 ? "Day" : "Days"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Equivalent to {diffResult.weeks} weeks or approx {diffResult.months} months
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs px-2">
              <span className="text-muted-foreground">Working (Business) Days:</span>
              <strong className="text-foreground text-sm font-mono">
                {diffResult.workingDays} working days (excluding weekends)
              </strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === "add" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Start Date</label>
              <input
                type="date"
                value={baseDateStr}
                onChange={(e) => setBaseDateStr(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Operation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("add")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    direction === "add"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  + Add Time
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("subtract")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    direction === "subtract"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  - Subtract Time
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Quantity</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="p-6 bg-muted/40 border border-border rounded-2xl text-center space-y-1">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Resulting Date
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {calculatedTargetDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
