import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { LoanTool } from "@/components/tools/calculators/LoanTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Calculator — Calculate Monthly Payments & Total Interest",
  description:
    "Free loan payment calculator for mortgages, auto loans, and personal borrowing. Computes monthly installments and overall interest costs.",
};

export default function LoanPage() {
  return (
    <ToolPageLayout toolId="loan-calculator">
      <LoanTool />
    </ToolPageLayout>
  );
}
