'use client';

import React from 'react';
import { VIDEO_PRESETS } from '@/lib/video-compressor/presets';
import { CompressionSettings, PresetProfile } from '@/lib/video-compressor/types';
import { Check, Sparkles } from 'lucide-react';

interface VideoPresetSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (preset: PresetProfile) => void;
}

export const VideoPresetSelector: React.FC<VideoPresetSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Smart Compression Presets
        </label>
        <span className="text-xs text-slate-500">Instant one-click tuning</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {VIDEO_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-sm shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-xs leading-tight">{preset.name}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {preset.badge && (
                <div className="mt-2">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {preset.badge}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
