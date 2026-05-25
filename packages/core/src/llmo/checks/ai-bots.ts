import type { LLMOCheck } from "../audit";

const AI_BOTS = ["GPTBot", "PerplexityBot", "Google-Extended"];

export async function checkAIBots(url: string): Promise<LLMOCheck> {
  const robotsUrl = `${new URL(url).origin}/robots.txt`;
  try {
    const res = await fetch(robotsUrl);
    if (!res.ok) {
      return {
        id: "llmo.ai-bots",
        label: "AI bot crawl policy",
        score: 50,
        weight: 2,
        detail: `robots.txt returned ${res.status}; no explicit AI bot block detected`,
      };
    }
    const text = await res.text();
    const blocked = AI_BOTS.filter((bot) => {
      const pattern = new RegExp(
        `User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`,
        "i",
      );
      return pattern.test(text);
    });
    return {
      id: "llmo.ai-bots",
      label: "AI bot crawl policy",
      score: blocked.length === 0 ? 100 : 20,
      weight: 2,
      detail:
        blocked.length === 0
          ? "No explicit block for common AI crawlers"
          : `Blocked bots: ${blocked.join(", ")}`,
    };
  } catch (error) {
    return {
      id: "llmo.ai-bots",
      label: "AI bot crawl policy",
      score: 50,
      weight: 2,
      detail:
        error instanceof Error ? error.message : "robots.txt check failed",
    };
  }
}
