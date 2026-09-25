import { Metadata } from "next";
import { UniversalConverter } from "@/components/converter/UniversalConverter";
import { POPULAR_CONVERSION_PAIRS } from "@/lib/converter/compatibilityMatrix";
import { getAllFormats } from "@/lib/converter/formatRegistry";
import { getAllCategories } from "@/lib/converter/categoryRegistry";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Table,
  Archive,
  Feather,
} from "lucide-react";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Universal File Converter — Convert Any File Free & In-Browser",
  description:
    "Convert images, audio, video, documents, spreadsheets, and archives online. 100% private client-side processing with zero server uploads.",
  keywords: [
    "file converter",
    "online converter",
    "image converter",
    "audio converter",
    "pdf converter",
    "spreadsheet converter",
    "free file converter",
    "in browser converter",
  ],
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-5 h-5 text-pink-500" />,
  audio: <Music className="w-5 h-5 text-amber-500" />,
  video: <Video className="w-5 h-5 text-rose-500" />,
  document: <FileText className="w-5 h-5 text-blue-500" />,
  spreadsheet: <Table className="w-5 h-5 text-emerald-500" />,
  archive: <Archive className="w-5 h-5 text-purple-500" />,
  "vector-fonts": <Feather className="w-5 h-5 text-indigo-500" />,
};

export default function ConvertHubPage() {
  const allFormats = getAllFormats();
  const availableFormats = allFormats.filter((f) => f.status === "AVAILABLE");
  const categories = getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <StructuredData
        name="Universal Online File Converter"
        description="Convert images, audio, video, and documents directly in your browser with zero server uploads."
        url="https://omnitools.app/convert"
        category="UtilitiesApplication"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal In-Browser File Converter</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Convert Any File. <span className="text-primary">Fast & Private.</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Convert documents, images, audio, video frames, and archives directly in your browser. No file size limits, no waiting in cloud queues, zero server uploads.
        </p>

        {/* Feature badges */}
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground pt-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Privacy
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Instant Processing
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-blue-500" /> {availableFormats.length}+ Formats Available
          </span>
        </div>
      </div>

      {/* 7 Dedicated Category Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Explore Converters by Category</h2>
          <span className="text-xs text-muted-foreground">7 Dedicated Studios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/convert/${cat.slug}`}
              className="p-5 bg-card hover:bg-muted/40 border border-border hover:border-primary/50 rounded-2xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border group-hover:scale-105 transition-transform">
                    {CATEGORY_ICONS[cat.id]}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {cat.formatIds.length} formats
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Format pills preview */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                {cat.formatIds.slice(0, 5).map((f) => (
                  <span
                    key={f}
                    className="px-1.5 py-0.5 rounded bg-muted/70 text-[10px] font-mono font-medium text-muted-foreground uppercase"
                  >
                    {f}
                  </span>
                ))}
                {cat.formatIds.length > 5 && (
                  <span className="px-1.5 py-0.5 rounded bg-muted/40 text-[10px] font-mono text-muted-foreground">
                    +{cat.formatIds.length - 5}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Primary Universal Converter */}
      <div className="space-y-4 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-foreground">Universal Converter</h2>
          <p className="text-xs text-muted-foreground">
            Drop any file below — our smart detector identifies the format and configures output options automatically.
          </p>
        </div>
        <UniversalConverter />
      </div>

      {/* Popular Conversion Pairs Quick Links */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Popular Conversions</h2>
          <Link
            href="/convert/workflow"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            Open Workflow Studio
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {POPULAR_CONVERSION_PAIRS.map((pair) => (
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
    </div>
  );
}
