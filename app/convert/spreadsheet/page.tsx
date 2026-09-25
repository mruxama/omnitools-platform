import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Spreadsheet & Data Converter — Convert CSV, TSV, JSON, Excel XLSX",
  description:
    "Convert between CSV, TSV, JSON, and Microsoft Excel XLSX workbooks. Pure in-browser spreadsheet generation and shared strings parsing.",
  keywords: [
    "spreadsheet converter",
    "csv to xlsx",
    "excel to csv",
    "csv to json",
    "json to csv",
    "convert spreadsheets free",
  ],
};

export default function SpreadsheetConverterPage() {
  const category = getCategoryBySlug("spreadsheet");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
