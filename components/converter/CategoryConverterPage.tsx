"use client";

import React from "react";
import Link from "next/link";
import {
  CategoryDefinition,
  getAllCategories,
  getFormatsForCategory,
} from "@/lib/converter/categoryRegistry";
import { UniversalConverter } from "./UniversalConverter";
import { StructuredData } from "@/components/seo/StructuredData";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import {
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Table,
  Archive,
  Feather,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CategoryConverterPageProps {
  category: CategoryDefinition;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  document: <FileText className="w-5 h-5" />,
  spreadsheet: <Table className="w-5 h-5" />,
  archive: <Archive className="w-5 h-5" />,
  "vector-fonts": <Feather className="w-5 h-5" />,
};

export function CategoryConverterPage({ category }: CategoryConverterPageProps) {
  const allCategories = getAllCategories();
  const formats = getFormatsForCategory(category);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <StructuredData
        name={`${category.name} — Free In-Browser Tool`}
        description={category.description}
        url={`https://omnitools.app/convert/${category.slug}`}
        category="UtilitiesApplication"
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/convert" className="hover:text-primary transition-colors">
          Convert
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{category.shortName}</span>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        <Link
          href="/convert"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          All Formats
        </Link>
        {allCategories.map((cat) => {
          const isActive = cat.id === category.id;
          return (
            <Link
              key={cat.id}
              href={`/convert/${cat.slug}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.shortName}</span>
            </Link>
          );
        })}
      </div>

      {/* Category Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          {CATEGORY_ICONS[category.id]}
          <span>Dedicated {category.name}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {category.name}
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {category.tagline}
        </p>

        <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground pt-1 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Privacy
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Instant Processing
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            {formats.length} Formats Supported
          </span>
        </div>
      </div>

      {/* Universal Converter pre-configured for this category */}
      <UniversalConverter
        initialInputFormat={category.defaultInput}
        initialOutputFormat={category.defaultOutput}
      />

      {/* Supported Formats in this Category */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>Supported {category.shortName} Formats</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {formats.length} total
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {formats.map((fmt) => (
            <div
              key={fmt.id}
              className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono font-bold text-xs">
                    {fmt.id}
                  </span>
                  <span className="font-semibold text-foreground text-xs">{fmt.displayName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    fmt.status === "AVAILABLE"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : fmt.status === "BETA"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {fmt.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {fmt.description}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground/80 font-mono">
                <span>.{fmt.extensions.join(", .")}</span>
                <span>{fmt.processingMode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Features */}
      <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-foreground">
          Why Use Our Online {category.name}?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {category.features.map((feat, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Pairs for this Category */}
      {category.popularPairs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Popular {category.shortName} Conversions
            </h2>
            <Link
              href="/convert/workflow"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              Multi-Step Workflow
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {category.popularPairs.map((pair) => (
              <Link
                key={`${pair.from}-${pair.to}`}
                href={`/convert/${pair.from}-to-${pair.to}`}
                className="p-3.5 bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-xl transition-all flex items-center justify-between text-xs font-medium group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase font-bold text-primary">{pair.from}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-mono uppercase font-bold text-foreground">{pair.to}</span>
                </div>
                <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                  Convert
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category FAQs */}
      {category.faqs.length > 0 && <FaqAccordion faqs={category.faqs} />}
    </div>
  );
}
