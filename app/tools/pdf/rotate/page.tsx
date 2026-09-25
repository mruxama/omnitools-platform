import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { RotatePdfTool } from "@/components/tools/pdf/RotatePdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online — Fix Page Orientation Free",
  description:
    "Rotate upside down or sideways PDF pages by 90, 180, or 270 degrees. Apply to specific pages or the entire document 100% locally.",
};

export default function RotatePdfPage() {
  return (
    <ToolPageLayout toolId="rotate-pdf">
      <RotatePdfTool />
    </ToolPageLayout>
  );
}
