import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ToolItem, getRelatedTools, getPopularTools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tools/ToolCard";

interface ToolPageLayoutProps {
  tool: ToolItem;
  children: React.ReactNode;
}

export function ToolHubNavigation({ tool, children }: ToolPageLayoutProps) {
  const related = getRelatedTools(tool).slice(0, 3);
  const popular = getPopularTools().filter((t) => t.id !== tool.id).slice(0, 3);

  return (
    <div className="w-full">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="w-full border-b border-border/60 bg-muted/20 py-2.5 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-primary transition-colors">
              All Tools
            </Link>
            <span>/</span>
            <Link href={`/tools/${tool.category}`} className="hover:text-primary transition-colors capitalize">
              {tool.categoryName}
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {tool.name}
            </span>
          </nav>

          <Link
            href="/tools"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Browse All Tools</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Interactive Tool Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>

      {/* Bottom Cross-Navigation & Recommendations */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-border space-y-12">
        {/* Related Tools */}
        {related.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Complementary Tools</h3>
                <p className="text-xs text-muted-foreground">Commonly used alongside {tool.name}</p>
              </div>
              <Link
                href={`/tools/${tool.category}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                More in {tool.categoryName} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Productivity Tools */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Explore Other Popular Tools</h3>
            </div>
            <Link
              href="/tools"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Tools Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
