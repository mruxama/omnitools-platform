import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Video Converter — Convert MP4, WebM, MOV, AVI & Extract Animated GIFs & Stills",
  description:
    "Convert video formats, extract high-resolution image stills, and generate animated GIFs from MP4, WebM, and MOV videos with 100% in-browser processing.",
  keywords: [
    "video converter",
    "mp4 to gif",
    "video to gif",
    "video frame grabber",
    "webm converter",
    "convert video free",
  ],
};

export default function VideoConverterPage() {
  const category = getCategoryBySlug("video");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
