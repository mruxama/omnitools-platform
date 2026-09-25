"use client";

import React, { useState } from "react";
import { Copy, Check, Trash2, ArrowLeftRight, UploadCloud } from "lucide-react";

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello from OmniTools! 🚀");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Encode with full UTF-8 support
  const utf8ToBase64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binString);
    } catch {
      throw new Error("Failed to encode UTF-8 text to Base64.");
    }
  };

  // Decode with full UTF-8 support
  const base64ToUtf8 = (base64: string) => {
    try {
      const binString = atob(base64.trim());
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      throw new Error("Invalid Base64 sequence. Please check your input string.");
    }
  };

  let output = "";
  try {
    if (mode === "encode") {
      output = input ? utf8ToBase64(input) : "";
    } else {
      output = input ? base64ToUtf8(input) : "";
    }
  } catch (err) {
    output = "";
  }

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        // Strip data:*;base64, header if desired or keep as pure Base64
        const pureBase64 = res.split(",")[1] || res;
        setInput(pureBase64);
        setMode("decode");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("encode")}
          className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
            mode === "encode"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Text → Base64 (Encode)
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
            mode === "decode"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Base64 → Text (Decode)
        </button>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">
            {mode === "encode" ? "Plain Text to Encode" : "Base64 to Decode"}
          </label>
          <button
            onClick={() => setInput("")}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Type or paste text..." : "Paste Base64 string..."}
          rows={5}
          className="w-full p-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
        />
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Output Result</label>
          {output && (
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Output"}</span>
            </button>
          )}
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Result will appear here..."
          rows={5}
          className="w-full p-3 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none font-mono text-primary"
        />
      </div>
    </div>
  );
}
