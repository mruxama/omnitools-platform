import { Metadata } from 'next';
import { SmartLogoRemoverStudio } from '@/components/remover/SmartLogoRemoverStudio';
import { ToolHubNavigation } from '@/components/navigation/ToolHubNavigation';
import { getToolById } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'Smart Logo & Object Remover — Images & Videos',
  description:
    'Erase logos, timestamps, watermarks, and unwanted objects from images and videos using smart boundary inpainting and concealment. 100% private in-browser editing.',
};

export default function ObjectRemoverPage() {
  const tool = getToolById('logo-remover');

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SmartLogoRemoverStudio />
      </div>
    );
  }

  return (
    <ToolHubNavigation tool={tool}>
      <SmartLogoRemoverStudio />
    </ToolHubNavigation>
  );
}
