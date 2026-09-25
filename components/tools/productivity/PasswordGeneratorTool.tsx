"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let charset = "";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+~|}{[]:;?><,.-=";

    if (excludeAmbiguous) {
      charset = charset.replace(/[1lI0O]/g, "");
    }

    if (!charset) {
      setPassword("");
      return;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    setPassword(result);
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate strength
  const getStrength = () => {
    let poolSize = 0;
    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 25;
    const entropy = Math.round(length * Math.log2(Math.max(2, poolSize)));

    if (entropy < 40) return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (entropy < 60) return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (entropy < 80) return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
    return { label: "Very Strong", color: "bg-purple-500", text: "text-purple-500" };
  };

  const strength = getStrength();

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Generated Password Box */}
      <div className="p-5 bg-muted/40 border border-border rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
            Generated Password
          </span>
          <span className={`text-xs font-bold ${strength.text}`}>
            {strength.label} Strength
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl font-mono text-base sm:text-lg font-bold text-foreground tracking-wider focus:outline-none"
          />
          <button
            onClick={generate}
            className="p-3 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Generate new password"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 flex items-center gap-1.5 transition-opacity shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-primary-foreground" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Strength Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${Math.min(100, (length / 32) * 100)}%` }}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 p-5 bg-card border border-border rounded-2xl">
        {/* Length Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-foreground">
            <span>Password Length</span>
            <span className="font-mono text-primary font-bold">{length} characters</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-primary mt-2"
          />
        </div>

        {/* Character Sets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-foreground font-medium">
            <input
              type="checkbox"
              checked={useUpper}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Include Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-foreground font-medium">
            <input
              type="checkbox"
              checked={useLower}
              onChange={(e) => setUseLower(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Include Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-foreground font-medium">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Include Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-foreground font-medium">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Include Symbols (!@#$%)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground sm:col-span-2 pt-1 border-t border-border/60">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Avoid ambiguous characters (1, l, I, 0, O)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
