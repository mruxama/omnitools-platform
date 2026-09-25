import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CropRotateTool } from "@/components/tools/image/CropRotateTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop & Rotate Image — Free Online Image Editor",
  description:
    "Rotate photos 90 degrees or custom angles, flip horizontally or vertically, and adjust orientation with live in-browser preview.",
};

export default function CropRotatePage() {
  return (
    <ToolPageLayout toolId="crop-rotate">
      <CropRotateTool />
    </ToolPageLayout>
  );
}
