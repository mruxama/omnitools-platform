import { describe, it, expect, beforeEach } from "vitest";
import { SearchConsoleService } from "@/lib/seo/searchConsoleService";
import {
  getAllSeoPagesDb,
  getSeoPageBySlugDb,
  saveSeoPageDb,
  initializeMemoryStore,
} from "@/lib/db/repository";
import { PageStatus } from "@prisma/client";

describe("Search Console Service Caching", () => {
  let scService: SearchConsoleService;

  beforeEach(() => {
    scService = new SearchConsoleService(300); // 300 seconds TTL
  });

  it("should cache getSearchAnalytics responses and return cached data on subsequent requests", async () => {
    const params = {
      siteUrl: "https://omnitools.app",
      startDate: "2026-08-01",
      endDate: "2026-08-28",
    };

    const first = await scService.getSearchAnalytics(params);
    expect(first).toBeDefined();
    expect(first.length).toBeGreaterThan(0);

    const statsAfterFirst = scService.getCacheStats();
    expect(statsAfterFirst.size).toBe(1);

    const second = await scService.getSearchAnalytics(params);
    expect(second).toBe(first); // Exact same cached reference
  });

  it("should bypass cache when bypassCache option is true", async () => {
    const params = {
      siteUrl: "https://omnitools.app",
      startDate: "2026-08-01",
      endDate: "2026-08-28",
    };

    const first = await scService.getSearchAnalytics(params);
    const bypassed = await scService.getSearchAnalytics({ ...params, bypassCache: true });

    expect(bypassed).toBeDefined();
    expect(bypassed.length).toBe(first.length);
    // Since it bypassed cache, it generates a fresh array instance
    expect(bypassed).not.toBe(first);
  });

  it("should cache inspectUrl results and allow clearing cache", async () => {
    const url = "https://omnitools.app/convert/jpg-to-webp";
    const res1 = await scService.inspectUrl(url);
    const res2 = await scService.inspectUrl(url);

    expect(res2).toBe(res1);
    expect(scService.getCacheStats().size).toBeGreaterThanOrEqual(1);

    scService.clearCache();
    expect(scService.getCacheStats().size).toBe(0);

    const res3 = await scService.inspectUrl(url);
    expect(res3).not.toBe(res1);
    expect(res3.verdict).toBe("INDEXED");
  });
});

describe("SEO Pages Repository & Field Updates", () => {
  beforeEach(async () => {
    initializeMemoryStore();
  });

  it("should update all SEO fields (Title, Meta Description, H1, Intro, How-To, FAQ, Schema, Status, Indexable)", async () => {
    const targetSlug = "jpg-to-webp";

    const customTitle = "Custom Test Title - Ultimate JPG to WebP";
    const customMetaDesc = "This is a custom meta description for testing SEO updates.";
    const customH1 = "Convert JPG to WEBP With Peak Quality";
    const customIntro = "Full intro narrative text for AEO and search snippets.";
    const customHowTo = ["Upload JPG", "Adjust quality slider", "Download WebP"];
    const customFaq = [
      { question: "Is this lossless?", answer: "Yes, WebP supports near-lossless compression." },
    ];
    const customSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Custom WebP Converter",
    };

    const saved = await saveSeoPageDb({
      slug: targetSlug,
      title: customTitle,
      metaDescription: customMetaDesc,
      h1: customH1,
      intro: customIntro,
      howTo: customHowTo as any,
      faq: customFaq as any,
      schema: customSchema as any,
      status: PageStatus.PUBLISHED,
      indexable: true,
      noIndex: false,
    });

    expect(saved.slug).toBe(targetSlug);
    expect(saved.title).toBe(customTitle);
    expect(saved.metaDescription).toBe(customMetaDesc);
    expect(saved.h1).toBe(customH1);
    expect(saved.intro).toBe(customIntro);
    expect(saved.howTo).toEqual(customHowTo);
    expect(saved.faq).toEqual(customFaq);
    expect(saved.schema).toEqual(customSchema);
    expect(saved.status).toBe(PageStatus.PUBLISHED);
    expect(saved.indexable).toBe(true);
    expect(saved.noIndex).toBe(false);

    // Verify retrieval from DB/memory
    const fetched = await getSeoPageBySlugDb(targetSlug);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe(customTitle);
    expect(fetched?.metaDescription).toBe(customMetaDesc);
    expect(fetched?.h1).toBe(customH1);
  });

  it("should correctly handle pagination slicing with page and pageSize", async () => {
    const allPages = await getAllSeoPagesDb();
    expect(allPages.length).toBeGreaterThan(0);

    const pageSize = 20;
    const page1 = 1;
    const offset1 = (page1 - 1) * pageSize;
    const slice1 = allPages.slice(offset1, offset1 + pageSize);

    expect(slice1.length).toBeLessThanOrEqual(20);
    expect(slice1.length).toBe(Math.min(pageSize, allPages.length));

    const totalPages = Math.ceil(allPages.length / pageSize);
    expect(totalPages).toBeGreaterThanOrEqual(1);

    if (allPages.length > 20) {
      const page2 = 2;
      const offset2 = (page2 - 1) * pageSize;
      const slice2 = allPages.slice(offset2, offset2 + pageSize);

      expect(slice2.length).toBeGreaterThan(0);
      expect(slice2[0].slug).not.toBe(slice1[0].slug);
    }
  });
});
