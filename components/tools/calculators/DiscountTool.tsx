"use client";

import React, { useState } from "react";
import { calculateDiscount } from "@/lib/tools/calculators/discount";
import { Tag, DollarSign, Check, Copy } from "lucide-react";

export function DiscountTool() {
  const [price, setPrice] = useState<number>(100);
  const [discount, setDiscount] = useState<number>(20);
  const [coupon, setCoupon] = useState<number>(5);
  const [tax, setTax] = useState<number>(8);
  const [copied, setCopied] = useState(false);

  const res = calculateDiscount({
    originalPrice: price,
    discountPercentage: discount,
    couponPercentage: coupon,
    taxPercentage: tax,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`$${res.totalPayable}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Original Price ($)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Discount (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Additional Coupon / Promo (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={coupon}
            onChange={(e) => setCoupon(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Sales Tax (%)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>
      </div>

      {/* Result Cards */}
      <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Total Payable Amount
            </span>
            <div className="text-4xl font-black text-primary font-mono mt-1">
              ${res.totalPayable.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Total"}</span>
          </button>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="space-y-2 pt-3 border-t border-border text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Primary Discount ({discount}%):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              -${res.discountAmount.toFixed(2)}
            </span>
          </div>
          {coupon > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Coupon Discount ({coupon}%):</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                -${res.couponAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal After Discounts:</span>
            <span className="font-mono text-foreground">${res.priceAfterDiscount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Estimated Sales Tax ({tax}%):</span>
            <span className="font-mono text-foreground">+${res.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border font-bold text-foreground">
            <span>Total Money Saved:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              ${res.totalSavings.toFixed(2)} ({res.effectiveDiscountPercentage}% off)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
