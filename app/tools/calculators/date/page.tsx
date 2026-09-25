import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DateTool } from "@/components/tools/calculators/DateTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Date Calculator — Days Between Dates & Business Days",
  description:
    "Calculate exact duration between dates, count business working days without weekends, and add or subtract time to any calendar date.",
};

export default function DatePage() {
  return (
    <ToolPageLayout toolId="date-calculator">
      <DateTool />
    </ToolPageLayout>
  );
}
