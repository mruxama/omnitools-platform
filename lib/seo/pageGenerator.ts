import { Format, Conversion, SeoPage, PageStatus, SeoPageType } from "@prisma/client";
import { generateAnswerBlocks } from "./aeoEngine";
import { generateGeoEntity } from "./geoEngine";
import { calculateSeoScore } from "./scoringEngine";

export interface PageGeneratorOptions {
  siteName?: string;
  domain?: string;
  searchQueries?: { query: string; impressions: number }[];
}

/**
 * Page Generation Engine
 * Creates rich, factual, programmatic SEO/AEO/GEO page data for a supported conversion.
 */
export function generateSeoPageData(
  source: Partial<Format>,
  target: Partial<Format>,
  conversion: Partial<Conversion>,
  options: PageGeneratorOptions = {}
): Partial<SeoPage> {
  const domain = options.domain || "https://omnitools.app";
  const slug = conversion.slug || `${source.slug}-to-${target.slug}`;
  const sExt = (source.extension || source.slug || "").toUpperCase();
  const tExt = (target.extension || target.slug || "").toUpperCase();
  const sName = source.name || sExt;
  const tName = target.name || tExt;

  // Title & Description
  const title = `Convert ${sExt} to ${tExt} Online Free — Fast & In-Browser`;
  const metaDescription = `Convert ${sName} (${sExt}) to ${tName} (${tExt}) online for free. 100% private in-browser conversion with zero file uploads, instant download, and high fidelity.`;
  const h1 = `Convert ${sExt} to ${tExt} Online`;
  const intro = `Transform your ${sName} files into ${tName} format directly in your browser. Powered by client-side Web APIs for complete privacy, zero upload waiting times, and instantaneous file generation.`;

  // Capabilities
  const clientSide = conversion.browserSupport ?? source.isBrowserSupported ?? true;
  const compression = target.category === "IMAGE" || target.category === "AUDIO" || target.category === "ARCHIVE";

  // How-To Steps
  const howToSteps = [
    `Upload your .${source.extension || source.slug} file by dragging it into the converter or choosing it from your device.`,
    `Verify output format is set to ${tExt}. Optionally customize quality, dimensions, or compression options.`,
    `Click "Convert" to process the file locally in your browser and download the generated ${tExt} instantly.`,
  ];

  // Benefits
  const benefits = [
    clientSide
      ? "100% Client-Side Privacy: Your files never leave your computer or touch remote servers."
      : "Secure Processing: Data is encrypted and automatically purged immediately upon completion.",
    `Lossless & High Quality: Preserves maximum visual, audio, or document structure integrity.`,
    "Instant Zero-Queue Conversion: Powered directly by your local hardware with no cloud waiting lines.",
    "Completely Free & Limitless: No accounts, no paywalls, and no daily file conversion caps.",
  ];

  // Limitations
  const limitations = [
    `Requires modern HTML5 compliant web browser for local client-side processing.`,
    `Processing speed is bounded by your device's memory and CPU.`,
  ];

  // AEO Answer Blocks
  const answerBlocks = generateAnswerBlocks(source, target, {
    clientSide,
    compression,
  });

  // Targeted FAQs
  const faq = [
    {
      question: `How do I convert ${sExt} to ${tExt}?`,
      answer: `Drag and drop your ${sExt} file into the converter box above, select ${tExt} as your output format, adjust any desired options, and click "Convert". Your new file will be ready for download in seconds.`,
    },
    {
      question: `Is converting ${sExt} to ${tExt} secure?`,
      answer: `Yes, your privacy is fully protected. Conversions run locally inside your web browser sandbox. Your confidential files never touch our servers.`,
    },
    {
      question: `What is the difference between ${sExt} and ${tExt}?`,
      answer: `${sName} (.${source.extension}) is widely used for ${source.description || "general digital files"}, whereas ${tName} (.${target.extension}) provides ${target.description || "specialized features, compatibility, or enhanced compression"}.`,
    },
    {
      question: `Can I convert ${sExt} to ${tExt} on mobile devices?`,
      answer: `Yes, OmniTools works smoothly on iPhone, iPad, Android, Mac, Windows, and Linux browsers without downloading third-party apps.`,
    },
  ];

  // Schema.org JSON-LD
  const canonicalUrl = `${domain}/convert/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#software`,
        name: `${sExt} to ${tExt} Converter`,
        url: canonicalUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        browserRequirements: "Requires HTML5 compliant web browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "HowTo",
        "@id": `${canonicalUrl}#howto`,
        name: `How to Convert ${sExt} to ${tExt}`,
        step: howToSteps.map((stepText, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: `Step ${idx + 1}`,
          text: stepText,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: domain },
          { "@type": "ListItem", position: 2, name: "Convert", item: `${domain}/convert` },
          { "@type": "ListItem", position: 3, name: `${sExt} to ${tExt}`, item: canonicalUrl },
        ],
      },
    ],
  };

  const draftPage: Partial<SeoPage> = {
    slug,
    canonicalUrl,
    title,
    metaDescription,
    h1,
    intro,
    type: SeoPageType.CONVERSION,
    status: PageStatus.PUBLISHED,
    indexable: conversion.indexable ?? true,
    noIndex: !(conversion.indexable ?? true),
    content: {
      howToSteps,
      benefits,
      limitations,
    } as any,
    faq: faq as any,
    answerBlocks: answerBlocks as any,
    schema: schema as any,
    version: 1,
  };

  const scoreResult = calculateSeoScore(draftPage);
  draftPage.seoScore = scoreResult.overallScore;
  draftPage.technicalScore = scoreResult.technicalScore;
  draftPage.contentScore = scoreResult.contentScore;
  draftPage.aeoScore = scoreResult.aeoScore;
  draftPage.geoScore = scoreResult.geoScore;

  return draftPage;
}
