import { CategoryPageTemplate } from "@/components/tools/CategoryPageTemplate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online PDF Tools — Merge, Split, Compress & Convert",
  description:
    "Free, secure online PDF utilities. Merge, split, compress, rotate, organize, and convert PDFs 100% locally in your browser with zero file uploads.",
};

export default function PdfCategoryPage() {
  return <CategoryPageTemplate categoryKey="pdf" />;
}
