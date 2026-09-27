import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "./render";

// A fixed, representative LLMO audit result so snapshots stay deterministic.
const sampleAudit = {
  url: "https://example.com",
  totalScore: 72,
  checks: [
    {
      id: "llmo.structured-data",
      label: "AI-readable structured data",
      score: 100,
      weight: 3,
      detail: "AI-friendly types: Article",
    },
    {
      id: "llmo.ai-bots",
      label: "AI bot crawl policy",
      score: 100,
      weight: 2,
      detail: "No explicit block for the tracked AI crawlers.",
    },
  ],
  recommendations: [
    "Question-oriented heading structure: add more H2 questions",
  ],
};

// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI for stable snapshots
const ANSI = /\u001b\[[0-9;]*m/g;

function capture(format: string): string {
  const calls: string[] = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    calls.push(args.map(String).join(" "));
  });
  // quiet: true so only the formatted body is emitted (no color footer).
  render(sampleAudit, format, { quiet: true });
  return calls.join("\n").replace(ANSI, "");
}

describe("CLI render output snapshots", () => {
  afterEach(() => vi.restoreAllMocks());

  it("human-readable table summary", () => {
    expect(capture("table")).toMatchSnapshot();
  });

  it("--format json", () => {
    expect(capture("json")).toMatchSnapshot();
  });

  it("--format markdown", () => {
    expect(capture("markdown")).toMatchSnapshot();
  });
});
