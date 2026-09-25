import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageMetadataTool } from "@/components/tools/image/ImageMetadataTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Metadata (EXIF) Viewer & Stripper Online",
  description:
    "View camera models, exposure settings, ISO, focal length, capture dates, and GPS coordinates. Strip all EXIF data for privacy.",
};

export default function ImageMetadataPage() {
  return (
    <ToolPageLayout toolId="image-metadata">
      <ImageMetadataTool />
    </ToolPageLayout>
  );
}
