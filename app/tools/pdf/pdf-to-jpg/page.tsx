import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PdfToJpgTool } from "@/components/tools/pdf/PdfToJpgTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to JPG & PNG — Convert PDF Pages to Images Online",
  description:
    "Convert PDF document pages into high-resolution JPG or PNG pictures. Free, fast, with individual page downloads and full ZIP archive export.",
};

export default function PdfToJpgPage() {
  return (
    <ToolPageLayout toolId="pdf-to-jpg">
      <PdfToJpgTool />
    </ToolPageLayout>
  );
}
