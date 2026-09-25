"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { WorkflowStep, ConversionResult } from "@/lib/converter/types";
import { executeWorkflow, WorkflowExecutionProgress } from "@/lib/converter/workflow/workflowEngine";
import { ResultCard } from "./ResultCard";
import {
  Plus,
  Trash2,
  Play,
  Layers,
  ArrowDown,
  Sparkles,
  Loader2,
  FileText,
  Image,
  Sliders,
  RotateCw,
  Archive,
} from "lucide-react";

export function WorkflowBuilder() {
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "step_1",
      action: "convert",
      name: "Convert Format",
      targetFormat: "webp",
      options: { quality: 85 },
    },
    {
      id: "step_2",
      action: "resize",
      name: "Resize Dimensions",
      options: { width: 1200, maintainAspectRatio: true },
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<WorkflowExecutionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addStep = (action: WorkflowStep["action"]) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      action,
      name:
        action === "convert"
          ? "Convert Format"
          : action === "resize"
          ? "Resize Dimensions"
          : action === "rotate"
          ? "Rotate Image"
          : "Archive Output",
      targetFormat: action === "convert" ? "png" : undefined,
      options:
        action === "rotate"
          ? { rotate: 90 }
          : action === "resize"
          ? { width: 800 }
          : {},
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleRunWorkflow = async () => {
    if (files.length === 0 || steps.length === 0) return;

    setIsExecuting(true);
    setError(null);
    setProgress(null);

    try {
      const res = await executeWorkflow(files[0], steps, (p) => setProgress(p));
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workflow failed to execute.");
    } finally {
      setIsExecuting(false);
    }
  };

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
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Visual Workflow Studio
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chain multiple conversion, resizing, and archiving actions into an automated pipeline.
              </p>
            </div>
          </div>

          <FileUploader
            accept="*/*"
            multiple={false}
            files={files}
            onFilesChange={setFiles}
            title="Upload input file for workflow"
            description="All operations will execute sequentially in-browser"
          />

          {/* Workflow Steps Pipeline */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Workflow Steps ({steps.length})
            </h3>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.id} className="space-y-2">
                  <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{step.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {step.targetFormat ? `Target: ${step.targetFormat.toUpperCase()}` : `Action: ${step.action}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.action === "convert" && (
                        <select
                          value={step.targetFormat || "webp"}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[index].targetFormat = e.target.value;
                            setSteps(copy);
                          }}
                          className="px-2 py-1 bg-background border border-border rounded-lg font-mono text-xs text-foreground"
                        >
                          <option value="webp">WEBP</option>
                          <option value="jpg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="pdf">PDF</option>
                        </select>
                      )}

                      {step.action === "resize" && (
                        <input
                          type="number"
                          placeholder="Width"
                          value={step.options.width || ""}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[index].options = { ...copy[index].options, width: parseInt(e.target.value) || 0 };
                            setSteps(copy);
                          }}
                          className="w-20 px-2 py-1 bg-background border border-border rounded-lg font-mono text-xs text-foreground"
                        />
                      )}

                      <button
                        onClick={() => removeStep(index)}
                        disabled={steps.length <= 1}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                        title="Delete step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-1 text-muted-foreground">
                      <ArrowDown className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Step Buttons */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Add Step:</span>
              <button
                type="button"
                onClick={() => addStep("convert")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Convert Format
              </button>
              <button
                type="button"
                onClick={() => addStep("resize")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Resize
              </button>
              <button
                type="button"
                onClick={() => addStep("rotate")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Rotate 90°
              </button>
            </div>
          </div>

          {/* Progress / Error */}
          {progress && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                Step {progress.currentStepIndex} of {progress.totalSteps}: {progress.stepName}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          {/* Run Workflow Button */}
          <button
            type="button"
            onClick={handleRunWorkflow}
            disabled={isExecuting || files.length === 0}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-primary-foreground" />
                <span>Run Automated Workflow</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
