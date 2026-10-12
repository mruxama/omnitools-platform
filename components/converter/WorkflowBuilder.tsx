"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { WorkflowStep, ConversionResult } from "@/lib/converter/types";
import {
  executeWorkflow,
  WorkflowExecutionProgress,
  AUTOMATED_SCENARIOS,
  AutomatedScenarioPreset,
} from "@/lib/converter/workflow/workflowEngine";
import { ResultCard } from "./ResultCard";
import {
  Plus,
  Trash2,
  Play,
  Layers,
  ArrowDown,
  Sparkles,
  Loader2,
  Sliders,
  RotateCw,
  Archive,
  Stamp,
  Video,
  FileText,
  Image as ImageIcon,
  Check,
  Zap,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Maximize2,
} from "lucide-react";

export function WorkflowBuilder() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("web-asset-pipeline");
  const [steps, setSteps] = useState<WorkflowStep[]>(AUTOMATED_SCENARIOS[0].steps);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<WorkflowExecutionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyScenario = (scenario: AutomatedScenarioPreset) => {
    setSelectedScenarioId(scenario.id);
    // Clone steps so users can customize them
    setSteps(JSON.parse(JSON.stringify(scenario.steps)));
    setError(null);
  };

  const addStep = (action: WorkflowStep["action"]) => {
    setSelectedScenarioId("custom");
    const id = `step_${Date.now()}`;
    let newStep: WorkflowStep;

    switch (action) {
      case "convert":
        newStep = {
          id,
          action: "convert",
          name: "Convert Format",
          targetFormat: "webp",
          options: { quality: 85 },
        };
        break;
      case "resize":
        newStep = {
          id,
          action: "resize",
          name: "Resize Dimensions",
          options: { width: 1200, maintainAspectRatio: true },
        };
        break;
      case "rotate":
        newStep = {
          id,
          action: "rotate",
          name: "Rotate 90° Clockwise",
          options: { rotate: 90 },
        };
        break;
      case "watermark":
        newStep = {
          id,
          action: "watermark",
          name: "Stamp Watermark",
          options: {
            text: "CONFIDENTIAL",
            position: "bottom-right",
            opacity: 70,
            fontSize: 24,
            color: "#ffffff",
          },
        };
        break;
      case "compress":
        newStep = {
          id,
          action: "compress",
          name: "High-Efficiency Compress",
          options: { quality: 80, crf: 26, targetResolution: "720p" },
        };
        break;
      case "archive":
        newStep = {
          id,
          action: "archive",
          name: "Compress into ZIP Archive",
          targetFormat: "zip",
          options: { compressionLevel: 8 },
        };
        break;
      default:
        newStep = {
          id,
          action: "convert",
          name: "Transform File",
          options: {},
        };
    }

    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    setSelectedScenarioId("custom");
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, partial: Partial<WorkflowStep>) => {
    setSelectedScenarioId("custom");
    const next = [...steps];
    next[index] = { ...next[index], ...partial };
    setSteps(next);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {result ? (
        <ResultCard
          result={result}
          onReset={() => {
            setFiles([]);
            setResult(null);
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Section 1: Pre-Built Automation Scenarios */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Pre-Built Automated Scenarios
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select an industry-tested automation recipe or customize your own multi-step pipeline.
                </p>
              </div>
              <span className="text-[11px] font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                {AUTOMATED_SCENARIOS.length} Ready Scenarios
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AUTOMATED_SCENARIOS.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => applyScenario(sc)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm text-foreground ring-1 ring-primary/30"
                        : "border-border bg-background hover:border-border/80 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-foreground leading-tight">
                          {sc.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-muted font-medium text-foreground">
                        {sc.badge}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {sc.steps.length} {sc.steps.length === 1 ? "step" : "steps"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Input File Dropzone */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              1. Choose Input Media File
            </h3>
            <FileUploader
              accept="*/*"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              title="Drag & drop file to automate"
              description="Supports Images (PNG, JPG, WebP), Documents (DOCX, PDF, CSV), Video & Archives"
            />
          </div>

          {/* Section 3: Visual Pipeline Step Sequencer */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  2. Automation Pipeline Sequence ({steps.length} Steps)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Each step executes in order. The output of each step automatically feeds into the next.
                </p>
              </div>

              {selectedScenarioId !== "custom" && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  Preset: {AUTOMATED_SCENARIOS.find((s) => s.id === selectedScenarioId)?.name}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="space-y-2">
                  <div className="p-4 bg-muted/40 border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center font-mono shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{step.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border uppercase">
                            {step.action}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {step.action === "convert" && `Convert output to ${step.targetFormat?.toUpperCase()}`}
                          {step.action === "resize" && `Resize to ${step.options.width}px width`}
                          {step.action === "watermark" && `Stamp text "${step.options.text || "Watermark"}" (${step.options.position})`}
                          {step.action === "compress" && `Compress with Quality/CRF optimization`}
                          {step.action === "rotate" && `Rotate image by ${step.options.rotate || 90}°`}
                          {step.action === "archive" && `Package output into ZIP container`}
                        </p>
                      </div>
                    </div>

                    {/* Step Config Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {step.action === "convert" && (
                        <select
                          value={step.targetFormat || "webp"}
                          onChange={(e) => updateStep(index, { targetFormat: e.target.value })}
                          className="px-2.5 py-1.5 bg-background border border-border rounded-lg font-mono text-xs text-foreground"
                        >
                          <option value="webp">WEBP</option>
                          <option value="jpg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="pdf">PDF</option>
                          <option value="docx">DOCX</option>
                          <option value="xlsx">XLSX</option>
                          <option value="zip">ZIP</option>
                        </select>
                      )}

                      {step.action === "resize" && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Width px"
                            value={step.options.width || ""}
                            onChange={(e) =>
                              updateStep(index, {
                                options: { ...step.options, width: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="w-24 px-2.5 py-1 bg-background border border-border rounded-lg font-mono text-xs text-foreground"
                          />
                          <span className="text-[10px] text-muted-foreground">px</span>
                        </div>
                      )}

                      {step.action === "watermark" && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Text"
                            value={step.options.text || ""}
                            onChange={(e) =>
                              updateStep(index, {
                                options: { ...step.options, text: e.target.value },
                              })
                            }
                            className="w-28 px-2 py-1 bg-background border border-border rounded-lg text-xs text-foreground"
                          />
                          <select
                            value={step.options.position || "bottom-right"}
                            onChange={(e) =>
                              updateStep(index, {
                                options: { ...step.options, position: e.target.value },
                              })
                            }
                            className="px-2 py-1 bg-background border border-border rounded-lg text-xs text-foreground"
                          >
                            <option value="bottom-right">Bottom-Right</option>
                            <option value="bottom-left">Bottom-Left</option>
                            <option value="center">Center</option>
                            <option value="top-right">Top-Right</option>
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        disabled={steps.length <= 1}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 rounded-lg"
                        title="Delete step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-0.5 text-muted-foreground">
                      <ArrowDown className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Step Action Palette */}
            <div className="pt-3 border-t border-border flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Add Step:</span>
              <button
                type="button"
                onClick={() => addStep("convert")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5 text-primary" /> Convert Format
              </button>
              <button
                type="button"
                onClick={() => addStep("resize")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <Maximize2 className="w-3.5 h-3.5 text-primary" /> Resize
              </button>
              <button
                type="button"
                onClick={() => addStep("watermark")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <Stamp className="w-3.5 h-3.5 text-primary" /> Watermark
              </button>
              <button
                type="button"
                onClick={() => addStep("compress")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <Zap className="w-3.5 h-3.5 text-primary" /> Compress
              </button>
              <button
                type="button"
                onClick={() => addStep("rotate")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <RotateCw className="w-3.5 h-3.5 text-primary" /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={() => addStep("archive")}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs flex items-center gap-1.5 font-medium transition"
              >
                <Archive className="w-3.5 h-3.5 text-primary" /> Package ZIP
              </button>
            </div>

            {/* Execution Status / Progress */}
            {progress && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-primary font-semibold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Step {progress.currentStepIndex} of {progress.totalSteps}: {progress.stepName}
                  </span>
                  <span className="font-mono">{progress.progressPercent}%</span>
                </div>
                <div className="w-full bg-primary/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
                {progress.detail && (
                  <p className="text-[11px] text-muted-foreground">{progress.detail}</p>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            {/* Run Pipeline Button */}
            <button
              type="button"
              onClick={handleRunWorkflow}
              disabled={isExecuting || files.length === 0}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Automation Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-primary-foreground" />
                  <span>
                    {files.length > 0
                      ? `Execute Pipeline on "${files[0].name}"`
                      : "Upload a File to Run Pipeline"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Privacy & Trust Footnote */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              100% Client-Side Automation: Zero server uploads. Your files never leave your device.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
