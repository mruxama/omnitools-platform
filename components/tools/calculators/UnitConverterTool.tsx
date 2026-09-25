"use client";

import React, { useState, useMemo } from "react";
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnits,
} from "@/lib/tools/calculators/units";
import { ArrowLeftRight, Copy, Check } from "lucide-react";

export function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [inputValue, setInputValue] = useState<number>(100);
  const [precision, setPrecision] = useState<number>(4);
  const [copied, setCopied] = useState(false);

  const currentCat = UNIT_CATEGORIES[category];
  const unitKeys = Object.keys(currentCat.units);

  const [fromUnit, setFromUnit] = useState<string>(unitKeys[0]);
  const [toUnit, setToUnit] = useState<string>(unitKeys[1] || unitKeys[0]);

  // When category changes, reset units to available keys
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const newUnitKeys = Object.keys(UNIT_CATEGORIES[newCat].units);
    setFromUnit(newUnitKeys[0]);
    setToUnit(newUnitKeys[1] || newUnitKeys[0]);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const convertedValue = useMemo(() => {
    try {
      const res = convertUnits(category, inputValue, fromUnit, toUnit);
      return Number(res.toFixed(precision));
    } catch {
      return 0;
    }
  }, [category, inputValue, fromUnit, toUnit, precision]);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedValue.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-semibold">
        {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((catKey) => {
          const cat = UNIT_CATEGORIES[catKey];
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(catKey)}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
                category === catKey
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Conversion Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center p-5 bg-muted/40 border border-border rounded-2xl">
        {/* From Section */}
        <div className="sm:col-span-3 space-y-2">
          <label className="text-xs font-semibold text-foreground">From</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>
                {currentCat.units[k].name} ({currentCat.units[k].symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="sm:col-span-1 flex justify-center py-2 sm:py-0">
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground hover:text-primary transition-colors shadow-xs"
            title="Swap units"
            aria-label="Swap units"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="sm:col-span-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground">To</label>
            <button
              onClick={handleCopy}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-xl text-primary font-bold truncate">
            {convertedValue}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>
                {currentCat.units[k].name} ({currentCat.units[k].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Precision and Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
        <span>
          1 {currentCat.units[fromUnit]?.name} ={" "}
          <strong className="text-foreground font-mono">
            {convertUnits(category, 1, fromUnit, toUnit).toFixed(precision)}{" "}
            {currentCat.units[toUnit]?.symbol}
          </strong>
        </span>

        <div className="flex items-center gap-2">
          <span>Decimals:</span>
          <select
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
            className="px-2 py-1 text-xs bg-background border border-border rounded-lg"
          >
            {[0, 2, 4, 6, 8].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
