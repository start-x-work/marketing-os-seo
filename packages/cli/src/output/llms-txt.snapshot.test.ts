import type { LlmsTxtDraftInput } from "@start-x-work/marketing-os-seo-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderLlmsTxt } from "./llms-txt";

// A fixed, representative set of signals so the snapshot stays deterministic.
const sample: LlmsTxtDraftInput = {
  site: "https://example.com",
  title: "Example Site",
  summary: "A short, human-readable summary of the site.",
  sections: [
    {
      title: "Key pages",
      links: [
        { url: "https://example.com/", label: "Home" },
        { url: "https://example.com/docs", label: "Documentation" },
        { url: "https://example.com/pricing", label: "Pricing" },
      ],
    },
  ],
};

function capture(input: LlmsTxtDraftInput): string {
  const calls: string[] = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    calls.push(args.map(String).join(" "));
  });
  renderLlmsTxt(input);
  return calls.join("\n");
}

describe("CLI --llms-txt output", () => {
  afterEach(() => vi.restoreAllMocks());

  it("prints the advisory llms.txt draft", () => {
    expect(capture(sample)).toMatchSnapshot();
  });

  it("opens with the advisory guidance note", () => {
    const out = capture(sample);
    expect(out.startsWith("> [!NOTE]")).toBe(true);
    expect(out).toContain("does NOT command");
  });
});
