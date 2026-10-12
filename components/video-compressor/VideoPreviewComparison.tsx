'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, ArrowRight, Download, CheckCircle2, TrendingDown } from 'lucide-react';
import { formatBytes } from '@/lib/video-compressor/bitrateCalculator';
import { VideoMetadata } from '@/lib/video-compressor/types';

interface VideoPreviewComparisonProps {
  originalFile: File;
  originalMetadata: VideoMetadata;
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedSize?: number;
}

export const VideoPreviewComparison: React.FC<VideoPreviewComparisonProps> = ({
  originalFile,
  originalMetadata,
  compressedBlob,
  compressedUrl,
  compressedSize,
}) => {
  const origVideoRef = useRef<HTMLVideoElement>(null);
  const compVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if (isPlaying) {
      origVideoRef.current?.pause();
      compVideoRef.current?.pause();
      setIsPlaying(false);
    } else {
      origVideoRef.current?.play();
      compVideoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = (e.target as HTMLVideoElement).currentTime;
    if (compVideoRef.current && Math.abs(compVideoRef.current.currentTime - time) > 0.3) {
      compVideoRef.current.currentTime = time;
    }
  };

  const savingsBytes = compressedSize ? originalMetadata.fileSize - compressedSize : 0;
  const savingsPct = compressedSize
    ? Math.max(0, Math.round((savingsBytes / originalMetadata.fileSize) * 100))
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Synchronized Video Comparison
        </h3>

        {compressedSize && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <TrendingDown className="w-3.5 h-3.5" />
            {savingsPct}% Smaller ({formatBytes(savingsBytes)} saved)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Player */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Original Video</span>
            <span className="font-mono">{formatBytes(originalMetadata.fileSize)}</span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <video
              ref={origVideoRef}
              src={URL.createObjectURL(originalFile)}
              controls
              onTimeUpdate={handleSeek}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between font-mono">
            <span>{originalMetadata.width}x{originalMetadata.height}</span>
            <span>{originalMetadata.duration ? Math.round(originalMetadata.duration) + 's' : ''}</span>
          </div>
        </div>

        {/* Compressed Player */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Compressed Output</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {compressedSize ? formatBytes(compressedSize) : 'Pending encoding'}
            </span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-slate-800">
            {compressedUrl ? (
              <video
                ref={compVideoRef}
                src={compressedUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                Click &ldquo;Compress Video&rdquo; to generate the optimized video stream
              </div>
            )}
          </div>
          {compressedUrl && (
            <div className="flex justify-end pt-1">
              <a
                href={compressedUrl}
                download={`compressed_${originalFile.name}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Video ({compressedSize ? formatBytes(compressedSize) : ''})
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
