"use client";

import React, { useState } from "react";
import { calculateSalesTax } from "@/lib/tools/calculators/financial";
import { Receipt, Copy, Check } from "lucide-react";

export function SalesTaxTool() {
  const [mode, setMode] = useState<"add_tax" | "extract_tax">("add_tax");
  const [amount, setAmount] = useState(150);
  const [taxRate, setTaxRate] = useState(8.25);
  const [copied, setCopied] = useState(false);

  const res = calculateSalesTax(amount, taxRate, mode);

  const handleCopy = () => {
    navigator.clipboard.writeText(`$${res.grossAmount}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("add_tax")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
            mode === "add_tax"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Add Tax (Price Before Tax)
        </button>
        <button
          type="button"
          onClick={() => setMode("extract_tax")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
            mode === "extract_tax"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Extract Tax (Total Receipt Price)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            {mode === "add_tax" ? "Net Price (Before Tax) $" : "Gross Price (Total with Tax) $"}
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Tax Rate (%)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>
      </div>

      <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              {mode === "add_tax" ? "Total Gross Price" : "Original Pre-Tax Price"}
            </span>
            <div className="text-4xl font-black text-primary font-mono mt-1">
              ${mode === "add_tax" ? res.grossAmount.toFixed(2) : res.netAmount.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border text-center text-xs">
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-muted-foreground block text-[11px]">Net Amount</span>
            <strong className="font-mono text-sm text-foreground mt-0.5 block">
              ${res.netAmount.toFixed(2)}
            </strong>
          </div>
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-muted-foreground block text-[11px]">Tax ({taxRate}%)</span>
            <strong className="font-mono text-sm text-foreground mt-0.5 block">
              ${res.taxAmount.toFixed(2)}
            </strong>
          </div>
          <div className="p-3 bg-card border border-border rounded-xl">
            <span className="text-muted-foreground block text-[11px]">Gross Total</span>
            <strong className="font-mono text-sm text-primary mt-0.5 block">
              ${res.grossAmount.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
