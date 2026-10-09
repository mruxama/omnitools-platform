import { Metadata } from "next";
import { BulkWatermarkStudio } from "@/components/watermark/BulkWatermarkStudio";

export const metadata: Metadata = {
  title: "Bulk Image & Video Watermark Studio | OmniTools",
  description:
    "Professional batch watermark tool for images and videos. Add custom logos, multi-line text, 3x3 grid positioning, opacity, rotation, and export with zero server uploads.",
  keywords: [
    "watermark images",
    "video watermark",
    "bulk watermark",
    "batch watermark images",
    "add logo to video",
    "watermark online",
    "free batch watermarker",
  ],
};

export default function BulkWatermarkPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] flex flex-col">
      <BulkWatermarkStudio />
    </main>
  );
}
