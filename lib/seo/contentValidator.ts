import { Format } from "@prisma/client";

export interface ValidationReport {
  isValid: boolean;
  canPublish: boolean;
  accuracyScore: number;
  technicalCorrectnessScore: number;
  originalityScore: number;
  errors: string[];
  warnings: string[];
}

/**
 * Quality validator enforcing strict anti-hallucination and content standards:
 * - Accuracy >= 90
 * - Technical correctness >= 95
 * - Originality >= 80
 */
export function validateContent(
  content: {
    title?: string;
    metaDescription?: string;
    h1?: string;
    intro?: string;
    howToSteps?: string[];
    faq?: { question: string; answer: string }[];
    benefits?: string[];
  },
  source: Partial<Format>,
  target: Partial<Format>
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  let accuracyScore = 100;
  let technicalCorrectnessScore = 100;
  let originalityScore = 90;

  // 1. Mandatory Fields Check
  if (!content.title || content.title.length < 15) {
    errors.push("Title is missing or too short.");
    technicalCorrectnessScore -= 20;
  }
  if (!content.metaDescription || content.metaDescription.length < 50) {
    errors.push("Meta description is missing or too short.");
    technicalCorrectnessScore -= 20;
  }
  if (!content.h1 || content.h1.trim().length === 0) {
    errors.push("H1 heading is missing.");
    technicalCorrectnessScore -= 20;
  }

  // 2. Anti-Hallucination: Format Verification
  const combinedText = `${content.title || ""} ${content.metaDescription || ""} ${content.intro || ""}`.toLowerCase();
  const sourceSlug = (source.slug || "").toLowerCase();
  const targetSlug = (target.slug || "").toLowerCase();

  if (!combinedText.includes(sourceSlug) || !combinedText.includes(targetSlug)) {
    warnings.push("Text does not clearly mention both source and target format identifiers.");
    accuracyScore -= 15;
  }

  // 3. Prohibited Spam & Fake Claims Check
  const spamTriggers = [
    "guaranteed google #1",
    "guaranteed ranking",
    "100% 5-star reviews",
    "voted best software in the universe",
    "pricing starts at $99/mo", // fake pricing
    "over 10,000,000 happy customers", // fake social proof
  ];

  for (const trigger of spamTriggers) {
    if (combinedText.includes(trigger)) {
      errors.push(`Prohibited false claim or spam phrase detected: "${trigger}"`);
      accuracyScore -= 30;
      technicalCorrectnessScore -= 30;
    }
  }

  // 4. Repetition & Keyword Stuffing Check
  const wordTokens = combinedText.split(/\s+/).filter((w) => w.length > 3);
  const freq: Record<string, number> = {};
  for (const w of wordTokens) {
    freq[w] = (freq[w] || 0) + 1;
    if (freq[w] > 20 && !["converter", "convert", "format", "online"].includes(w)) {
      warnings.push(`Excessive repetition of term "${w}". Possible keyword stuffing.`);
      originalityScore -= 10;
    }
  }

  // 5. How-To Steps Validation
  if (!content.howToSteps || content.howToSteps.length < 3) {
    warnings.push("Less than 3 sequential how-to steps provided.");
    technicalCorrectnessScore -= 10;
  }

  // 6. Minimum Threshold Verification
  const canPublish =
    errors.length === 0 &&
    accuracyScore >= 90 &&
    technicalCorrectnessScore >= 95 &&
    originalityScore >= 80;

  return {
    isValid: errors.length === 0,
    canPublish,
    accuracyScore: Math.max(0, accuracyScore),
    technicalCorrectnessScore: Math.max(0, technicalCorrectnessScore),
    originalityScore: Math.max(0, originalityScore),
    errors,
    warnings,
  };
}
