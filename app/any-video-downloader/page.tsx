import React from "react";
import type { Metadata } from "next";
import { AnyVideoDownloaderTool } from "@/components/tools/productivity/AnyVideoDownloaderTool";

export const metadata: Metadata = {
  title: "Any Video Downloader — Universal Video & Audio Downloader (yt-dlp)",
  description:
    "Free online video and audio downloader powered by yt-dlp. Download 4K, 1080p, 720p MP4 videos, MP3 audio tracks, and subtitles from 1,800+ sites with one click.",
  keywords: [
    "any video downloader",
    "video downloader",
    "yt-dlp",
    "youtube downloader",
    "tiktok downloader",
    "twitter video downloader",
    "vimeo downloader",
    "mp3 downloader",
    "subtitles downloader"
  ],
};

export default function StandaloneAnyVideoDownloaderPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <AnyVideoDownloaderTool isStandalone={true} />
    </div>
  );
}
