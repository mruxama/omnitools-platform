import { Format, Conversion, SeoPage, InternalLink } from "@prisma/client";

export interface LinkCandidate {
  targetSlug: string;
  targetUrl: string;
  anchorText: string;
  relationType: "reverse" | "same_source" | "same_target" | "same_category" | "format_knowledge" | "category_hub";
  relevanceScore: number;
}

export interface PageLinkBudget {
  contextualLinks: LinkCandidate[];
  relatedConversions: LinkCandidate[];
  formatKnowledgeLink: LinkCandidate | null;
  categoryHubLink: LinkCandidate | null;
  relatedTools: LinkCandidate[];
}

export interface LinkGraphNode {
  slug: string;
  inboundCount: number;
  outboundCount: number;
  isOrphan: boolean;
}

/**
 * Calculates semantic relevance between two conversion slugs.
 * Score from 0.0 to 1.0.
 */
export function calculateRelevance(
  sourceSlug: string,
  targetSlug: string,
  formatsBySlug: Map<string, Partial<Format>>
): number {
  if (sourceSlug === targetSlug) return 0;

  const [s1, t1] = sourceSlug.split("-to-");
  const [s2, t2] = targetSlug.split("-to-");

  if (!s1 || !t1 || !s2 || !t2) return 0;

  // 1. Reverse conversion (e.g. JPG->WEBP and WEBP->JPG) has maximum relevance
  if (s1 === t2 && t1 === s2) return 0.98;

  // 2. Same source format (e.g. JPG->WEBP and JPG->PNG)
  if (s1 === s2) return 0.85;

  // 3. Same target format (e.g. PNG->WEBP and JPG->WEBP)
  if (t1 === t2) return 0.80;

  // 4. Same format category (e.g. image to image)
  const fmt1 = formatsBySlug.get(s1);
  const fmt2 = formatsBySlug.get(s2);
  if (fmt1 && fmt2 && fmt1.category === fmt2.category) {
    return 0.65;
  }

  return 0.20;
}

/**
 * Computes link candidates and enforces strict link budgets for a page:
 * - 1-3 contextual links
 * - 2-5 related conversions
 * - 1 format link
 * - 1 category link
 * - 3-8 related tools
 */
export function generatePageLinks(
  currentSlug: string,
  allConversions: Partial<Conversion>[],
  formats: Partial<Format>[]
): PageLinkBudget {
  const formatsMap = new Map<string, Partial<Format>>(formats.map((f) => [f.slug || "", f]));
  const [sourceId, targetId] = currentSlug.split("-to-");

  const candidates: LinkCandidate[] = [];

  for (const conv of allConversions) {
    if (!conv.slug || conv.slug === currentSlug) continue;

    const rel = calculateRelevance(currentSlug, conv.slug, formatsMap);
    if (rel >= 0.5) {
      const [s, t] = conv.slug.split("-to-");
      let relationType: LinkCandidate["relationType"] = "same_category";
      if (s === targetId && t === sourceId) relationType = "reverse";
      else if (s === sourceId) relationType = "same_source";
      else if (t === targetId) relationType = "same_target";

      candidates.push({
        targetSlug: conv.slug,
        targetUrl: `/convert/${conv.slug}`,
        anchorText: `${(s || "").toUpperCase()} to ${(t || "").toUpperCase()}`,
        relationType,
        relevanceScore: rel,
      });
    }
  }

  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Reverse conversion candidate
  const reverse = candidates.find((c) => c.relationType === "reverse");
  const contextualLinks = candidates.slice(0, 3);
  const relatedConversions = candidates.slice(1, 6);

  // Format Knowledge Page link
  const formatKnowledgeLink: LinkCandidate | null = sourceId
    ? {
        targetSlug: sourceId,
        targetUrl: `/formats/${sourceId}`,
        anchorText: `${sourceId.toUpperCase()} Format Guide`,
        relationType: "format_knowledge",
        relevanceScore: 0.9,
      }
    : null;

  // Category Hub link
  const currentFormat = formatsMap.get(sourceId);
  const catSlug = currentFormat?.category?.toLowerCase() || "image";
  const categoryHubLink: LinkCandidate = {
    targetSlug: catSlug,
    targetUrl: `/convert/${catSlug}`,
    anchorText: `${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} Converter Hub`,
    relationType: "category_hub",
    relevanceScore: 0.85,
  };

  // Related Tools links
  const relatedTools: LinkCandidate[] = [
    { targetSlug: "compress", targetUrl: "/tools/image/compress", anchorText: "Image Compressor", relationType: "same_category", relevanceScore: 0.8 },
    { targetSlug: "resize", targetUrl: "/tools/image/resize", anchorText: "Image Resizer", relationType: "same_category", relevanceScore: 0.75 },
    { targetSlug: "metadata", targetUrl: "/tools/image/metadata", anchorText: "EXIF Viewer", relationType: "same_category", relevanceScore: 0.7 },
  ];

  return {
    contextualLinks,
    relatedConversions,
    formatKnowledgeLink,
    categoryHubLink,
    relatedTools,
  };
}

/**
 * Evaluates the full graph of internal links and identifies orphan pages
 */
export function analyzeLinkGraph(
  pages: { slug: string }[],
  links: { sourceSlug: string; targetSlug: string }[]
): {
  nodes: LinkGraphNode[];
  orphanPages: string[];
  mostLinked: LinkGraphNode[];
  leastLinked: LinkGraphNode[];
} {
  const inboundMap = new Map<string, number>();
  const outboundMap = new Map<string, number>();

  pages.forEach((p) => {
    inboundMap.set(p.slug, 0);
    outboundMap.set(p.slug, 0);
  });

  links.forEach((l) => {
    outboundMap.set(l.sourceSlug, (outboundMap.get(l.sourceSlug) || 0) + 1);
    inboundMap.set(l.targetSlug, (inboundMap.get(l.targetSlug) || 0) + 1);
  });

  const nodes: LinkGraphNode[] = pages.map((p) => {
    const inbound = inboundMap.get(p.slug) || 0;
    const outbound = outboundMap.get(p.slug) || 0;
    return {
      slug: p.slug,
      inboundCount: inbound,
      outboundCount: outbound,
      isOrphan: inbound === 0,
    };
  });

  const orphanPages = nodes.filter((n) => n.isOrphan).map((n) => n.slug);

  const sorted = [...nodes].sort((a, b) => b.inboundCount - a.inboundCount);
  const mostLinked = sorted.slice(0, 5);
  const leastLinked = [...nodes].sort((a, b) => a.inboundCount - b.inboundCount).slice(0, 5);

  return {
    nodes,
    orphanPages,
    mostLinked,
    leastLinked,
  };
}
