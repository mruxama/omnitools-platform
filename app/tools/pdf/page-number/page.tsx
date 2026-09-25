import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PageNumberTool } from "@/components/tools/pdf/PageNumberTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF — Number PDF Pages Online Free",
  description:
    "Add customizable page numbers to your PDF documents. Select positions, numbering styles, font sizes, colors, and skip cover pages.",
};

export default function PageNumberPage() {
  return (
    <ToolPageLayout toolId="pdf-page-number">
      <PageNumberTool />
    </ToolPageLayout>
  );
}
