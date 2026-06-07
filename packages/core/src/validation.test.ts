import { describe, expect, it } from "vitest";
import { CliError } from "./errors";
import { validateNonEmptyString, validateUrl } from "./validation";

describe("validation", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com")).toBe("https://example.com");
    expect(validateUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects invalid URLs", () => {
    expect(() => validateUrl("example.com")).toThrow(CliError);
    expect(() => validateUrl("ftp://example.com")).toThrow(CliError);
  });

  it("rejects empty strings", () => {
    expect(() => validateNonEmptyString("  ", "Topic")).toThrow(CliError);
  });
});
