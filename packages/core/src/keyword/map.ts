import type { AIProvider } from "../ai";
import { clusterKeywords } from "./cluster";
import { classifyIntent, type Intent } from "./intent";

export interface KeywordMapResult {
  seed: string;
  keywords: string[];
  intents: Record<string, Intent>;
  clusters: Record<string, string[]>;
}

export async function mapKeywords(
  ai: AIProvider,
  seed: string,
  related: string[] = [],
): Promise<KeywordMapResult> {
  const keywords = Array.from(
    new Set(
      [seed, ...related].map((keyword) => keyword.trim()).filter(Boolean),
    ),
  );
  const [intents, clusters] = await Promise.all([
    classifyIntent(ai, keywords),
    clusterKeywords(ai, keywords),
  ]);
  return { seed, keywords, intents, clusters };
}
