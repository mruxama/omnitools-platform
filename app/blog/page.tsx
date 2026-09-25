import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPostsDb } from "@/lib/db/repository";
import {
  BookOpen,
  Clock,
  Folder,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Calendar,
  Search,
  Tag,
} from "lucide-react";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "OmniTools Blog & Engineering Guides | Fast, Private File Conversion",
  description:
    "Explore deep-dive technical tutorials, privacy benchmarks, image and PDF optimization guides, and developer tooling insights from the OmniTools engineering team.",
  alternates: {
    canonical: "https://omnitools.app/blog",
  },
  openGraph: {
    title: "OmniTools Blog & Engineering Guides",
    description:
      "Explore technical tutorials, privacy benchmarks, and file conversion optimization guides.",
    url: "https://omnitools.app/blog",
    siteName: "OmniTools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTools Blog & Engineering Guides",
    description:
      "Technical tutorials, privacy benchmarks, and file conversion optimization guides.",
  },
};

export const revalidate = 60; // ISR 60 seconds

export default async function BlogIndexPage() {
  const allPosts = await getAllBlogPostsDb("published");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OmniTools Engineering & Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Guides, Benchmarks & <span className="text-primary">File Optimization</span> Insights
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master in-browser media compression, preserve 100% data privacy with client-side processing, and accelerate your digital workflows.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span>Zero Server Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Free Educational Guides</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Interactive Client Filters & Articles */}
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading articles...</div>}>
          <BlogListClient posts={allPosts} />
        </Suspense>

        {/* Global Conversion CTA */}
        <section className="mt-16 p-8 sm:p-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background relative overflow-hidden shadow-sm">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary">
              Instant File Conversion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Ready to convert your files privately?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Experience the fastest, zero-upload file converter on the web. Convert images, audio, video, documents, and PDFs directly in your browser without queues or size caps.
            </p>
            <div className="pt-2">
              <Link
                href="/convert"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-md transition-all"
              >
                <span>Launch Universal Converter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
