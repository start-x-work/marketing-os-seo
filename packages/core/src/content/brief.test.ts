import { describe, expect, it, vi } from "vitest";
import type { AIProvider } from "../ai";
import { generateBrief } from "./brief";

const mockAI: AIProvider = {
  complete: vi.fn().mockResolvedValue(
    JSON.stringify({
      intent: "informational",
      outline: ["Why it matters", "How to evaluate"],
      prompts: ["State the audience", "List decision criteria"],
    }),
  ),
  embed: vi.fn(),
};

describe("generateBrief", () => {
  it("returns an editable brief without final body text", async () => {
    const result = await generateBrief(mockAI, "AI SEO");
    expect(result.topic).toBe("AI SEO");
    expect(result.intent).toBe("informational");
    expect(result.outline).toHaveLength(2);
    expect(result.prompts).toContain("State the audience");
  });

  it("uses language in the prompt", async () => {
    await generateBrief(mockAI, "AI SEO", { lang: "en" });
    expect(mockAI.complete).toHaveBeenCalledWith(
      expect.stringContaining("English"),
      { json: true },
    );
  });
});
