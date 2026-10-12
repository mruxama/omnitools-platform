import { Metadata } from 'next';
import { VideoCompressorStudio } from '@/components/video-compressor/VideoCompressorStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'Professional Video Compressor — Reduce Video File Size Online',
  description:
    'Compress video files without losing visual quality. Choose target size, CRF quality, bitrate, or resolution. Fast, 100% private in-browser compression.',
};

export default function VideoCompressorPage() {
  const tool = getToolById('video-compressor');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <VideoCompressorStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <VideoCompressorStudio />
    </ToolHubNavigation>
  );
}
