import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { MergePdfTool } from "@/components/tools/pdf/MergePdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF — Combine Multiple PDF Files Online Free",
  description:
    "Combine multiple PDF files into one organized document in seconds. 100% private, free, and runs locally in your browser with zero file uploads.",
};

export default function MergePdfPage() {
  return (
    <ToolPageLayout toolId="merge-pdf">
      <MergePdfTool />
    </ToolPageLayout>
  );
}
