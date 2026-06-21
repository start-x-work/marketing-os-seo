import { describe, expect, it } from "vitest";
import type { KeywordNode } from "./map";
import { estimateVolume } from "./volume";

describe("estimateVolume", () => {
  it("uses GSC impressions when available", () => {
    const nodes: KeywordNode[] = [
      { keyword: "ai marketing", impressions: 1200 },
      { keyword: "ai seo", impressions: 300 },
    ];
    const result = estimateVolume(nodes);
    expect(result[0]).toMatchObject({
      keyword: "ai marketing",
      estimatedVolume: 1200,
      source: "gsc",
      confidence: "high",
    });
  });

  it("estimates cluster-relative volume without a keyword DB", () => {
    const nodes: KeywordNode[] = [
      { keyword: "ai marketing", impressions: 1000, intent: "commercial" },
      { keyword: "ai marketing tools", intent: "commercial" },
    ];
    const result = estimateVolume(nodes);
    expect(result[1]?.source).toBe("estimated");
    expect(result[1]?.confidence).toBe("medium");
    expect(result[1]?.estimatedVolume).toBeGreaterThan(0);
  });

  it("falls back to low-confidence heuristics without GSC", () => {
    const nodes: KeywordNode[] = [
      { keyword: "ai marketing", intent: "informational" },
    ];
    const result = estimateVolume(nodes);
    expect(result[0]).toMatchObject({
      source: "estimated",
      confidence: "low",
    });
    expect(result[0]?.estimatedVolume).toBeGreaterThan(0);
  });
});
