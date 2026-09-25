"use client";

import React, { useState } from "react";
import { calculateCompoundInterest } from "@/lib/tools/calculators/financial";
import { TrendingUp, Info } from "lucide-react";

export function CompoundInterestTool() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [monthlyDeposit, setMonthlyDeposit] = useState(200);
  const [frequency, setFrequency] = useState<"annually" | "semi-annually" | "quarterly" | "monthly" | "daily">("monthly");

  const res = calculateCompoundInterest({
    principal,
    annualRate: rate,
    years,
    monthlyDeposit,
    frequency,
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Initial Investment ($)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Monthly Contribution ($)</label>
          <input
            type="number"
            min={0}
            step={25}
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Estimated Annual Return (%)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Investment Horizon (Years)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-5">
        <div className="text-center">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
            Projected Future Value
          </span>
          <div className="text-4xl sm:text-5xl font-black text-primary font-mono mt-1">
            ${res.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Over {years} years with ${monthlyDeposit}/month recurring contribution
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-center">
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Principal Invested</span>
            <p className="text-base font-bold text-foreground font-mono mt-0.5">
              ${res.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Interest Earned</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              +${res.totalInterestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground">Growth Progression:</span>
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
            {res.breakdown.map((row) => (
              <div
                key={row.year}
                className="flex items-center justify-between p-2 bg-card rounded-lg border border-border/70 font-mono"
              >
                <span>Year {row.year}</span>
                <span className="text-muted-foreground">${row.totalInvested.toLocaleString()} dep</span>
                <span className="font-bold text-foreground">${row.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Returns are mathematical projections assuming a constant annual growth rate. Actual investment returns fluctuate with market performance and asset risk.
        </span>
      </div>
    </div>
  );
}
