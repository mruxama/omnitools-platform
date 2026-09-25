import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PercentageTool } from "@/components/tools/calculators/PercentageTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Percentage Calculator — Free Online Percent Calculations",
  description:
    "Solve any percentage calculation: percentage increase, decrease, difference, and percent of a number with live formulas and solutions.",
};

export default function PercentagePage() {
  return (
    <ToolPageLayout toolId="percentage-calculator">
      <PercentageTool />
    </ToolPageLayout>
  );
}
