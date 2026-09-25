import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { WatermarkPdfTool } from "@/components/tools/pdf/WatermarkPdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark PDF — Add Text Watermarks to PDF Online Free",
  description:
    "Stamp custom text watermarks onto PDF pages with angle, opacity, and font customization. 100% private, free, and in-browser.",
};

export default function WatermarkPdfPage() {
  return (
    <ToolPageLayout toolId="pdf-watermark">
      <WatermarkPdfTool />
    </ToolPageLayout>
  );
}
