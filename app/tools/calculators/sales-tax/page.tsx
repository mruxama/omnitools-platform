import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { SalesTaxTool } from "@/components/tools/calculators/SalesTaxTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Tax Calculator — Forward and Reverse Tax Online Free",
  description:
    "Easily add tax to a net price or reverse-calculate pre-tax cost from a total receipt. Fast, accurate, and completely free in your browser.",
};

export default function SalesTaxPage() {
  return (
    <ToolPageLayout toolId="sales-tax-calculator">
      <SalesTaxTool />
    </ToolPageLayout>
  );
}
