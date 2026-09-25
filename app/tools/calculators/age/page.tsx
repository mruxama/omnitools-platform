import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { AgeTool } from "@/components/tools/calculators/AgeTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Calculator — Calculate Exact Age, Days & Next Birthday",
  description:
    "Find your exact age in years, months, and days with total days lived, day of week born, and countdown to your next birthday.",
};

export default function AgePage() {
  return (
    <ToolPageLayout toolId="age-calculator">
      <AgeTool />
    </ToolPageLayout>
  );
}
