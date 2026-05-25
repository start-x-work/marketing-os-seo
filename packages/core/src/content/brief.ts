import type { AIProvider } from "../ai";
import { parseJsonFromText } from "../json";

export interface ContentBrief {
  topic: string;
  intent: string;
  outline: string[];
  prompts: string[];
}

export async function generateBrief(
  ai: AIProvider,
  topic: string,
): Promise<ContentBrief> {
  const prompt = `トピック「${topic}」について、検索意図・推奨アウトライン・編集可能な執筆プロンプトをJSONで出力する。本文の自動生成は含めない。`;
  const json = await ai.complete(prompt, { json: true });
  const parsed = parseJsonFromText<Partial<ContentBrief>>(json);
  return {
    topic,
    intent: parsed.intent ?? "未分類",
    outline: parsed.outline ?? [],
    prompts: parsed.prompts ?? [],
  };
}
