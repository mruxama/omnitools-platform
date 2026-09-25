import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllFormats, getFormatById } from "@/lib/converter/formatRegistry";
import { getSupportedOutputs } from "@/lib/converter/compatibilityMatrix";
import { StructuredData } from "@/components/seo/StructuredData";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface PageProps {
  params: {
    format: string;
  };
}

export function generateStaticParams() {
  const formats = getAllFormats();
  return formats.map((f) => ({
    format: f.id,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const format = getFormatById(params.format);
  if (!format) return {};

  const title = `${format.displayName} (${format.id.toUpperCase()}) Format Guide & Online Converters`;
  const description = `Complete technical specifications for ${format.displayName} (.${format.extensions.join(", .")}). Learn how to open, compress, and convert ${format.id.toUpperCase()} online for free.`;

  return {
    title,
    description,
    keywords: [
      `${format.id} format`,
      `what is ${format.id}`,
      `how to open ${format.id}`,
      `convert ${format.id}`,
      `${format.displayName}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://omnitools.app/formats/${format.id}`,
    },
  };
}

export default function FormatKnowledgePage({ params }: PageProps) {
  const format = getFormatById(params.format);
  if (!format) notFound();

  const allFormats = getAllFormats();

  // 1. Supported conversions FROM this format
  const supportedOutputs = getSupportedOutputs(format.id);

  // 2. Supported conversions TO this format
  const supportedInputs = allFormats.filter((source) => {
    const targets = getSupportedOutputs(source.id);
    return targets.some((t) => t.id === format.id);
  });

  const faqs = [
    {
      question: `What is a .${format.extensions[0] || format.id} file?`,
      answer: format.description,
    },
    {
      question: `How do I open a ${format.id.toUpperCase()} file?`,
      answer: `Most modern operating systems and web browsers can open ${format.displayName} files natively or with standard viewing software. You can also convert it to more ubiquitous formats like PDF, WebP, or TXT directly using our free online converter.`,
    },
    {
      question: `Can I convert ${format.id.toUpperCase()} files without software installation?`,
      answer: `Yes! OmniTools allows you to convert ${format.id.toUpperCase()} files directly inside your browser without installing third-party apps or uploading confidential files to remote servers.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <StructuredData
        name={`${format.displayName} Format Guide`}
        description={format.description}
        url={`https://omnitools.app/formats/${format.id}`}
        category="TechArticle"
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
        <span className="text-foreground font-medium uppercase">{format.id} Knowledge Base</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <FileCode className="w-3.5 h-3.5" />
          <span>File Format Technical Reference</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          What is a <span className="uppercase text-primary">.{format.id}</span> File?
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {format.description}
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/convert/${format.category.toLowerCase()}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>Open {format.category.toUpperCase()} Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-foreground">Technical Specifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
            <span className="text-muted-foreground font-medium uppercase text-[10px]">Extensions</span>
            <p className="font-mono font-bold text-foreground text-sm">.{format.extensions.join(", .")}</p>
          </div>
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
            <span className="text-muted-foreground font-medium uppercase text-[10px]">MIME Type</span>
            <p className="font-mono font-bold text-foreground text-sm truncate">{format.mimeTypes[0] || "N/A"}</p>
          </div>
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
            <span className="text-muted-foreground font-medium uppercase text-[10px]">Format Category</span>
            <p className="font-bold text-foreground text-sm uppercase">{format.category}</p>
          </div>
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
            <span className="text-muted-foreground font-medium uppercase text-[10px]">Execution Mode</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm capitalize">{format.processingMode}-native</p>
          </div>
        </div>
      </div>

      {/* Supported Conversions: Convert FROM this format */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Convert <span className="uppercase text-primary">{format.id}</span> to Other Formats
          </h2>
          <span className="text-xs text-muted-foreground">{supportedOutputs.length} targets supported</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {supportedOutputs.map((target) => (
            <Link
              key={target.id}
              href={`/convert/${format.id}-to-${target.id}`}
              className="p-3.5 bg-card hover:bg-muted/40 border border-border hover:border-primary/50 rounded-xl transition-all flex items-center justify-between text-xs font-medium group"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase font-bold text-primary">{format.id}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                <span className="font-mono uppercase font-bold text-foreground">{target.id}</span>
              </div>
              <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                Convert
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Supported Conversions: Convert TO this format */}
      {supportedInputs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Convert Other Formats to <span className="uppercase text-primary">{format.id}</span>
            </h2>
            <span className="text-xs text-muted-foreground">{supportedInputs.length} sources supported</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {supportedInputs.map((source) => (
              <Link
                key={source.id}
                href={`/convert/${source.id}-to-${format.id}`}
                className="p-3.5 bg-card hover:bg-muted/40 border border-border hover:border-primary/50 rounded-xl transition-all flex items-center justify-between text-xs font-medium group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase font-bold text-muted-foreground">{source.id}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-mono uppercase font-bold text-primary">{format.id}</span>
                </div>
                <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                  Convert
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <FaqAccordion faqs={faqs} />
    </div>
  );
}
