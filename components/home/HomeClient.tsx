"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image,
  Calculator,
  Type,
  Zap,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchModal } from "@/components/search/SearchModal";
import { ToolCard } from "@/components/tools/ToolCard";
import {
  CATEGORIES,
  getPopularTools,
  getToolsByCategory,
  ToolCategory,
} from "@/lib/tools/registry";

export function HomeClient() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const popularTools = getPopularTools();

  const categoryIcons: Record<ToolCategory, React.ComponentType<{ className?: string }>> = {
    pdf: FileText,
    image: Image,
    calculators: Calculator,
    text: Type,
    productivity: Zap,
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free • No Sign-Up • Privacy-First</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Free Online Tools for <span className="text-primary">Everyday Tasks</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Compress files, convert images, manage PDFs, and solve everyday calculations — all in one place.
          </p>

          {/* Global Search Bar */}
          <div className="pt-2 flex justify-center">
            <SearchBar onOpenSearch={() => setIsSearchOpen(true)} />
          </div>

          {/* Popular Shortcuts */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Popular:</span>
            {[
              { name: "Merge PDF", path: "/tools/pdf/merge" },
              { name: "Split PDF", path: "/tools/pdf/split" },
              { name: "Compress Image", path: "/tools/image/compress" },
              { name: "Percentage Calc", path: "/tools/calculators/percentage" },
              { name: "Unit Converter", path: "/tools/calculators/unit-converter" },
              { name: "QR Generator", path: "/tools/productivity/qr-code" },
            ].map((shortcut) => (
              <Link
                key={shortcut.name}
                href={shortcut.path}
                className="px-2.5 py-1 rounded-lg bg-card border border-border hover:border-primary/50 text-foreground transition-all hover:shadow-sm"
              >
                {shortcut.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Quick Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Browse by Category</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Choose a toolkit tailored to your workflow
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.keys(CATEGORIES) as ToolCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const Icon = categoryIcons[catKey];
            const count = getToolsByCategory(catKey).length;
            return (
              <Link
                key={cat.id}
                href={cat.path}
                className="group flex flex-col items-center text-center p-5 bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md rounded-2xl transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-muted-foreground mt-1">{count} utilities</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Most Popular Tools
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Everyday utilities trusted by thousands of students, freelancers, and businesses.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All 30+ Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularTools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Categories Detailed Sections */}
      {(Object.keys(CATEGORIES) as ToolCategory[]).map((catKey) => {
        const cat = CATEGORIES[catKey];
        const tools = getToolsByCategory(catKey);
        return (
          <section key={cat.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-border">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{cat.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{cat.description}</p>
              </div>
              <Link
                href={cat.path}
                className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                View all {cat.name} ({tools.length}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tools.slice(0, 3).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
