import { OpportunityPriority, OpportunityType, SeoOpportunity, SeoPage, SearchQuery } from "@prisma/client";

export interface OpportunityDetectionContext {
  page: Partial<SeoPage>;
  queries: SearchQuery[];
  inboundLinksCount: number;
}

/**
 * Opportunity Engine
 * Detects high-leverage search ranking, CTR, content, and linking opportunities
 * using actual performance and architectural metrics.
 */
export function detectOpportunities(
  pagesWithData: OpportunityDetectionContext[]
): Partial<SeoOpportunity>[] {
  const opportunities: Partial<SeoOpportunity>[] = [];

  for (const ctx of pagesWithData) {
    const { page, queries, inboundLinksCount } = ctx;
    const pageUrl = page.canonicalUrl || `https://omnitools.app/convert/${page.slug}`;

    // Aggregates
    const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);
    const totalClicks = queries.reduce((sum, q) => sum + q.clicks, 0);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgPosition =
      queries.length > 0
        ? queries.reduce((sum, q) => sum + (q.position || 50), 0) / queries.length
        : 50;

    // 1. Opportunity: High Impressions + Low CTR
    if (totalImpressions >= 1000 && avgPosition <= 20 && avgCtr < 0.035) {
      opportunities.push({
        id: `opp_low_ctr_${page.slug}`,
        pageId: page.id,
        type: OpportunityType.LOW_CTR,
        priority: OpportunityPriority.HIGH,
        title: `Low CTR (${(avgCtr * 100).toFixed(1)}%) on High Impression Page (${page.slug})`,
        description: `This page generated ${totalImpressions.toLocaleString()} search impressions at average position ${avgPosition.toFixed(1)}, but CTR is underperforming the 3.5% benchmark.`,
        evidence: { totalImpressions, avgCtr, avgPosition, pageUrl } as any,
        recommendation: {
          action: "A/B test a more compelling meta title and description with benefit-driven triggers ('Fast & 100% Free').",
          estimatedImpact: `+${Math.round(totalImpressions * 0.02)} extra clicks/month`,
        } as any,
        score: 92,
        status: "OPEN",
      });
    }

    // 2. Opportunity: Ranking on Page 2 (Positions 11–20)
    if (avgPosition >= 11 && avgPosition <= 20 && totalImpressions >= 500) {
      opportunities.push({
        id: `opp_rank_11_20_${page.slug}`,
        pageId: page.id,
        type: OpportunityType.RANKING_11_20,
        priority: OpportunityPriority.HIGH,
        title: `Page 2 Striking Distance: ${page.slug} (Position ${avgPosition.toFixed(1)})`,
        description: `The page is within reach of Google Page 1. Additional topical depth and contextual internal links can push it into top 10 positions.`,
        evidence: { avgPosition, totalImpressions, pageUrl } as any,
        recommendation: {
          action: "Add 2 dedicated FAQ entries answering top search intent questions, and add 3 internal links from category hubs.",
          estimatedImpact: "High probability of page 1 promotion (up to 3x organic click growth)",
        } as any,
        score: 95,
        status: "OPEN",
      });
    }

    // 3. Opportunity: Orphan Page
    if (inboundLinksCount === 0 && page.indexable) {
      opportunities.push({
        id: `opp_orphan_${page.slug}`,
        pageId: page.id,
        type: OpportunityType.ORPHAN_PAGE,
        priority: OpportunityPriority.MEDIUM,
        title: `Orphan Indexable Page: ${page.slug}`,
        description: `This indexable conversion page has 0 inbound internal links, making it difficult for search crawlers to discover and rank.`,
        evidence: { inboundLinksCount: 0, pageUrl } as any,
        recommendation: {
          action: "Link to this page from the relevant Format Knowledge page and Category Studio.",
          estimatedImpact: "Ensures full crawl budget allocation and rank distribution",
        } as any,
        score: 78,
        status: "OPEN",
      });
    }

    // 4. Opportunity: Content Gap (Query with impressions not mentioned on page)
    const contentText = `${page.title || ""} ${page.metaDescription || ""} ${page.intro || ""}`.toLowerCase();
    for (const q of queries) {
      if (q.impressions >= 500 && !contentText.includes(q.query.toLowerCase())) {
        opportunities.push({
          id: `opp_gap_${page.slug}_${q.id}`,
          pageId: page.id,
          type: OpportunityType.CONTENT_GAP,
          priority: OpportunityPriority.MEDIUM,
          title: `Content Gap: Query "${q.query}" Not Addressed on ${page.slug}`,
          description: `The query "${q.query}" drove ${q.impressions} impressions, but the term is not directly addressed in the page text.`,
          evidence: { query: q.query, impressions: q.impressions, position: q.position } as any,
          recommendation: {
            action: `Add a dedicated FAQ or section explicitly covering "${q.query}".`,
            estimatedImpact: "Direct relevance boost for this query",
          } as any,
          score: 84,
          status: "OPEN",
        });
        break; // one per page to avoid noise
      }
    }
  }

  return opportunities.sort((a, b) => (b.score || 0) - (a.score || 0));
}
