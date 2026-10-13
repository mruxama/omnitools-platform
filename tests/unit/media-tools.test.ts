import { describe, it, expect } from "vitest";
import { isHeicFile } from "@/lib/heic/heicConverter";
import { formatBytes } from "@/lib/shared/exportHelper";
import { getRecommendedConcurrency, BatchQueueManager } from "@/lib/shared/BatchQueueManager";

describe("Shared Media Processing Architecture", () => {
  it("detects HEIC and HEIF files correctly by filename and mime", () => {
    const f1 = new File(["test"], "photo.heic", { type: "" });
    const f2 = new File(["test"], "photo.HEIF", { type: "" });
    const f3 = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    const f4 = new File(["test"], "image_without_ext", { type: "image/heic" });

    expect(isHeicFile(f1)).toBe(true);
    expect(isHeicFile(f2)).toBe(true);
    expect(isHeicFile(f3)).toBe(false);
    expect(isHeicFile(f4)).toBe(true);
  });

  it("calculates human-readable byte sizes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("computes safe concurrency bounds for device", () => {
    const cHeic = getRecommendedConcurrency("heic");
    const cVid = getRecommendedConcurrency("video");

    expect(cHeic).toBeGreaterThanOrEqual(1);
    expect(cHeic).toBeLessThanOrEqual(4);
    expect(cVid).toBeGreaterThanOrEqual(1);
    expect(cVid).toBeLessThanOrEqual(2);
  });

  it("manages batch queue lifecycle", async () => {
    let completedCount = 0;
    const queue = new BatchQueueManager<any, any>(
      async (job, onProgress) => {
        onProgress(50);
        onProgress(100);
        completedCount++;
        return { success: true };
      },
      () => {},
      2
    );

    const f1 = new File(["a"], "f1.heic", { type: "image/heic" });
    const f2 = new File(["b"], "f2.heic", { type: "image/heic" });

    queue.addJobs([
      { id: "1", file: f1, name: "f1.heic", size: 10, type: "image/heic", status: "pending", progress: 0, config: {} },
      { id: "2", file: f2, name: "f2.heic", size: 10, type: "image/heic", status: "pending", progress: 0, config: {} },
    ]);

    await queue.start();

    // Allow pump loop to complete
    await new Promise((r) => setTimeout(r, 100));

    expect(completedCount).toBe(2);
    const stats = queue.getStats();
    expect(stats.completed).toBe(2);
    expect(stats.total).toBe(2);
    expect(stats.percentOverall).toBe(100);
  });
});
