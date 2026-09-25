"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";

export function HashGeneratorTool() {
  const [input, setInput] = useState("OmniTools");
  const [isUppercase, setIsUppercase] = useState(false);
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
  }>({
    sha256: "",
    sha512: "",
    sha384: "",
    sha1: "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  useEffect(() => {
    const compute = async () => {
      if (!input) {
        setHashes({ sha256: "", sha512: "", sha384: "", sha1: "" });
        return;
      }
      const data = new TextEncoder().encode(input);

      const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
        window.crypto.subtle.digest("SHA-256", data),
        window.crypto.subtle.digest("SHA-512", data),
        window.crypto.subtle.digest("SHA-384", data),
        window.crypto.subtle.digest("SHA-1", data),
      ]);

      setHashes({
        sha256: bufferToHex(sha256Buf),
        sha512: bufferToHex(sha512Buf),
        sha384: bufferToHex(sha384Buf),
        sha1: bufferToHex(sha1Buf),
      });
    };

    compute();
  }, [input]);

  const copyHash = (key: string, val: string) => {
    navigator.clipboard.writeText(isUppercase ? val.toUpperCase() : val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Text to Hash</label>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={isUppercase}
              onChange={(e) => setIsUppercase(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>UPPERCASE Hex</span>
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to compute cryptographic hashes..."
          rows={3}
          className="w-full p-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Hashes List */}
      <div className="space-y-3">
        {[
          { key: "sha256", label: "SHA-256", val: hashes.sha256 },
          { key: "sha512", label: "SHA-512", val: hashes.sha512 },
          { key: "sha384", label: "SHA-384", val: hashes.sha384 },
          { key: "sha1", label: "SHA-1", val: hashes.sha1 },
        ].map((h) => {
          const displayVal = isUppercase ? h.val.toUpperCase() : h.val;
          const isCopied = copiedKey === h.key;
          return (
            <div
              key={h.key}
              className="p-4 bg-muted/40 border border-border rounded-xl space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {h.label}
                </span>
                <button
                  onClick={() => copyHash(h.key, h.val)}
                  disabled={!h.val}
                  className="px-2 py-0.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1 transition-colors disabled:opacity-30"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-primary break-all bg-background p-2.5 rounded-lg border border-border/60">
                {displayVal || "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
