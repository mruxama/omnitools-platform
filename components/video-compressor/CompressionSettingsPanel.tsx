'use client';

import React from 'react';
import { CompressionSettings, CompressionMode } from '@/lib/video-compressor/types';
import { Sliders, Settings2, Gauge, Monitor, Volume2, ShieldCheck } from 'lucide-react';

interface CompressionSettingsPanelProps {
  settings: CompressionSettings;
  onChange: (updated: CompressionSettings) => void;
  originalFileSize?: number;
}

export const CompressionSettingsPanel: React.FC<CompressionSettingsPanelProps> = ({
  settings,
  onChange,
  originalFileSize,
}) => {
  const modes: { id: CompressionMode; label: string; desc: string }[] = [
    { id: 'quality', label: 'Quality (CRF)', desc: 'Constant rate factor optimization' },
    { id: 'target-size', label: 'Target File Size', desc: 'Specify exact MB or percentage' },
    { id: 'bitrate', label: 'Bitrate', desc: 'Direct video kbps bitrate control' },
    { id: 'resolution', label: 'Resolution', desc: 'Scale dimensions (1080p, 720p, etc.)' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Compression Parameters
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real Engine Output</span>
      </div>

      {/* Mode Tabs */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Compression Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...settings, mode: m.id })}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                settings.mode === m.id
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-semibold">{m.label}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode-Specific Controls */}
      {settings.mode === 'quality' && (
        <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-500" />
              Constant Rate Factor (CRF): {settings.crf}
            </span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              {settings.crf <= 20 ? 'Near Lossless' : settings.crf <= 26 ? 'Balanced' : 'High Compression'}
            </span>
          </div>
          <input
            type="range"
            min="16"
            max="40"
            step="1"
            value={settings.crf}
            onChange={(e) => onChange({ ...settings, crf: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>16 (Max Quality / Larger)</span>
            <span>26 (Standard)</span>
            <span>40 (Max Savings)</span>
          </div>
        </div>
      )}

      {settings.mode === 'target-size' && (
        <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Target Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                step="0.5"
                value={settings.targetSizeMB || 15}
                onChange={(e) => onChange({ ...settings, targetSizeMB: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Or Percentage Reduction ({settings.percentageReduction}%)
              </label>
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={settings.percentageReduction || 40}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    percentageReduction: Number(e.target.value),
                    targetSizeMB: originalFileSize
                      ? Math.round((originalFileSize * (1 - Number(e.target.value) / 100)) / (1024 * 1024))
                      : settings.targetSizeMB,
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {settings.mode === 'bitrate' && (
        <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Video Bitrate: {settings.videoBitrateKbps || 1200} kbps
            </span>
          </div>
          <input
            type="range"
            min="300"
            max="8000"
            step="100"
            value={settings.videoBitrateKbps || 1200}
            onChange={(e) => onChange({ ...settings, videoBitrateKbps: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>300 kbps (Light)</span>
            <span>1200 kbps (Standard 720p)</span>
            <span>4000+ kbps (1080p HQ)</span>
          </div>
        </div>
      )}

      {/* Resolution & Codec Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Monitor className="w-3.5 h-3.5 text-indigo-500" />
            Output Resolution
          </label>
          <select
            value={settings.targetResolution || 'original'}
            onChange={(e) => onChange({ ...settings, targetResolution: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            <option value="original">Original Dimensions</option>
            <option value="1080p">1080p (Full HD - 1920x1080)</option>
            <option value="720p">720p (HD - 1280x720)</option>
            <option value="480p">480p (SD - 854x480)</option>
            <option value="360p">360p (Mobile - 640x360)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            Video Codec
          </label>
          <select
            value={settings.videoCodec}
            onChange={(e) => onChange({ ...settings, videoCodec: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            <option value="h264">H.264 / AVC (Most Compatible)</option>
            <option value="h265">H.265 / HEVC (High Efficiency)</option>
            <option value="vp9">VP9 (Open Web Standard)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            Audio Settings
          </label>
          <select
            value={settings.stripAudio ? 'mute' : String(settings.audioBitrateKbps)}
            onChange={(e) => {
              if (e.target.value === 'mute') {
                onChange({ ...settings, stripAudio: true });
              } else {
                onChange({ ...settings, stripAudio: false, audioBitrateKbps: Number(e.target.value) });
              }
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            <option value="192">192 kbps (Studio Quality)</option>
            <option value="128">128 kbps (Standard Quality)</option>
            <option value="96">96 kbps (Voice / Lightweight)</option>
            <option value="64">64 kbps (Max Compression)</option>
            <option value="mute">Mute / Strip Audio</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 text-xs text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="w-4 h-4" />
        <span>100% Private: Compression runs directly on your device. Zero server file logging.</span>
      </div>
    </div>
  );
};
