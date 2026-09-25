"use client";

import React, { useState } from "react";
import {
  calculatePercentage,
  PercentageMode,
} from "@/lib/tools/calculators/percentage";
import { Copy, Check, Percent, ArrowRight } from "lucide-react";

export function PercentageTool() {
  const [mode, setMode] = useState<PercentageMode>("percent_of_number");
  const [val1, setVal1] = useState<number>(20);
  const [val2, setVal2] = useState<number>(150);
  const [copied, setCopied] = useState(false);

  let output = null;
  let errorMsg = null;

  try {
    output = calculatePercentage(mode, val1, val2);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Calculation error";
  }

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output.result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeLabels: { id: PercentageMode; label: string }[] = [
    { id: "percent_of_number", label: "What is X% of Y?" },
    { id: "is_what_percent", label: "X is what % of Y?" },
    { id: "percent_increase", label: "Increase X by Y%" },
    { id: "percent_decrease", label: "Decrease X by Y%" },
    { id: "percent_difference", label: "% Difference between X & Y" },
    { id: "original_value", label: "X is Y% of what?" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Mode Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {modeLabels.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-colors ${
              mode === m.id
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input Fields */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {mode === "percent_of_number" && "Percentage (X%)"}
              {mode === "is_what_percent" && "Value (X)"}
              {mode === "percent_increase" && "Starting Value (X)"}
              {mode === "percent_decrease" && "Starting Value (X)"}
              {mode === "percent_difference" && "First Value (X)"}
              {mode === "original_value" && "Resulting Value (X)"}
            </label>
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {mode === "percent_of_number" && "Total Number (Y)"}
              {mode === "is_what_percent" && "Total Number (Y)"}
              {mode === "percent_increase" && "Increase By (Y%)"}
              {mode === "percent_decrease" && "Decrease By (Y%)"}
              {mode === "percent_difference" && "Second Value (Y)"}
              {mode === "original_value" && "Percentage (Y%)"}
            </label>
            <input
              type="number"
              value={val2}
              onChange={(e) => setVal2(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
        </div>
      </div>

      {/* Output / Result Box */}
      {errorMsg ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {errorMsg}
        </div>
      ) : output ? (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Result
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1 text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold text-primary font-mono tracking-tight">
            {output.result % 1 === 0 ? output.result : output.result.toFixed(2)}
            {(mode === "is_what_percent" || mode === "percent_difference") && "%"}
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1 text-xs">
            <span className="font-semibold text-foreground">Formula & Solution:</span>
            <p className="font-mono text-muted-foreground">{output.formula}</p>
            <p className="text-muted-foreground mt-1">{output.explanation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
