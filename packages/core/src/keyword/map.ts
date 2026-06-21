import type { AIProvider } from "@start-x-work/mos-kit";
import { clusterKeywords } from "./cluster";
import type { GSCQueryRow } from "./gsc";
import { classifyIntent, type Intent } from "./intent";
import type { VolumeEstimate } from "./volume";

export interface KeywordNode {
  keyword: string;
  intent?: Intent;
  impressions?: number;
}

export interface KeywordMapOptions {
  lang?: string;
}

export interface KeywordMapResult {
  seed: string;
  keywords: string[];
  intents: Record<string, Intent>;
  clusters: Record<string, string[]>;
  volumes?: VolumeEstimate[];
}

export async function mapKeywords(
  ai: AIProvider,
  seed: string,
  related: string[] = [],
  opts: KeywordMapOptions = {},
): Promise<KeywordMapResult> {
  const keywords = Array.from(
    new Set(
      [seed, ...related].map((keyword) => keyword.trim()).filter(Boolean),
    ),
  );
  const [intents, clusters] = await Promise.all([
    classifyIntent(ai, keywords, opts.lang),
    clusterKeywords(ai, keywords),
  ]);
  return { seed, keywords, intents, clusters };
}

export function toKeywordNodes(
  result: KeywordMapResult,
  gscRows: GSCQueryRow[] = [],
): KeywordNode[] {
  const impressionsByQuery = new Map(
    gscRows.map((row) => [row.query.toLowerCase(), row.impressions]),
  );

  return result.keywords.map((keyword) => ({
    keyword,
    intent: result.intents[keyword],
    impressions: matchGscImpressions(keyword, impressionsByQuery),
  }));
}

function matchGscImpressions(
  keyword: string,
  impressionsByQuery: Map<string, number>,
): number | undefined {
  const exact = impressionsByQuery.get(keyword.toLowerCase());
  if (exact != null) {
    return exact;
  }

  for (const [query, impressions] of impressionsByQuery.entries()) {
    if (
      query.includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(query)
    ) {
      return impressions;
    }
  }

  return undefined;
}
