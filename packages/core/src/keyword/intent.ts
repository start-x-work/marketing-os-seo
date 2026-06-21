import type { AIProvider } from "@start-x-work/mos-kit";
import { parseJsonFromText } from "../json";

export type Intent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export async function classifyIntent(
  ai: AIProvider,
  keywords: string[],
  lang = "ja",
): Promise<Record<string, Intent>> {
  const language =
    lang === "ja" ? "Japanese" : lang === "en" ? "English" : lang;
  const prompt = `Classify the following keywords into informational/commercial/transactional/navigational. Respond in ${language} labels only inside JSON values if needed, but keep the intent values exactly as those four English enum strings. Return a JSON object only: ${JSON.stringify(keywords)}`;
  const json = await ai.complete(prompt, { json: true });
  return parseJsonFromText<Record<string, Intent>>(json);
}
