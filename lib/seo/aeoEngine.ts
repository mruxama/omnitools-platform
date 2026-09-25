import { Format } from "@prisma/client";

export interface AeoAnswerBlock {
  question: string;
  answer: string;
  directExtract: string;
  targetQueryType: "how_to" | "comparison" | "privacy" | "capability";
}

/**
 * Answer Engine Optimization (AEO)
 * Generates concise, factual, high-clarity answers engineered for voice search,
 * AI direct overviews, and Google featured snippets.
 */
export function generateAnswerBlocks(
  source: Partial<Format>,
  target: Partial<Format>,
  capabilities: { clientSide: boolean; compression: boolean; transparency?: boolean }
): AeoAnswerBlock[] {
  const sName = source.name || source.slug?.toUpperCase() || "File";
  const tName = target.name || target.slug?.toUpperCase() || "Target";
  const sExt = (source.extension || source.slug || "").toUpperCase();
  const tExt = (target.extension || target.slug || "").toUpperCase();

  const blocks: AeoAnswerBlock[] = [
    {
      question: `How do I convert ${sExt} to ${tExt} online?`,
      answer: `To convert ${sExt} to ${tExt}, upload your ${sExt} file into the converter, choose ${tExt} as the target format, adjust optional quality or dimension settings, and click "Convert". Your new ${tExt} file downloads immediately.`,
      directExtract: `Upload ${sExt} → Select ${tExt} → Click Convert → Download.`,
      targetQueryType: "how_to",
    },
    {
      question: `Can I convert ${sExt} to ${tExt} without uploading files to a server?`,
      answer: capabilities.clientSide
        ? `Yes. OmniTools converts ${sExt} to ${tExt} entirely inside your browser using client-side Web APIs. Your files are processed in local memory and are never transmitted to any external server.`
        : `Yes, conversions are processed securely with automatic file deletion immediately upon completion.`,
      directExtract: capabilities.clientSide
        ? `Yes, 100% in-browser processing with zero server uploads.`
        : `Secure server processing with immediate file deletion.`,
      targetQueryType: "privacy",
    },
    {
      question: `Is converting ${sExt} to ${tExt} completely free?`,
      answer: `Yes, converting ${sExt} to ${tExt} on OmniTools is 100% free with no account registration, no watermarks, and no arbitrary daily file limits.`,
      directExtract: `Free, no registration, no watermarks.`,
      targetQueryType: "capability",
    },
  ];

  if (capabilities.compression) {
    blocks.push({
      question: `Does converting ${sExt} to ${tExt} reduce file size?`,
      answer: `Yes. ${tExt} offers advanced compression algorithms that typically reduce file sizes by 30% to 70% compared to legacy ${sExt} files while preserving visual and audio fidelity.`,
      directExtract: `Reduces file size by up to 30%–70% while preserving fidelity.`,
      targetQueryType: "comparison",
    });
  }

  return blocks;
}
