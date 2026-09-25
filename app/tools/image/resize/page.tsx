import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageResizerTool } from "@/components/tools/image/ImageResizerTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer — Change Image Dimensions & Scale Online",
  description:
    "Resize images to exact dimensions, percentages, or social media presets with aspect ratio lock. Fast, free, and completely secure in-browser.",
};

export default function ImageResizePage() {
  return (
    <ToolPageLayout toolId="image-resizer">
      <ImageResizerTool />
    </ToolPageLayout>
  );
}
