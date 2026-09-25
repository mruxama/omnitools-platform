import { NextRequest, NextResponse } from "next/server";
import {
  getAllSeoPagesDb,
  getSeoPageBySlugDb,
  saveSeoPageDb,
  updateSeoPageStatusDb,
  getFormatBySlugDb,
  getConversionBySlugDb,
  getAllConversionsDb,
  getAllFormatsDb,
} from "@/lib/db/repository";
import { PageStatus } from "@prisma/client";
import { generateSeoPageData } from "@/lib/seo/pageGenerator";
import { generatePageLinks } from "@/lib/seo/internalLinkEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const indexableParam = searchParams.get("indexable");
    // Pagination parameters: `page` (1‑based) and `pageSize` (default 20).
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "20", 10)
    );
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    let pages = await getAllSeoPagesDb();

    if (search) {
      pages = pages.filter(
        (p) =>
          p.slug.toLowerCase().includes(search) ||
          p.title?.toLowerCase().includes(search) ||
          p.h1?.toLowerCase().includes(search)
      );
    }

    if (status && status !== "ALL") {
      pages = pages.filter((p) => p.status === status);
    }

    if (indexableParam !== null && indexableParam !== undefined && indexableParam !== "ALL") {
      const isIndexable = indexableParam === "true";
      pages = pages.filter((p) => p.indexable === isIndexable);
    }

    const total = pages.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = pages.slice(offset, offset + limit);

    return NextResponse.json({
      ok: true,
      total,
      page,
      pageSize,
      totalPages,
      pages: paginated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch SEO pages" },
      { status: 500 }
    );
  }
}

function safeParseJson(value: any) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      slug,
      status,
      indexable,
      noIndex,
      title,
      metaDescription,
      h1,
      intro,
      content,
      faq,
      answerBlocks,
      howTo,
      schema,
      canonicalUrl,
      canonicalTarget,
      seoScore,
      aeoScore,
      geoScore,
    } = body;

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing required slug" }, { status: 400 });
    }

    // Action: Regenerate page content
    if (action === "regenerate") {
      const parts = slug.split("-to-");
      if (parts.length === 2) {
        const [sourceSlug, targetSlug] = parts;
        const source = await getFormatBySlugDb(sourceSlug);
        const target = await getFormatBySlugDb(targetSlug);
        const conversion = await getConversionBySlugDb(slug);

        if (!source || !target || !conversion) {
          return NextResponse.json(
            { ok: false, error: "Source format, target format, or conversion not found" },
            { status: 404 }
          );
        }

        const freshPageData = generateSeoPageData(source, target, conversion);
        const allConversions = await getAllConversionsDb();
        const allFormats = await getAllFormatsDb();
        const links = generatePageLinks(slug, allConversions, allFormats);

        const pageWithLinks = {
          ...freshPageData,
          content: {
            ...(freshPageData.content as any),
            contextualLinks: links.contextualLinks,
            relatedTools: links.relatedTools,
          },
        };

        const saved = await saveSeoPageDb(pageWithLinks as any);
        return NextResponse.json({ ok: true, page: saved, message: "Page content regenerated successfully" });
      }
    }

    // Field-level updates or status / indexable updates
    const updatePayload: Record<string, any> = { slug };

    if (title !== undefined) updatePayload.title = title;
    if (metaDescription !== undefined) updatePayload.metaDescription = metaDescription;
    if (h1 !== undefined) updatePayload.h1 = h1;
    if (intro !== undefined) updatePayload.intro = intro;
    if (content !== undefined) updatePayload.content = safeParseJson(content);
    if (faq !== undefined) updatePayload.faq = safeParseJson(faq);
    if (answerBlocks !== undefined) updatePayload.answerBlocks = safeParseJson(answerBlocks);
    if (howTo !== undefined) updatePayload.howTo = safeParseJson(howTo);
    if (schema !== undefined) updatePayload.schema = safeParseJson(schema);
    if (canonicalUrl !== undefined) updatePayload.canonicalUrl = canonicalUrl;
    if (canonicalTarget !== undefined) updatePayload.canonicalTarget = canonicalTarget;
    if (status !== undefined) {
      updatePayload.status = status as PageStatus;
      await updateSeoPageStatusDb(slug, status as PageStatus);
    }
    if (typeof indexable === "boolean") {
      updatePayload.indexable = indexable;
      if (noIndex === undefined) updatePayload.noIndex = !indexable;
    }
    if (typeof noIndex === "boolean") updatePayload.noIndex = noIndex;
    if (seoScore !== undefined) updatePayload.seoScore = Number(seoScore);
    if (aeoScore !== undefined) updatePayload.aeoScore = Number(aeoScore);
    if (geoScore !== undefined) updatePayload.geoScore = Number(geoScore);

    const saved = await saveSeoPageDb(updatePayload as any);
    const updated = await getSeoPageBySlugDb(slug);

    return NextResponse.json({
      ok: true,
      page: updated || saved,
      message: "SEO page updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update SEO page" },
      { status: 500 }
    );
  }
}

export const PATCH = POST;
