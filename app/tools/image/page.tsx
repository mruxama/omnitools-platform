import { CategoryPageTemplate } from "@/components/tools/CategoryPageTemplate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Image Tools — Compress, Resize, Convert & Crop",
  description:
    "Fast, private image optimization and editing utilities. Compress, resize, convert between JPG, PNG, and WebP, and crop photos without uploading your files.",
};

export default function ImageCategoryPage() {
  return <CategoryPageTemplate categoryKey="image" />;
}
