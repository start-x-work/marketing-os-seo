import { describe, expect, it } from "vitest";
import type { LLMOCheck } from "./audit";
import { computeScore } from "./scoring";

describe("computeScore", () => {
  it("returns weighted score", () => {
    const checks: LLMOCheck[] = [
      { id: "a", label: "A", score: 100, weight: 3, detail: "" },
      { id: "b", label: "B", score: 40, weight: 1, detail: "" },
    ];
    expect(computeScore(checks)).toBe(85);
  });
});
