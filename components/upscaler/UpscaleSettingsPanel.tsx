'use client';

import React from 'react';
import { UpscaleSettings, UpscaleMode, ScaleFactor, OutputFormat } from '@/lib/upscaler/types';
import { MODEL_REGISTRY } from '@/lib/upscaler/modelRegistry';
import { Sparkles, Sliders, Shield, Zap, Info, Rocket } from 'lucide-react';

interface UpscaleSettingsPanelProps {
  settings: UpscaleSettings;
  onChange: (updated: UpscaleSettings) => void;
  hasAlpha?: boolean;
}

export const UpscaleSettingsPanel: React.FC<UpscaleSettingsPanelProps> = ({
  settings,
  onChange,
  hasAlpha,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Upscaling Configuration
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> High Performance Mode
        </span>
      </div>

      {/* Mode Selection: Fast AI (Recommended) vs Deep Neural vs Faithful */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Enhancement Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'fast-ai' })}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              settings.mode === 'fast-ai'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400">
                <Rocket className="w-4 h-4" />
                Fast AI Turbo
              </div>
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono">
                &lt; 1 sec
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-pass adaptive edge refinement. Instant high-speed upscaling with zero lag.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'neural-deep' })}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              settings.mode === 'neural-deep'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-4 h-4" />
              Deep Neural AI
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Full Real-ESRGAN ONNX weights. Synthesizes micro-details on GPU (takes 5-15s).
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'faithful' })}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              settings.mode === 'faithful'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
              <Shield className="w-4 h-4" />
              Faithful Resize
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Lanczos resampling without generative hallucination for barcodes and logos.
            </p>
          </button>
        </div>
      </div>

      {/* Scale Factor: 2x vs 4x */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Scale Factor
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...settings, scaleFactor: s as ScaleFactor })}
                className={`py-2.5 px-3 rounded-xl border text-center font-bold text-sm transition ${
                  settings.scaleFactor === s
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                {s}× ({s === 2 ? 'Double' : 'Quadruple'})
              </button>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Output Format
          </label>
          <select
            value={settings.outputFormat}
            onChange={(e) => onChange({ ...settings, outputFormat: e.target.value as OutputFormat })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            <option value="image/png">PNG (Lossless &amp; Alpha)</option>
            <option value="image/webp">WebP (Modern Compact)</option>
            <option value="image/jpeg">JPEG (Universal Photo)</option>
          </select>
        </div>
      </div>

      {/* Deep Neural Model selection only if neural-deep is selected */}
      {settings.mode === 'neural-deep' && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            ONNX Neural Model Weights
          </label>
          <select
            value={settings.modelId}
            onChange={(e) => onChange({ ...settings, modelId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            {Object.values(MODEL_REGISTRY).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.fileSizeMB} MB)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Note: Deep Neural models run millions of tensor weights inside WebAssembly. For faster sub-second results, use Fast AI Turbo mode above.
          </p>
        </div>
      )}
    </div>
  );
};
