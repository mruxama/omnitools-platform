'use client';

import React from 'react';
import { CompressionJob } from '@/lib/video-compressor/types';
import { formatBytes } from '@/lib/video-compressor/bitrateCalculator';
import { Download, Trash2, CheckCircle2, Clock, AlertCircle, FileArchive } from 'lucide-react';
import JSZip from 'jszip';

interface BatchQueueManagerProps {
  jobs: CompressionJob[];
  onRemoveJob: (id: string) => void;
  onClearQueue: () => void;
  onSelectActiveJob: (job: CompressionJob) => void;
  activeJobId?: string;
}

export const BatchQueueManager: React.FC<BatchQueueManagerProps> = ({
  jobs,
  onRemoveJob,
  onClearQueue,
  onSelectActiveJob,
  activeJobId,
}) => {
  if (jobs.length === 0) return null;

  const completedJobs = jobs.filter((j) => j.status === 'completed' && j.outputBlob);

  const handleDownloadAllZip = async () => {
    if (completedJobs.length === 0) return;
    const zip = new JSZip();

    completedJobs.forEach((job) => {
      if (job.outputBlob) {
        zip.file(`compressed_${job.file.name}`, job.outputBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_videos_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Batch Queue ({jobs.length} {jobs.length === 1 ? 'file' : 'files'})
        </h3>

        <div className="flex items-center gap-2">
          {completedJobs.length > 1 && (
            <button
              onClick={handleDownloadAllZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              <FileArchive className="w-3.5 h-3.5" />
              Download All as ZIP ({completedJobs.length})
            </button>
          )}

          <button
            onClick={onClearQueue}
            className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {jobs.map((job) => {
          const isActive = activeJobId === job.id;
          return (
            <div
              key={job.id}
              onClick={() => onSelectActiveJob(job)}
              className={`py-3 px-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition ${
                isActive
                  ? 'bg-slate-50 dark:bg-slate-800/60'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {job.metadata.thumbnailUrl ? (
                  <img
                    src={job.metadata.thumbnailUrl}
                    alt={job.file.name}
                    className="w-14 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                )}

                <div className="min-w-0">
                  <div className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[280px]">
                    {job.file.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <span>{formatBytes(job.file.size)}</span>
                    {job.compressedSize && (
                      <span className="text-emerald-600 font-semibold">
                        → {formatBytes(job.compressedSize)} (-{job.savingsPercentage}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-3">
                {job.status === 'compressing' && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-indigo-600">{job.progress}%</span>
                  </div>
                )}

                {job.status === 'completed' && job.outputUrl && (
                  <a
                    href={job.outputUrl}
                    download={`compressed_${job.file.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                    title="Download compressed video"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveJob(job.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
