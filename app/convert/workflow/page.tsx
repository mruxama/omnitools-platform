import { Metadata } from "next";
import { WorkflowBuilder } from "@/components/converter/WorkflowBuilder";
import { StructuredData } from "@/components/seo/StructuredData";
import Link from "next/link";
import { Layers, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Visual Workflow Studio — Chain Conversions, Resizing & Optimizations",
  description:
    "Build multi-step automated file processing pipelines directly in your browser. Chain format conversions, image resizing, rotations, and archive packaging.",
  keywords: [
    "file workflow",
    "conversion pipeline",
    "batch workflow",
    "chain file conversion",
    "online workflow builder",
  ],
};

export default function WorkflowPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <StructuredData
        name="Visual Workflow Studio"
        description="Chain multiple file transformations into an automated in-browser pipeline."
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
        <span className="text-foreground font-medium">Workflow Studio</span>
      </div>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Sequential Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Visual Workflow Studio
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Chain conversions, resizing, rotations, and compression into a seamless sequence. Execute entirely on your machine.
        </p>
      </div>

      <WorkflowBuilder />
    </div>
  );
}
