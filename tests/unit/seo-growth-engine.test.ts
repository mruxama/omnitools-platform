import { describe, it, expect } from "vitest";
import { calculateSeoScore } from "@/lib/seo/scoringEngine";
import { evaluateEligibility } from "@/lib/seo/eligibilityEngine";
import { generateSeoPageData } from "@/lib/seo/pageGenerator";
import { validateContent } from "@/lib/seo/contentValidator";
import {
  calculateRelevance,
  generatePageLinks,
  analyzeLinkGraph,
} from "@/lib/seo/internalLinkEngine";
import { detectOpportunities } from "@/lib/seo/opportunityEngine";
import { searchConsoleService } from "@/lib/seo/searchConsoleService";
import { Format, Conversion, FormatCategory, FormatStatus, PageStatus, SeoPageType } from "@prisma/client";

// Mock formats for testing
const mockJpg: Partial<Format> = {
  id: "fmt_jpg",
  slug: "jpg",
  name: "JPEG Image",
  extension: "jpg",
  category: FormatCategory.IMAGE,
  isInputSupported: true,
  isOutputSupported: true,
  isBrowserSupported: true,
  isServerSupported: true,
  status: FormatStatus.ACTIVE,
};

const mockWebp: Partial<Format> = {
  id: "fmt_webp",
  slug: "webp",
  name: "WebP Image",
  extension: "webp",
  category: FormatCategory.IMAGE,
  isInputSupported: true,
  isOutputSupported: true,
  isBrowserSupported: true,
  isServerSupported: true,
  status: FormatStatus.ACTIVE,
};

const mockPng: Partial<Format> = {
  id: "fmt_png",
  slug: "png",
  name: "Portable Network Graphics",
  extension: "png",
  category: FormatCategory.IMAGE,
  isInputSupported: true,
  isOutputSupported: true,
  isBrowserSupported: true,
  isServerSupported: true,
  status: FormatStatus.ACTIVE,
};

const mockPdf: Partial<Format> = {
  id: "fmt_pdf",
  slug: "pdf",
  name: "Portable Document Format",
  extension: "pdf",
  category: FormatCategory.DOCUMENT,
  isInputSupported: true,
  isOutputSupported: true,
  isBrowserSupported: true,
  isServerSupported: true,
  status: FormatStatus.ACTIVE,
};

const mockObscure: Partial<Format> = {
  id: "fmt_xyz",
  slug: "xyz",
  name: "XYZ Format",
  extension: "xyz",
  category: FormatCategory.OTHER,
  isInputSupported: true,
  isOutputSupported: true,
  isBrowserSupported: true,
  isServerSupported: true,
  status: FormatStatus.ACTIVE,
};

const mockUnsupported: Partial<Format> = {
  id: "fmt_disabled",
  slug: "disabled",
  name: "Disabled Format",
  extension: "dis",
  category: FormatCategory.OTHER,
  isInputSupported: false,
  isOutputSupported: false,
  isBrowserSupported: false,
  isServerSupported: false,
  status: FormatStatus.DISABLED,
};

describe("Automated SEO + AEO + GEO Growth Engine", () => {
  describe("1. Scoring Engine (calculateSeoScore)", () => {
    it("should calculate a high composite SEO score for a complete conversion page", () => {
      const page = {
        slug: "jpg-to-webp",
        canonicalUrl: "https://omnitools.app/convert/jpg-to-webp",
        indexable: true,
        noIndex: false,
        title: "Convert JPG to WEBP Online Free — Fast & In-Browser",
        metaDescription:
          "Convert JPG to WebP online for free. 100% private in-browser conversion with zero file uploads, instant download, and high fidelity.",
        h1: "Convert JPG to WEBP Online",
        intro:
          "Transform your JPEG files into WebP format directly in your browser with zero remote server file uploads.",
        content: {
          howToSteps: [
            "Upload your JPG file",
            "Select WebP target",
            "Click Convert to process locally",
          ],
          benefits: [
            "100% Client-Side Privacy",
            "Zero File Uploads",
            "Preserves Visual Quality",
          ],
        },
        faq: [
          { question: "How to convert JPG to WEBP?", answer: "Drag and drop your JPG file and click Convert." },
          { question: "Is this conversion free?", answer: "Yes, 100% free with no limits." },
        ],
        answerBlocks: [
          {
            question: "Can I convert JPG to WEBP in my browser?",
            answer: "Yes, OmniTools converts JPG to WEBP completely in client-side browser memory.",
          },
        ],
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "JPG to WEBP Converter",
        },
      };

      const breakdown = calculateSeoScore(
        page as any,
        { impressions: 15000, ctr: 0.05, position: 4.2 },
        { inboundCount: 6, outboundCount: 5 }
      );

      expect(breakdown.overallScore).toBeGreaterThanOrEqual(80);
      expect(breakdown.technicalScore).toBeGreaterThanOrEqual(80);
      expect(breakdown.contentScore).toBeGreaterThanOrEqual(75);
      expect(breakdown.aeoScore).toBeGreaterThanOrEqual(80);
      expect(breakdown.passedChecks.length).toBeGreaterThan(0);
    });

    it("should flag missing critical tags and recommend improvements for incomplete pages", () => {
      const incompletePage = {
        title: "Too short",
        h1: "",
      };

      const breakdown = calculateSeoScore(incompletePage as any);
      expect(breakdown.overallScore).toBeLessThan(70);
      expect(breakdown.failedChecks).toContain("Missing primary H1 tag");
      expect(breakdown.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("2. Eligibility & Anti-Spam Engine (evaluateEligibility)", () => {
    it("should classify popular, fully supported pairs as INDEX", () => {
      const conv: Partial<Conversion> = {
        slug: "jpg-to-webp",
        demandScore: 92,
        usefulnessScore: 90,
      };

      const result = evaluateEligibility(mockJpg, mockWebp, conv, 80);
      expect(result.decision).toBe("INDEX");
      expect(result.isIndexable).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it("should reject and classify unsupported formats as DO_NOT_CREATE", () => {
      const result = evaluateEligibility(mockUnsupported, mockWebp);
      expect(result.decision).toBe("DO_NOT_CREATE");
      expect(result.isIndexable).toBe(false);
      expect(result.score).toBe(0);
    });

    it("should classify low-demand, obscure combinations as NOINDEX to prevent doorway spam", () => {
      const lowDemandConv: Partial<Conversion> = {
        slug: "xyz-to-xyz",
        demandScore: 20,
        usefulnessScore: 30,
        uniquenessScore: 35,
        competitionScore: 40,
      };

      const result = evaluateEligibility(mockObscure, mockObscure, lowDemandConv, 80);
      expect(["NOINDEX", "REVIEW"]).toContain(result.decision);
      expect(result.isIndexable).toBe(false);
    });
  });

  describe("3. Programmatic Page Generator (generateSeoPageData)", () => {
    it("should generate complete, validated SEO/AEO/GEO page structures", () => {
      const conv: Partial<Conversion> = {
        slug: "jpg-to-webp",
        browserSupport: true,
      };

      const page = generateSeoPageData(mockJpg, mockWebp, conv);

      expect(page.slug).toBe("jpg-to-webp");
      expect(page.title).toContain("Convert JPG to WEBP");
      expect(page.metaDescription).toContain("WebP");
      expect(page.h1).toBe("Convert JPG to WEBP Online");
      expect(page.canonicalUrl).toBe("https://omnitools.app/convert/jpg-to-webp");

      const content = page.content as any;
      expect(content.howToSteps.length).toBeGreaterThanOrEqual(3);
      expect(content.benefits.length).toBeGreaterThanOrEqual(3);

      const answerBlocks = page.answerBlocks as any[];
      expect(answerBlocks.length).toBeGreaterThanOrEqual(1);

      const schema = page.schema as any;
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@graph"]).toBeDefined();
      const webAppNode = schema["@graph"].find((node: any) => node["@type"] === "WebApplication");
      expect(webAppNode).toBeDefined();
      expect(webAppNode.name).toContain("Converter");
    });
  });

  describe("4. Content Quality Validator (validateContent)", () => {
    it("should pass high-quality, truthful content", () => {
      const validContent = {
        title: "Convert JPG to WEBP Online Free — 100% In-Browser",
        metaDescription:
          "Convert JPG to WebP online for free. 100% private in-browser conversion with zero file uploads, instant download, and high fidelity.",
        h1: "Convert JPG to WEBP",
        intro: "Convert your JPG photos to modern WEBP files locally in your browser with zero server uploads.",
        howToSteps: ["Step 1", "Step 2", "Step 3"],
        benefits: ["Private", "Fast", "Free"],
      };

      const report = validateContent(validContent, mockJpg, mockWebp);
      expect(report.isValid).toBe(true);
      expect(report.canPublish).toBe(true);
      expect(report.accuracyScore).toBeGreaterThanOrEqual(90);
      expect(report.technicalCorrectnessScore).toBeGreaterThanOrEqual(95);
    });

    it("should fail content missing mandatory fields or containing contradictory claims", () => {
      const invalidContent = {
        title: "Short",
        metaDescription: "Too short",
        h1: "",
      };

      const report = validateContent(invalidContent, mockJpg, mockWebp);
      expect(report.canPublish).toBe(false);
      expect(report.errors.length).toBeGreaterThan(0);
    });
  });

  describe("5. Internal Link Engine & Graph Analysis", () => {
    const formats = [mockJpg, mockWebp, mockPng, mockPdf];
    const conversions: Partial<Conversion>[] = [
      { slug: "jpg-to-webp" },
      { slug: "webp-to-jpg" },
      { slug: "jpg-to-png" },
      { slug: "png-to-webp" },
      { slug: "pdf-to-docx" },
    ];

    it("should calculate highest semantic relevance for reverse conversions", () => {
      const formatsMap = new Map(formats.map((f) => [f.slug!, f]));
      const reverseRel = calculateRelevance("jpg-to-webp", "webp-to-jpg", formatsMap);
      const sameSourceRel = calculateRelevance("jpg-to-webp", "jpg-to-png", formatsMap);
      const crossCatRel = calculateRelevance("jpg-to-webp", "pdf-to-docx", formatsMap);

      expect(reverseRel).toBeGreaterThan(sameSourceRel);
      expect(sameSourceRel).toBeGreaterThan(crossCatRel);
      expect(reverseRel).toBeCloseTo(0.98, 2);
    });

    it("should generate link budgets matching strict structural quotas", () => {
      const budget = generatePageLinks("jpg-to-webp", conversions, formats);

      expect(budget.contextualLinks.length).toBeLessThanOrEqual(3);
      expect(budget.relatedConversions.length).toBeLessThanOrEqual(5);
      expect(budget.formatKnowledgeLink).not.toBeNull();
      expect(budget.formatKnowledgeLink?.targetUrl).toBe("/formats/jpg");
      expect(budget.categoryHubLink?.targetUrl).toBe("/convert/image");
    });

    it("should accurately analyze the link graph and flag orphan pages", () => {
      const pages = [
        { slug: "jpg-to-webp" },
        { slug: "webp-to-jpg" },
        { slug: "orphan-conversion" },
      ];
      const links = [
        { sourceSlug: "jpg-to-webp", targetSlug: "webp-to-jpg" },
        { sourceSlug: "webp-to-jpg", targetSlug: "jpg-to-webp" },
      ];

      const analysis = analyzeLinkGraph(pages, links);
      expect(analysis.orphanPages).toContain("orphan-conversion");
      expect(analysis.orphanPages).not.toContain("jpg-to-webp");
      expect(analysis.mostLinked[0].slug).toBeDefined();
    });
  });

  describe("6. SEO Opportunity Engine (detectOpportunities)", () => {
    it("should detect LOW_CTR on high impression pages with below-average CTR", () => {
      const contexts = [
        {
          page: { id: "page_1", slug: "epub-to-pdf", indexable: true },
          queries: [
            { id: "q1", query: "epub to pdf free", impressions: 16000, clicks: 200, ctr: 0.012, position: 14.5 } as any,
          ],
          inboundLinksCount: 4,
        },
      ];

      const opps = detectOpportunities(contexts);
      const lowCtr = opps.find((o) => o.type === "LOW_CTR");
      expect(lowCtr).toBeDefined();
      expect(lowCtr?.priority).toBe("HIGH");
      expect((lowCtr?.recommendation as any)?.action).toBeDefined();
    });

    it("should detect RANKING_11_20 for pages in striking distance of page 1", () => {
      const contexts = [
        {
          page: { id: "page_2", slug: "pdf-to-docx", indexable: true },
          queries: [
            { id: "q2", query: "pdf to docx converter", impressions: 25000, clicks: 800, ctr: 0.032, position: 13.4 } as any,
          ],
          inboundLinksCount: 5,
        },
      ];

      const opps = detectOpportunities(contexts);
      const rankOpp = opps.find((o) => o.type === "RANKING_11_20");
      expect(rankOpp).toBeDefined();
      expect(rankOpp?.priority).toBe("HIGH");
    });

    it("should detect ORPHAN_PAGE for indexable pages with zero inbound links", () => {
      const contexts = [
        {
          page: { id: "page_3", slug: "svg-to-webp", indexable: true },
          queries: [],
          inboundLinksCount: 0,
        },
      ];

      const opps = detectOpportunities(contexts);
      const orphanOpp = opps.find((o) => o.type === "ORPHAN_PAGE");
      expect(orphanOpp).toBeDefined();
      expect(orphanOpp?.priority).toBe("MEDIUM");
    });
  });

  describe("7. Google Search Console Service", () => {
    it("should return grounded analytics and mock inspection data", async () => {
      const analytics = await searchConsoleService.getSearchAnalytics({
        siteUrl: "https://omnitools.app",
        startDate: "2026-08-01",
        endDate: "2026-08-28",
      });

      expect(analytics.length).toBeGreaterThan(0);
      expect(analytics[0].clicks).toBeGreaterThan(0);
      expect(analytics[0].query).toBeDefined();

      const inspection = await searchConsoleService.inspectUrl(
        "https://omnitools.app/convert/jpg-to-webp"
      );
      expect(inspection.verdict).toBe("INDEXED");
      expect(inspection.mobileUsability).toBe("MOBILE_FRIENDLY");
      expect(inspection.robotstxtState).toBe("ALLOWED");
    });
  });
});
