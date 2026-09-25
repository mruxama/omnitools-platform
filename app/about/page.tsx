import React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Lock, Globe, Wrench, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OmniTools — Our Mission, Architecture & Privacy",
  description:
    "Learn about OmniTools: our client-side privacy architecture, mission to provide fast and free productivity tools, and zero operating cost design.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Wrench className="w-3.5 h-3.5" />
          <span>Productivity Redefined</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          About OmniTools
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          OmniTools was created with a single objective: to empower students, office workers, freelancers, and internet users with fast, accurate, and completely free online utilities without sacrificing privacy or demanding an account.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">100% In-Browser Privacy</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Traditional online tool websites upload your confidential PDFs, sensitive photos, and documents to cloud servers. OmniTools processes everything right in your browser RAM via WebAssembly and Canvas APIs. No file ever leaves your machine.
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">Zero Server Bottlenecks</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Because operations run on client hardware with modern multithreading and bounded concurrency, there are no queue delays, server timeouts, or upload latency.
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">No Paywalls, No Sign-Up</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every utility is free and accessible immediately. There are no daily conversion limits, hidden watermarks, credit card forms, or mandatory newsletters.
          </p>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="p-8 bg-muted/40 border border-border rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-foreground">Our Technical Architecture</h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          OmniTools is engineered using modern web technologies: Next.js App Router in strict TypeScript, Tailwind CSS, pdf-lib for vector manipulation, HTML5 Canvas for image transformation, and the native browser Web Crypto API (SubtleCrypto) for hashing and cryptographic password generation.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The platform operates entirely serverless, making it lightweight, sustainable, environmentally conscious, and virtually immune to remote server data breaches.
        </p>
      </div>
    </div>
  );
}
