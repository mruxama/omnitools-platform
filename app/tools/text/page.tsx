import { CategoryPageTemplate } from "@/components/tools/CategoryPageTemplate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Text Tools — Word Counter & Case Converter",
  description:
    "Fast, private text tools to count words, characters, reading times, and convert between uppercase, lowercase, title case, and programming casings.",
};

export default function TextCategoryPage() {
  return <CategoryPageTemplate categoryKey="text" />;
}
