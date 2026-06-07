export * from "./provider";

import type { AIProvider } from "./provider";

let providerPromise: Promise<AIProvider> | undefined;

export function createProvider(): AIProvider {
  return {
    async complete(prompt, opts) {
      const provider = await getDefaultProvider();
      return provider.complete(prompt, opts);
    },
    async embed(texts) {
      const provider = await getDefaultProvider();
      return provider.embed(texts);
    },
  };
}

async function getDefaultProvider(): Promise<AIProvider> {
  providerPromise ??= import("./gemini").then(
    ({ GeminiProvider }) => new GeminiProvider(),
  );
  return providerPromise;
}
