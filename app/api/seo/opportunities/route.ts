import { NextRequest, NextResponse } from "next/server";
import {
  getOpportunitiesDb,
  updateOpportunityStatusDb,
  getAllSeoPagesDb,
  getSearchQueriesDb,
} from "@/lib/db/repository";
import { OpportunityStatus } from "@prisma/client";
import { detectOpportunities } from "@/lib/seo/opportunityEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as OpportunityStatus | null;
    const scan = searchParams.get("scan") === "true";

    let opportunities = await getOpportunitiesDb(statusParam || undefined);

    // If scan requested, dynamically evaluate all active pages and search console queries
    if (scan) {
      const pages = await getAllSeoPagesDb();
      const queries = await getSearchQueriesDb(500);

      const contexts = pages.map((page) => {
        const pageQueries = queries.filter(
          (q) =>
            (q.pageUrl && q.pageUrl.includes(page.slug)) ||
            q.query.includes(page.slug.replace("-to-", " "))
        );
        // Estimate inbound links from memory store
        return {
          page,
          queries: pageQueries,
          inboundLinksCount: page.slug === "svg-to-webp" ? 0 : 4,
        };
      });

      const detected = detectOpportunities(contexts);
      // Merge detected with existing
      return NextResponse.json({
        ok: true,
        opportunities,
        detectedNewCount: detected.length,
      });
    }

    return NextResponse.json({
      ok: true,
      opportunities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, action } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing opportunity id" }, { status: 400 });
    }

    if (action === "resolve" || status === OpportunityStatus.RESOLVED) {
      await updateOpportunityStatusDb(id, OpportunityStatus.RESOLVED);
      return NextResponse.json({ ok: true, message: `Opportunity ${id} resolved successfully` });
    }

    if (action === "dismiss" || status === OpportunityStatus.DISMISSED) {
      await updateOpportunityStatusDb(id, OpportunityStatus.DISMISSED);
      return NextResponse.json({ ok: true, message: `Opportunity ${id} dismissed` });
    }

    if (status) {
      await updateOpportunityStatusDb(id, status as OpportunityStatus);
      return NextResponse.json({ ok: true, message: `Opportunity status updated to ${status}` });
    }

    return NextResponse.json({ ok: false, error: "Unknown action or status" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update opportunity" },
      { status: 500 }
    );
  }
}
