"use client";

import React, { useState } from "react";
import { calculateLoan } from "@/lib/tools/calculators/financial";
import { Coins, Info } from "lucide-react";

export function LoanTool() {
  const [principal, setPrincipal] = useState(250000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const res = calculateLoan({
    principal,
    annualInterestRate: interestRate,
    termYears: years,
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Loan Amount ($)</label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Interest Rate (Annual %)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Loan Term (Years)</label>
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
            Estimated Monthly Payment
          </span>
          <div className="text-4xl sm:text-5xl font-black text-primary font-mono mt-1">
            ${res.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Principal & Interest over {years} years</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-center">
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Interest</span>
            <p className="text-lg font-bold text-foreground font-mono mt-0.5">
              ${res.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Loan Cost</span>
            <p className="text-lg font-bold text-foreground font-mono mt-0.5">
              ${res.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          <strong>Financial Disclaimer:</strong> Calculations are informational estimates based on a standard fixed-rate formula. Real mortgages and loans may include taxes, insurance, loan origination fees, or private mortgage insurance (PMI).
        </span>
      </div>
    </div>
  );
}
