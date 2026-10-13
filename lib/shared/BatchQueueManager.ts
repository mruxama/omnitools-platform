export type ProcessingStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface BaseMediaJob<TConfig = any, TResult = any> {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: ProcessingStatus;
  progress: number; // 0 to 100
  error?: string;
  config: TConfig;
  result?: TResult;
  startedAt?: number;
  completedAt?: number;
}

export interface BatchProcessingStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  totalInputBytes: number;
  totalOutputBytes: number;
  percentOverall: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds?: number;
  itemsPerSecond: number;
}

export interface ConcurrencyOptions {
  maxConcurrent?: number;
  minConcurrent?: number;
  adaptive?: boolean;
}

/**
 * Calculates safe concurrent worker count based on device hardware and memory limits.
 */
export function getRecommendedConcurrency(itemType: "image" | "video" | "heic"): number {
  if (typeof navigator === "undefined") return 2;
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    if (itemType === "video") return 1;
    if (itemType === "heic") return 2;
    return 1;
  }

  // Desktop
  if (itemType === "video") {
    // Video transcoding/recording is CPU & canvas intensive
    return Math.min(2, Math.max(1, Math.floor(cores / 4)));
  }

  if (itemType === "heic") {
    // HEIC decoding in WASM: 3-4 concurrent files is ideal to avoid OOM
    return Math.min(4, Math.max(2, Math.floor(cores / 2)));
  }

  // General image processing
  return Math.min(4, Math.max(2, Math.floor(cores / 2)));
}

/**
 * Reusable Concurrent Queue Runner supporting pause, cancellation, and real-time progress.
 */
export class BatchQueueManager<TConfig, TResult> {
  private jobs: BaseMediaJob<TConfig, TResult>[] = [];
  private activeCount = 0;
  private isRunning = false;
  private isCancelled = false;
  private maxConcurrency: number;
  private startTime = 0;
  private onUpdate: (jobs: BaseMediaJob<TConfig, TResult>[], stats: BatchProcessingStats) => void;
  private processor: (
    job: BaseMediaJob<TConfig, TResult>,
    onProgress: (pct: number) => void,
    checkCancelled: () => boolean
  ) => Promise<TResult>;

  constructor(
    processor: (
      job: BaseMediaJob<TConfig, TResult>,
      onProgress: (pct: number) => void,
      checkCancelled: () => boolean
    ) => Promise<TResult>,
    onUpdate: (jobs: BaseMediaJob<TConfig, TResult>[], stats: BatchProcessingStats) => void,
    concurrency: number = 2
  ) {
    this.processor = processor;
    this.onUpdate = onUpdate;
    this.maxConcurrency = concurrency;
  }

  public setJobs(jobs: BaseMediaJob<TConfig, TResult>[]) {
    this.jobs = jobs;
    this.notify();
  }

  public addJobs(newJobs: BaseMediaJob<TConfig, TResult>[]) {
    this.jobs = [...this.jobs, ...newJobs];
    this.notify();
    if (this.isRunning) {
      this.pump();
    }
  }

  public removeJob(id: string) {
    this.jobs = this.jobs.filter((j) => j.id !== id);
    this.notify();
  }

  public clearAll() {
    this.cancelAll();
    this.jobs = [];
    this.notify();
  }

  public setConcurrency(concurrency: number) {
    this.maxConcurrency = Math.max(1, concurrency);
  }

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isCancelled = false;
    this.startTime = Date.now();
    this.pump();
  }

  public pause() {
    this.isRunning = false;
    this.notify();
  }

  public cancelAll() {
    this.isCancelled = true;
    this.isRunning = false;
    this.jobs = this.jobs.map((j) => {
      if (j.status === "pending" || j.status === "processing") {
        return { ...j, status: "cancelled", progress: 0 };
      }
      return j;
    });
    this.notify();
  }

  public retryFailed() {
    this.jobs = this.jobs.map((j) => {
      if (j.status === "failed" || j.status === "cancelled") {
        return { ...j, status: "pending", progress: 0, error: undefined };
      }
      return j;
    });
    this.start();
  }

  private pump() {
    if (!this.isRunning || this.isCancelled) return;

    while (this.activeCount < this.maxConcurrency) {
      const nextJob = this.jobs.find((j) => j.status === "pending");
      if (!nextJob) break;

      this.processJob(nextJob);
    }

    if (this.activeCount === 0 && !this.jobs.some((j) => j.status === "pending")) {
      this.isRunning = false;
      this.notify();
    }
  }

  private async processJob(job: BaseMediaJob<TConfig, TResult>) {
    this.activeCount++;
    job.status = "processing";
    job.startedAt = Date.now();
    this.notify();

    try {
      const result = await this.processor(
        job,
        (progressPercent) => {
          job.progress = Math.min(100, Math.max(0, progressPercent));
          this.notify();
        },
        () => this.isCancelled || !this.isRunning
      );

      if (this.isCancelled) {
        job.status = "cancelled";
      } else {
        job.status = "completed";
        job.progress = 100;
        job.result = result;
        job.completedAt = Date.now();
      }
    } catch (err: any) {
      job.status = "failed";
      job.error = err?.message || "Processing failed";
    } finally {
      this.activeCount--;
      this.notify();
      this.pump();
    }
  }

  public getStats(): BatchProcessingStats {
    const total = this.jobs.length;
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;
    let cancelled = 0;
    let totalInputBytes = 0;
    let totalOutputBytes = 0;

    for (const j of this.jobs) {
      totalInputBytes += j.size || 0;
      if ((j.result as any)?.size) {
        totalOutputBytes += (j.result as any).size;
      } else if ((j.result as any)?.blob?.size) {
        totalOutputBytes += (j.result as any).blob.size;
      }

      if (j.status === "pending") pending++;
      else if (j.status === "processing") processing++;
      else if (j.status === "completed") completed++;
      else if (j.status === "failed") failed++;
      else if (j.status === "cancelled") cancelled++;
    }

    const elapsedSeconds = this.startTime > 0 ? (Date.now() - this.startTime) / 1000 : 0;
    const itemsPerSecond = elapsedSeconds > 0 && completed > 0 ? completed / elapsedSeconds : 0;
    const remainingItems = pending + processing;
    const estimatedRemainingSeconds =
      itemsPerSecond > 0 && remainingItems > 0 ? Math.round(remainingItems / itemsPerSecond) : undefined;

    const percentOverall =
      total > 0
        ? Math.round(
            (this.jobs.reduce((sum, j) => sum + (j.progress || 0), 0) / (total * 100)) * 100
          )
        : 0;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      cancelled,
      totalInputBytes,
      totalOutputBytes,
      percentOverall,
      elapsedSeconds: Math.round(elapsedSeconds),
      estimatedRemainingSeconds,
      itemsPerSecond: +itemsPerSecond.toFixed(1),
    };
  }

  private notify() {
    this.onUpdate([...this.jobs], this.getStats());
  }
}
