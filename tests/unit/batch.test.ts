import { describe, it, expect } from "vitest";
import { processBatch, BatchItem } from "@/lib/tools/batch";

describe("Batch Queue Processor", () => {
  it("processes batch items with bounded concurrency", async () => {
    const items: BatchItem<number, number>[] = [
      { id: "1", file: 10, name: "item1", size: 100, status: "pending", progress: 0 },
      { id: "2", file: 20, name: "item2", size: 200, status: "pending", progress: 0 },
      { id: "3", file: 30, name: "item3", size: 300, status: "pending", progress: 0 },
    ];

    let runningConcurrent = 0;
    let maxObservedConcurrency = 0;

    const results = await processBatch(
      items,
      async (val) => {
        runningConcurrent++;
        if (runningConcurrent > maxObservedConcurrency) {
          maxObservedConcurrency = runningConcurrent;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
        runningConcurrent--;
        return { result: val * 2, outputSize: val };
      },
      { concurrency: 2 }
    );

    expect(results.length).toBe(3);
    expect(results.every((r) => r.status === "success")).toBe(true);
    expect(results[0].result).toBe(20);
    expect(results[1].result).toBe(40);
    expect(results[2].result).toBe(60);
    expect(maxObservedConcurrency).toBeLessThanOrEqual(2);
  });

  it("handles errors on individual files without discarding others", async () => {
    const items: BatchItem<number, number>[] = [
      { id: "1", file: 10, name: "item1", size: 100, status: "pending", progress: 0 },
      { id: "2", file: -1, name: "bad_item", size: 200, status: "pending", progress: 0 },
      { id: "3", file: 30, name: "item3", size: 300, status: "pending", progress: 0 },
    ];

    const results = await processBatch(
      items,
      async (val) => {
        if (val < 0) throw new Error("Negative value error");
        return { result: val * 2 };
      },
      { concurrency: 2 }
    );

    expect(results[0].status).toBe("success");
    expect(results[1].status).toBe("error");
    expect(results[1].error).toBe("Negative value error");
    expect(results[2].status).toBe("success");
  });
});
