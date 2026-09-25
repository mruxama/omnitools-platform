import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { MetadataPdfTool } from "@/components/tools/pdf/MetadataPdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Metadata Viewer & Editor — View and Strip PDF Metadata",
  description:
    "Inspect, edit, and sanitize hidden metadata in PDF documents. Strip Title, Author, and Creator identifiers before sharing files publicly.",
};

export default function PdfMetadataPage() {
  return (
    <ToolPageLayout toolId="pdf-metadata">
      <MetadataPdfTool />
    </ToolPageLayout>
  );
}
