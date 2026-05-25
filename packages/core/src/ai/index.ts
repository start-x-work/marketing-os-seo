export { GeminiProvider } from "./gemini";
export * from "./provider";

import { GeminiProvider } from "./gemini";
import type { AIProvider } from "./provider";

export function createProvider(): AIProvider {
  return new GeminiProvider();
}
