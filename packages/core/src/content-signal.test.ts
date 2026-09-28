import { describe, expect, it } from "vitest";
import {
  extractContentSignalFromRobots,
  parseContentSignal,
} from "./content-signal";

describe("parseContentSignal", () => {
  it("parses the three known purposes", () => {
    const signal = parseContentSignal("search=yes, ai-input=no, ai-train=no");
    expect(signal.search).toBe(true);
    expect(signal["ai-input"]).toBe(false);
    expect(signal["ai-train"]).toBe(false);
    expect(signal.others).toEqual({});
  });

  it("is case-insensitive and whitespace tolerant", () => {
    const signal = parseContentSignal("  SEARCH = YES ,AI-Train=No ");
    expect(signal.search).toBe(true);
    expect(signal["ai-train"]).toBe(false);
  });

  it("leaves unspecified purposes undefined", () => {
    const signal = parseContentSignal("search=yes");
    expect(signal.search).toBe(true);
    expect(signal["ai-input"]).toBeUndefined();
    expect(signal["ai-train"]).toBeUndefined();
  });

  it("preserves unknown keys under others", () => {
    const signal = parseContentSignal("search=yes, custom-thing=maybe");
    expect(signal.others).toEqual({ "custom-thing": "maybe" });
  });

  it("ignores empty segments and malformed pairs", () => {
    const signal = parseContentSignal(", ,search=yes,,noequals,");
    expect(signal.search).toBe(true);
    expect(signal.others).toEqual({});
  });

  it("ignores non yes/no values for known purposes", () => {
    const signal = parseContentSignal("search=maybe");
    expect(signal.search).toBeUndefined();
  });
});

describe("extractContentSignalFromRobots", () => {
  it("finds a Content-Signal directive anywhere in robots.txt", () => {
    const robots = [
      "User-agent: *",
      "Disallow:",
      "Content-Signal: search=yes, ai-train=no",
    ].join("\n");
    const signal = extractContentSignalFromRobots(robots);
    expect(signal?.search).toBe(true);
    expect(signal?.["ai-train"]).toBe(false);
  });

  it("returns undefined when absent", () => {
    expect(
      extractContentSignalFromRobots("User-agent: *\nDisallow: /"),
    ).toBeUndefined();
  });
});
