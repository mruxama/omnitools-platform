import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Image Converter — Convert JPG, PNG, WebP, AVIF, PSD, ICO Free & In-Browser",
  description:
    "Convert images between JPG, PNG, WebP, AVIF, BMP, ICO, and Photoshop PSD. 100% private in-browser conversion with zero server uploads.",
  keywords: [
    "image converter",
    "jpg to webp",
    "png to jpg",
    "psd to png",
    "ico converter",
    "convert photos online",
    "free image converter",
  ],
};

export default function ImageConverterPage() {
  const category = getCategoryBySlug("image");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
