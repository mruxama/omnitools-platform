"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, Sparkles, AlertCircle, Info, Lightbulb } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={"prose prose-neutral dark:prose-invert max-w-none space-y-5 text-foreground/90 " + className}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

interface Block {
  type: "heading" | "paragraph" | "code" | "blockquote" | "list" | "table" | "hr" | "converter-cta";
  level?: number;
  lang?: string;
  items?: string[];
  ordered?: boolean;
  tableData?: { headers: string[]; rows: string[][] };
  text?: string;
  ctaPair?: { from: string; to: string; label?: string };
}

function parseMarkdownBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        type: "code",
        lang: lang || "text",
        text: codeLines.join("\n"),
      });
      continue;
    }

    // Horizontal Rule
    if (/^(\*{3}|---|___)$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Contextual Converter CTA: {{converter:jpg-to-webp}} or {{converter:pdf-to-docx:Convert PDF to Word}}
    const ctaMatch = line.trim().match(/^\{\{converter:([a-z0-9]+)-to-([a-z0-9]+)(?::([^}]+))?\}\}$/i);
    if (ctaMatch) {
      blocks.push({
        type: "converter-cta",
        ctaPair: {
          from: ctaMatch[1].toLowerCase(),
          to: ctaMatch[2].toLowerCase(),
          label: ctaMatch[3] || ("Convert " + ctaMatch[1].toUpperCase() + " to " + ctaMatch[2].toUpperCase()),
        },
      });
      i++;
      continue;
    }

    // Headings: #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Blockquote: > text
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        text: quoteLines.join("\n"),
      });
      continue;
    }

    // Markdown Table: | col 1 | col 2 |
    if (line.trim().startsWith("|") && line.trim().endsWith("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const parseCells = (rowStr: string) =>
        rowStr
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseCells(lines[i]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        rows.push(parseCells(lines[i]));
        i++;
      }
      blocks.push({
        type: "table",
        tableData: { headers, rows },
      });
      continue;
    }

    // Lists: - item or 1. item
    const isBullet = /^[-*]\s+/.test(line.trim());
    const isOrdered = /^\d+\.\s+/.test(line.trim());
    if (isBullet || isOrdered) {
      const items: string[] = [];
      const ordered = isOrdered;
      while (
        i < lines.length &&
        ((ordered && /^\d+\.\s+/.test(lines[i].trim())) || (!ordered && /^[-*]\s+/.test(lines[i].trim())))
      ) {
        const itemText = lines[i].trim().replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, "");
        items.push(itemText);
        i++;
      }
      blocks.push({
        type: "list",
        ordered,
        items,
      });
      continue;
    }

    // Default: Paragraph
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].trim().startsWith(">") &&
      !/^(\*{3}|---|___)$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("{{converter:") &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({
      type: "paragraph",
      text: pLines.join(" "),
    });
  }

  return blocks;
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "heading": {
      const slug = block.text?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (block.level === 1) {
        return (
          <h1 key={key} id={slug} className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight pt-4 pb-1 scroll-mt-20">
            {renderInline(block.text || "")}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 key={key} id={slug} className="text-xl sm:text-2xl font-bold text-foreground tracking-tight pt-5 pb-1 border-b border-border/40 scroll-mt-20">
            {renderInline(block.text || "")}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 key={key} id={slug} className="text-lg sm:text-xl font-semibold text-foreground tracking-tight pt-3 scroll-mt-20">
            {renderInline(block.text || "")}
          </h3>
        );
      }
      return (
        <h4 key={key} id={slug} className="text-base font-semibold text-foreground tracking-tight pt-2 scroll-mt-20">
          {renderInline(block.text || "")}
        </h4>
      );
    }

    case "paragraph":
      return (
        <p key={key} className="text-base sm:text-lg leading-relaxed text-muted-foreground">
          {renderInline(block.text || "")}
        </p>
      );

    case "code":
      return <CodeBlock key={key} code={block.text || ""} lang={block.lang} />;

    case "blockquote": {
      const rawText = block.text || "";
      const isTip = rawText.startsWith("[!TIP]");
      const isWarning = rawText.startsWith("[!WARNING]");
      const isNote = rawText.startsWith("[!NOTE]") || rawText.startsWith("[!IMPORTANT]");
      const cleanText = rawText.replace(/^\[!(TIP|WARNING|NOTE|IMPORTANT)\]\s*/i, "");

      if (isTip) {
        return (
          <div key={key} className="my-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3 text-emerald-900 dark:text-emerald-200">
            <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-sm sm:text-base leading-relaxed">{renderInline(cleanText)}</div>
          </div>
        );
      }
      if (isWarning) {
        return (
          <div key={key} className="my-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex gap-3 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm sm:text-base leading-relaxed">{renderInline(cleanText)}</div>
          </div>
        );
      }
      if (isNote) {
        return (
          <div key={key} className="my-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex gap-3 text-foreground">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm sm:text-base leading-relaxed">{renderInline(cleanText)}</div>
          </div>
        );
      }

      return (
        <blockquote key={key} className="border-l-4 border-primary/60 pl-4 py-1.5 my-4 italic text-muted-foreground bg-muted/20 rounded-r-lg">
          <p className="leading-relaxed">{renderInline(rawText)}</p>
        </blockquote>
      );
    }

    case "list":
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal list-inside space-y-2 text-muted-foreground text-base sm:text-lg pl-2">
            {block.items?.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="list-disc list-inside space-y-2 text-muted-foreground text-base sm:text-lg pl-2">
          {block.items?.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div key={key} className="overflow-x-auto my-6 rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-foreground font-semibold">
              <tr>
                {block.tableData?.headers.map((h, idx) => (
                  <th key={idx} className="p-3 whitespace-nowrap">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {block.tableData?.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-muted-foreground">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return <hr key={key} className="my-8 border-border" />;

    case "converter-cta":
      if (!block.ctaPair) return null;
      return (
        <div
          key={key}
          className="my-8 p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Client-Side Tool</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">
              {block.ctaPair.label}
            </h4>
            <p className="text-xs text-muted-foreground">
              Free, secure, 100% private in-browser file transformation. No uploads required.
            </p>
          </div>
          <Link
            href={`/convert/${block.ctaPair.from}-to-${block.ctaPair.to}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shrink-0"
          >
            <span>Launch Converter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );

    default:
      return null;
  }
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-border bg-card/80 font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border text-muted-foreground text-xs">
        <span className="font-semibold uppercase tracking-wider">{lang || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/60 transition-colors text-xs text-muted-foreground hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-foreground/90 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm bg-muted text-primary font-semibold border border-border/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="italic text-foreground">
          {part.slice(1, -1)}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const isExternal = linkMatch[2].startsWith("http");
      if (isExternal) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return (
        <Link
          key={index}
          href={linkMatch[2]}
          className="text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {linkMatch[1]}
        </Link>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
