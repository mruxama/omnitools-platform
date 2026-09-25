import React from "react";
import Link from "next/link";
import { Wrench, Shield, Lock, Cpu } from "lucide-react";
import { CATEGORIES } from "@/lib/tools/registry";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 text-foreground transition-colors mt-auto">
      {/* Privacy & Architecture banner */}
      <div className="border-b border-border/60 bg-muted/30 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Zero Server Uploads</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                All files and PDFs are manipulated entirely in your web browser memory. Documents never touch an external server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Free & No Account Needed</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full access to every tool without account creation, subscriptions, paywalls, or hidden watermarks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Instant Local Performance</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Powered by WebAssembly, HTML5 Canvas, and client-side processing for high speed and zero queue delays.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Omni<span className="text-primary">Tools</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              A comprehensive suite of free, high-speed, privacy-first productivity utilities.
              Manipulate PDFs, convert media, solve calculations, and streamline everyday tasks directly in your browser.
            </p>
            <div className="text-xs text-muted-foreground">
              Designed for privacy, accessibility, and speed.
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground mb-3">Categories</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {Object.values(CATEGORIES).map((cat) => (
                <li key={cat.id}>
                  <Link href={cat.path} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground mb-3">Popular Tools</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/tools/pdf/merge" className="hover:text-primary transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf/split" className="hover:text-primary transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/image/compress" className="hover:text-primary transition-colors">
                  Compress Image
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/percentage" className="hover:text-primary transition-colors">
                  Percentage Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/unit-converter" className="hover:text-primary transition-colors">
                  Unit Converter
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About OmniTools
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} OmniTools. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
