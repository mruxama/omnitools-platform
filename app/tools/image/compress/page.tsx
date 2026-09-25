import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageCompressorTool } from "@/components/tools/image/ImageCompressorTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Compress JPG, PNG & WebP Online Free",
  description:
    "Compress single or batch images with adjustable quality sliders. Reduce image size without losing visual clarity. 100% private in-browser tool.",
};

export default function ImageCompressPage() {
  return (
    <ToolPageLayout toolId="image-compressor">
      <ImageCompressorTool />
    </ToolPageLayout>
  );
}
