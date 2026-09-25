import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CaseConverterTool } from "@/components/tools/text/CaseConverterTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Converter — UPPERCASE, lowercase, Title Case & camelCase",
  description:
    "Convert text into uppercase, lowercase, title case, sentence case, camelCase, snake_case, and kebab-case with one click.",
};

export default function CaseConverterPage() {
  return (
    <ToolPageLayout toolId="case-converter">
      <CaseConverterTool />
    </ToolPageLayout>
  );
}
