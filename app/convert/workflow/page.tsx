import { Metadata } from "next";
import { WorkflowBuilder } from "@/components/converter/WorkflowBuilder";
import { StructuredData } from "@/components/seo/StructuredData";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  FileCheck,
  Share2,
  Table,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Visual Workflow Studio & Automation — Automated Multi-Step Media Pipeline",
  description:
    "Automate file processing pipelines entirely in your browser. Chain format conversion, WebP optimization, watermark stamping, video compression, dimension resizing, and ZIP archiving across all scenarios.",
  keywords: [
    "file workflow",
    "conversion pipeline",
    "batch workflow",
    "automated file processing",
    "chain file conversion",
    "online workflow builder",
    "watermark and zip automation",
  ],
};

export default function WorkflowPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <StructuredData
        name="Visual Workflow Studio & File Automation"
        description="Automate file processing pipelines entirely in your browser. Chain format conversion, WebP optimization, watermark stamping, video compression, dimension resizing, and ZIP archiving."
        url="https://omnitools.app/convert/workflow"
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
        <span className="text-foreground font-medium">Workflow Automation Studio</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Multi-Step Media Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Visual Workflow Studio & Automation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Automate every file conversion, resizing, watermarking, video compression, and archive bundling step into an end-to-end pipeline. 100% private in-browser execution with zero server latency.
        </p>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="font-bold text-foreground">Web Optimization</div>
            <div className="text-muted-foreground text-[11px]">WebP + 1200px + 80% CRF</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-2.5">
          <Share2 className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="font-bold text-foreground">Social & E-Comm</div>
            <div className="text-muted-foreground text-[11px]">Brand watermark + Resize</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-2.5">
          <FileCheck className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="font-bold text-foreground">Office to PDF</div>
            <div className="text-muted-foreground text-[11px]">DOCX/Markdown to PDF</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center gap-2.5">
          <Table className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="font-bold text-foreground">Spreadsheet & ZIP</div>
            <div className="text-muted-foreground text-[11px]">CSV to Excel + ZIP pack</div>
          </div>
        </div>
      </div>

      {/* Main Workflow Builder Workspace */}
      <WorkflowBuilder />

      {/* Every Possible Scenario Guide */}
      <div className="pt-8 border-t border-border space-y-6">
        <h2 className="text-xl font-bold text-foreground text-center">
          Every Automated Processing Scenario Covered
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Web Publishing & SEO
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Convert raw heavy camera files (JPG/PNG) into Google Lighthouse recommended modern WebP, scale down excessive resolutions to 1200px or 800px, and optimize bytes for instant sub-second LCP.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Brand Protection & E-Commerce
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Apply automated brand logo or text copyright watermarks with custom opacity and positioning, scale to standardized 1000x1000 square dimensions, and generate catalog-ready assets.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Document Archiving & Security
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Transform raw text, CSV datasets, and DOCX files into standardized A4 PDF documents, stamp prominent &ldquo;CONFIDENTIAL&rdquo; security badges, and package them into DEFLATE-compressed ZIP archives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
