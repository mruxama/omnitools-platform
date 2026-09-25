"use client";

import React, { useState } from "react";
import { Copy, Check, Trash2, ArrowRight } from "lucide-react";

export function CaseConverterTool() {
  const [text, setText] = useState(
    "OmniTools is the fastest browser-based productivity toolkit."
  );
  const [copied, setCopied] = useState(false);

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/[\s\-_]+/g, "");
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/[\s\-_]+/g, "");
  };

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
  };

  const toKebabCase = (str: string) => {
    return str
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase();
  };

  const applyCase = (type: string) => {
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "title":
        setText(toTitleCase(text));
        break;
      case "sentence":
        setText(toSentenceCase(text));
        break;
      case "camel":
        setText(toCamelCase(text));
        break;
      case "pascal":
        setText(toPascalCase(text));
        break;
      case "snake":
        setText(toSnakeCase(text));
        break;
      case "kebab":
        setText(toKebabCase(text));
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Transformation Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => applyCase("upper")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          UPPERCASE
        </button>
        <button
          onClick={() => applyCase("lower")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          lowercase
        </button>
        <button
          onClick={() => applyCase("title")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          Title Case
        </button>
        <button
          onClick={() => applyCase("sentence")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          Sentence case
        </button>
        <button
          onClick={() => applyCase("camel")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground font-mono transition-colors"
        >
          camelCase
        </button>
        <button
          onClick={() => applyCase("pascal")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground font-mono transition-colors"
        >
          PascalCase
        </button>
        <button
          onClick={() => applyCase("snake")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground font-mono transition-colors"
        >
          snake_case
        </button>
        <button
          onClick={() => applyCase("kebab")}
          className="p-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground font-mono transition-colors"
        >
          kebab-case
        </button>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Content</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1 transition-opacity disabled:opacity-40 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Text"}</span>
            </button>
            <button
              onClick={() => setText("")}
              disabled={!text}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert..."
          rows={8}
          className="w-full p-4 text-sm bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
        />
      </div>
    </div>
  );
}
