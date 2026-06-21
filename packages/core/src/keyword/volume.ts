import type { Intent } from "./intent";
import type { KeywordNode } from "./map";

export interface VolumeEstimate {
  keyword: string;
  estimatedVolume: number | null;
  source: "gsc" | "estimated";
  confidence: "high" | "medium" | "low";
}

const INTENT_WEIGHT: Record<Intent, number> = {
  informational: 50,
  commercial: 80,
  transactional: 100,
  navigational: 30,
};

export function estimateVolume(nodes: KeywordNode[]): VolumeEstimate[] {
  if (nodes.length === 0) {
    return [];
  }

  const gscImpressions = nodes
    .map((node) => node.impressions ?? 0)
    .filter((value) => value > 0);
  const anchor = gscImpressions.length > 0 ? Math.max(...gscImpressions) : null;
  const seed = nodes[0]?.keyword ?? "";

  return nodes.map((node) => {
    if (node.impressions != null && node.impressions > 0) {
      return {
        keyword: node.keyword,
        estimatedVolume: node.impressions,
        source: "gsc",
        confidence: "high",
      };
    }

    if (anchor != null) {
      const ratio = relativeSimilarity(seed, node.keyword);
      return {
        keyword: node.keyword,
        estimatedVolume: Math.max(1, Math.round(anchor * ratio)),
        source: "estimated",
        confidence: "medium",
      };
    }

    return {
      keyword: node.keyword,
      estimatedVolume: heuristicVolume(node),
      source: "estimated",
      confidence: "low",
    };
  });
}

function relativeSimilarity(seed: string, keyword: string): number {
  const seedTokens = tokenize(seed);
  const keywordTokens = tokenize(keyword);
  if (seedTokens.size === 0 || keywordTokens.size === 0) {
    return 0.35;
  }
  let overlap = 0;
  for (const token of keywordTokens) {
    if (seedTokens.has(token)) {
      overlap += 1;
    }
  }
  const union = new Set([...seedTokens, ...keywordTokens]).size;
  return Math.max(0.15, Math.min(1, overlap / union));
}

function heuristicVolume(node: KeywordNode): number {
  const intentWeight = node.intent ? INTENT_WEIGHT[node.intent] : 45;
  const wordFactor = Math.max(1, tokenize(node.keyword).size);
  return Math.round(intentWeight * wordFactor * 0.8);
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[\s,/]+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );
}
