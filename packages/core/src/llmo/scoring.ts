import type { LLMOCheck } from "./audit";

export function computeScore(checks: LLMOCheck[]): number {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  const weighted = checks.reduce(
    (sum, check) => sum + check.score * check.weight,
    0,
  );
  return Math.round(weighted / totalWeight);
}
