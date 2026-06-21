import type { FetchedPage } from "@start-x-work/mos-kit";
import * as cheerio from "cheerio";
import { describe, expect, it } from "vitest";
import { checkMeta } from "./meta";

function page(html: string): FetchedPage {
  return {
    url: "https://example.com",
    status: 200,
    html,
    $: cheerio.load(html),
  };
}

describe("checkMeta", () => {
  it("passes basic metadata checks", () => {
    const checks = checkMeta(
      page(
        `<!doctype html><html><head><title>A useful example title</title><meta name="description" content="This is a useful example description for a real search result snippet."><link rel="canonical" href="https://example.com/"></head><body><h1>Hello</h1></body></html>`,
      ),
    );
    expect(checks.every((check) => check.passed)).toBe(true);
  });
});
