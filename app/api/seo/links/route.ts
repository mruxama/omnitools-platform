import { NextRequest, NextResponse } from "next/server";
import {
  getAllSeoPagesDb,
  getAllConversionsDb,
  getAllFormatsDb,
  saveSeoPageDb,
} from "@/lib/db/repository";
import { analyzeLinkGraph, generatePageLinks } from "@/lib/seo/internalLinkEngine";

export async function GET() {
  try {
    const pages = await getAllSeoPagesDb();
    const conversions = await getAllConversionsDb();

    // Reconstruct explicit links from page contents
    const linkPairs: { sourceSlug: string; targetSlug: string }[] = [];

    for (const page of pages) {
      const content = page.content as any;
      if (content?.contextualLinks && Array.isArray(content.contextualLinks)) {
        for (const link of content.contextualLinks) {
          if (link.targetSlug) {
            linkPairs.push({ sourceSlug: page.slug, targetSlug: link.targetSlug });
          }
        }
      }
      if (content?.relatedConversions && Array.isArray(content.relatedConversions)) {
        for (const link of content.relatedConversions) {
          if (link.targetSlug) {
            linkPairs.push({ sourceSlug: page.slug, targetSlug: link.targetSlug });
          }
        }
      }
    }

    const graphAnalysis = analyzeLinkGraph(
      pages.map((p) => ({ slug: p.slug })),
      linkPairs
    );

    return NextResponse.json({
      ok: true,
      totalPages: pages.length,
      totalLinks: linkPairs.length,
      orphanPages: graphAnalysis.orphanPages,
      mostLinked: graphAnalysis.mostLinked,
      leastLinked: graphAnalysis.leastLinked,
      nodes: graphAnalysis.nodes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to analyze link graph" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pages = await getAllSeoPagesDb();
    const conversions = await getAllConversionsDb();
    const formats = await getAllFormatsDb();

    let updatedCount = 0;

    for (const page of pages) {
      const linkBudget = generatePageLinks(page.slug, conversions, formats);
      await saveSeoPageDb({
        slug: page.slug,
        content: {
          ...(page.content as any),
          contextualLinks: linkBudget.contextualLinks,
          relatedConversions: linkBudget.relatedConversions,
          formatKnowledgeLink: linkBudget.formatKnowledgeLink,
          categoryHubLink: linkBudget.categoryHubLink,
          relatedTools: linkBudget.relatedTools,
        },
      });
      updatedCount++;
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully recalculated and updated internal links across ${updatedCount} pages.`,
      updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to recalculate internal links" },
      { status: 500 }
    );
  }
}
