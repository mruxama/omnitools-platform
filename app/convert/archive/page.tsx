import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Archive Converter — Convert ZIP, TAR, 7Z, RAR In-Browser",
  description:
    "Compress, unpack, and convert archives between ZIP, TAR, 7Z, and RAR formats directly in your browser with configurable deflate compression.",
  keywords: [
    "archive converter",
    "zip to tar",
    "tar to zip",
    "convert zip online",
    "in browser archive converter",
  ],
};

export default function ArchiveConverterPage() {
  const category = getCategoryBySlug("archive");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
