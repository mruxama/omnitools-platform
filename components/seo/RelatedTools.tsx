import React from "react";
import { ToolItem, getRelatedTools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tools/ToolCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RelatedToolsProps {
  tool: ToolItem;
}

export function RelatedTools({ tool }: RelatedToolsProps) {
  const related = getRelatedTools(tool);

  if (related.length === 0) return null;

  return (
    <section className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Related Tools</h2>
        <Link
          href={`/tools/${tool.category}`}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          More {tool.categoryName} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </section>
  );
}
