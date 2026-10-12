import { Metadata } from 'next';
import { ImageUpscalerStudio } from '@/components/upscaler/ImageUpscalerStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'AI Image Upscaler — 100% In-Browser Super-Resolution (2× & 4×)',
  description:
    'Enhance and upscale images up to 4× resolution directly on your browser GPU using WebGPU and WebAssembly. No uploads, no API keys, 100% private.',
};

export default function ImageUpscalerPage() {
  const tool = getToolById('image-upscaler');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ImageUpscalerStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <ImageUpscalerStudio />
    </ToolHubNavigation>
  );
}
