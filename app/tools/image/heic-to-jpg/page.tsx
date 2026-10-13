import { Metadata } from 'next';
import { BulkHeicConverterStudio } from '@/components/heic/BulkHeicConverterStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'Ultra-Fast Bulk HEIC to JPG & PNG Converter — iPhone Photos',
  description:
    'Convert hundreds of iPhone HEIC/HEIF images to JPG, PNG, or WebP in parallel with full resolution preservation. 100% private in-browser WebAssembly conversion.',
};

export default function HeicConverterPage() {
  const tool = getToolById('heic-converter');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BulkHeicConverterStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <BulkHeicConverterStudio />
    </ToolHubNavigation>
  );
}
