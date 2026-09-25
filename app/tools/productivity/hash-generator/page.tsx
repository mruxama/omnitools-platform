import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { HashGeneratorTool } from "@/components/tools/productivity/HashGeneratorTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cryptographic Hash Generator — SHA-256, SHA-512, MD5 Online",
  description:
    "Generate SHA-256, SHA-512, SHA-384, and SHA-1 cryptographic hashes instantly in your browser using the native Web Crypto API.",
};

export default function HashGeneratorPage() {
  return (
    <ToolPageLayout toolId="hash-generator">
      <HashGeneratorTool />
    </ToolPageLayout>
  );
}
