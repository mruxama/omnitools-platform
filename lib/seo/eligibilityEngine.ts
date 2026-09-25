import { Conversion, Format } from "@prisma/client";

export type IndexabilityDecision = "INDEX" | "REVIEW" | "NOINDEX" | "DO_NOT_CREATE";

export interface EligibilityResult {
  score: number;
  decision: IndexabilityDecision;
  isIndexable: boolean;
  reasons: string[];
  breakdown: {
    demandScore: number;
    usefulnessScore: number;
    functionalityScore: number;
    uniquenessScore: number;
    relevanceScore: number;
    competitionScore: number;
    readinessScore: number;
  };
}

/**
 * Evaluates whether a conversion deserves an indexable public page.
 * Implements strict anti-spam rules to prevent doorway page generation.
 */
export function evaluateEligibility(
  source: Partial<Format>,
  target: Partial<Format>,
  conversion?: Partial<Conversion>,
  customThreshold = 80
): EligibilityResult {
  const reasons: string[] = [];

  // 1. Hard Disqualification Check (Engine & Support Check)
  if (!source.isInputSupported || !target.isOutputSupported) {
    return {
      score: 0,
      decision: "DO_NOT_CREATE",
      isIndexable: false,
      reasons: ["Input or output format not supported by any active conversion engine."],
      breakdown: {
        demandScore: 0,
        usefulnessScore: 0,
        functionalityScore: 0,
        uniquenessScore: 0,
        relevanceScore: 0,
        competitionScore: 0,
        readinessScore: 0,
      },
    };
  }

  // 2. Component Scoring
  // A. Actual Functionality (Weight: 20%)
  let functionalityScore = 95;
  if (source.isBrowserSupported && target.isBrowserSupported) {
    functionalityScore = 100;
    reasons.push("100% Client-side browser execution verified");
  } else if (source.isServerSupported) {
    functionalityScore = 85;
    reasons.push("Server fallback execution available");
  }

  // B. Usefulness Score (Weight: 20%)
  // Same category is almost always useful (e.g. JPG to WebP, WAV to MP3, DOCX to PDF)
  let usefulnessScore = 70;
  const isSameCategory = source.category === target.category;
  const isImageToDoc = source.category === "IMAGE" && target.slug === "pdf";
  const isDocToImage = source.slug === "pdf" && target.category === "IMAGE";
  const isDataToDoc = source.category === "SPREADSHEET" && (target.slug === "html" || target.slug === "txt");

  if (isSameCategory || isImageToDoc || isDocToImage || isDataToDoc) {
    usefulnessScore = 95;
    reasons.push("High practical utility across common real-world workflows");
  } else {
    usefulnessScore = 40;
    reasons.push("Low inter-category relevance");
  }

  // C. Search Demand Score (Weight: 25%)
  let demandScore = conversion?.demandScore ?? 60;
  // Common mainstream formats have naturally high search demand
  const highDemandFormats = new Set(["jpg", "jpeg", "png", "webp", "pdf", "docx", "mp3", "wav", "mp4", "gif", "csv", "xlsx"]);
  if (highDemandFormats.has(source.slug || "") && highDemandFormats.has(target.slug || "")) {
    demandScore = Math.max(demandScore, 90);
    reasons.push("High global search volume for format pair");
  }

  // D. Content Uniqueness (Weight: 15%)
  const uniquenessScore = conversion?.uniquenessScore ?? 85;

  // E. Internal Relevance (Weight: 10%)
  const relevanceScore = isSameCategory ? 90 : 60;

  // F. Competition (Weight: 5%)
  const competitionScore = conversion?.competitionScore ?? 70;

  // G. Technical Readiness (Weight: 5%)
  const readinessScore = 100;

  // Weighted Calculation
  const totalScore = Math.round(
    demandScore * 0.25 +
      usefulnessScore * 0.2 +
      functionalityScore * 0.2 +
      uniquenessScore * 0.15 +
      relevanceScore * 0.1 +
      competitionScore * 0.05 +
      readinessScore * 0.05
  );

  let decision: IndexabilityDecision = "NOINDEX";
  if (totalScore >= customThreshold) {
    decision = "INDEX";
  } else if (totalScore >= 65) {
    decision = "REVIEW";
  } else if (totalScore >= 40) {
    decision = "NOINDEX";
  } else {
    decision = "DO_NOT_CREATE";
  }

  return {
    score: totalScore,
    decision,
    isIndexable: decision === "INDEX",
    reasons,
    breakdown: {
      demandScore,
      usefulnessScore,
      functionalityScore,
      uniquenessScore,
      relevanceScore,
      competitionScore,
      readinessScore,
    },
  };
}
