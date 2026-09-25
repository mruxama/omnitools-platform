import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CompressPdfTool } from "@/components/tools/pdf/CompressPdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF — Reduce PDF File Size Online Free",
  description:
    "Shrink your PDF file size while maintaining document quality and formatting. Real stream optimization with instant before-and-after size metrics.",
};

export default function CompressPdfPage() {
  return (
    <ToolPageLayout toolId="compress-pdf">
      <CompressPdfTool />
    </ToolPageLayout>
  );
}
