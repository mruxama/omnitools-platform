'use client';

import React, { useRef, useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageMetadata } from '@/lib/upscaler/types';

interface ImageUploaderProps {
  onImagesSelected: (files: { file: File; metadata: ImageMetadata; previewUrl: string }[]) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(f.name)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid images (PNG, JPEG, WebP, or BMP)');
      return;
    }

    const items: { file: File; metadata: ImageMetadata; previewUrl: string }[] = [];

    for (const file of validFiles) {
      const previewUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          items.push({
            file,
            previewUrl,
            metadata: {
              filename: file.name,
              width: img.naturalWidth,
              height: img.naturalHeight,
              fileSize: file.size,
              mimeType: file.type || 'image/png',
              aspectRatio: img.naturalWidth / img.naturalHeight,
              hasAlpha: file.type === 'image/png' || file.type === 'image/webp',
            },
          });
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
        img.src = previewUrl;
      });
    }

    if (items.length > 0) {
      onImagesSelected(items);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Upload Images to Upscale
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag & drop photos, product shots, or illustrations here. 100% private in-browser AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 font-mono">PNG</span>
            <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 font-mono">JPEG</span>
            <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 font-mono">WebP</span>
            <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 font-mono">2× / 4× AI</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
