import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { JpgToPdfTool } from "@/components/tools/pdf/JpgToPdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG & PNG to PDF — Convert Images to PDF Online Free",
  description:
    "Convert multiple JPG, PNG, and WebP images into a single organized PDF. Adjust page sizes, orientations, and margins easily in your browser.",
};

export default function JpgToPdfPage() {
  return (
    <ToolPageLayout toolId="jpg-to-pdf">
      <JpgToPdfTool />
    </ToolPageLayout>
  );
}
