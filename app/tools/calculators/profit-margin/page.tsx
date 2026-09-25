import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ProfitMarginTool } from "@/components/tools/calculators/ProfitMarginTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit Margin Calculator — Calculate Margin, Markup & Profit",
  description:
    "Essential ecommerce and retail calculator. Compute gross profit, margin percentage, and markup percentage from unit cost and selling price.",
};

export default function ProfitMarginPage() {
  return (
    <ToolPageLayout toolId="profit-margin-calculator">
      <ProfitMarginTool />
    </ToolPageLayout>
  );
}
