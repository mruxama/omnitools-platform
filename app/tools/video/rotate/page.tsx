import { Metadata } from 'next';
import { BulkVideoRotatorStudio } from '@/components/video-rotator/BulkVideoRotatorStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'Bulk Video Rotator & Orientation Corrector — 90°, 180°, 270°',
  description:
    'Rotate sideways or upside-down videos by 90, 180, or 270 degrees. Maintain aspect ratio, preserve synchronized audio, and export batch videos 100% locally.',
};

export default function VideoRotatorPage() {
  const tool = getToolById('video-rotator');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BulkVideoRotatorStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <BulkVideoRotatorStudio />
    </ToolHubNavigation>
  );
}
