import React from "react";
import { ShieldCheck, Lock, EyeOff, ServerOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OmniTools",
  description:
    "OmniTools privacy policy. We do not collect, store, or transmit your uploaded files. All processing occurs locally in your web browser.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Guaranteed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Zero File Upload Policy</h2>
          <p>
            OmniTools is architected from the ground up to respect user privacy. When you use our PDF tools, Image tools, QR generator, or calculators, <strong>no files or data are uploaded to our servers</strong>.
          </p>
          <p>
            All file processing—including PDF merging, splitting, compression, page rotation, image conversion, image resizing, and background removal—is executed entirely within your device's browser memory (RAM) utilizing JavaScript, WebAssembly, and the HTML5 Canvas API. Once you close or refresh the tab, all in-memory buffers are automatically freed by your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Local Storage Usage</h2>
          <p>
            To provide a seamless experience without requiring you to create an account, OmniTools uses your browser's local storage (<code>localStorage</code>) strictly for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Remembering your favorited tool shortcuts.</li>
            <li>Remembering recently visited tool pages for quick access in your workspace.</li>
            <li>Storing your UI theme preference (Light, Dark, or System).</li>
            <li>Storing recent search queries in the search modal.</li>
          </ul>
          <p>
            <strong>We never store file contents, document text, or photos in your local storage.</strong> You can clear your workspace data anytime via the "Clear history" button or by clearing your browser cache.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">3. Analytics & Product Metrics</h2>
          <p>
            We may collect anonymous aggregate usage statistics to understand which tools are popular and identify technical bugs. These metrics may include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Page view counts and referrers.</li>
            <li>Tool usage starts and general error rates.</li>
            <li>Device screen resolution and browser type for responsive design optimization.</li>
          </ul>
          <p>
            We do not log file names, file contents, IP addresses, or personal identifiable information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">4. Contact & Security Questions</h2>
          <p>
            If you have questions regarding our privacy architecture or technical implementations, please contact our team at <code>privacy@omnitools.app</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
