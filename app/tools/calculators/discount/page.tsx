import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DiscountTool } from "@/components/tools/calculators/DiscountTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discount Calculator — Calculate Sale Prices, Savings & Tax",
  description:
    "Calculate sale prices, discounts, coupon savings, and sales tax. Discover exact total payable and money saved in your browser.",
};

export default function DiscountPage() {
  return (
    <ToolPageLayout toolId="discount-calculator">
      <DiscountTool />
    </ToolPageLayout>
  );
}
