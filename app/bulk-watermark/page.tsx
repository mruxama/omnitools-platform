import { Metadata } from "next";
import { BulkWatermarkStudio } from "@/components/watermark/BulkWatermarkStudio";

export const metadata: Metadata = {
  title: "Bulk Image & Video Watermark Studio | OmniTools",
  description:
    "Professional batch watermark tool for images and videos. Add custom logos, multi-line text, 3x3 grid positioning, opacity, rotation, and export with zero server uploads.",
};

export default function BulkWatermarkAliasPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] flex flex-col">
      <BulkWatermarkStudio />
    </main>
  );
}
