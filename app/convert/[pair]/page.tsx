import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { POPULAR_CONVERSION_PAIRS } from "@/lib/converter/compatibilityMatrix";
import { getFormatById } from "@/lib/converter/formatRegistry";
import { getSeoPageBySlugDb, getAllConversionsDb, getAllFormatsDb } from "@/lib/db/repository";
import { generatePageLinks } from "@/lib/seo/internalLinkEngine";
import { UniversalConverter } from "@/components/converter/UniversalConverter";
import { StructuredData } from "@/components/seo/StructuredData";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    pair: string;
  };
}

export function generateStaticParams() {
  return POPULAR_CONVERSION_PAIRS.map((p) => ({
    pair: `${p.from}-to-${p.to}`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parts = params.pair.split("-to-");
  if (parts.length !== 2) return {};

  const fromFmt = getFormatById(parts[0]);
  const toFmt = getFormatById(parts[1]);

  if (!fromFmt || !toFmt) return {};

  const seoPage = await getSeoPageBySlugDb(params.pair);

  const title =
    seoPage?.title || `${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()} Converter — Free & In-Browser`;
  const description =
    seoPage?.metaDescription ||
    `Convert ${fromFmt.displayName} to ${toFmt.displayName} online for free. Fast, secure, and 100% private in your browser with zero file uploads.`;

  return {
    title,
    description,
    keywords: [
      `${fromFmt.id} to ${toFmt.id}`,
      `convert ${fromFmt.id} to ${toFmt.id}`,
      `${fromFmt.id} converter`,
      `${toFmt.id} converter`,
      "free online converter",
    ],
    openGraph: {
      title,
      description,
      url: `https://omnitools.app/convert/${params.pair}`,
    },
  };
}

export default async function ConversionPairPage({ params }: PageProps) {
  const parts = params.pair.split("-to-");
  if (parts.length !== 2) notFound();

  const fromFmt = getFormatById(parts[0]);
  const toFmt = getFormatById(parts[1]);

  if (!fromFmt || !toFmt) notFound();

  // Load dynamic SEO page from database repository
  const seoPage = await getSeoPageBySlugDb(params.pair);
  const allConversions = await getAllConversionsDb();
  const allFormats = await getAllFormatsDb();

  // Internal Links Budget
  const linksBudget = generatePageLinks(params.pair, allConversions, allFormats);

  const contentObj = (seoPage?.content as any) || {};
  const howToSteps = contentObj.howToSteps || [
    `Drop your ${fromFmt.id.toUpperCase()} file into the dropzone or click to browse from your device.`,
    `Choose output quality, dimensions, or compression options if you wish to customize the output.`,
    `Click Convert and save your new ${toFmt.id.toUpperCase()} file immediately.`,
  ];

  const benefits = contentObj.benefits || [
    "100% Client-Side Privacy: No files leave your device.",
    "Fast zero-queue execution powered by your local hardware.",
    "Completely free without registrations or usage watermarks.",
  ];

  const faqs = (seoPage?.faq as any) || [
    {
      question: `How do I convert ${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()}?`,
      answer: `Simply drag and drop your ${fromFmt.id.toUpperCase()} file into the converter above, customize any quality or dimension settings if desired, and click "Convert". Your ${toFmt.id.toUpperCase()} file will be generated instantly and ready for download.`,
    },
    {
      question: `Are my files uploaded to a server?`,
      answer: `No. All conversions happen 100% locally inside your browser using modern Web APIs. Your documents, photos, or media never leave your device.`,
    },
    {
      question: `Is converting ${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()} completely free?`,
      answer: `Yes, OmniTools is completely free with no registration, no subscription, and no hidden file conversion quotas.`,
    },
  ];

  const answerBlocks = (seoPage?.answerBlocks as any) || [
    {
      question: `Can I convert ${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()} online for free?`,
      answer: `Yes, OmniTools converts ${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()} directly in your browser with zero registration or payment required.`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <StructuredData
        name={`${fromFmt.id.toUpperCase()} to ${toFmt.id.toUpperCase()} Converter`}
        description={`Convert ${fromFmt.displayName} to ${toFmt.displayName} online for free.`}
        url={`https://omnitools.app/convert/${params.pair}`}
        category="UtilitiesApplication"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/convert" className="hover:text-primary transition-colors">
          Convert
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium uppercase">
          {fromFmt.id} to {toFmt.id}
        </span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {seoPage?.h1 || (
            <>
              Convert <span className="uppercase text-primary">{fromFmt.id}</span> to{" "}
              <span className="uppercase text-primary">{toFmt.id}</span>
            </>
          )}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {seoPage?.intro ||
            `Convert your ${fromFmt.displayName} (${fromFmt.id.toUpperCase()}) into ${toFmt.displayName} (${toFmt.id.toUpperCase()}) instantly in your browser.`}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side Privacy Guaranteed</span>
        </div>
      </div>

      {/* AEO Direct Answer Highlight Box */}
      {answerBlocks.length > 0 && (
        <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Quick Answer</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed font-medium">
            {answerBlocks[0].answer}
          </p>
        </div>
      )}

      {/* Pre-initialized Universal Converter */}
      <UniversalConverter
        initialInputFormat={fromFmt.id}
        initialOutputFormat={toFmt.id}
      />

      {/* How to Guide */}
      <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          How to Convert {fromFmt.id.toUpperCase()} to {toFmt.id.toUpperCase()}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {howToSteps.map((stepText: string, idx: number) => (
            <div key={idx} className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                {idx + 1}
              </span>
              <h3 className="font-semibold text-foreground text-sm">Step {idx + 1}</h3>
              <p className="text-muted-foreground leading-relaxed">{stepText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Format Comparison & Knowledge Links */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {fromFmt.id.toUpperCase()} vs {toFmt.id.toUpperCase()}: Key Differences
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/formats/${fromFmt.id}`}
              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {fromFmt.id.toUpperCase()} Guide
            </Link>
            <span>•</span>
            <Link
              href={`/formats/${toFmt.id}`}
              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {toFmt.id.toUpperCase()} Guide
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1.5">
            <h3 className="font-bold text-sm text-foreground uppercase">{fromFmt.displayName}</h3>
            <p className="text-muted-foreground leading-relaxed">{fromFmt.description}</p>
            <div className="pt-2 text-muted-foreground font-mono text-[11px]">
              Extensions: {fromFmt.extensions.join(", ")}
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1.5">
            <h3 className="font-bold text-sm text-foreground uppercase">{toFmt.displayName}</h3>
            <p className="text-muted-foreground leading-relaxed">{toFmt.description}</p>
            <div className="pt-2 text-muted-foreground font-mono text-[11px]">
              Extensions: {toFmt.extensions.join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Internal Links Budget */}
      {linksBudget.relatedConversions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Related Conversions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {linksBudget.relatedConversions.map((link) => (
              <Link
                key={link.targetSlug}
                href={link.targetUrl}
                className="p-3 bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-xl transition-all flex items-center justify-between text-xs font-medium group"
              >
                <span className="font-mono font-bold text-foreground uppercase">{link.anchorText}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
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
