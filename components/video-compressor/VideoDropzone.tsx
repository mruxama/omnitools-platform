'use client';

import React, { useRef, useState } from 'react';
import { Upload, Film, AlertCircle, Sparkles } from 'lucide-react';
import { extractVideoMetadata } from '@/lib/video-compressor/browserCompressor';
import { VideoMetadata } from '@/lib/video-compressor/types';

interface VideoDropzoneProps {
  onVideosSelected: (files: { file: File; metadata: VideoMetadata }[]) => void;
  isLoading: boolean;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onVideosSelected,
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
      const file = fileList[i];
      if (file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|wmv|flv|m4v|3gp|ts)$/i.test(file.name)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid video files (MP4, MOV, WebM, MKV, AVI, etc.)');
      return;
    }

    try {
      const results: { file: File; metadata: VideoMetadata }[] = [];
      for (const file of validFiles) {
        try {
          const metadata = await extractVideoMetadata(file);
          results.push({ file, metadata });
        } catch {
          // Fallback metadata if browser cannot decode video directly
          results.push({
            file,
            metadata: {
              filename: file.name,
              fileSize: file.size,
              duration: 30,
              width: 1920,
              height: 1080,
              aspectRatio: 1.777,
              fps: 30,
            },
          });
        }
      }

      onVideosSelected(results);
    } catch (err) {
      setErrorMsg('Error processing video metadata: ' + (err as Error).message);
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
          accept="video/*,.mkv,.avi,.wmv,.flv,.mov"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Film className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Choose Video Files
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag and drop videos here, or click to browse from your device
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">MP4</span>
            <span className="px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">MOV</span>
            <span className="px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">WebM</span>
            <span className="px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">MKV</span>
            <span className="px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">AVI</span>
            <span className="flex items-center gap-1 text-indigo-500 font-medium ml-2">
              <Sparkles className="w-3.5 h-3.5" /> High-speed compression
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
