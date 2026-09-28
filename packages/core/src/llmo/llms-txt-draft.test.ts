import { describe, expect, it } from "vitest";
import {
  buildLlmsTxtDraft,
  LLMS_TXT_GUIDANCE_NOTE,
  type LlmsTxtDraftInput,
} from "./llms-txt-draft";

const sample: LlmsTxtDraftInput = {
  site: "https://example.com",
  title: "Example Docs",
  summary: "Documentation for the Example project.",
  notes: ["Optional context paragraph."],
  sections: [
    {
      title: "Docs",
      links: [
        {
          url: "https://example.com/start",
          label: "Getting started",
          note: "How to begin",
        },
        { url: "https://example.com/api" },
      ],
    },
  ],
};

describe("buildLlmsTxtDraft", () => {
  it("begins with the advisory guidance note", () => {
    const draft = buildLlmsTxtDraft(sample);
    expect(draft.startsWith(LLMS_TXT_GUIDANCE_NOTE)).toBe(true);
  });

  it("states the draft does not command AI behavior", () => {
    const draft = buildLlmsTxtDraft(sample);
    expect(draft).toContain("does NOT command");
    expect(draft).toMatch(/advisory/i);
  });

  it("renders the title as an H1 and summary as a blockquote", () => {
    const draft = buildLlmsTxtDraft(sample);
    expect(draft).toContain("# Example Docs");
    expect(draft).toContain("> Documentation for the Example project.");
  });

  it("renders sections and key URLs as Markdown links", () => {
    const draft = buildLlmsTxtDraft(sample);
    expect(draft).toContain("## Docs");
    expect(draft).toContain(
      "- [Getting started](https://example.com/start): How to begin",
    );
    // Missing label falls back to the URL.
    expect(draft).toContain(
      "- [https://example.com/api](https://example.com/api)",
    );
  });

  it("is deterministic and ends with a trailing newline", () => {
    expect(buildLlmsTxtDraft(sample)).toBe(buildLlmsTxtDraft(sample));
    expect(buildLlmsTxtDraft(sample).endsWith("\n")).toBe(true);
  });

  it("falls back to the site when no title is given", () => {
    const draft = buildLlmsTxtDraft({ site: "https://only-site.example" });
    expect(draft).toContain("# https://only-site.example");
  });

  it("skips empty sections and links with no URL", () => {
    const draft = buildLlmsTxtDraft({
      site: "https://example.com",
      sections: [
        { title: "Empty", links: [] },
        { title: "", links: [{ url: "https://example.com/x" }] },
        {
          title: "Kept",
          links: [{ url: "" }, { url: "https://example.com/y" }],
        },
      ],
    });
    expect(draft).not.toContain("## Empty");
    expect(draft).toContain("## Kept");
    expect(draft).toContain("https://example.com/y");
    expect(draft).not.toContain("[]()");
  });
});
