import React from "react";
import { ToolItem } from "@/lib/tools/registry";

interface StructuredDataProps {
  tool?: ToolItem;
  name?: string;
  description?: string;
  url?: string;
  category?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export function StructuredData({
  tool,
  name,
  description,
  url,
  category = "UtilitiesApplication",
  faqs,
}: StructuredDataProps) {
  const finalName = tool ? tool.name : name || "OmniTools";
  const finalDescription = tool ? tool.longDescription : description || "Free online tools";
  const finalUrl = tool ? `https://omnitools.app${tool.path}` : url || "https://omnitools.app";
  const finalCategory = category;
  const finalFaqs = tool?.faqs || faqs;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: finalName,
    description: finalDescription,
    url: finalUrl,
    applicationCategory: finalCategory,
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: tool?.features || ["Client-side processing", "Privacy first", "Free to use"],
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://omnitools.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool ? tool.categoryName : "Tools",
        item: tool ? `https://omnitools.app/tools/${tool.category}` : "https://omnitools.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: finalName,
        item: finalUrl,
      },
    ],
  };

  const faqSchema = finalFaqs && finalFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: finalFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
