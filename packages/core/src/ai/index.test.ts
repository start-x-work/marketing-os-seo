import { describe, expect, it } from "vitest";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { createProvider, isModelKind } from "./index";
import { OpenAIProvider } from "./openai";

describe("createProvider", () => {
  it("accepts gemini, openai, and anthropic", () => {
    expect(isModelKind("gemini")).toBe(true);
    expect(isModelKind("openai")).toBe(true);
    expect(isModelKind("anthropic")).toBe(true);
    expect(isModelKind("unknown")).toBe(false);
  });

  it("returns a provider wrapper for each model", () => {
    const provider = createProvider("openai", "test-key");
    expect(provider.complete).toBeTypeOf("function");
    expect(provider.embed).toBeTypeOf("function");
  });
});

describe("provider constructors", () => {
  it("requires API keys from arguments", () => {
    expect(() => new GeminiProvider()).toThrow(/GEMINI_API_KEY/);
    expect(() => new OpenAIProvider()).toThrow(/OPENAI_API_KEY/);
    expect(() => new AnthropicProvider()).toThrow(/ANTHROPIC_API_KEY/);
  });

  it("accepts explicit API keys", () => {
    expect(new GeminiProvider("key")).toBeDefined();
    expect(new OpenAIProvider("key")).toBeDefined();
    expect(new AnthropicProvider("key")).toBeDefined();
  });
});
