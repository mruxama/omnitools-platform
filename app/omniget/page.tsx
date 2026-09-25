import React from "react";
import type { Metadata } from "next";
import { AnyVideoDownloaderTool } from "@/components/tools/productivity/AnyVideoDownloaderTool";

export const metadata: Metadata = {
  title: "Any Video Downloader — Universal Video & Audio Downloader (yt-dlp)",
  description:
    "Free universal media downloader powered by yt-dlp. Extract 4K/1080p MP4 videos, MP3 audio, and subtitles from 1,800+ sites with one click.",
  keywords: [
    "any video downloader",
    "video downloader",
    "yt-dlp",
    "youtube downloader",
    "tiktok downloader",
    "twitter video downloader",
    "vimeo downloader",
    "subtitles downloader",
    "mp3 converter",
  ],
};

export default function StandaloneOmniGetPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <AnyVideoDownloaderTool isStandalone={true} />
    </div>
  );
}
