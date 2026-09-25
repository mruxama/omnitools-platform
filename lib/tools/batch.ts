export type BatchItemStatus = "pending" | "processing" | "success" | "error";

export interface BatchItem<TInput, TOutput> {
  id: string;
  file: TInput;
  name: string;
  size: number;
  status: BatchItemStatus;
  progress: number;
  result?: TOutput;
  error?: string;
  outputSize?: number;
}

export interface BatchProcessorOptions<TInput, TOutput> {
  concurrency?: number;
  onItemUpdate?: (item: BatchItem<TInput, TOutput>) => void;
  onOverallProgress?: (completed: number, total: number) => void;
}

export async function processBatch<TInput, TOutput>(
  items: BatchItem<TInput, TOutput>[],
  processor: (file: TInput, item: BatchItem<TInput, TOutput>) => Promise<{ result: TOutput; outputSize?: number }>,
  options: BatchProcessorOptions<TInput, TOutput> = {}
): Promise<BatchItem<TInput, TOutput>[]> {
  const concurrency = Math.max(1, options.concurrency || 2);
  const queue = [...items];
  const results = new Map<string, BatchItem<TInput, TOutput>>();

  items.forEach((item) => results.set(item.id, { ...item }));

  let activeCount = 0;
  let completedCount = 0;
  let queueIndex = 0;
  let isCancelled = false;

  return new Promise((resolve) => {
    if (items.length === 0) {
      resolve([]);
      return;
    }

    const startNext = () => {
      if (isCancelled) {
        resolve(Array.from(results.values()));
        return;
      }

      if (queueIndex >= queue.length && activeCount === 0) {
        resolve(Array.from(results.values()));
        return;
      }

      while (activeCount < concurrency && queueIndex < queue.length) {
        const item = queue[queueIndex++];
        activeCount++;

        const current = results.get(item.id)!;
        current.status = "processing";
        current.progress = 10;
        options.onItemUpdate?.(current);

        processor(item.file, current)
          .then(({ result, outputSize }) => {
            current.status = "success";
            current.progress = 100;
            current.result = result;
            current.outputSize = outputSize;
            options.onItemUpdate?.(current);
          })
          .catch((err) => {
            current.status = "error";
            current.progress = 0;
            current.error = err instanceof Error ? err.message : "Processing failed";
            options.onItemUpdate?.(current);
          })
          .finally(() => {
            activeCount--;
            completedCount++;
            options.onOverallProgress?.(completedCount, queue.length);
            startNext();
          });
      }
    };

    startNext();
  });
}
