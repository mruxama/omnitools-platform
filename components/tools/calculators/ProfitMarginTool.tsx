"use client";

import React, { useState } from "react";
import { calculateProfitMargin } from "@/lib/tools/calculators/financial";
import { DollarSign, TrendingUp, Info } from "lucide-react";

export function ProfitMarginTool() {
  const [cost, setCost] = useState(40);
  const [revenue, setRevenue] = useState(100);

  const res = calculateProfitMargin(cost, revenue);

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Item Cost ($)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={cost}
            onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Selling Price ($)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={revenue}
            onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>
      </div>

      {/* Result Metrics */}
      <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Gross Profit</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              ${res.grossProfit.toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Profit Margin</span>
            <p className="text-2xl font-bold text-primary font-mono mt-1">
              {res.profitMarginPercent}%
            </p>
            <span className="text-[10px] text-muted-foreground">Profit / Revenue</span>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Markup</span>
            <p className="text-2xl font-bold text-foreground font-mono mt-1">
              {res.markupPercent}%
            </p>
            <span className="text-[10px] text-muted-foreground">Profit / Cost</span>
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border rounded-xl space-y-1.5 text-xs text-muted-foreground">
          <p>
            <strong>Margin vs Markup:</strong> While Margin describes the percentage of the selling price that is profit, Markup describes the percentage added on top of your original unit cost.
          </p>
        </div>
      </div>
    </div>
  );
}
