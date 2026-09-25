import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageConverterTool } from "@/components/tools/image/ImageConverterTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter — Convert between JPG, PNG & WebP Online",
  description:
    "Convert multiple images between JPG, PNG, and WebP formats with quality controls and batch ZIP download. 100% in-browser processing.",
};

export default function ImageConvertPage() {
  return (
    <ToolPageLayout toolId="image-converter">
      <ImageConverterTool />
    </ToolPageLayout>
  );
}
