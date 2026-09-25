import {
  Format,
  Conversion,
  SeoPage,
  SearchQuery,
  SeoOpportunity,
  InternalLink,
  SearchConsoleProperty,
  SeoSettings,
  FormatCategory,
  FormatStatus,
  ConversionStatus,
  SeoPageType,
  PageStatus,
  OpportunityType,
  OpportunityPriority,
  OpportunityStatus,
  BlogPost,
} from "@prisma/client";
import { prisma, isDatabaseConfigured } from "./prisma";
import { getAllFormats, getFormatById } from "../converter/formatRegistry";
import { getSupportedOutputs, POPULAR_CONVERSION_PAIRS } from "../converter/compatibilityMatrix";

// In-Memory fallback store used when DATABASE_URL is not set
interface MemoryStore {
  formats: Map<string, Format>;
  conversions: Map<string, Conversion>;
  seoPages: Map<string, SeoPage>;
  blogPosts: Map<string, BlogPost>;
  searchQueries: SearchQuery[];
  opportunities: Map<string, SeoOpportunity>;
  internalLinks: InternalLink[];
  settings: SeoSettings;
  searchConsole: SearchConsoleProperty;
  initialized: boolean;
}

const memoryStore: MemoryStore = {
  formats: new Map(),
  conversions: new Map(),
  seoPages: new Map(),
  blogPosts: new Map(),
  searchQueries: [],
  opportunities: new Map(),
  internalLinks: [],
  settings: {
    id: "default-settings",
    siteName: "OmniTools",
    domain: "https://omnitools.app",
    defaultTitleSuffix: "OmniTools Universal Converter",
    defaultDescription: "100% private, free online file conversions in your browser.",
    indexThreshold: 80,
    autoGenerate: false,
    autoPublish: false,
    maxInternalLinks: 8,
    allowOaiSearchBot: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  searchConsole: {
    id: "sc-property-default",
    siteUrl: "https://omnitools.app",
    accessToken: null,
    refreshToken: null,
    connected: false,
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  initialized: false,
};

function mapCategory(cat: string): FormatCategory {
  switch (cat.toLowerCase()) {
    case "image":
      return FormatCategory.IMAGE;
    case "audio":
      return FormatCategory.AUDIO;
    case "video":
      return FormatCategory.VIDEO;
    case "document":
      return FormatCategory.DOCUMENT;
    case "spreadsheet":
    case "data":
      return FormatCategory.SPREADSHEET;
    case "archive":
      return FormatCategory.ARCHIVE;
    case "vector":
      return FormatCategory.VECTOR;
    case "ebook":
      return FormatCategory.EBOOK;
    case "font":
      return FormatCategory.FONT;
    default:
      return FormatCategory.OTHER;
  }
}

export function initializeMemoryStore() {
  if (memoryStore.initialized) return;

  const rawFormats = getAllFormats();

  // 1. Seed Formats
  for (const f of rawFormats) {
    const formatRecord: Format = {
      id: `fmt_${f.id}`,
      slug: f.id,
      name: f.displayName,
      extension: f.extensions[0] || f.id,
      mimeType: f.mimeTypes[0] || null,
      category: mapCategory(f.category),
      description: f.description,
      shortDescription: `${f.displayName} format (${f.id.toUpperCase()})`,
      isInputSupported: f.canInput,
      isOutputSupported: f.canOutput,
      isBrowserSupported: f.processingMode === "browser",
      isServerSupported: f.processingMode === "server",
      engine: f.engines[0] || "browser",
      status: f.status === "AVAILABLE" ? FormatStatus.ACTIVE : f.status === "BETA" ? FormatStatus.BETA : FormatStatus.COMING_SOON,
      seoEnabled: true,
      aeoEnabled: true,
      geoEnabled: true,
      metadata: f.supportedOptions as any,
      aliases: (f.aliases || []) as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.formats.set(f.id, formatRecord);
  }

  // 2. Seed Conversions & SEO Pages
  const popularSet = new Set(POPULAR_CONVERSION_PAIRS.map((p) => `${p.from}-to-${p.to}`));

  for (const source of rawFormats) {
    const targets = getSupportedOutputs(source.id);
    for (const target of targets) {
      const slug = `${source.id}-to-${target.id}`;
      const isPopular = popularSet.has(slug);

      // Scoring
      const demandScore = isPopular ? 88 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 35);
      const usefulnessScore = 80 + Math.floor(Math.random() * 18);
      const competitionScore = 50 + Math.floor(Math.random() * 30);
      const uniquenessScore = 75 + Math.floor(Math.random() * 20);
      const seoScore = Math.round(demandScore * 0.4 + usefulnessScore * 0.4 + uniquenessScore * 0.2);

      const isIndexable = isPopular || seoScore >= 80;

      const convRecord: Conversion = {
        id: `conv_${slug}`,
        sourceFormatId: `fmt_${source.id}`,
        targetFormatId: `fmt_${target.id}`,
        slug,
        status: ConversionStatus.ACTIVE,
        engine: "browser",
        browserSupport: true,
        serverSupport: true,
        optionsSchema: null,
        limitations: null,
        seoScore,
        demandScore,
        usefulnessScore,
        competitionScore,
        uniquenessScore,
        indexable: isIndexable,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.conversions.set(slug, convRecord);

      // Seed SEO Page for indexable conversions
      if (isIndexable) {
        const seoPage: SeoPage = {
          id: `page_${slug}`,
          conversionId: convRecord.id,
          formatId: null,
          type: SeoPageType.CONVERSION,
          slug,
          canonicalUrl: `https://omnitools.app/convert/${slug}`,
          title: `Convert ${source.id.toUpperCase()} to ${target.id.toUpperCase()} Online — Free & In-Browser`,
          metaDescription: `Convert ${source.displayName} to ${target.displayName} online for free. Fast, secure, and 100% private in your browser with zero server file uploads.`,
          h1: `Convert ${source.id.toUpperCase()} to ${target.id.toUpperCase()}`,
          intro: `Instantly transform your ${source.displayName} into ${target.displayName} without uploading your files to any remote servers.`,
          content: {
            howToSteps: [
              `Upload your .${source.extensions[0] || source.id} file into the drag-and-drop zone.`,
              `Select ${target.id.toUpperCase()} as the target format and adjust options if needed.`,
              `Click Convert to process the file locally in your browser and download the result.`,
            ],
            benefits: [
              "100% Private Client-Side Conversion",
              "Zero file size limits or cloud upload queues",
              "Preserves image transparency, metadata, and quality",
            ],
          } as any,
          faq: [
            {
              question: `How do I convert ${source.id.toUpperCase()} to ${target.id.toUpperCase()}?`,
              answer: `Simply drag and drop your ${source.id.toUpperCase()} file into the converter, select ${target.id.toUpperCase()}, and click Convert.`,
            },
            {
              question: `Is converting ${source.id.toUpperCase()} to ${target.id.toUpperCase()} secure?`,
              answer: `Yes! All conversions happen 100% in your browser memory using Web APIs. Your file never leaves your machine.`,
            },
          ] as any,
          answerBlocks: [
            {
              question: `Can I convert ${source.id.toUpperCase()} to ${target.id.toUpperCase()} online for free?`,
              answer: `Yes, OmniTools converts ${source.id.toUpperCase()} to ${target.id.toUpperCase()} directly in your browser with zero registration or payment required.`,
            },
          ] as any,
          howTo: null,
          schema: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${source.id.toUpperCase()} to ${target.id.toUpperCase()} Converter`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "All",
          } as any,
          seoScore,
          contentScore: 85,
          technicalScore: 95,
          aeoScore: 88,
          geoScore: 84,
          indexable: true,
          noIndex: false,
          canonicalTarget: null,
          status: PageStatus.PUBLISHED,
          version: 1,
          lastGeneratedAt: new Date(),
          lastReviewedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.seoPages.set(slug, seoPage);
      }
    }
  }

  // 3. Seed Sample Search Console Queries
  const sampleQueries = [
    { query: "jpg to webp converter", pageUrl: "https://omnitools.app/convert/jpg-to-webp", clicks: 1420, impressions: 24500, ctr: 0.058, position: 4.2 },
    { query: "png to jpg high quality", pageUrl: "https://omnitools.app/convert/png-to-jpg", clicks: 980, impressions: 18200, ctr: 0.054, position: 6.1 },
    { query: "convert pdf to word online free", pageUrl: "https://omnitools.app/convert/pdf-to-docx", clicks: 820, impressions: 32000, ctr: 0.025, position: 14.8 }, // Ranking 11-20 + High Impressions!
    { query: "docx to pdf without formatting loss", pageUrl: "https://omnitools.app/convert/docx-to-pdf", clicks: 430, impressions: 12400, ctr: 0.034, position: 12.3 },
    { query: "wav to mp3 320kbps", pageUrl: "https://omnitools.app/convert/wav-to-mp3", clicks: 650, impressions: 8900, ctr: 0.073, position: 3.8 },
    { query: "csv to excel converter online", pageUrl: "https://omnitools.app/convert/csv-to-xlsx", clicks: 510, impressions: 9400, ctr: 0.054, position: 5.2 },
    { query: "convert psd to png without photoshop", pageUrl: "https://omnitools.app/convert/psd-to-png", clicks: 320, impressions: 4500, ctr: 0.071, position: 3.1 },
    { query: "epub to pdf converter free", pageUrl: "https://omnitools.app/convert/epub-to-pdf", clicks: 290, impressions: 15600, ctr: 0.018, position: 16.4 }, // Low CTR!
  ];

  sampleQueries.forEach((q, idx) => {
    memoryStore.searchQueries.push({
      id: `sq_${idx + 1}`,
      query: q.query,
      pageUrl: q.pageUrl,
      country: "US",
      device: "DESKTOP",
      clicks: q.clicks,
      impressions: q.impressions,
      ctr: q.ctr,
      position: q.position,
      date: new Date(),
      pageId: null,
      createdAt: new Date(),
    });
  });

  // 4. Seed Opportunities
  const opp1: SeoOpportunity = {
    id: "opp_1",
    pageId: "page_pdf-to-docx",
    type: OpportunityType.RANKING_11_20,
    priority: OpportunityPriority.HIGH,
    title: "PDF to DOCX Ranking on Page 2 (Position 14.8)",
    description: "Page receives 32,000 monthly impressions at position 14.8. Optimizing topical coverage and internal links can lift it into Page 1.",
    evidence: { impressions: 32000, position: 14.8, ctr: 0.025 } as any,
    recommendation: {
      action: "Add dedicated OCR and font preservation FAQ, plus 3 contextual internal links from Document tools.",
    } as any,
    score: 92,
    status: OpportunityStatus.OPEN,
    detectedAt: new Date(),
    resolvedAt: null,
  };

  const opp2: SeoOpportunity = {
    id: "opp_2",
    pageId: "page_epub-to-pdf",
    type: OpportunityType.LOW_CTR,
    priority: OpportunityPriority.HIGH,
    title: "EPUB to PDF Low CTR (1.8% on 15,600 impressions)",
    description: "Impression volume is high but CTR is below the expected 4.5% benchmark for position 16.4.",
    evidence: { impressions: 15600, ctr: 0.018, expectedCtr: 0.045 } as any,
    recommendation: {
      action: "Revise meta title and description with high-converting search intent ('Instant Chapter-to-Page Layout').",
    } as any,
    score: 88,
    status: OpportunityStatus.OPEN,
    detectedAt: new Date(),
    resolvedAt: null,
  };

  const opp3: SeoOpportunity = {
    id: "opp_3",
    pageId: null,
    type: OpportunityType.ORPHAN_PAGE,
    priority: OpportunityPriority.MEDIUM,
    title: "SVG to WEBP Has Zero Inbound Internal Links",
    description: "Indexable conversion page svg-to-webp has no internal links pointing to it from related image or vector pages.",
    evidence: { inboundLinks: 0 } as any,
    recommendation: {
      action: "Link to SVG to WEBP from /formats/svg and /convert/image category studio.",
    } as any,
    score: 75,
    status: OpportunityStatus.OPEN,
    detectedAt: new Date(),
    resolvedAt: null,
  };

  memoryStore.opportunities.set(opp1.id, opp1);
  memoryStore.opportunities.set(opp2.id, opp2);
  memoryStore.opportunities.set(opp3.id, opp3);

  // 5. Seed Initial High-Impact SEO Blog Articles
  const seedPosts: BlogPost[] = [
    {
      id: "post_jpg-to-webp-guide",
      slug: "how-to-convert-jpg-to-webp-without-losing-quality",
      title: "How to Convert JPG to WebP Without Losing Quality (2026 Guide)",
      excerpt: "Learn how to switch from legacy JPEG to modern WebP to shrink image file sizes by 35% or more while preserving pixel-perfect visual fidelity.",
      content: `## Why Switch from JPG to WebP?

Image assets account for over 60% of total web page payload. For decades, JPEG has been the ubiquitous standard for photographic imagery. However, modern websites and applications require faster page loads, higher Core Web Vitals (CWV) scores, and reduced bandwidth consumption.

WebP, developed by Google, delivers significant improvements over legacy JPEG:
- **30%–35% smaller file sizes** at equivalent visual quality.
- **Support for transparency (alpha channel)**, which JPEG lacks.
- **Predictable perceptual compression** powered by VP8 predictive coding.

---

## Lossy vs. Lossless WebP: Which Should You Use?

1. **Lossy WebP (Recommended for Photographs & Graphics)**:
   - Compresses photographic images and complex gradients effectively.
   - Recommended quality parameter: **80–85**. At this setting, file size drops significantly while visual artifacts remain virtually imperceptible to the human eye.

2. **Lossless WebP (Recommended for Diagrams, UI & Text Screenshots)**:
   - Completely preserves every pixel.
   - Typically 26% smaller than uncompressed PNGs.

---

## Step-by-Step: Converting JPG to WebP in OmniTools

Converting images with OmniTools requires zero software installation and never transfers your photos to an external server:

1. **Open the Converter**: Navigate to our dedicated [JPG to WebP Converter](/convert/jpg-to-webp).
2. **Select Your Image**: Drag and drop your JPG file into the drop zone.
3. **Configure Options**: Adjust the quality slider (default is 85% for balanced performance).
4. **Convert & Download**: Conversion executes client-side in milliseconds via HTML5 Canvas.

---

## Browser Support and Fallbacks in 2026

WebP is supported by **98.5%+ of all web browsers globally**, including Chrome, Safari, Firefox, Edge, and mobile browsers on iOS and Android. If your audience uses modern smartphones and computers, serving WebP natively is safe and universally compatible.`,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      category: "Guides",
      tags: ["WebP", "Image Optimization", "JPG", "Web Performance"] as any,
      author: "OmniTools Editorial",
      readingTime: "4 min read",
      status: PageStatus.PUBLISHED,
      seoTitle: "Convert JPG to WebP Without Losing Quality (2026 Guide) | OmniTools",
      seoDescription: "Step-by-step tutorial on converting JPEG to modern WebP. Reduce file sizes by 35% without visible quality degradation.",
      canonicalUrl: "https://omnitools.app/blog/how-to-convert-jpg-to-webp-without-losing-quality",
      schema: null,
      views: 1240,
      publishedAt: new Date("2026-08-15"),
      createdAt: new Date("2026-08-15"),
      updatedAt: new Date("2026-09-01"),
    },
    {
      id: "post_client-side-privacy",
      slug: "client-side-vs-server-side-file-converters",
      title: "Client-Side vs Server-Side File Converters: Why In-Browser Processing Protects Your Data",
      excerpt: "Discover why client-side file conversion inside your browser protects confidential PDFs, legal documents, and personal photos from third-party server exposure.",
      content: `## The Hidden Security Risk of Online File Converters

Every day, millions of users upload confidential contracts, tax returns, medical scans, and personal photos to free online file converters. What most people do not realize is that the vast majority of online converters rely on **server-side processing**:

1. Your file is transmitted over the internet to a third-party remote server.
2. The server writes your file to temporary disk storage.
3. A backend script (such as FFmpeg, ImageMagick, or LibreOffice) converts the file.
4. You receive a download link, while the file remains on the server until an automated cleanup cron job triggers hours or days later.

If that server experiences an intrusion, misconfigured S3 bucket permissions, or unauthorized inspection, your sensitive private documents are at risk.

---

## What is Client-Side In-Browser Conversion?

Client-side file conversion flips the traditional paradigm completely. Instead of sending your file to a remote cloud server:

- The processing code (HTML5 Canvas, Web Audio API, WebAssembly, JSZip, and pdf-lib) runs **directly inside your local web browser memory**.
- **0 bytes leave your device**. You could disconnect your Wi-Fi or turn on Airplane Mode after loading the page, and the conversion still completes successfully.
- When you close the browser tab, the temporary in-memory buffers are instantly purged by the browser's garbage collector.

---

## Performance Benefits: Zero Queue Latency

In addition to rock-solid privacy, client-side conversion eliminates:
- Upload wait times on slow connections.
- Server queue waiting times during peak traffic hours.
- Download wait times.

Your conversions start immediately, leveraging the multi-core CPU of your local computer or smartphone.

---

## OmniTools Privacy Guarantee

At OmniTools, we believe your documents belong exclusively to you. Every single file converter on our platform operates 100% client-side whenever supported by modern web standards. Explore our [Universal Converter](/convert) to experience zero-upload processing firsthand.`,
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
      category: "Privacy & Security",
      tags: ["Privacy", "Security", "Client-Side", "Data Protection"] as any,
      author: "Security Team",
      readingTime: "5 min read",
      status: PageStatus.PUBLISHED,
      seoTitle: "Client-Side vs Server-Side Converters: Privacy Comparison | OmniTools",
      seoDescription: "Learn why in-browser file conversion is the safest way to convert sensitive documents without uploading them to cloud servers.",
      canonicalUrl: "https://omnitools.app/blog/client-side-vs-server-side-file-converters",
      schema: null,
      views: 890,
      publishedAt: new Date("2026-08-20"),
      createdAt: new Date("2026-08-20"),
      updatedAt: new Date("2026-09-05"),
    },
    {
      id: "post_ultimate-pdf-compression",
      slug: "the-ultimate-guide-to-pdf-compression",
      title: "The Ultimate Guide to PDF Compression: Balancing Quality, DPI, and File Size",
      excerpt: "Learn how to compress oversized PDF documents for email attachments, upload portals, and mobile viewing while preserving razor-sharp text typography.",
      content: `## Why Are PDF Files Often So Enormous?

Have you ever tried to submit a PDF job application or email an agreement, only to receive a rejection message stating: *"File exceeds maximum limit of 5 MB"*?

PDF bloat is usually caused by three hidden culprits:
1. **Embedded high-resolution raster images**: A single 300 DPI or 600 DPI scanned page can consume 15–30 MB alone.
2. **Uncompressed streams**: Text and vector graphics stored without Deflate/FlateDecode compression.
3. **Redundant embedded fonts**: Duplicated subsets of system typefaces embedded across multiple pages.

---

## The 3 Key Levers of PDF Compression

To shrink a PDF effectively without turning body text into an unreadable blur, understand the three dials:

### 1. Image Downsampling (DPI)
- **Print Quality (300 DPI)**: Necessary only for physical offset printing.
- **Desktop & Screen Reading (150 DPI)**: Crisp on Retina and 4K screens, saves ~60% size.
- **Web & Email Attachments (72–96 DPI)**: Standard screen resolution, saves up to 85% size.

### 2. Font Subsetting
Ensure only the glyphs actually typed in the document are embedded, rather than the entire 50,000-character font library.

### 3. Stream Compression
Modern PDF specifications support Flate compression for all content streams and object arrays, reducing vector shapes and layout instructions by 40%–70%.

---

## How to Compress a PDF in OmniTools

1. Head over to our [PDF Compress Tool](/tools/pdf/compress).
2. Drag and drop your bloated PDF document.
3. Select your desired compression profile (**Maximum**, **Recommended**, or **High Quality**).
4. Download your lean, email-ready PDF instantly.`,
      coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop&q=80",
      category: "Tutorials",
      tags: ["PDF", "Compression", "Productivity", "Document Management"] as any,
      author: "OmniTools Editorial",
      readingTime: "6 min read",
      status: PageStatus.PUBLISHED,
      seoTitle: "The Ultimate Guide to PDF Compression (2026) | OmniTools",
      seoDescription: "Step-by-step guide to reducing PDF file size for email, web, and upload portals without compromising text clarity.",
      canonicalUrl: "https://omnitools.app/blog/the-ultimate-guide-to-pdf-compression",
      schema: null,
      views: 1560,
      publishedAt: new Date("2026-08-25"),
      createdAt: new Date("2026-08-25"),
      updatedAt: new Date("2026-09-10"),
    },
    {
      id: "post_extract-images-docx-pdf",
      slug: "how-to-extract-high-resolution-images-from-word-docx-and-pdf",
      title: "How to Extract High-Resolution Images from Word DOCX and PDF Files",
      excerpt: "Discover the exact techniques to retrieve original, uncompressed photos and graphics from Microsoft Word documents and PDFs without lossy screenshots.",
      content: `## The Problem with Screenshots

When someone sends you a Word document or PDF containing a logo, photo, or infographic, the most common response is to zoom in and take a screen capture (screenshot).

However, screenshots have major drawbacks:
- **Locked to screen resolution**: You get only 72–144 DPI instead of the original 300+ DPI asset.
- **Color profile shifting**: Converts CMYK or AdobeRGB colors into device sRGB.
- **Loss of transparent backgrounds**: PNG transparency is replaced by a white background.

Here are the proper, lossless techniques to extract the original raw files.

---

## Method 1: The DOCX ZIP Extraction Trick

A Microsoft Word \`.docx\` file is actually an archive containing XML and media files formatted according to the Open Packaging Conventions (OPC).

1. Make a copy of your document: \`report.docx\` → \`report_copy.docx\`.
2. Rename the file extension from \`.docx\` to \`.zip\`.
3. Double-click to open the ZIP archive (or use your favorite archive tool).
4. Navigate to the folder: \`word/media/\`.
5. Inside this directory, you will find every single original PNG, JPEG, and SVG file exactly as the author inserted them, at 100% uncompressed quality!

---

## Method 2: Convert PDF to High-Res Images Online

If your file is a PDF, extracting images manually is harder because PDF files encode bitmap streams within binary XObject dictionaries.

Using OmniTools, you can convert PDF pages directly to high-res PNG or JPG files in seconds:
- Use our [PDF to JPG Tool](/tools/pdf/pdf-to-jpg) to extract individual pages at crisp resolution.
- Or convert Word files directly using our [DOCX to PDF Converter](/convert/docx-to-pdf).`,
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80",
      category: "Tutorials",
      tags: ["DOCX", "PDF", "Image Extraction", "Office Tools"] as any,
      author: "OmniTools Editorial",
      readingTime: "4 min read",
      status: PageStatus.PUBLISHED,
      seoTitle: "How to Extract Images from Word DOCX and PDF (Lossless) | OmniTools",
      seoDescription: "Learn how to extract original full-resolution images from Word DOCX and PDF files without taking low-quality screenshots.",
      canonicalUrl: "https://omnitools.app/blog/how-to-extract-high-resolution-images-from-word-docx-and-pdf",
      schema: null,
      views: 740,
      publishedAt: new Date("2026-09-01"),
      createdAt: new Date("2026-09-01"),
      updatedAt: new Date("2026-09-12"),
    },
  ];

  for (const post of seedPosts) {
    memoryStore.blogPosts.set(post.slug, post);
  }

  memoryStore.initialized = true;
}

// Auto-initialize memory store on import
initializeMemoryStore();

// ============================================
// FORMAT REPOSITORY
// ============================================
export async function getAllFormatsDb(): Promise<Format[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.format.findMany();
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }
  return Array.from(memoryStore.formats.values());
}

export async function getFormatBySlugDb(slug: string): Promise<Format | null> {
  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.format.findUnique({ where: { slug: slug.toLowerCase() } });
      if (record) return record;
    } catch {
      // fallback
    }
  }
  return memoryStore.formats.get(slug.toLowerCase()) || null;
}

// ============================================
// CONVERSION REPOSITORY
// ============================================
export async function getAllConversionsDb(): Promise<Conversion[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.conversion.findMany();
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }
  return Array.from(memoryStore.conversions.values());
}

export async function getConversionBySlugDb(slug: string): Promise<Conversion | null> {
  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.conversion.findUnique({ where: { slug: slug.toLowerCase() } });
      if (record) return record;
    } catch {
      // fallback
    }
  }
  return memoryStore.conversions.get(slug.toLowerCase()) || null;
}

export async function getIndexableConversionsDb(): Promise<Conversion[]> {
  const all = await getAllConversionsDb();
  return all.filter((c) => c.indexable);
}

// ============================================
// SEO PAGE REPOSITORY
// ============================================
export async function getAllSeoPagesDb(): Promise<SeoPage[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.seoPage.findMany();
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }
  return Array.from(memoryStore.seoPages.values());
}

export async function getSeoPageBySlugDb(slug: string): Promise<SeoPage | null> {
  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.seoPage.findUnique({ where: { slug: slug.toLowerCase() } });
      if (record) return record;
    } catch {
      // fallback
    }
  }
  return memoryStore.seoPages.get(slug.toLowerCase()) || null;
}

export async function saveSeoPageDb(pageData: Partial<SeoPage> & { slug: string }): Promise<SeoPage> {
  const slug = pageData.slug.toLowerCase();
  const existing = memoryStore.seoPages.get(slug);

  const updated: SeoPage = {
    id: existing?.id || `page_${slug}`,
    conversionId: pageData.conversionId ?? existing?.conversionId ?? null,
    formatId: pageData.formatId ?? existing?.formatId ?? null,
    type: pageData.type ?? existing?.type ?? SeoPageType.CONVERSION,
    slug,
    canonicalUrl: pageData.canonicalUrl ?? `https://omnitools.app/convert/${slug}`,
    title: pageData.title ?? existing?.title ?? null,
    metaDescription: pageData.metaDescription ?? existing?.metaDescription ?? null,
    h1: pageData.h1 ?? existing?.h1 ?? null,
    intro: pageData.intro ?? existing?.intro ?? null,
    content: pageData.content ?? existing?.content ?? null,
    faq: pageData.faq ?? existing?.faq ?? null,
    answerBlocks: pageData.answerBlocks ?? existing?.answerBlocks ?? null,
    howTo: pageData.howTo ?? existing?.howTo ?? null,
    schema: pageData.schema ?? existing?.schema ?? null,
    seoScore: pageData.seoScore ?? existing?.seoScore ?? 80,
    contentScore: pageData.contentScore ?? existing?.contentScore ?? 85,
    technicalScore: pageData.technicalScore ?? existing?.technicalScore ?? 95,
    aeoScore: pageData.aeoScore ?? existing?.aeoScore ?? 85,
    geoScore: pageData.geoScore ?? existing?.geoScore ?? 85,
    indexable: pageData.indexable ?? existing?.indexable ?? true,
    noIndex: pageData.noIndex ?? existing?.noIndex ?? false,
    canonicalTarget: pageData.canonicalTarget ?? existing?.canonicalTarget ?? null,
    status: pageData.status ?? existing?.status ?? PageStatus.PUBLISHED,
    version: (existing?.version || 0) + 1,
    lastGeneratedAt: new Date(),
    lastReviewedAt: new Date(),
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  memoryStore.seoPages.set(slug, updated);

  if (isDatabaseConfigured()) {
    try {
      await prisma.seoPage.upsert({
        where: { slug },
        create: updated as any,
        update: updated as any,
      });
    } catch {
      // logged or handled
    }
  }

  return updated;
}

export async function updateSeoPageStatusDb(id: string, status: PageStatus): Promise<boolean> {
  for (const [slug, page] of memoryStore.seoPages.entries()) {
    if (page.id === id || slug === id) {
      page.status = status;
      page.updatedAt = new Date();
      return true;
    }
  }
  return false;
}

// ============================================
// SEARCH CONSOLE & QUERIES REPOSITORY
// ============================================
export async function getSearchQueriesDb(limit = 100): Promise<SearchQuery[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.searchQuery.findMany({ take: limit, orderBy: { clicks: "desc" } });
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }
  return memoryStore.searchQueries.slice(0, limit);
}

export async function getOpportunitiesDb(status?: OpportunityStatus): Promise<SeoOpportunity[]> {
  if (isDatabaseConfigured()) {
    try {
      const where = status ? { status } : {};
      const records = await prisma.seoOpportunity.findMany({ where, orderBy: { score: "desc" } });
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }
  const opps = Array.from(memoryStore.opportunities.values());
  if (status) return opps.filter((o) => o.status === status);
  return opps;
}

export async function updateOpportunityStatusDb(id: string, status: OpportunityStatus): Promise<boolean> {
  const opp = memoryStore.opportunities.get(id);
  if (opp) {
    opp.status = status;
    if (status === OpportunityStatus.RESOLVED) opp.resolvedAt = new Date();
    return true;
  }
  return false;
}

export async function getSearchConsolePropertyDb(): Promise<SearchConsoleProperty> {
  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.searchConsoleProperty.findFirst();
      if (record) return record;
    } catch {
      // fallback
    }
  }
  return memoryStore.searchConsole;
}

// ============================================
// SETTINGS REPOSITORY
// ============================================
export async function getSeoSettingsDb(): Promise<SeoSettings> {
  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.seoSettings.findFirst();
      if (record) return record;
    } catch {
      // fallback
    }
  }
  return memoryStore.settings;
}

export async function updateSeoSettingsDb(newSettings: Partial<SeoSettings>): Promise<SeoSettings> {
  memoryStore.settings = {
    ...memoryStore.settings,
    ...newSettings,
    updatedAt: new Date(),
  };

  if (isDatabaseConfigured()) {
    try {
      await prisma.seoSettings.upsert({
        where: { id: memoryStore.settings.id },
        create: memoryStore.settings,
        update: memoryStore.settings,
      });
    } catch {
      // handled
    }
  }

  return memoryStore.settings;
}

// ============================================
// BLOG POST REPOSITORY
// ============================================
export interface BlogQueryOptions {
  status?: PageStatus | "ALL" | string;
  category?: string;
  search?: string;
}

export async function getAllBlogPostsDb(
  optionsOrStatus?: BlogQueryOptions | PageStatus | "ALL" | string
): Promise<BlogPost[]> {
  const options: BlogQueryOptions =
    typeof optionsOrStatus === "string"
      ? { status: optionsOrStatus.toUpperCase() === "ALL" ? "ALL" : optionsOrStatus.toLowerCase() === "published" ? PageStatus.PUBLISHED : optionsOrStatus.toLowerCase() === "draft" ? PageStatus.DRAFT : optionsOrStatus }
      : optionsOrStatus || {};

  if (isDatabaseConfigured()) {
    try {
      const where: any = {};
      if (options?.status && options.status !== "ALL") {
        where.status = options.status;
      }
      if (options?.category && options.category !== "ALL") {
        where.category = options.category;
      }
      if (options?.search && typeof options.search === "string") {
        where.OR = [
          { title: { contains: options.search, mode: "insensitive" } },
          { slug: { contains: options.search, mode: "insensitive" } },
          { excerpt: { contains: options.search, mode: "insensitive" } },
        ];
      }
      const records = await prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
      });
      if (records.length > 0) return records;
    } catch {
      // fallback
    }
  }

  initializeMemoryStore();

  let posts = Array.from(memoryStore.blogPosts.values());

  if (options?.status && options.status !== "ALL") {
    const targetStatus = String(options.status).toLowerCase();
    posts = posts.filter((p) => String(p.status).toLowerCase() === targetStatus);
  }

  if (options?.category && options.category !== "ALL") {
    posts = posts.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.search && typeof options.search === "string") {
    const q = options.search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }

  // Sort by publishedAt desc, fallback to createdAt desc
  return posts.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

export async function getBlogPostBySlugDb(slug: string): Promise<BlogPost | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.blogPost.findUnique({
        where: { slug: normalizedSlug },
      });
      if (record) return record;
    } catch {
      // fallback
    }
  }

  initializeMemoryStore();

  return memoryStore.blogPosts.get(normalizedSlug) || null;
}

export async function saveBlogPostDb(
  postData: Partial<BlogPost> & { slug: string; title: string }
): Promise<BlogPost> {
  const slug = postData.slug.toLowerCase().trim();
  const existing = memoryStore.blogPosts.get(slug);

  // Auto-calculate reading time if content is provided
  let readingTime = postData.readingTime ?? existing?.readingTime;
  if (!readingTime && (postData.content || existing?.content)) {
    const words = (postData.content || existing?.content || "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    readingTime = `${minutes} min read`;
  }

  const updated: BlogPost = {
    id: existing?.id || `post_${slug}`,
    slug,
    title: postData.title,
    excerpt: postData.excerpt ?? existing?.excerpt ?? null,
    content: postData.content ?? existing?.content ?? "",
    coverImage: postData.coverImage ?? existing?.coverImage ?? null,
    category: postData.category ?? existing?.category ?? "Guides",
    tags: postData.tags ?? existing?.tags ?? ([] as any),
    author: postData.author ?? existing?.author ?? "OmniTools Editorial",
    readingTime: readingTime || "3 min read",
    status: postData.status ?? existing?.status ?? PageStatus.DRAFT,
    seoTitle: postData.seoTitle ?? existing?.seoTitle ?? `${postData.title} | OmniTools Blog`,
    seoDescription: postData.seoDescription ?? existing?.seoDescription ?? postData.excerpt ?? null,
    canonicalUrl: postData.canonicalUrl ?? existing?.canonicalUrl ?? `https://omnitools.app/blog/${slug}`,
    schema: postData.schema ?? existing?.schema ?? null,
    views: postData.views ?? existing?.views ?? 0,
    publishedAt:
      postData.status === PageStatus.PUBLISHED
        ? postData.publishedAt ?? existing?.publishedAt ?? new Date()
        : postData.publishedAt ?? existing?.publishedAt ?? null,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  memoryStore.blogPosts.set(slug, updated);

  if (isDatabaseConfigured()) {
    try {
      await prisma.blogPost.upsert({
        where: { slug },
        create: updated as any,
        update: updated as any,
      });
    } catch {
      // handled
    }
  }

  return updated;
}

export async function deleteBlogPostDb(slug: string): Promise<boolean> {
  const normalizedSlug = slug.toLowerCase().trim();
  const existed = memoryStore.blogPosts.delete(normalizedSlug);

  if (isDatabaseConfigured()) {
    try {
      await prisma.blogPost.delete({
        where: { slug: normalizedSlug },
      });
      return true;
    } catch {
      // handled
    }
  }

  return existed;
}

