import React from "react";
import { getToolById } from "@/lib/tools/registry";
import { ToolHeader } from "@/components/seo/ToolHeader";
import { HowToSection } from "@/components/seo/HowToSection";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { StructuredData } from "@/components/seo/StructuredData";

interface ToolPageLayoutProps {
  toolId: string;
  children: React.ReactNode;
}

export function ToolPageLayout({ toolId, children }: ToolPageLayoutProps) {
  const tool = getToolById(toolId);
  if (!tool) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <StructuredData tool={tool} />
      <ToolHeader tool={tool} />

      {/* Main Tool Interactive Interface */}
      <div className="w-full">{children}</div>

      {/* Structured Content for SEO and Guidance */}
      <HowToSection toolName={tool.name} steps={tool.howToSteps} />
      <FaqAccordion faqs={tool.faqs} />
      <RelatedTools tool={tool} />
    </div>
  );
}
