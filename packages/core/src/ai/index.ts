export * from "./provider";

import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import type { AIProvider } from "./provider";

export type ModelKind = "gemini" | "openai" | "anthropic";

const MODELS = new Set<ModelKind>(["gemini", "openai", "anthropic"]);
const providerPromises = new Map<string, Promise<AIProvider>>();

export function createProvider(
  model: ModelKind = "gemini",
  apiKey?: string,
): AIProvider {
  return resolveProvider(model, apiKey);
}

function resolveProvider(model: ModelKind, apiKey?: string): AIProvider {
  const cacheKey = `${model}:${apiKey ?? "__env__"}`;
  let providerPromise = providerPromises.get(cacheKey);
  if (!providerPromise) {
    providerPromise = Promise.resolve(instantiateProvider(model, apiKey));
    providerPromises.set(cacheKey, providerPromise);
  }
  return {
    async complete(prompt, opts) {
      const provider = await providerPromise;
      return provider.complete(prompt, opts);
    },
    async embed(texts) {
      const provider = await providerPromise;
      return provider.embed(texts);
    },
  };
}

function instantiateProvider(model: ModelKind, apiKey?: string): AIProvider {
  switch (model) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "anthropic":
      return new AnthropicProvider(apiKey);
    default:
      return new GeminiProvider(apiKey);
  }
}

export function isModelKind(value: string): value is ModelKind {
  return MODELS.has(value as ModelKind);
}
