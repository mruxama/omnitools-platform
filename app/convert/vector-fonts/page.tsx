import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Vector, Ebooks & Fonts Converter — Convert SVG, EPUB, MOBI, TTF, WOFF2",
  description:
    "Convert SVG vector artwork to PNG/WebP, extract chapters from EPUB e-books to PDF/HTML, and manage font typography in your browser.",
  keywords: [
    "vector converter",
    "svg to png",
    "epub to pdf",
    "epub converter",
    "font converter",
    "ttf to woff2",
  ],
};

export default function VectorFontsConverterPage() {
  const category = getCategoryBySlug("vector-fonts");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
