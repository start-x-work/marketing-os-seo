import type { AIProvider } from "../ai";
import { parseJsonFromText } from "../json";

export interface ContentBrief {
  topic: string;
  intent: string;
  outline: string[];
  prompts: string[];
}

export interface BriefOptions {
  lang?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  ja: "Japanese",
  en: "English",
  zh: "Chinese",
  ko: "Korean",
};

export async function generateBrief(
  ai: AIProvider,
  topic: string,
  opts: BriefOptions = {},
): Promise<ContentBrief> {
  const lang = opts.lang ?? "ja";
  const language = LANGUAGE_LABELS[lang] ?? lang;
  const prompt = `Write a content planning brief for the topic "${topic}" in ${language}. Return JSON only with keys intent, outline (string array), and prompts (editable writing prompts — not final body text). Do not generate the article body.`;
  const json = await ai.complete(prompt, { json: true });
  const parsed = parseJsonFromText<Partial<ContentBrief>>(json);
  return {
    topic,
    intent: parsed.intent ?? (lang === "ja" ? "未分類" : "unclassified"),
    outline: parsed.outline ?? [],
    prompts: parsed.prompts ?? [],
  };
}
