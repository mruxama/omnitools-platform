import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import {
  CATEGORIES,
  getToolsByCategory,
  ToolCategory,
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";

interface CategoryPageTemplateProps {
  categoryKey: ToolCategory;
}

export function CategoryPageTemplate({ categoryKey }: CategoryPageTemplateProps) {
  const category = CATEGORIES[categoryKey];
  const tools = getToolsByCategory(categoryKey);
  const popularInCat = tools.filter((t) => t.badges?.includes("popular"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">
          Tools
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{category.name}</span>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <ToolIcon name={category.icon} className="w-3.5 h-3.5" />
          <span>{category.name}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {category.name}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Popular in this category */}
      {popularInCat.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Most Popular</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularInCat.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* All tools in category */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          All {category.name} ({tools.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Category Features & Privacy */}
      <section className="p-6 bg-card border border-border rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Privacy Guaranteed</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Every tool in the {category.name} suite executes operations strictly inside your web browser.
          No uploaded documents, photos, or inputs are ever transferred to our servers, ensuring total data privacy.
        </p>
      </section>
    </div>
  );
}
