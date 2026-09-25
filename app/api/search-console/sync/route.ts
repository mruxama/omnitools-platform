import { NextRequest, NextResponse } from "next/server";
import { searchConsoleService } from "@/lib/seo/searchConsoleService";
import { getSearchQueriesDb, getSearchConsolePropertyDb } from "@/lib/db/repository";

export async function GET() {
  try {
    const scProp = await getSearchConsolePropertyDb();
    const queries = await getSearchQueriesDb(100);

    const totalClicks = queries.reduce((acc, q) => acc + q.clicks, 0);
    const totalImpressions = queries.reduce((acc, q) => acc + q.impressions, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition =
      queries.length > 0
        ? queries.reduce((acc, q) => acc + (q.position || 0), 0) / queries.length
        : 0;

    return NextResponse.json({
      ok: true,
      property: scProp,
      metrics: {
        totalClicks,
        totalImpressions,
        avgCtr: parseFloat(avgCtr.toFixed(2)),
        avgPosition: parseFloat(avgPosition.toFixed(1)),
      },
      queries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch Search Console data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, sitemapUrl } = body;

    const scProp = await getSearchConsolePropertyDb();

    if (action === "submit-sitemap") {
      const targetUrl = sitemapUrl || `${scProp.siteUrl}/sitemap.xml`;
      const res = await searchConsoleService.submitSitemap(scProp.siteUrl, targetUrl);
      return NextResponse.json({ ok: true, result: res });
    }

    // Default sync action
    const freshRows = await searchConsoleService.getSearchAnalytics({
      siteUrl: scProp.siteUrl,
      startDate: new Date(Date.now() - 86400000 * 28).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({
      ok: true,
      message: `Successfully synchronized ${freshRows.length} search queries from Search Console.`,
      rowsCount: freshRows.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Search Console sync failed" },
      { status: 500 }
    );
  }
}
