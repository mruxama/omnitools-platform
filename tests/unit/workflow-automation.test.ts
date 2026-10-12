import { describe, it, expect } from "vitest";
import { AUTOMATED_SCENARIOS } from "@/lib/converter/workflow/workflowEngine";

describe("Workflow Automation Scenarios", () => {
  it("contains all critical automation scenarios", () => {
    expect(AUTOMATED_SCENARIOS.length).toBeGreaterThanOrEqual(8);

    const scenarioIds = AUTOMATED_SCENARIOS.map((s) => s.id);
    expect(scenarioIds).toContain("web-asset-pipeline");
    expect(scenarioIds).toContain("ecommerce-product-prep");
    expect(scenarioIds).toContain("social-media-post-prep");
    expect(scenarioIds).toContain("video-mobile-stream");
    expect(scenarioIds).toContain("doc-to-secure-pdf");
    expect(scenarioIds).toContain("confidential-watermark-archive");
    expect(scenarioIds).toContain("data-spreadsheet-export");
    expect(scenarioIds).toContain("thumbnail-strip-pipeline");
  });

  it("every scenario has valid steps and required actions", () => {
    AUTOMATED_SCENARIOS.forEach((scenario) => {
      expect(scenario.name).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);

      scenario.steps.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.name).toBeTruthy();
        expect(["convert", "resize", "watermark", "compress", "rotate", "archive"]).toContain(
          step.action
        );
      });
    });
  });
});
