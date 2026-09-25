"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { FormatSelector } from "./FormatSelector";
import { FormatOptionsPanel } from "./FormatOptionsPanel";
import { ResultCard } from "./ResultCard";
import { detectFileFormat, DetectedFormatResult } from "@/lib/converter/detector";
import { getSupportedOutputs } from "@/lib/converter/compatibilityMatrix";
import { getFormatById } from "@/lib/converter/formatRegistry";
import { defaultBrowserProvider } from "@/lib/converter/providers/browser/browserProvider";
import { GenericConversionOptions, ConversionResult } from "@/lib/converter/types";
import { saveConversionHistory } from "@/lib/converter/history";
import { ArrowRight, Loader2, Sparkles, AlertCircle, FileCheck, Layers } from "lucide-react";
import Link from "next/link";

interface UniversalConverterProps {
  initialInputFormat?: string;
  initialOutputFormat?: string;
}

export function UniversalConverter({
  initialInputFormat,
  initialOutputFormat,
}: UniversalConverterProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [detected, setDetected] = useState<DetectedFormatResult | null>(null);
  const [targetFormatId, setTargetFormatId] = useState<string>(initialOutputFormat || "");
  const [options, setOptions] = useState<GenericConversionOptions>({ quality: 85 });
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  // When files change, detect format
  useEffect(() => {
    if (files.length === 0) {
      setDetected(null);
      setResult(null);
      setError(null);
      return;
    }

    const file = files[0];
    detectFileFormat(file).then((res) => {
      setDetected(res);

      // Choose supported target
      const supported = getSupportedOutputs(res.format.id);
      if (initialOutputFormat && supported.some((f) => f.id === initialOutputFormat)) {
        setTargetFormatId(initialOutputFormat);
      } else if (supported.length > 0) {
        setTargetFormatId(supported[0].id);
      }
    });
  }, [files, initialOutputFormat]);

  const handleConvert = async () => {
    if (files.length === 0 || !detected || !targetFormatId) return;

    setIsConverting(true);
    setError(null);

    try {
      const job = {
        id: `job_${Date.now()}`,
        file: files[0],
        inputFormat: detected.format.id,
        outputFormat: targetFormatId,
        options,
      };

      const res = await defaultBrowserProvider.convert(job);
      setResult(res);

      // Record to history
      saveConversionHistory({
        fileName: files[0].name,
        inputFormat: detected.format.id,
        outputFormat: targetFormatId,
        originalSize: files[0].size,
        outputSize: res.outputSize,
        status: "success",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      setError(msg);

      saveConversionHistory({
        fileName: files[0].name,
        inputFormat: detected.format.id,
        outputFormat: targetFormatId,
        originalSize: files[0].size,
        status: "error",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const supportedOutputs = detected ? getSupportedOutputs(detected.format.id) : [];
  const targetFormat = getFormatById(targetFormatId);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {result ? (
        <ResultCard
          result={result}
          onReset={() => {
            setFiles([]);
            setResult(null);
          }}
        />
      ) : (
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
          {/* File Uploader */}
          <FileUploader
            accept="*/*"
            multiple={false}
            files={files}
            onFilesChange={setFiles}
            title={
              initialInputFormat
                ? `Upload ${initialInputFormat.toUpperCase()} file`
                : "Drop your file here to convert"
            }
            description="Automatic format detection • 100% in-browser processing"
          />

          {/* Detected Format & Output Selector */}
          {files.length > 0 && detected && (
            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Input Badge */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Detected Format
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs">
                      {detected.format.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {detected.format.displayName}
                    </span>
                    {detected.method === "magic_bytes" && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-medium flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Magic Byte Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-muted-foreground">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Target Format Selector */}
                <div className="sm:w-64">
                  <FormatSelector
                    availableFormats={supportedOutputs}
                    selectedFormatId={targetFormatId}
                    onSelectFormat={setTargetFormatId}
                  />
                </div>
              </div>

              {/* Format-specific Options */}
              {targetFormat && (
                <FormatOptionsPanel
                  format={targetFormat}
                  options={options}
                  onChangeOptions={setOptions}
                />
              )}

              {/* Error Box */}
              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Convert Action Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting || !targetFormatId || supportedOutputs.length === 0}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Convert to {targetFormatId ? targetFormatId.toUpperCase() : "..."}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick links to Batch / Workflow */}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border/60">
            <span>Need more options?</span>
            <div className="flex items-center gap-3">
              <Link
                href="/convert/workflow"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Layers className="w-3.5 h-3.5" />
                Visual Workflow Studio
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
