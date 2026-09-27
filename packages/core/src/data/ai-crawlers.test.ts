import { describe, expect, it } from "vitest";
import {
  AI_CRAWLER_TOKENS,
  AI_CRAWLERS,
  SEARCH_CITATION_CRAWLERS,
  TRAINING_CRAWLERS,
} from "./ai-crawlers";

describe("ai-crawlers data", () => {
  it("combines both categories into AI_CRAWLERS", () => {
    expect(AI_CRAWLERS).toHaveLength(
      SEARCH_CITATION_CRAWLERS.length + TRAINING_CRAWLERS.length,
    );
  });

  it("distinguishes search/citation bots from training bots", () => {
    expect(
      SEARCH_CITATION_CRAWLERS.every((c) => c.category === "search-citation"),
    ).toBe(true);
    expect(TRAINING_CRAWLERS.every((c) => c.category === "training")).toBe(
      true,
    );
  });

  it("has unique tokens", () => {
    const tokens = AI_CRAWLERS.map((c) => c.token);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("classifies well-known bots", () => {
    const byToken = new Map(AI_CRAWLERS.map((c) => [c.token, c]));
    expect(byToken.get("GPTBot")?.category).toBe("training");
    expect(byToken.get("Google-Extended")?.category).toBe("training");
    expect(byToken.get("OAI-SearchBot")?.category).toBe("search-citation");
    expect(byToken.get("Googlebot")?.category).toBe("search-citation");
  });

  it("exposes tokens as strings", () => {
    expect(AI_CRAWLER_TOKENS).toContain("GPTBot");
    expect(AI_CRAWLER_TOKENS.every((t) => typeof t === "string")).toBe(true);
  });
});
