import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CompoundInterestTool } from "@/components/tools/calculators/CompoundInterestTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compound Interest Calculator — Forecast Investment Growth",
  description:
    "Simulate investment balance with regular monthly contributions and compounding frequencies. Visualize long-term wealth accumulation.",
};

export default function CompoundInterestPage() {
  return (
    <ToolPageLayout toolId="compound-interest-calculator">
      <CompoundInterestTool />
    </ToolPageLayout>
  );
}
