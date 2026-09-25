"use client";

import React, { useState } from "react";
import { calculateAge, AgeResult } from "@/lib/tools/calculators/age";
import { Calendar, Cake, Clock, Heart } from "lucide-react";

export function AgeTool() {
  const [birthStr, setBirthStr] = useState("2000-01-15");
  const [targetStr, setTargetStr] = useState(
    new Date().toISOString().split("T")[0]
  );

  let result: AgeResult | null = null;
  let errorMsg: string | null = null;

  try {
    const bDate = new Date(birthStr + "T00:00:00");
    const tDate = new Date(targetStr + "T00:00:00");
    result = calculateAge(bDate, tDate);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Calculation error";
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Date of Birth</label>
          <input
            type="date"
            value={birthStr}
            onChange={(e) => setBirthStr(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Age as of Date</label>
          <input
            type="date"
            value={targetStr}
            onChange={(e) => setTargetStr(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {errorMsg ? (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {errorMsg}
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Primary Age Card */}
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-2">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Exact Chronological Age
            </span>
            <div className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              {result.years} <span className="text-xl sm:text-2xl font-semibold text-muted-foreground">years</span>{" "}
              {result.months} <span className="text-xl sm:text-2xl font-semibold text-muted-foreground">months</span>{" "}
              {result.days} <span className="text-xl sm:text-2xl font-semibold text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Born on a <strong>{result.dayOfWeekBorn}</strong>
            </p>
          </div>

          {/* Next Birthday & Milestones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-muted/40 border border-border rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium uppercase">Next Birthday</span>
              <p className="text-lg font-bold text-foreground mt-1">
                {result.nextBirthdayDays} {result.nextBirthdayDays === 1 ? "day" : "days"}
              </p>
              <span className="text-[10px] text-muted-foreground">{result.nextBirthdayDayOfWeek}</span>
            </div>

            <div className="p-4 bg-muted/40 border border-border rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Days</span>
              <p className="text-lg font-bold text-foreground mt-1 font-mono">
                {result.totalDays.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground">days lived</span>
            </div>

            <div className="p-4 bg-muted/40 border border-border rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Weeks</span>
              <p className="text-lg font-bold text-foreground mt-1 font-mono">
                {result.totalWeeks.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground">weeks lived</span>
            </div>

            <div className="p-4 bg-muted/40 border border-border rounded-xl">
              <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Hours</span>
              <p className="text-lg font-bold text-foreground mt-1 font-mono">
                {result.totalHours.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground">approx hours</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
