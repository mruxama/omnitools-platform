import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { AnyVideoDownloaderTool } from "@/components/tools/productivity/AnyVideoDownloaderTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Any Video Downloader — Free Online Video & Audio Downloader (yt-dlp)",
  description:
    "Download videos, extract audio tracks, and save subtitles from 1,800+ sites with the official yt-dlp media engine.",
};

export default function VideoDownloaderToolPage() {
  return (
    <ToolPageLayout toolId="omniget">
      <AnyVideoDownloaderTool />
    </ToolPageLayout>
  );
}
