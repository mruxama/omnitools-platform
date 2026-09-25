import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { SplitPdfTool } from "@/components/tools/pdf/SplitPdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF — Extract Pages or Split Ranges Online Free",
  description:
    "Split a PDF into multiple documents by custom page ranges or individual pages. Fast, free, and completely secure in-browser processing.",
};

export default function SplitPdfPage() {
  return (
    <ToolPageLayout toolId="split-pdf">
      <SplitPdfTool />
    </ToolPageLayout>
  );
}
