import type { AIProvider } from "@start-x-work/mos-kit";

export async function clusterKeywords(
  ai: AIProvider,
  keywords: string[],
  threshold = 0.8,
): Promise<Record<string, string[]>> {
  if (keywords.length === 0) {
    return {};
  }
  const vectors = await ai.embed(keywords);
  return groupByCosine(keywords, vectors, threshold);
}

export function groupByCosine(
  keywords: string[],
  vectors: number[][],
  threshold = 0.8,
): Record<string, string[]> {
  const clusters: string[][] = [];
  const centroids: number[][] = [];

  for (const [index, keyword] of keywords.entries()) {
    const vector = vectors[index] ?? [];
    let bestIndex = -1;
    let bestScore = -1;

    for (const [clusterIndex, centroid] of centroids.entries()) {
      const score = cosine(vector, centroid);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = clusterIndex;
      }
    }

    if (bestIndex >= 0 && bestScore >= threshold) {
      clusters[bestIndex]?.push(keyword);
      centroids[bestIndex] = average([
        ...clusters[bestIndex].map(
          (clusterKeyword) => vectors[keywords.indexOf(clusterKeyword)] ?? [],
        ),
      ]);
    } else {
      clusters.push([keyword]);
      centroids.push(vector);
    }
  }

  return Object.fromEntries(
    clusters.map((cluster) => [cluster[0] ?? "cluster", cluster]),
  );
}

function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value ** 2, 0));
  return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

function average(vectors: number[][]): number[] {
  const first = vectors[0];
  if (!first) {
    return [];
  }
  return first.map(
    (_, index) =>
      vectors.reduce((sum, vector) => sum + (vector[index] ?? 0), 0) /
      vectors.length,
  );
}
