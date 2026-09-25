"use client";

import React, { useState } from "react";
import { Copy, Check, Trash2, FileCheck, Clock, Mic } from "lucide-react";

export function WordCounterTool() {
  const [text, setText] = useState(
    "OmniTools provides fast, private, and free utilities designed for students, freelancers, and professionals. All file and text processing executes entirely within your browser for absolute data confidentiality."
  );
  const [copied, setCopied] = useState(false);

  // Compute text statistics
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s+/g, "").length;
  const sentences = trimmed ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0;
  const paragraphs = trimmed ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

  // Reading time at ~200 wpm
  const readingTimeMin = Math.ceil(words / 200);
  // Speaking time at ~130 wpm
  const speakingTimeMin = Math.ceil(words / 130);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 bg-muted/40 border border-border rounded-xl">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Words</span>
          <p className="text-2xl font-black text-primary font-mono mt-0.5">{words}</p>
        </div>

        <div className="p-3.5 bg-muted/40 border border-border rounded-xl">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Characters</span>
          <p className="text-2xl font-black text-foreground font-mono mt-0.5">{charsWithSpaces}</p>
          <span className="text-[10px] text-muted-foreground">({charsWithoutSpaces} no spaces)</span>
        </div>

        <div className="p-3.5 bg-muted/40 border border-border rounded-xl">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Sentences</span>
          <p className="text-2xl font-black text-foreground font-mono mt-0.5">{sentences}</p>
        </div>

        <div className="p-3.5 bg-muted/40 border border-border rounded-xl">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Paragraphs</span>
          <p className="text-2xl font-black text-foreground font-mono mt-0.5">{paragraphs}</p>
        </div>
      </div>

      {/* Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Text Input</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!text}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1 transition-colors disabled:opacity-40"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => setText("")}
              disabled={!text}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
              title="Clear text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here for instant analysis..."
          rows={10}
          className="w-full p-4 text-sm bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
        />
      </div>

      {/* Reading / Speaking Time Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Reading time: <strong className="text-foreground">{readingTimeMin} min</strong> (at 200 WPM)</span>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          <span>Speaking time: <strong className="text-foreground">{speakingTimeMin} min</strong> (at 130 WPM)</span>
        </div>
      </div>
    </div>
  );
}
