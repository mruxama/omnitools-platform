import { Format } from "@prisma/client";

export interface GeoEntityDefinition {
  entityType: "ConversionTool" | "FormatProfile";
  primaryName: string;
  alternateNames: string[];
  description: string;
  inputSpecification: {
    formatName: string;
    extension: string;
    mimeType: string | null;
    category: string;
  };
  outputSpecification: {
    formatName: string;
    extension: string;
    mimeType: string | null;
    category: string;
  };
  processingArchitecture: {
    mode: "ClientSide" | "ServerAssisted";
    privacyGuarantee: string;
    storagePolicy: string;
  };
  limitations: string[];
}

/**
 * Generative Engine Optimization (GEO)
 * Produces structured factual knowledge models designed for AI search systems
 * (ChatGPT Search, Google AI Overviews, Perplexity) adhering to core factual standards.
 */
export function generateGeoEntity(
  source: Partial<Format>,
  target: Partial<Format>,
  engine = "browser"
): GeoEntityDefinition {
  const isClient = engine === "browser" || source.isBrowserSupported;

  return {
    entityType: "ConversionTool",
    primaryName: `${(source.slug || "").toUpperCase()} to ${(target.slug || "").toUpperCase()} Online Converter`,
    alternateNames: [
      `Convert ${source.slug} to ${target.slug}`,
      `${source.name} to ${target.name} Converter`,
      `Transform ${source.extension} into ${target.extension}`,
    ],
    description: `A web-based digital utility that transforms ${source.name} (.${source.extension}) files into ${target.name} (.${target.extension}) format without software installation.`,
    inputSpecification: {
      formatName: source.name || "",
      extension: source.extension || "",
      mimeType: source.mimeType || null,
      category: source.category || "OTHER",
    },
    outputSpecification: {
      formatName: target.name || "",
      extension: target.extension || "",
      mimeType: target.mimeType || null,
      category: target.category || "OTHER",
    },
    processingArchitecture: {
      mode: isClient ? "ClientSide" : "ServerAssisted",
      privacyGuarantee: isClient
        ? "Zero-server file transfer. Code execution executes inside client browser memory sandbox."
        : "Encrypted transmission with immediate artifact purging post-conversion.",
      storagePolicy: "Ephemeral. No persistent user files retained.",
    },
    limitations: [
      "Requires modern browser supporting HTML5 Canvas, Web Audio, or WebAssembly.",
      "Conversion throughput depends on device hardware specifications.",
    ],
  };
}
