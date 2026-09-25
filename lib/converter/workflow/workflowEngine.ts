import { WorkflowStep, ConversionResult } from "../types";
import { defaultBrowserProvider } from "../providers/browser/browserProvider";
import { detectFileFormat } from "../detector";

export interface WorkflowExecutionProgress {
  currentStepIndex: number;
  totalSteps: number;
  stepName: string;
  progressPercent: number;
}

export async function executeWorkflow(
  initialFile: File,
  steps: WorkflowStep[],
  onProgress?: (progress: WorkflowExecutionProgress) => void
): Promise<ConversionResult> {
  if (steps.length === 0) {
    throw new Error("Workflow must contain at least one step.");
  }

  let currentFile: File = initialFile;
  let lastResult: ConversionResult | null = null;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onProgress?.({
      currentStepIndex: i + 1,
      totalSteps: steps.length,
      stepName: step.name,
      progressPercent: Math.round(((i) / steps.length) * 100),
    });

    const detected = await detectFileFormat(currentFile);
    const targetFormat = step.targetFormat || detected.format.id;

    lastResult = await defaultBrowserProvider.convert({
      id: `step_${i}_${Date.now()}`,
      file: currentFile,
      inputFormat: detected.format.id,
      outputFormat: targetFormat,
      options: step.options,
    });

    // Output of this step becomes input of next step
    currentFile = new File([lastResult.blob], lastResult.fileName, {
      type: lastResult.mimeType,
    });
  }

  onProgress?.({
    currentStepIndex: steps.length,
    totalSteps: steps.length,
    stepName: "Complete",
    progressPercent: 100,
  });

  return lastResult!;
}
