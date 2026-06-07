import { describe, expect, it, vi } from "vitest";
import type { AIProvider } from "../ai";
import { classifyIntent } from "./intent";

const mockAI: AIProvider = {
  complete: vi.fn().mockResolvedValue(
    JSON.stringify({
      "buy shoes": "transactional",
      "what is seo": "informational",
    }),
  ),
  embed: vi.fn(),
};

describe("classifyIntent", () => {
  it("classifies keywords by intent", async () => {
    const result = await classifyIntent(mockAI, ["buy shoes", "what is seo"]);
    expect(result["buy shoes"]).toBe("transactional");
    expect(result["what is seo"]).toBe("informational");
  });
});
