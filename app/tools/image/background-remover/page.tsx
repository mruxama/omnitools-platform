import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { BackgroundRemoverTool } from "@/components/tools/image/BackgroundRemoverTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover — Make Transparent PNGs Online Free",
  description:
    "Remove backgrounds from photos, graphics, signatures, and product shots. Fast, edge-aware segmentation that runs 100% in your browser.",
};

export default function BackgroundRemoverPage() {
  return (
    <ToolPageLayout toolId="background-remover">
      <BackgroundRemoverTool />
    </ToolPageLayout>
  );
}
