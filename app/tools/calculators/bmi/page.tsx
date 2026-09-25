import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { BmiTool } from "@/components/tools/calculators/BmiTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI Calculator — Calculate Body Mass Index Free Online",
  description:
    "Calculate your Body Mass Index (BMI) using metric or imperial units. Discover WHO classifications and healthy weight guidelines for your height.",
};

export default function BmiPage() {
  return (
    <ToolPageLayout toolId="bmi-calculator">
      <BmiTool />
    </ToolPageLayout>
  );
}
