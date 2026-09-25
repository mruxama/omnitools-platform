import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Document Converter — Convert PDF, Word DOCX, TXT, MD, HTML, ODT, RTF",
  description:
    "Convert Word DOCX documents, compile multi-page A4 PDFs, transform Markdown to HTML, and extract text from ODT & RTF files client-side with complete privacy.",
  keywords: [
    "document converter",
    "docx to pdf",
    "word to pdf",
    "markdown to html",
    "odt to pdf",
    "free pdf converter",
  ],
};

export default function DocumentConverterPage() {
  const category = getCategoryBySlug("document");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
