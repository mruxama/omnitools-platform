import { CategoryPageTemplate } from "@/components/tools/CategoryPageTemplate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Calculators & Unit Converters",
  description:
    "Instant, accurate online calculators for percentages, discounts, dates, age, loans, compound interest, and 10 comprehensive unit conversion categories.",
};

export default function CalculatorsCategoryPage() {
  return <CategoryPageTemplate categoryKey="calculators" />;
}
