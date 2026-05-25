import type { AIProvider } from "../ai";
import { parseJsonFromText } from "../json";

export type Intent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export async function classifyIntent(
  ai: AIProvider,
  keywords: string[],
): Promise<Record<string, Intent>> {
  const prompt = `次のキーワードを informational/commercial/transactional/navigational に分類し、JSONオブジェクトだけで返す: ${JSON.stringify(keywords)}`;
  const json = await ai.complete(prompt, { json: true });
  return parseJsonFromText<Record<string, Intent>>(json);
}
