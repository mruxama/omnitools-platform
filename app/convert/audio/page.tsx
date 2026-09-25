import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/converter/categoryRegistry";
import { CategoryConverterPage } from "@/components/converter/CategoryConverterPage";

export const metadata: Metadata = {
  title: "Audio Converter — Convert WAV, MP3, OGG, AAC, M4A, FLAC Free & In-Browser",
  description:
    "Convert audio files online directly in your browser. Powered by Web Audio API with resampling, channel mixing, and studio-grade 16-bit PCM WAV encoding.",
  keywords: [
    "audio converter",
    "wav to mp3",
    "mp3 to wav",
    "flac to wav",
    "convert music online",
    "in browser audio converter",
  ],
};

export default function AudioConverterPage() {
  const category = getCategoryBySlug("audio");
  if (!category) notFound();
  return <CategoryConverterPage category={category} />;
}
