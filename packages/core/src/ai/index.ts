export * from "./provider";

import type { AIProvider } from "./provider";

const providerPromises = new Map<string, Promise<AIProvider>>();

export function createProvider(apiKey?: string): AIProvider {
  return {
    async complete(prompt, opts) {
      const provider = await getDefaultProvider(apiKey);
      return provider.complete(prompt, opts);
    },
    async embed(texts) {
      const provider = await getDefaultProvider(apiKey);
      return provider.embed(texts);
    },
  };
}

async function getDefaultProvider(apiKey?: string): Promise<AIProvider> {
  const cacheKey = apiKey ?? "__env__";
  let providerPromise = providerPromises.get(cacheKey);
  if (!providerPromise) {
    providerPromise = import("./gemini").then(
      ({ GeminiProvider }) => new GeminiProvider(apiKey),
    );
    providerPromises.set(cacheKey, providerPromise);
  }
  return providerPromise;
}
