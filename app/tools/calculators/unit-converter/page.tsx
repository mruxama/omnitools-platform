import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UnitConverterTool } from "@/components/tools/calculators/UnitConverterTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter — Convert Length, Weight, Temperature & More",
  description:
    "Universal unit converter for 10 categories: Length, Weight, Temperature, Area, Volume, Speed, Time, Digital Storage, Energy, and Pressure.",
};

export default function UnitConverterPage() {
  return (
    <ToolPageLayout toolId="unit-converter">
      <UnitConverterTool />
    </ToolPageLayout>
  );
}
