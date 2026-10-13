import { Metadata } from 'next';
import { BulkVideoConverterStudio } from '@/components/video-converter/BulkVideoConverterStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'Bulk iPhone Video Converter — Convert MOV & HEVC to MP4',
  description:
    'Convert hundreds of iPhone MOV, HEVC and other videos to MP4 with smart quality preservation and instant lossless stream copying. 100% private in-browser tool.',
};

export default function BulkVideoConverterPage() {
  const tool = getToolById('iphone-video-converter');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BulkVideoConverterStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <BulkVideoConverterStudio />
    </ToolHubNavigation>
  );
}
